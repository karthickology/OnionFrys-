# OnionFrys — Module 2: Authentication & Admin Security

This package extends your existing Module 1 repository. It does not replace the project.

## What this module adds
- Customer registration, login and logout
- Supabase email-confirmation callback
- Protected customer account page (`/account`)
- Protected admin page (`/admin`)
- Server-side admin authorization using the existing `public.is_admin()` database function

## Compatibility checked
The public GitHub repository's Module 1 files were inspected before preparing this package. The current schema includes:
- `public.profiles(id, full_name, phone, role, created_at, updated_at)`
- `public.is_admin()` returning boolean
- A trigger that creates a profile after Supabase Auth signup
- `lib/supabase/server.js` and `lib/supabase/client.js`

**No new SQL migration is required for this module.**

## Upload the files
1. Extract this ZIP on your computer.
2. Open your existing GitHub repository: `karthickology/OnionFrys-`.
3. Click **Add file → Upload files**.
4. Upload the extracted files/folders, preserving their folder structure.
5. If GitHub asks to replace existing files, replace only the matching paths listed below.
6. Commit the changes to `main`.

Files that replace Module 1:
- `app/page.js`
- `app/admin/page.js`
- `app/globals.css`

New files:
- `app/login/page.js`
- `app/register/page.js`
- `app/account/page.js`
- `app/auth/callback/route.js`
- `components/auth-form.js`
- `components/sign-out-button.js`

Do not delete other Module 1 files.

## Supabase Auth URL configuration
In Supabase:
1. Open **Authentication → URL Configuration**.
2. Set **Site URL** to your actual Vercel site URL.
3. Add this Redirect URL: `https://YOUR-VERCEL-DOMAIN/auth/callback`
4. Save.

Replace `YOUR-VERCEL-DOMAIN` with your actual deployed domain. You can add the localhost callback later if you ever test locally.

## First admin account
1. Open the deployed website.
2. Register using your own email address.
3. If Supabase asks for email confirmation, open the email and confirm.
4. Sign in.
5. In Supabase **SQL Editor**, run this query after replacing the email:
```sql
update public.profiles
set role = 'admin'
where id = (
  select id
  from auth.users
  where lower(email) = lower('YOUR_LOGIN_EMAIL')
);
```
6. Check that exactly one row was updated.
7. Sign out, sign in again, then open `/admin`.

Only promote your own account. The website never accepts an admin role from a signup form or browser input.

## Test checklist
- Signed out → `/account` redirects to `/login`.
- Signed out → `/admin` redirects to `/login?next=/admin`.
- A registered customer can sign in and see their email on `/account`.
- A normal customer opening `/admin` sees **Access denied**.
- After promoting your own profile in Supabase, sign in again and open `/admin`.
- Sign out; protected routes should redirect again.

## Important: Module 1 database connection
Your earlier `/api/health` check returned `PGRST125`. That issue was deferred. If the Supabase URL/client connection is still broken, signup/login and the database admin check will not work yet. Module 2 does not silently bypass that issue; fix the connection before treating authentication as complete.

## Scope and verification
The ZIP structure was validated. This is not a live deployment or a build executed against your Vercel/Supabase account. Follow the browser tests above after uploading.
