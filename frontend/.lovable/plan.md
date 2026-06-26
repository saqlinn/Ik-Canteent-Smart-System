# IK Smart Canteen — Functional Upgrade Plan

This is a large scope. To ship reliably I'll deliver it in **3 phases** within this turn, prioritizing user-facing flows first.

## Phase 1 — Backend Foundation (Lovable Cloud)
Create database tables + RLS so everything else is real, not mock:
- `profiles` (name, register_no, college, dept, year, phone, role)
- `user_roles` (admin / student) — separate table for security
- `menu_items` (name, price, desc, image, category, available, stock)
- `orders` + `order_items` (status, total, gst, user_id)
- `inventory` (item, unit, total_stock, used)
- `inventory_logs` (daily usage entries)
- Trigger: auto-create profile + assign 'student' role on signup
- Trigger: enforce single-active-session via `active_session_id` on profile
- Seed menu items from current hardcoded list

## Phase 2 — Student Experience
1. **Auth wiring** — real signup/login against Supabase, persistent session via `onAuthStateChange`, register-number uniqueness check, single-session enforcement (write session ID on login, validate on each load)
2. **Global Cart Context** (`CartProvider`) with localStorage persistence
3. **Side Cart Drawer** — auto opens on Add to Cart, slide-in from right with overlay, qty +/-, remove, subtotal + 5% GST + total, "Proceed to Payment" / "Continue Ordering"
4. **Payment Page** (`/checkout`) — UPI (GPay/PhonePe tiles) + Net Banking (bank dropdown), processing → success screen, writes order to DB
5. **Logout** button in sidebar/navbar, clears session
6. **Public Navbar** — About / Founder / Services / Contact visible before & after login

## Phase 3 — Admin Panel
1. **Orders page** (`/admin/orders`) — list real orders, click → user profile drawer (name, reg#, college, dept, year, phone, past orders)
2. **Menu Management** (`/admin/menu`) — table with edit/delete/toggle availability + add-new dialog, instant reflection via Supabase realtime
3. **Inventory** (`/admin/inventory`) — grocery items (milk L, sugar kg, rice kg…), add monthly stock, log daily usage (auto-deducts), low-stock badges
4. **Analytics** (`/admin/analytics`) — real weekly/monthly revenue from `orders`, best sellers from `order_items`
5. Admin route guard via `has_role(uid, 'admin')`

## Phase 4 — Polish
- Footer: Developers section (Saqlin Mustaq + Nishat Fathima with LinkedIn/email/phone)
- Toasts for all actions (sonner)
- All buttons wired — no dummy handlers

## Technical Notes
- Cart state: React Context + localStorage (survives refresh, no DB needed until checkout)
- Single-session: store `active_session_id` (uuid generated at login) on profile; on app mount, compare; if mismatch → force logout with toast "Logged in on another device"
- GST: 5% on food (configurable constant)
- Payment "processing" is simulated (3s) then writes order — no real Stripe per scope
- Realtime: enable on `menu_items` + `orders` so admin & student stay in sync

## Files to create/edit (high level)
- `supabase/migrations/*` — schema
- `src/contexts/CartContext.tsx`, `src/contexts/AuthContext.tsx`
- `src/components/ik/SideCart.tsx`, `Navbar.tsx` (update), `Footer.tsx` (update)
- `src/routes/checkout.tsx`, `src/routes/_authenticated.tsx`, `src/routes/_admin.tsx`
- `src/routes/admin/{orders,menu,inventory,analytics}.tsx`
- Updates: `menu.tsx`, `login.tsx`, `signup.tsx`, `admin.tsx`, `__root.tsx`

Approve to proceed and I'll execute Phase 1 → 4 in sequence.