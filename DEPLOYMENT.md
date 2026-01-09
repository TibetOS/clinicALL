# ClinicALL Deployment Guide

## Production Security Checklist

Before deploying to production, ensure the following security measures are in place:

### 1. Environment Variables

```bash
# REQUIRED
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# NEVER SET IN PRODUCTION
# VITE_ALLOW_DEMO_MODE=true  # Build will fail if set
# VITE_GEMINI_API_KEY=...    # Expose to client - use server-side proxy instead
```

### 2. HTTP Security Headers

Configure these headers at your deployment platform (Vercel, Netlify, Cloudflare, etc.):

```
# Prevent MIME type sniffing
X-Content-Type-Options: nosniff

# Prevent clickjacking (redundant with CSP frame-ancestors, but belt-and-suspenders)
X-Frame-Options: DENY

# Enforce HTTPS
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload

# Control referrer information
Referrer-Policy: strict-origin-when-cross-origin

# Disable unnecessary browser features
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()

# XSS Protection (legacy browsers)
X-XSS-Protection: 1; mode=block
```

#### Platform-Specific Configuration

**Vercel (vercel.json):**
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

**Netlify (_headers):**
```
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  X-XSS-Protection: 1; mode=block
```

**Cloudflare Pages (_headers):**
Same format as Netlify.

### 3. Content Security Policy

CSP is already configured in `index.html`. Verify it matches your deployment:

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' https://esm.sh;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https: blob:;
  connect-src 'self' https://*.supabase.co https://generativelanguage.googleapis.com wss://*.supabase.co;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
">
```

### 4. Supabase Configuration

#### Row Level Security (RLS)

Ensure RLS is enabled on all tables with proper policies:

```sql
-- Example: Patients table
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Clinic isolation policy
CREATE POLICY "Users can only access their clinic's patients"
ON patients
FOR ALL
USING (clinic_id = auth.jwt() ->> 'clinic_id');

-- Health tokens expiry policy
CREATE POLICY "Only active non-expired tokens are accessible"
ON health_declaration_tokens
FOR SELECT
USING (
  status = 'active'
  AND expires_at > NOW()
);
```

#### API Keys

- **Anon Key**: Safe to expose (limited by RLS)
- **Service Role Key**: NEVER expose client-side
- **Database Password**: NEVER expose

### 5. Build Verification

Before deploying, run:

```bash
# Clean install
rm -rf node_modules
pnpm install

# Type check
pnpm tsc --noEmit

# Build for production
pnpm build

# Verify no demo mode
# Build will fail with error if VITE_ALLOW_DEMO_MODE is set
```

### 6. Healthcare Compliance

For HIPAA/healthcare compliance:

1. **Business Associate Agreement (BAA)**
   - Ensure you have a BAA with Supabase if handling PHI
   - https://supabase.com/docs/guides/platform/hipaa-compliance

2. **Audit Logging**
   - Enable Supabase database logging
   - Consider implementing application-level audit logs for:
     - Patient data access
     - Data modifications
     - Admin actions

3. **Data Retention**
   - Implement data retention policies
   - Health declarations: Typically 7+ years
   - Session data: Clear after logout

4. **Encryption**
   - Data at rest: Enabled by Supabase by default
   - Data in transit: HTTPS enforced via HSTS

### 7. Monitoring

Set up monitoring for:

- Application errors (Sentry, LogRocket)
- API response times
- Failed authentication attempts
- Unusual data access patterns

### 8. Backup & Recovery

- Enable Supabase Point-in-Time Recovery (PITR)
- Regular backup verification
- Document recovery procedures

## Deployment Commands

```bash
# Build
pnpm build

# Preview locally
pnpm preview

# Deploy (platform-specific)
# Vercel: vercel --prod
# Netlify: netlify deploy --prod
```

## Post-Deployment Verification

1. Verify HTTPS is enforced
2. Check security headers at https://securityheaders.com
3. Test authentication flows
4. Verify RLS policies are working (try accessing other clinic's data)
5. Test health declaration token flow
6. Verify demo mode is disabled (mock data should not be accessible)
