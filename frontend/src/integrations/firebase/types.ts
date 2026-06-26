// Firebase Firestore data types — mirrors the original Supabase schema

export type AppRole = "admin" | "student";

export interface Profile {
  id: string;           // Firestore doc id = user uid
  user_id: string;
  full_name: string;
  register_no: string | null;
  college: string | null;
  department: string | null;
  year: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  available: boolean;
  best_seller: boolean;
  rating: number | null;
  eta_min: number | null;
  stock: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  subtotal: number;
  gst: number;
  total: number;
  status: "preparing" | "ready" | "completed";
  payment_method: string | null;
  upi_id: string | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  name: string;
  price: number;
  quantity: number;
}

export interface CategorySetting {
  id: string;
  category: string;
  opening_time: string | null;
  closing_time: string | null;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  item_name: string;
  unit: string;
  total_stock: number;
  used: number;
  low_threshold: number;
  updated_at: string;
}

export interface InventoryLog {
  id: string;
  inventory_id: string;
  amount: number;
  kind: "stock_in" | "stock_out" | "usage";
  note: string | null;
  created_at: string;
}
