# Products Storefront Fix TODO

## Information Gathered
Admin creates `Product` model ✅
Storefront: `/shop/[slug]` → `CatalogPage` → `/api/products?slug=...` → `getFilteredProducts` → `Product.category === slug` (exact match fails)

## Files Analyzed
- `/src/app/api/products/route.ts` → Delegates to storefront.getFilteredProducts
- `/lib/storefront.ts` → Strict `where: { category: slug }`
- `/components/shop/catalog-page.tsx` → fetches `/api/products?slug=...`
- Schema: `Product.category String` (no isActive)

## Plan
1. [ ] Fix `/lib/storefront.ts` - `category: { contains: slug, mode: 'insensitive' }`
2. [ ] Add `cache: 'no-store'` to catalog-page fetch
3. [ ] Add fallback UI + logs
4. [ ] Test `/api/products?slug=jewellery`
5. [ ] Complete

## Dependent Files
None - isolated to query/filter logic

## Followup
- `npm run dev`
- Add product category="diamond" 
- /shop/diamond → shows ✅

Approve plan?

