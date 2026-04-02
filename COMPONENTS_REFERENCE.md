# Dashboard Components Quick Reference

## Components Overview

### 1. AnalyticsCards
**Location:** `components/admin/AnalyticsCards.tsx`

Displays 4 KPI metrics in a grid.

```typescript
<AnalyticsCards
  revenue={orderStats.totalRevenue}
  orders={orderStats.totalOrders}
  users={orderStats.totalUsers}
  averageOrderValue={enhancedAnalytics.averageOrderValue}
  revenueChange={5.2}        // Optional: % change
  ordersChange={-2.1}        // Optional: % change
  usersChange={10.5}         // Optional: % change
/>
```

**Displays:**
- Total Revenue (₹, compact notation)
- Total Orders (count)
- Total Users (count)
- Average Order Value (₹)

---

### 2. EnhancedSalesGraph
**Location:** `components/admin/EnhancedSalesGraph.tsx`

Dual-axis chart with revenue bars and order line.

```typescript
<EnhancedSalesGraph 
  data={enhancedAnalytics.dailyBreakdown}
  title="Sales Performance (Last 30 Days)"
  description="Revenue and order trends over time"
/>
```

**Data Format Required:**
```typescript
Array<{
  date: string;      // ISO format: "2024-04-01"
  revenue: number;   // In paisa (1 rupee = 100 paisa)
  orders: number;    // Order count
}>
```

**Features:**
- Auto date formatting
- Currency conversion
- Interactive tooltips
- Stats summary below

---

### 3. InventoryAlerts
**Location:** `components/admin/InventoryAlerts.tsx`

Shows low stock products with progress bars.

```typescript
<InventoryAlerts products={lowStockProducts} />
```

**Data Format Required:**
```typescript
Array<{
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  images?: string[];
}>
```

**Features:**
- Shows top 5 lowest stock
- Visual progress bars
- Stock percentage badges
- Quick edit links

---

### 4. ConversionFunnel
**Location:** `components/admin/ConversionFunnel.tsx`

Visualizes visitor journey to conversion.

```typescript
<ConversionFunnel metrics={funnelMetrics} />
```

**Data Format Required:**
```typescript
{
  totalVisitors: number;
  usersWithCart: number;
  completedOrders: number;
  conversionRates: {
    cartConversion: number;      // %
    checkoutConversion: number;  // %
    overall: number;            // %
  };
}
```

**Features:**
- Funnel visualization
- Drop-off metrics
- Conversion rates
- Color-coded stages

---

## Backend Functions

### getEnhancedAnalytics(days: number = 30)

```typescript
const data = await getEnhancedAnalytics(30);

// Returns:
{
  totalRevenue: number;      // Total in paisa
  totalOrders: number;       // Count
  averageOrderValue: number; // Calculated
  dailyBreakdown: Array<{    // For graph
    date: string;
    revenue: number;
    orders: number;
  }>;
}
```

---

### getLowStockProducts(threshold?: number)

```typescript
const products = await getLowStockProducts(10); // threshold = 10 units

// Returns:
Array<{
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  images?: string[];
}>
```

---

### getFunnelMetrics(days: number = 30)

```typescript
const metrics = await getFunnelMetrics(30);

// Returns:
{
  totalVisitors: number;
  usersWithCart: number;
  completedOrders: number;
  conversionRates: {
    cartConversion: number;      // % of visitors who added to cart
    checkoutConversion: number;  // % of cart users who ordered
    overall: number;             // % of total visitors who ordered
  };
}
```

---

## PostHog Events

### Tracking Events

```typescript
import { posthogEvents } from "@/lib/posthog-analytics";

// Dashboard view
posthogEvents.trackDashboardView("admin-id-123");

// Visitor funnel
posthogEvents.trackVisitor("user-id-456");

// Add to cart
posthogEvents.trackAddToCart("product-id", 2);

// Checkout
posthogEvents.trackCheckout("order-id", 50000); // in paisa

// Order update
posthogEvents.trackOrderStatusChange("order-id", "SHIPPED");

// Product view
posthogEvents.trackProductView("product-id", "Product Name");

// Search
posthogEvents.trackSearch("gold bracelet", 15); // 15 results
```

---

## Database Queries

### Add stock to new products

```typescript
await prisma.product.create({
  data: {
    name: "Product Name",
    slug: "product-name",
    price: 5000,
    stock: 50,
    lowStockThreshold: 10,
    // ... other fields
  },
});
```

### Update stock

```typescript
await prisma.product.update({
  where: { id: "product-id" },
  data: { stock: 25 },
});
```

### Get low stock products

```typescript
const lowStock = await prisma.product.findMany({
  where: {
    stock: { lte: 10 }, // Below threshold
  },
  orderBy: { stock: "asc" },
});
```

---

## Tailwind Classes Used

### Card styling
```
rounded-[1.5rem] border border-stone-200 bg-gradient-to-br
```

### Section styling
```
overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 backdrop-blur
```

### Progress bars
```
h-2 w-24 rounded-full bg-stone-200 → filled with color via style={{ width }}
```

### Grid layouts
```
grid gap-4 sm:grid-cols-2 lg:grid-cols-4
```

---

## Integration Points

### In Dashboard Page
```typescript
import { AnalyticsCards } from "@/components/admin/AnalyticsCards";
import { EnhancedSalesGraph } from "@/components/admin/EnhancedSalesGraph";
import { InventoryAlerts } from "@/components/admin/InventoryAlerts";
import { ConversionFunnel } from "@/components/admin/ConversionFunnel";
import {
  getEnhancedAnalytics,
  getLowStockProducts,
  getFunnelMetrics,
} from "@/server/services/admin/orders";
```

---

## Performance Notes

✅ All queries use transactions
✅ No N+1 database queries
✅ Parallel data fetching with Promise.all()
✅ Optimized Recharts rendering
✅ Efficient aggregations

---

## Testing

### Test data requirements
- At least 1 paid order for graph data
- Stock values set on products
- 30 days of order history recommended

### Verify in browser
1. Check Network tab for API calls
2. Verify no console errors
3. Test responsive design (mobile, tablet, desktop)
4. Check Recharts renders properly

---

**Last Updated:** April 3, 2026
**Status:** Production Ready
