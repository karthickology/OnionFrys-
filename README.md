# OnionFrys — Module 1: Foundation

This is the first deployable foundation module for the OnionFrys Growth Engineering sandbox.

## What this module includes

- Next.js App Router application (JavaScript, not TypeScript).
- Storefront landing page and an admin workspace preview.
- Supabase browser/server client setup using `@supabase/ssr`.
- Next.js 16 `proxy.js` session-refresh entry point.
- Health endpoint at `/api/health`.
- Initial Supabase schema and Row Level Security (RLS).
- Product image Storage bucket.
- Three sample products for initial catalogue testing.

## What this module does NOT include yet

This is not the finished ecommerce store. It does not yet include customer login screens, protected admin operations, product management forms, cart, checkout, orders, CRM automation, GTM/GA4 events or analytics dashboards. Those are later modules.

Do not enter real customer data or use this as a live commercial store yet.

## Browser-only setup: GitHub

1. Extract the ZIP on your computer.
2. Open GitHub and create a new repository named `onionfrys`.
3. Keep it empty (do not add a README, license or `.gitignore`).
4. Open the new repository and choose **Add file → Upload files**.
5. Upload the contents inside the extracted `onionfrys-module-1` folder. Upload the files and folders, not the ZIP itself.
6. Commit the upload to the `main` branch.

You do not need Git, Node.js or VS Code for this upload method.

## Create the Supabase project

1. Open https://supabase.com/ and create a project.
2. Choose a strong database password and save it privately.
3. Wait for the database to finish provisioning.
4. Open **SQL Editor → New query**.
5. Open `supabase/migrations/0001_foundation.sql` from this project, copy its entire contents, paste into SQL Editor and click **Run**.
6. In Supabase **Project Settings → API** (or the project's Connect/API settings), copy:
   - Project URL
   - Publishable key (not the secret/service-role key)

The SQL creates the initial tables, access policies and public product-image bucket. It also inserts three sample products.

## Deploy on Vercel

1. Open https://vercel.com/ and sign in with GitHub.
2. Choose **Add New → Project** and import the `onionfrys` repository.
3. Framework should be detected as Next.js. Keep the default build settings.
4. Before deploying, add these Environment Variables:

   `NEXT_PUBLIC_SUPABASE_URL` = your Supabase Project URL

   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = your Supabase Publishable key

5. Deploy.

If you deploy before setting the variables, the app can still render, but the database status will show that Supabase is not configured. Add the variables and redeploy.

## Verify the deployment

- Open the Vercel deployment URL. The homepage should load.
- Open `/api/health`. After the SQL and environment variables are configured, the response should report `"database": "connected"`.
- The homepage foundation status should show **DATABASE CONNECTED**.
- Open `/admin` to see the admin workspace preview.

## Important security notes

- Never put a Supabase secret/service-role key in a `NEXT_PUBLIC_` variable or in frontend code.
- Never commit `.env.local` or real secrets to GitHub.
- The SQL gives customers read access only to published catalogue data. Inventory and customer profile records are not public.
- Customer profiles are created by a database trigger after Supabase Auth signup.
- Customer profile updates are column-restricted so users cannot promote themselves to admin.
- The `/admin` page is only a harmless preview in this module. Real admin functionality must not be added until login and server/database admin authorization are implemented and tested.

## How to make your first user an admin

After the app's authentication module is implemented, create your own account through the app. Then, in Supabase SQL Editor, run the following after replacing the email:

```sql
update public.profiles
set role = 'admin'
where id = (
  select id from auth.users
  where email = 'YOUR_LOGIN_EMAIL'
);
```

Do not run this for any other account.

## Project structure

```text
app/
  admin/page.js
  api/health/route.js
  globals.css
  layout.js
  page.js
lib/
  supabase/
    client.js
    proxy.js
    server.js
supabase/
  migrations/
    0001_foundation.sql
proxy.js
package.json
```

## Next module

Module 2 will add secure authentication and the real admin access boundary. After that, we can build catalogue management and the customer-facing product pages.
