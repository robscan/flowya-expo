# Security Guidelines for FLOWYA

## API Keys Security

### Google Maps API Keys

FLOWYA uses Google Maps, Places, and Geocoding APIs which require API keys. These keys must be properly secured to prevent unauthorized use and potential cost overruns.

#### Configuration

API keys are stored in environment variables using the `.env` file:

```
EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY=your_android_key_here
EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY=your_ios_key_here
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=your_places_key_here
```

**Important:** The `.env` file is in `.gitignore` and should never be committed to version control.

#### Security Best Practices

1. **Restrict API Keys in Google Cloud Console**

   For each API key, configure the following restrictions:

   - **Application restrictions:**
     - iOS: Add your iOS bundle ID (e.g., `com.flowya.app`)
     - Android: Add your Android package name (e.g., `com.flowya.app`)
     - Web: Add your domain (e.g., `https://flowya.app`, `https://www.flowya.app`)

   - **API restrictions:**
     - Only enable the APIs you need:
       - Maps SDK for Android
       - Maps SDK for iOS
       - Places API (if using Places features)
       - Geocoding API (if using geocoding features)
     - Do NOT enable all APIs

   - **IP restrictions (if applicable):**
     - For server-side usage, restrict by IP
     - For client-side usage, use application restrictions instead

2. **Key Rotation**

   - Regularly rotate API keys (recommended: every 90 days)
   - Have a process to update keys in production without downtime
   - Monitor usage patterns to detect anomalies

3. **Monitoring and Alerts**

   - Set up billing alerts in Google Cloud Console
   - Monitor API usage daily
   - Set up quota limits to prevent excessive usage
   - Review usage reports regularly

4. **Error Handling**

   - Never log API keys in error messages
   - Implement proper error handling that doesn't expose keys
   - Use environment-specific keys (development, staging, production)

5. **Development vs Production**

   - Use separate API keys for development and production
   - Development keys can have less restrictive settings
   - Production keys should have maximum restrictions enabled

#### Implementation Notes

- API keys are loaded from environment variables at build time (Expo uses `EXPO_PUBLIC_` prefix)
- Keys are embedded in the app bundle but protected by application restrictions
- Web deployment: Keys are visible in client-side code but restricted by domain
- Mobile deployment: Keys are in the app bundle but restricted by bundle ID/package name

#### Cost Management

- Set up billing budgets and alerts
- Monitor daily usage
- Review and optimize API calls
- Use caching to reduce API calls (already implemented for weather and places)
- Implement rate limiting on the client side (future enhancement)

## Authentication Security

### User Data

- User authentication data should be stored securely
- Use secure storage mechanisms (AsyncStorage is not encrypted - consider encryption for sensitive data)
- Never store passwords in plain text
- Use token-based authentication when connecting to a backend

### Data Validation

- Validate all user inputs on the client side
- Server-side validation is required for production (not yet implemented)
- Sanitize user-generated content

## General Security Practices

1. **Never commit secrets:**
   - API keys
   - Passwords
   - Private keys
   - Tokens

2. **Use environment variables:**
   - Store all secrets in `.env` files
   - Add `.env` to `.gitignore`
   - Use `.env.example` as a template (without real values)

3. **Keep dependencies updated:**
   - Regularly update npm packages
   - Monitor security advisories
   - Use `npm audit` to check for vulnerabilities

4. **Secure communication:**
   - Use HTTPS for all API calls
   - Implement certificate pinning for production (future enhancement)

5. **Error handling:**
   - Don't expose sensitive information in error messages
   - Log errors securely
   - Implement proper error boundaries

## Reporting Security Issues

If you discover a security vulnerability, please report it responsibly:

1. Do not open a public issue
2. Contact the development team directly
3. Provide detailed information about the vulnerability
4. Allow time for the issue to be addressed before disclosure

