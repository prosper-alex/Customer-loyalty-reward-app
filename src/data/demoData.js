// Sample data used only in PREVIEW MODE (no Supabase configured yet).
// Mirrors the shape of the real tables in supabase/schema.sql so every
// screen renders exactly like it will once the backend is connected.

export function makeDemoProfile() {
  return {
    id: "demo-user",
    full_name: "Chidinma Okafor",
    email: "preview@loyaltyapp.demo",
    avatar_url: "https://randomuser.me/api/portraits/women/44.jpg",
    points_balance: 2480,
    lifetime_points: 12450,
    tier: "Gold",
    member_since: "2023-01-01",
    member_code: "#9870-1744-88",
  };
}

export const demoRewards = [
  { id: "r1", title: "Chilled Chapman", description: "The house special, served ice cold", category: "drinks", points_cost: 200, icon: "solar:cup-outline", badge_label: null, is_featured: false },
  { id: "r2", title: "Fresh Zobo Drink", description: "Hibiscus zobo with ginger and pineapple", category: "drinks", points_cost: 150, icon: "solar:cup-paper-outline", badge_label: null, is_featured: false },
  { id: "r3", title: "Bottle of Chi Exotic", description: "Any flavor, chilled", category: "drinks", points_cost: 250, icon: "solar:cup-outline", badge_label: null, is_featured: false },
  { id: "r4", title: "Jollof Rice & Chicken", description: "Party-style jollof with grilled chicken", category: "food", points_cost: 900, icon: "solar:chef-hat-outline", badge_label: null, is_featured: false },
  { id: "r5", title: "Suya Platter (Beef)", description: "Spicy grilled beef suya with yaji spice", category: "food", points_cost: 700, icon: "solar:donut-outline", badge_label: null, is_featured: false },
  { id: "r6", title: "Meat Pie (2 pcs)", description: "Freshly baked, flaky pastry", category: "food", points_cost: 400, icon: "solar:donut-outline", badge_label: null, is_featured: false },
  { id: "r7", title: "Puff Puff (6 pcs)", description: "Soft, sweet, and golden fried", category: "food", points_cost: 300, icon: "solar:donut-outline", badge_label: null, is_featured: false },
  { id: "r8", title: "Moin Moin Special", description: "Steamed bean pudding with egg and fish", category: "food", points_cost: 500, icon: "solar:donut-outline", badge_label: null, is_featured: false },
  { id: "r9", title: "15% Off Next Order", description: "Applies to your entire bill", category: "discounts", points_cost: 800, icon: "solar:ticket-sale-outline", badge_label: null, is_featured: false },
  { id: "r10", title: "Reusable Ankara Tote Bag", description: "Locally made, limited print", category: "discounts", points_cost: 1200, icon: "solar:bag-heart-outline", badge_label: null, is_featured: false },
  { id: "r11", title: "Owambe Party Pack", description: "Jollof rice, small chops, and 2 bottles of Chapman — enough to share.", category: "food", points_cost: 1800, icon: "solar:gift-bold", badge_label: "Featured", is_featured: true },
];

export const demoVouchers = [
  { id: "v1", title: "10% Off Suya Platter", code: "SUYA10-WELCOME", expires_at: new Date(Date.now() + 14 * 86400000).toISOString(), is_active: true },
  { id: "v2", title: "Free Puff Puff (6 pcs)", code: "PUFFPUFF-FREE", expires_at: new Date(Date.now() + 7 * 86400000).toISOString(), is_active: true },
];

export const demoActivity = [
  { id: "a1", title: "Welcome bonus", points_delta: 500, kind: "bonus", created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: "a2", title: "Redeemed Meat Pie (2 pcs)", points_delta: -400, kind: "redeem", created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: "a3", title: "Purchase at Lekki Phase 1 outlet", points_delta: 320, kind: "earn", created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: "a4", title: "Redeemed Fresh Zobo Drink", points_delta: -150, kind: "redeem", created_at: new Date(Date.now() - 4 * 86400000).toISOString() },
];

export const demoNotifications = [
  { id: "n1", title: "Welcome to LoyaltyApp!", body: "You've been credited 500 welcome points. Start redeeming rewards today.", is_read: false, created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: "n2", title: "Your Gold Tier is active", body: "Earn 10 points for every ₦100 spent at any partner outlet nationwide.", is_read: false, created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: "n3", title: "Points expiring soon", body: "150 points from your March activity expire in 10 days.", is_read: true, created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
];

export const demoPaymentMethods = [
  { id: "p1", brand: "Verve", last4: "4417", exp_month: 9, exp_year: 2028, is_default: true },
];

export function makeDemoNotificationPrefs() {
  return {
    user_id: "demo-user",
    push_enabled: true,
    promo_emails: true,
    order_updates: true,
    points_alerts: true,
  };
}
