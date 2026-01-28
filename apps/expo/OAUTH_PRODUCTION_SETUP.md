# OAuth Production Setup Guide

## Issues Fixed

### 1. **Deprecated useOAuth Hook**

- Updated from deprecated `useOAuth` to modern `useSignIn` with `authenticateWithRedirect`
- Better error handling and browser compatibility

### 2. **Production vs Local Environment**

- Dynamic redirect URL generation based on current origin
- Proper HTTPS handling for production
- Environment-specific OAuth configuration

### 3. **Browser-Specific Handling**

- iOS Safari: Always uses redirect flow (no popups)
- Chrome: Uses redirect flow with fallback
- Other browsers: Graceful fallback handling

## Clerk Dashboard Configuration

### Required Redirect URLs

Add these URLs to your Clerk Dashboard under "OAuth redirect URLs":

**For Expo Hosting (your current setup):**

```
https://startracker--*.expo.app/oauth-native-callback
```

**Note:** Since Expo generates dynamic URLs like `https://startracker--cbie19a34j.expo.app`, you need to add a wildcard pattern or add each specific deployment URL.

**Alternative approach - Add specific URLs:**

```
https://startracker--cbie19a34j.expo.app/oauth-native-callback
```

(Replace with your actual deployment URL)

**For Custom Domain (if you set one up later):**

```
https://yourdomain.com/oauth-native-callback
```

**For Local Development:**

```
http://localhost:3001/oauth-native-callback
http://localhost:8081/oauth-native-callback
```

**For Expo Development:**

```
exp://localhost:8081/oauth-native-callback
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select your project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://yourdomain.com/oauth-native-callback`
   - `http://localhost:3001/oauth-native-callback` (for local testing)

## Environment Variables

Ensure these are set in your production environment:

```bash
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
# or for development:
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

## Testing OAuth

### Local Testing

1. Build and serve locally:
   ```bash
   cd apps/expo
   pnpm build:web
   pnpm serve:pwa
   ```
2. Test on different browsers and devices
3. Check browser console for OAuth debug logs

### Production Testing

1. Deploy to your hosting platform
2. Ensure HTTPS is enabled
3. Test on various browsers:
   - iOS Safari
   - Chrome (mobile/desktop)
   - Firefox
   - Edge

## Debugging OAuth Issues

### Enable Debug Mode

Uncomment the OAuth debug component in `_layout.tsx`:

```typescript
// import OAuthDebug from "@/components/oauth-debug";
// <OAuthDebug />
```

### Common Issues & Solutions

**1. "Something went wrong" in Chrome**

- Check if popup is blocked
- Verify redirect URL in Clerk dashboard
- Check browser console for specific errors

**2. "Popup blocked" message**

- Expected behavior - the code falls back to redirect
- Ensure redirect URL is properly configured

**3. OAuth works locally but not in production**

- Verify HTTPS is enabled in production
- Check that production domain is added to Clerk OAuth settings
- Ensure environment variables are set correctly

**4. iOS Safari issues**

- iOS Safari always uses redirect flow (no popups)
- Ensure redirect URL handles the callback properly
- Check that the callback page loads correctly

## Browser Compatibility

| Browser        | Method   | Notes                                  |
| -------------- | -------- | -------------------------------------- |
| iOS Safari     | Redirect | Always uses redirect, no popup support |
| Chrome Mobile  | Redirect | Popup blocked, falls back to redirect  |
| Chrome Desktop | Redirect | Uses redirect for consistency          |
| Firefox        | Redirect | Uses redirect for consistency          |
| Edge           | Redirect | Uses redirect for consistency          |

## Security Considerations

1. **HTTPS Required**: OAuth requires HTTPS in production
2. **Redirect URL Validation**: Clerk validates redirect URLs
3. **State Parameter**: Clerk handles CSRF protection automatically
4. **Token Security**: Tokens are handled securely by Clerk

## Troubleshooting Checklist

- [ ] Clerk publishable key is set correctly
- [ ] Redirect URLs are configured in Clerk dashboard
- [ ] Google OAuth credentials are set up
- [ ] HTTPS is enabled in production
- [ ] Browser console shows no errors
- [ ] OAuth callback page loads correctly
- [ ] Environment variables are set in production

## Support

If issues persist:

1. Check Clerk dashboard logs
2. Enable OAuth debug component
3. Test with different browsers
4. Verify network requests in browser dev tools
