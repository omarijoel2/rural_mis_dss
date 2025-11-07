# Security Configuration Guide

This document outlines the security configuration for CORS and cookie settings in the Rural Water Supply MIS application.

## CORS (Cross-Origin Resource Sharing) Configuration

### File: `api/config/cors.php`

**Lockdown Features:**

1. **Restricted Origins** - Only specific domains are allowed to make API requests:
   ```php
   'allowed_origins' => array_filter(explode(',', env('CORS_ALLOWED_ORIGINS', 'http://localhost:5173,http://localhost:3000'))),
   ```
   - Default: `localhost:5173` (Vite dev server), `localhost:3000` (alternative dev port)
   - Production: Set `CORS_ALLOWED_ORIGINS` environment variable to your production frontend domain(s)

2. **Explicit HTTP Methods** - Only standard REST methods allowed:
   - GET, POST, PUT, PATCH, DELETE, OPTIONS

3. **Restricted Headers** - Only necessary headers permitted:
   - Content-Type, X-Requested-With, Authorization, Accept, Origin
   - X-CSRF-TOKEN, X-XSRF-TOKEN (for CSRF protection)

4. **Credentials Support** - Enabled for cookie-based authentication:
   ```php
   'supports_credentials' => true,
   ```

5. **Preflight Caching** - 10 minute cache for OPTIONS requests:
   ```php
   'max_age' => 600,
   ```

### Environment Variables

Create `.env` file in `api/` directory with:

```env
# Development
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Production
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## Session/Cookie Configuration

### File: `api/config/session.php`

**Security Features:**

1. **Session Encryption** - All session data encrypted by default:
   ```php
   'encrypt' => env('SESSION_ENCRYPT', true),
   ```

2. **Secure Cookies** - HTTPS-only in production:
   ```php
   'secure' => env('SESSION_SECURE_COOKIE', env('APP_ENV') === 'production'),
   ```
   - Development (HTTP): `false`
   - Production (HTTPS): `true` (automatic)

3. **HttpOnly Cookies** - Prevents JavaScript access:
   ```php
   'http_only' => env('SESSION_HTTP_ONLY', true),
   ```
   - Mitigates XSS attacks by preventing client-side script access to cookies

4. **SameSite Attribute** - Strict CSRF protection:
   ```php
   'same_site' => env('SESSION_SAME_SITE', 'strict'),
   ```
   - `strict`: Cookies only sent with same-site requests
   - Prevents CSRF attacks by default
   - Can be changed to `lax` if needed for certain OAuth flows

5. **Session Lifetime** - Configurable timeout:
   ```php
   'lifetime' => (int) env('SESSION_LIFETIME', 120), // 2 hours
   ```

### Environment Variables

```env
# Session encryption (enabled by default)
SESSION_ENCRYPT=true

# Secure cookies (auto-enabled in production)
SESSION_SECURE_COOKIE=true

# HttpOnly (always enabled for security)
SESSION_HTTP_ONLY=true

# SameSite policy (strict by default)
SESSION_SAME_SITE=strict

# Session lifetime in minutes
SESSION_LIFETIME=120

# Session driver (database recommended for multi-server setups)
SESSION_DRIVER=database
```

## Sanctum Configuration

### File: `api/config/sanctum.php`

**Stateful Domains** - Frontend domains allowed to use cookie authentication:

```php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', 'localhost:5173,localhost:3000,127.0.0.1:5173,127.0.0.1:3000')),
```

### Environment Variables

```env
# Development
SANCTUM_STATEFUL_DOMAINS=localhost:5173,localhost:3000,127.0.0.1:5173,127.0.0.1:3000

# Production
SANCTUM_STATEFUL_DOMAINS=yourdomain.com,www.yourdomain.com
```

## Production Deployment Checklist

### 1. Environment Variables

Ensure these are set in production `.env`:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

CORS_ALLOWED_ORIGINS=https://yourdomain.com
SANCTUM_STATEFUL_DOMAINS=yourdomain.com

SESSION_DRIVER=database
SESSION_ENCRYPT=true
SESSION_SECURE_COOKIE=true
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=strict
SESSION_LIFETIME=120
```

### 2. HTTPS Configuration

- Ensure your production server uses HTTPS (TLS/SSL certificate)
- Redirect all HTTP traffic to HTTPS
- Use HSTS header: `Strict-Transport-Security: max-age=31536000; includeSubDomains`

### 3. Domain Configuration

- Set `APP_URL` to your production domain
- Update `CORS_ALLOWED_ORIGINS` with your frontend domain(s)
- Update `SANCTUM_STATEFUL_DOMAINS` with the same domains (without protocol)

### 4. Session Storage

- Use `database` driver for session storage in multi-server environments
- Ensure `sessions` table exists (run migrations if needed)
- Consider Redis for high-traffic applications

### 5. Rate Limiting

Rate limiting is configured in `api/app/Http/Kernel.php`:

```php
'api' => [
    'throttle:60,1', // 60 requests per minute
    // ...
],
```

Adjust as needed for your use case.

## Testing Security Configuration

### 1. Test CORS in Development

```bash
# Should succeed (localhost:5173 is allowed)
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS http://localhost:8000/api/schemes

# Should fail (unauthorized origin)
curl -H "Origin: http://evil.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS http://localhost:8000/api/schemes
```

### 2. Test Cookie Security

Check cookie attributes in browser DevTools:

```
Set-Cookie: laravel_session=...; 
  HttpOnly; 
  Secure; 
  SameSite=Strict
```

### 3. Test CSRF Protection

All state-changing requests (POST, PUT, PATCH, DELETE) require CSRF token:

```javascript
// Fetch CSRF cookie first
await fetch('http://localhost:8000/sanctum/csrf-cookie', {
  credentials: 'include'
});

// Then make authenticated request
await fetch('http://localhost:8000/api/schemes', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-XSRF-TOKEN': getCsrfToken(), // From cookie
  },
  credentials: 'include',
  body: JSON.stringify({...})
});
```

## Troubleshooting

### CORS Issues

**Error:** `Access to fetch at 'http://localhost:8000/api/...' from origin 'http://localhost:5173' has been blocked by CORS policy`

**Solution:** 
- Verify `CORS_ALLOWED_ORIGINS` includes your frontend domain
- Ensure `supports_credentials: true` is set
- Clear browser cache and restart dev server

### Cookie Not Being Set

**Error:** Cookies not persisting across requests

**Solution:**
- Check `SANCTUM_STATEFUL_DOMAINS` includes your frontend domain
- Ensure frontend uses `credentials: 'include'` in fetch requests
- In development, cookies may not work across different ports without proper configuration

### SameSite=Strict Issues

**Error:** Cookies not sent on navigation from external sites

**Solution:**
- Change `SESSION_SAME_SITE=lax` if you need cookies on top-level navigation
- Keep `strict` for maximum security if external navigation isn't needed

## Security Headers

Consider adding these headers in your web server config (Nginx/Apache) or middleware:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

## References

- [Laravel CORS Documentation](https://laravel.com/docs/11.x/sanctum#cors-and-cookies)
- [Laravel Session Documentation](https://laravel.com/docs/11.x/session)
- [Laravel Sanctum Documentation](https://laravel.com/docs/11.x/sanctum)
- [MDN CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [MDN Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie)
- [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
