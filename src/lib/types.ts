export type Variant = { id: string; product_id: string; size: string; price: number; stock: number; sort: number };

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  images: string[];
  active: boolean;
  variants: Variant[];
};

export type OrderStatus = "pending" | "ready" | "claimed" | "cancelled";

export type OrderItem = { id: string; product_name: string; size: string; price: number; qty: number };

export type Order = {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  cit_student: boolean;
  student_id: string | null;
  payment_method: "gcash" | "cash";
  gcash_ref: string | null;
  receipt_path: string | null;
  status: OrderStatus;
  total: number;
  paid_at: string | null;
  ready_at: string | null;
  claimed_at: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
  created_at: string;
  order_items?: OrderItem[];
};

export type Role = "admin" | "staff";
