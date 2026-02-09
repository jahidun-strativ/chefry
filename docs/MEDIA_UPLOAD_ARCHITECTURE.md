# Media Upload & Retrieval Architecture

> Documentation for the Startracker media pipeline — how files are uploaded, stored, and served.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Services Used](#services-used)
3. [Database Schema](#database-schema)
4. [Upload Flow (Step-by-Step)](#upload-flow-step-by-step)
5. [Retrieval & Display Flow](#retrieval--display-flow)
6. [Image Transformations (ImageKit)](#image-transformations-imagekit)
7. [Platform-Specific Upload Implementations](#platform-specific-upload-implementations)
8. [File Structure](#file-structure)
9. [Environment Variables](#environment-variables)
10. [Security Considerations](#security-considerations)

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                        CLIENT (Expo / Web)                          │
│                                                                      │
│  1. User picks image/video                                           │
│  2. Client requests signed upload URL from backend (tRPC)            │
│  3. Client uploads file DIRECTLY to Firebase/GCS (no server relay)   │
│  4. Client sends file metadata to backend (tRPC) → saved in Neon DB  │
│  5. Client creates post linking to saved media ID                    │
└──────┬──────────────────────┬──────────────────────┬─────────────────┘
       │                      │                      │
       │ tRPC (metadata)      │ HTTP PUT (file)      │ HTTPS GET (display)
       ▼                      ▼                      ▼
┌──────────────┐   ┌────────────────────┐   ┌─────────────────────┐
│   Neon DB    │   │  Firebase Storage   │   │    ImageKit CDN     │
│ (PostgreSQL) │   │  (Google Cloud      │──▶│ (ik.imagekit.io/    │
│              │   │   Storage)          │   │     shader/)        │
│ Stores:      │   │                     │   │                     │
│ - filename   │   │ Stores:             │   │ Provides:           │
│ - dimensions │   │ - Actual files      │   │ - Global CDN        │
│ - type       │   │ - Images & videos   │   │ - On-the-fly resize │
│ - thumbhash  │   │                     │   │ - Format optimize   │
│ - owner      │   │ Bucket:             │   │ - Caching           │
│ - relations  │   │ startracker-fb6ce   │   │                     │
│              │   │   .appspot.com      │   │ URL pattern:        │
│ Provider:    │   │                     │   │ https://ik.imagekit │
│ Neon (EU)    │   │ Path: media/{file}  │   │ .io/shader/{file}   │
└──────────────┘   └────────────────────┘   └─────────────────────┘
```

### Key Principle

The file (binary data) and metadata (database record) are stored in **separate systems**:

| Data Type | Where It Goes | Example |
|-----------|---------------|---------|
| **Actual file** (image/video bytes) | Firebase Storage (GCS) | `media/1711635125159_photo.jpg` |
| **Metadata** (dimensions, type, URL path) | Neon DB (PostgreSQL) | `{ url: "1711635125159_photo.jpg", width: 1024, ... }` |
| **Served via** | ImageKit CDN | `https://ik.imagekit.io/shader/1711635125159_photo.jpg` |

---

## Services Used

### 1. Firebase Storage / Google Cloud Storage (GCS)

- **Purpose:** Persistent file storage for all uploaded images and videos
- **Project:** `startracker-fb6ce`
- **Bucket:** `startracker-fb6ce.appspot.com`
- **File path pattern:** `media/{timestamp}_{original_filename}`
- **Authentication:** GCP Service Account with signed URLs (v4)
- **Note:** Firebase Storage IS Google Cloud Storage under the hood — same bucket, same API

### 2. Neon Database (PostgreSQL)

- **Purpose:** Store file metadata, user data, posts, and all relational data
- **Provider:** Neon (serverless PostgreSQL)
- **Region:** EU Central 1 (Frankfurt, AWS)
- **ORM:** Prisma
- **Connection:** Via `DATABASE_URL` environment variable
- **Features:** Driver adapters enabled for Neon's serverless driver

### 3. ImageKit CDN

- **Purpose:** Serve files globally with on-the-fly image/video transformations
- **URL Endpoint:** `https://ik.imagekit.io/shader/`
- **Public Key:** `public_PLXcEoODbQKWcZCa+vgnk+5qiO8=`
- **Auth Endpoint:** `/api/imagekit-auth`
- **Origin:** Connected to the Firebase Storage bucket as origin source
- **How it works:** ImageKit pulls files from Firebase Storage, caches them on its CDN, and applies transformations on-the-fly

### 4. Clerk (Authentication)

- **Purpose:** User authentication and identity management
- **Usage in upload:** Ensures only authenticated users can request signed URLs and create media records

---

## Database Schema

### Media Model

```prisma
model Media {
  id          String     @id @default(cuid())
  createdAt   DateTime   @default(now())
  type        MEDIA_TYPE               // IMAGE or VIDEO
  url         String                   // Relative path (filename only)
  duration    Int?                     // Video duration in ms
  width       Int?
  height      Int?
  name        String                   // Original filename
  size        Int                      // File size in bytes
  thumbhash   String?                  // Blur hash for placeholder
  thumbnail   Media?     @relation("MediaThumbnail", fields: [thumbnailId], references: [id])
  thumbnailId String?    @unique
  parent      Media?     @relation("MediaThumbnail")
  post        Post?      @relation(fields: [postId], references: [id], onDelete: Cascade)
  postId      String?
  user        User?      @relation("UserProfileImage")
  story       Story?
  cropX       Int?                     // Crop coordinates
  cropY       Int?
  cropWidth   Int?
  cropHeight  Int?
  owner       User?      @relation(fields: [ownerId], references: [id])
  ownerId     String?
}

enum MEDIA_TYPE {
  IMAGE
  VIDEO
}
```

### Key Relationships

```
User ──┐
       ├── owns many Media (medias)
       ├── has one profile image (Media via "UserProfileImage")
       ├── creates many Posts
       └── creates many Stories

Post ──── has many Media[]

Story ─── has one Media

Media ─── can have one thumbnail Media (self-relation, for videos)
```

### What's Stored in DB vs. Storage

| Field in DB | Example Value | Notes |
|-------------|---------------|-------|
| `url` | `1711635125159_photo.jpg` | **Just the filename**, not full URL |
| `type` | `IMAGE` or `VIDEO` | |
| `width` | `1024` | After compression |
| `height` | `768` | After compression |
| `size` | `245760` | In bytes |
| `thumbhash` | `k0gGFYR3d4h4eIeGh...` | Base64 blur hash for placeholders |
| `duration` | `15000` | Video only, in milliseconds |
| `cropX/Y/Width/Height` | `100, 50, 500, 500` | Optional crop coordinates |

---

## Upload Flow (Step-by-Step)

### Step 1: File Selection

**Native (iOS/Android):**
```typescript
// Uses expo-image-picker
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.All,
  quality: 1,
});
```

**Web:**
```typescript
// Uses HTML file input
<input type="file" accept="image/*,video/*" onChange={handleFileSelect} />
```

### Step 2: Request Signed Upload URL

Client calls the tRPC mutation:

```typescript
const { signedUploadUrl, filename, contentType } = 
  await api.auth.media.createSignedUploadUrl.mutate({ uri: fileUri });
```

**Backend generates a signed URL:**
```typescript
// packages/api/src/router/auth/media.ts
const storage = new Storage({
  projectId: "startracker-fb6ce",
  credentials: { /* GCP service account */ },
});

const [url] = await storage
  .bucket("startracker-fb6ce.appspot.com")
  .file(`media/${filename}`)
  .getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    contentType,
  });
```

**Filename format:** `{timestamp}_{sanitized_original_name}`
Example: `1711635125159_271ac1dc-2b09-4417-9bc8-2d7bd9df618e.jpg`

### Step 3: File Processing (Client-Side)

Before upload, files are processed on the client:

**Images:**
- Resized to max width of **1536px**
- Compressed to **20% quality** JPEG
- Original aspect ratio preserved

**Videos:**
- A **thumbnail** is generated (first frame)
- Thumbnail is uploaded separately
- Video is uploaded at original quality

### Step 4: Direct Upload to Firebase/GCS

The file is uploaded **directly from client to GCS** — the backend is NOT a relay:

```typescript
const xhr = new XMLHttpRequest();
xhr.open("PUT", signedUploadUrl, true);
xhr.setRequestHeader("Content-Type", contentType);

xhr.upload.onprogress = (e) => {
  const progress = (e.loaded / e.total) * 100;
  onProgressChange(progress);
};

xhr.send(file); // Direct upload to GCS
```

### Step 5: Save Metadata to Database

After successful upload, client saves metadata via tRPC:

```typescript
const media = await api.auth.media.create.mutate({
  media: {
    fileType: "image",    // or "video"
    url: filename,        // e.g. "1711635125159_photo.jpg"
    width: 1024,
    height: 768,
    size: 245760,
    duration: null,       // only for videos
  },
  thumbnail: null,        // only for videos
});
```

**Backend creates the DB record and generates a thumbhash:**
```typescript
// packages/api/src/router/auth/media.ts
const urlEndpoint = "https://ik.imagekit.io/shader/";
const thumbhash = await generateImageThumbhash(urlEndpoint + media.url);

return ctx.prisma.media.create({
  data: {
    url: media.url,       // Just filename
    type: "IMAGE",
    width, height, size,
    thumbhash,            // Blur placeholder
    owner: { connect: { clerkId: ctx.auth.userId } },
  },
});
```

### Step 6: Create Post

Finally, the post is created linking to the media record:

```typescript
const post = await api.auth.post.create.mutate({
  mediaId: media.id,      // Links to the Media record
  caption: "My post",
  starPost: false,
});
```

---

## Retrieval & Display Flow

### URL Construction

```
DB stores:     url = "1711635125159_photo.jpg"
                          │
                          ▼
ImageKit URL:  https://ik.imagekit.io/shader/1711635125159_photo.jpg
                          │
                          ▼ (with transformations)
Transformed:   https://ik.imagekit.io/shader/tr:w-1024/1711635125159_photo.jpg
```

### Code Implementation

```typescript
// apps/expo/src/utils/imagekit.ts
export const mediaBaseUrl = "https://ik.imagekit.io/shader/";

// Simple URL
const url = mediaBaseUrl + media.url;
// → "https://ik.imagekit.io/shader/1711635125159_photo.jpg"

// With ImageKit transformation
const url = getImageUrl(media.url, [{ width: "1024" }]);
// → "https://ik.imagekit.io/shader/tr:w-1024/1711635125159_photo.jpg"

// With crop
const url = mediaBaseUrl + 
  `tr:w-${cropWidth},h-${cropHeight},cm-extract,xc-${centerX},yc-${centerY}:w-512/` + 
  media.url;
```

### Video URLs

```typescript
// Videos also served via ImageKit
const videoUrl = mediaBaseUrl + "tr:w-1024/" + media.url;
// → "https://ik.imagekit.io/shader/tr:w-1024/1711635125159_video.mp4"
```

### Placeholder Loading

While images load, a **thumbhash** (blur placeholder) is shown:

```typescript
<Image
  source={{ uri: getImageUrl(media.url, [{ width: "1024" }]) }}
  placeholder={Platform.OS === "ios" ? media.thumbhash : undefined}
  placeholderContentFit="cover"
/>
```

---

## Image Transformations (ImageKit)

ImageKit provides on-the-fly transformations via URL parameters:

| Transformation | URL Format | Example |
|----------------|------------|---------|
| Resize width | `tr:w-{width}` | `tr:w-1024` |
| Resize height | `tr:h-{height}` | `tr:h-768` |
| Width + Height | `tr:w-{w},h-{h}` | `tr:w-512,h-512` |
| Crop extract | `tr:w-{w},h-{h},cm-extract,xc-{x},yc-{y}` | Center crop |
| Chained transforms | `tr:{first}:{second}` | `tr:w-500,h-500:w-256` |

### Common Usage in App

| Context | Transformation | Reasoning |
|---------|---------------|-----------|
| Post feed (mobile) | `tr:w-800` | Optimized for phone screens |
| Post feed (tablet) | `tr:w-900` | Slightly larger |
| Post feed (desktop) | `tr:w-1000` | Full size |
| Video playback | `tr:w-1024` | Standard video quality |
| Profile image | `tr:w-512` | Small, circular crop |
| Thumbnails | `tr:w-1024` | Video poster frame |

---

## Platform-Specific Upload Implementations

### Native (iOS/Android)

**File:** `apps/expo/src/utils/imagekit.ts` → `uploadMedia()`

- Uses `expo-image-manipulator` for image compression
- Uses `expo-video-thumbnails` for video thumbnail generation
- Uses `FormData` and `XMLHttpRequest` for upload
- Accesses local file URI directly

### Web

**File:** `apps/expo/src/utils/upload-media-web.ts` → `uploadMediaWeb()`

- Uses HTML Canvas API for image compression
- Uses HTML `<video>` element + Canvas for video thumbnail
- Uses `FileReader` for file processing
- Uses `XMLHttpRequest` for upload (for progress tracking)
- Requires CORS configuration on GCS bucket

---

## File Structure

```
packages/
├── api/src/
│   ├── router/auth/
│   │   ├── media.ts          # Signed URL generation, media CRUD
│   │   ├── post.ts           # Post creation (links to media)
│   │   ├── story.ts          # Story creation (links to media)
│   │   └── user.ts           # Profile image upload
│   └── utils/
│       ├── generate-image-thumbhash.ts  # Blur hash generation
│       └── schemas.ts        # Shared Zod schemas (createMediaSchema)
│
├── db/prisma/
│   └── schema.prisma         # Media model definition
│
apps/expo/src/
├── utils/
│   ├── imagekit.ts           # ImageKit config, URL helpers, native upload
│   └── upload-media-web.ts   # Web-specific upload logic
│
├── components/
│   ├── create-post-button.tsx              # Post creation UI
│   ├── create-post-form.tsx                # Post form with media preview
│   ├── change-profile-image-button.tsx     # Profile image upload
│   ├── post-list-item.tsx                  # Displays post with media
│   ├── post-video-player.tsx               # Video playback component
│   └── event-package/
│       └── create-event-package-post-button.tsx  # Package post upload
```

---

## Environment Variables

| Variable | Service | Description |
|----------|---------|-------------|
| `DATABASE_URL` | Neon DB | PostgreSQL connection string |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit | Server-side ImageKit auth (if used) |

### Hardcoded Configuration (in source)

| Config | Location | Value |
|--------|----------|-------|
| GCS Project ID | `packages/api/src/router/auth/media.ts` | `startracker-fb6ce` |
| GCS Bucket | Same file | `startracker-fb6ce.appspot.com` |
| GCS Service Account | Same file | Embedded credentials |
| ImageKit URL Endpoint | `apps/expo/src/utils/imagekit.ts` | `https://ik.imagekit.io/shader/` |
| ImageKit Public Key | Same file | `public_PLXcEoODbQKWcZCa+vgnk+5qiO8=` |
| ImageKit Auth Endpoint | Same file | `{baseUrl}/api/imagekit-auth` |

---

## Security Considerations

### Signed URLs
- Upload URLs are **time-limited** (15 minutes)
- URLs are **specific to a file path and content type**
- Only authenticated users can request signed URLs (protected procedure)

### Authentication Flow
1. Client authenticates via **Clerk**
2. Clerk token is sent with tRPC requests
3. `protectedProcedure` validates the token
4. Backend generates signed URL scoped to the user's upload

### File Access
- Files in GCS are **not publicly writable** — only via signed URLs
- Files are **publicly readable** through ImageKit CDN
- ImageKit is configured as the public-facing origin

### Data Integrity
- `thumbhash` is generated server-side to verify the file was uploaded correctly
- Media records are linked to owners via `ownerId`
- Posts cascade-delete their media records

---

## Sequence Diagram

```
User          Client App         tRPC Server        Firebase/GCS       Neon DB        ImageKit
 │                │                   │                  │                │               │
 │  Pick file     │                   │                  │                │               │
 │───────────────▶│                   │                  │                │               │
 │                │                   │                  │                │               │
 │                │  createSignedUrl  │                  │                │               │
 │                │──────────────────▶│                  │                │               │
 │                │                   │  getSignedUrl()  │                │               │
 │                │                   │─────────────────▶│                │               │
 │                │                   │◀─────────────────│                │               │
 │                │◀──────────────────│ {signedUrl, name}│                │               │
 │                │                   │                  │                │               │
 │                │  PUT file (direct)│                  │                │               │
 │                │─────────────────────────────────────▶│                │               │
 │                │◀─────────────────────────────────────│ 200 OK         │               │
 │                │                   │                  │                │               │
 │                │  media.create     │                  │                │               │
 │                │──────────────────▶│                  │                │               │
 │                │                   │  generateThumbhash               │               │
 │                │                   │──────────────────────────────────────────────────▶│
 │                │                   │◀─────────────────────────────────────────────────│
 │                │                   │  prisma.media.create             │               │
 │                │                   │─────────────────────────────────▶│               │
 │                │                   │◀─────────────────────────────────│ media record   │
 │                │◀──────────────────│ {id, url, ...}   │                │               │
 │                │                   │                  │                │               │
 │                │  post.create      │                  │                │               │
 │                │──────────────────▶│                  │                │               │
 │                │                   │  prisma.post.create              │               │
 │                │                   │─────────────────────────────────▶│               │
 │                │◀──────────────────│ {postId}         │                │               │
 │                │                   │                  │                │               │
 │  View post     │                   │                  │                │               │
 │───────────────▶│                   │                  │                │               │
 │                │  post.list        │                  │                │               │
 │                │──────────────────▶│  prisma.post.find                │               │
 │                │                   │─────────────────────────────────▶│               │
 │                │◀──────────────────│ {media.url}      │                │               │
 │                │                   │                  │                │               │
 │                │  GET image via CDN│                  │                │               │
 │                │──────────────────────────────────────────────────────────────────────▶│
 │                │                   │                  │  fetch origin  │               │
 │                │                   │                  │◀──────────────────────────────│
 │                │                   │                  │──────────────────────────────▶│
 │                │◀─────────────────────────────────────────────────────────────────────│
 │  Display image │                   │                  │                │               │
 │◀───────────────│                   │                  │                │               │
```

---

*Last updated: February 2026*
