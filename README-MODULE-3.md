# OnionFrys — Module 3: Storefront & Product Catalogue

This module adds a customer-facing catalogue using the existing Supabase tables from Module 1. It extends the existing project; it does not replace Modules 1 or 2.

## What this module adds

- `/products` catalogue page.
- Product cards populated from published Supabase products.
- Product images loaded from the existing `product-images` Storage bucket.
- Search by product name, description, or category.
- Category filtering.
- Sorting by featured, price, and name.
- `/products/[slug]` product detail pages.
- Available stock display based on active variants and inventory.
- Responsive catalogue styling.

## Important boundaries

- This module does not yet add cart or checkout. Those are Module 4.
- Product create/edit/delete screens are part of the Admin & CRM module.
- No new database migration is required. It uses the existing `products`, `categories`, `product_categories`, `product_variants`, `inventory`, and `product_images` tables.
- Only products with `status = 'published'` are visible to customers.
- Product images must already be uploaded to the public `product-images` bucket and have a matching row in `product_images`.

## Upload to GitHub

1. Extract this ZIP on your computer.
2. Open your existing `OnionFrys-` GitHub repository.
3. Upload the files and folders from this ZIP into the repository root.
4. If GitHub asks whether to replace a file, replace only files with the exact same paths shown in this ZIP.
5. Commit the upload to `main`.

Files in this module:
- `lib/catalog.js`
- `lib/format-price.js`
- `components/product-catalog.js`
- `app/products/layout.js`
- `app/products/page.js`
- `app/products/[slug]/page.js`
- `app/products/catalog.css`

Do not delete your existing `app/page.js`, authentication files, Supabase client files, migration `0001_foundation.sql`, or other Module 1/2 files.

## Deploy

Vercel should automatically deploy after the GitHub commit. Wait for the latest deployment to show **Ready**.

## Browser test checklist

1. Open `/products`.
2. Confirm the three sample published products appear.
3. Search for `potato`.
4. Filter by `Just for Fun`.
5. Change sorting to `Price: low to high`.
6. Open a product card and confirm its detail page loads.
7. Confirm stock appears as a number if inventory rows exist.

If the page says no products are available, check that the products have `status = 'published'`. If it reports a catalogue connection error, revisit the Supabase connection issue before changing the catalogue code.

## What has and has not been verified

The archive contains the module source files. This ZIP has not been deployed or tested against your live Supabase project. Live behaviour must be confirmed using the browser checklist above.
