# Jewellery Storefront

## Local Development

Run the app from `my-app`:

```bash
npm run dev
```

The storefront will be available at `http://localhost:3000`.

## Sanity Studio

The app now includes an embedded Sanity Studio at `/studio`.

1. Add the Sanity variables from `.env.example`.
2. Install dependencies with `npm install`.
3. Restart the dev server.
4. Visit `http://localhost:3000/studio`.

Published homepage and shop-page shell content now prefers Sanity, while Prisma
continues to power products, pricing, carts, and orders.

### Editing Homepage Content

1. Visit `http://localhost:3000/studio`.
2. Open the `Homepage` document in the Studio sidebar.
3. Update the area you want:
   `Hero Slides` controls the main homepage carousel and signature story cards.
   `Category Section` plus `Category Cards` controls the category grid.
   `Trending Section` plus `Trending Cards` controls the curated trending block.
   `Arrival Section` plus `Arrival Cards` controls the new arrivals block.
   `Gender Section` plus `Gender Cards` controls the shop-by-gender block.
   `Service Pillars`, `Reassurance Highlights`, `Concierge`, and `Styling Journal` control the lower homepage sections.
4. Publish the document in Sanity.

For category landing-page copy, open a `Shop Page` document in Studio. Product
inventory and prices still come from the app admin and Prisma, not Sanity.

To bootstrap the current Prisma-backed storefront content into Sanity, add a
write token and run:

```bash
npm run sanity:migrate-storefront
```

That command creates or replaces the singleton `homePage` document plus the
current `shopPage-*` editorial documents in Sanity using the existing storefront
content and image URL fallbacks.

The token must be able to create and update documents in your target dataset.
If `--dry-run` works but the real migration returns a 403 permission error, the
token is authenticated but does not have mutation rights.
