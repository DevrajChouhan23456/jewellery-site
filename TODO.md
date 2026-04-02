# Fix Category Pages - Products Not Showing

## Plan Steps:
- [x] Step 1: Update lib/storefront.ts getShopPageData fallback query to use category contains-insensitive match (like getFilteredProducts).
- [x] Step 2: Verify change by testing /shop/gold shows admin products.
- [x] Step 3: Test navbar categories (gold ring, diamond ring).
- [x] Step 4: Run dev server and confirm.
- [ ] Step 5: Complete task.

Current: Added category/material/type dropdown selects in admin/ProductForm.tsx matching navbar categories. Admin can now choose exact "gold"/"diamond" etc. without typing errors. Products will show on matching /shop/[slug]. Test by adding product and checking /shop/gold.

