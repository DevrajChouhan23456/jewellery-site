# Implementation Checklist

## Phase 1: Database Migration ⚙️

- [ ] Run migration: `npx prisma migrate dev --name add_stock_fields`
- [ ] Verify migration completed successfully
- [ ] Test accessing `/admin/dashboard` (should load without errors)

## Phase 2: Update Product Data 📦

Option A: **Seed existing products**
```bash
# Edit prisma/seed.ts to include stock values
# Then run:
npx prisma db seed
```

Option B: **Manually update products**
- Go to `/admin/products`
- Edit each product
- Set stock values

Option C: **Database query**
```javascript
// In browser console or mongo shell:
db.Product.updateMany({}, { $set: { stock: 10, lowStockThreshold: 10 } })
```

## Phase 3: Test Dashboard 🧪

- [ ] Visit `/admin/dashboard`
- [ ] Verify **Analytics Cards** display revenue/orders/users/AOV
- [ ] Verify **Sales Graph** shows data (if orders exist)
- [ ] Verify **Inventory Alerts** shows low stock
- [ ] Verify **Conversion Funnel** displays visitor data
- [ ] Verify existing sections still work (Top Products, Orders, etc.)

## Phase 4: PostHog Setup (Optional) 📊

- [ ] Create account at [posthog.com](https://posthog.com)
- [ ] Get API key from settings
- [ ] Add to `.env.local`:
```env
NEXT_PUBLIC_POSTHOG_KEY=phc_your_key_here
```
- [ ] Restart dev server: `npm run dev`
- [ ] Visit dashboard and check DevTools for PostHog requests

## Phase 5: Production Deployment 🚀

- [ ] Test locally first
- [ ] Run `npm run build` successfully
- [ ] Deploy to production
- [ ] Verify dashboard works in production

## Troubleshooting

### "Table Product doesn't have stock field" error
→ Run: `npx prisma migrate deploy`

### Graph showing no data
→ Need at least one paid order. Check:
```javascript
db.Order.findOne({ paymentStatus: "PAID" })
```

### Components not rendering
→ Clear `.next` folder: `rm -rf .next && npm run dev`

### PostHog events not showing
→ Check browser Network tab for API calls to posthog.com

## Files Modified

✅ `prisma/schema.prisma` - Added stock fields
✅ `src/server/services/admin/orders.ts` - Added 3 new functions
✅ `src/app/admin/dashboard/page.tsx` - Updated layout

## Files Created

✅ `components/admin/AnalyticsCards.tsx`
✅ `components/admin/EnhancedSalesGraph.tsx`
✅ `components/admin/InventoryAlerts.tsx`
✅ `components/admin/ConversionFunnel.tsx`
✅ `lib/posthog-analytics.ts`
✅ `components/analytics/PostHogScript.tsx`
✅ `ADMIN_DASHBOARD_UPGRADE.md` - Full documentation

## Expected Performance

- Dashboard loads in <1 second
- Analytics calculations instant
- No N+1 queries
- Optimized Recharts rendering

---

**Ready to roll out!** 🎉
