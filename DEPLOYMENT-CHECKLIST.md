# OnionFrys Module 1 — Deployment Checklist

## GitHub
- [ ] Create empty repository named `onionfrys`.
- [ ] Upload the extracted project contents (not the ZIP file).
- [ ] Confirm `package.json`, `app/`, `lib/`, `supabase/` and `proxy.js` are visible at repository root.

## Supabase
- [ ] Create Supabase project.
- [ ] Run `supabase/migrations/0001_foundation.sql` in SQL Editor.
- [ ] Confirm tables exist: profiles, categories, products, product_categories, product_variants, inventory, product_images.
- [ ] Confirm `product-images` bucket exists.
- [ ] Copy Project URL and Publishable key.

## Vercel
- [ ] Import the GitHub repository.
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL`.
- [ ] Add `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- [ ] Deploy.
- [ ] Open `/api/health` and confirm database is connected.
- [ ] Open homepage and confirm DATABASE CONNECTED.

## Security / readiness
- [ ] Never expose the Supabase secret/service-role key.
- [ ] Do not add real customer data yet.
- [ ] Do not use `/admin` for real operations yet; authentication and admin authorization are not included until Module 2.
