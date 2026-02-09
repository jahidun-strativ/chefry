# CORS Configuration for File Uploads

## Problem

When uploading files from the web browser, you may encounter CORS (Cross-Origin Resource Sharing) errors because the browser makes direct requests to Firebase Storage (Google Cloud Storage), which requires CORS configuration on the bucket.

## Solution

Configure CORS on your Google Cloud Storage bucket to allow uploads from your web domains.

## Setup Instructions

### Prerequisites

1. Install [Google Cloud SDK (gcloud CLI)](https://cloud.google.com/sdk/docs/install)
2. Authenticate with your Google Cloud account:
   ```bash
   gcloud auth login
   ```
3. Set your project:
   ```bash
   gcloud config set project startracker-fb6ce
   ```

### Apply CORS Configuration

Run the setup script from the `apps/nextjs` directory:

```bash
cd apps/nextjs
./scripts/setup-gcs-cors.sh
```

Or manually apply the CORS configuration:

```bash
cd apps/nextjs
gcloud storage buckets update gs://startracker-fb6ce.appspot.com --cors-file=gcs-cors-config.json
```

### Verify CORS Configuration

Check the current CORS configuration:

```bash
gcloud storage buckets describe gs://startracker-fb6ce.appspot.com --format="value(cors)"
```

## Allowed Origins

The current configuration allows uploads from:
- `https://chefry-nextjs-rust.vercel.app` (production)
- `http://localhost:3000` (local Next.js)
- `http://localhost:8081` (Expo web dev)
- `http://localhost:19006` (Expo web dev alternative)

## Adding New Origins

To add a new origin, edit `gcs-cors-config.json` and add it to the `origin` array, then re-run the setup script.

## Troubleshooting

If you still encounter CORS errors after applying the configuration:

1. **Clear browser cache** - CORS headers are cached by browsers
2. **Check the bucket name** - Ensure it matches `startracker-fb6ce.appspot.com`
3. **Verify the origin** - Make sure your web app's URL is in the allowed origins list
4. **Check browser console** - Look for specific CORS error messages

## Alternative: Proxy Upload Through API

If you cannot configure CORS on the bucket, you can modify the upload flow to proxy through your Next.js API instead of uploading directly to Firebase Storage. However, this is less efficient and not recommended for production.
