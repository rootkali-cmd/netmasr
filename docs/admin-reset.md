# Admin Credential Reset

If you lose access to the admin panel, you can reset the admin username and password directly in the database.

## How to Use

```bash
# Requires PostgreSQL connection string (same as production)
DATABASE_URL="postgresql://user:password@host:5432/netmasr?sslmode=require" \
ADMIN_RESET_USERNAME="admin" \
ADMIN_RESET_PASSWORD="MySecure!Password123" \
npm run admin:reset
```

## Password Requirements

- Minimum 14 characters
- At least one lowercase letter
- At least one uppercase letter
- At least one number
- At least one symbol (!@#$%^&*...)

## Security Notes

- **Do not commit secrets** — Never commit `.env` or shell history containing these variables
- **Do not share DATABASE_URL** — Your database connection string must remain private
- **Do not store plaintext passwords** — This script hashes the password with bcrypt (cost 12) before storing it
- **2FA is preserved** — If the admin account already has 2FA configured, it stays enabled after the reset. You will still need to complete 2FA after logging in
- **No hardcoded passwords** — There is no default admin password in the codebase. All credentials must be provided via environment variables

## Example

```bash
DATABASE_URL="postgresql://admin:securepass@db.example.com:5432/netmasr?sslmode=require" \
ADMIN_RESET_USERNAME="netmasr_admin" \
ADMIN_RESET_PASSWORD="C0mpl3x!PassWord999" \
npm run admin:reset
# Output: Admin credentials reset successfully. 2FA was preserved.
```

## After Resetting

1. Navigate to your admin panel URL (the `ADMIN_PANEL_PATH` from your `.env`)
2. Log in with the new username and password
3. Complete 2FA with your authenticator app if 2FA was already configured
4. (Recommended) Change credentials immediately after login via the admin settings page

## Troubleshooting

**"Password must be at least 14 characters"**
Make sure your password meets all requirements including symbols.

**"ADMIN_RESET_USERNAME is not set"**
Make sure the environment variable is exported before running the script.

**2FA is not working after reset**
If 2FA was configured, the secret key is preserved during reset. Make sure your system time is correct — TOTP codes are time-based.

## Why This Script Exists

The admin credentials must live in the database only. There is no fallback admin password stored in the codebase. This script is the secure way to regain access without weakening the admin panel security.
