export interface Product {
  id: number;
  title: string;
  name: string;
  brand: string;
  category: string;
  model_no: string;
  image_url: string;
  image: string;
  description: string;
  base_price: number;
  price: number;
  rating: number;
  reviews_count: number;
  stock: number;
  is_demo_data?: number;
  store_count?: number;
  min_store_price?: number;
  min_store_name?: string;
  max_discount_pct?: number;
  min_history_price?: number;
  max_history_price?: number;
  avg_history_price?: number;
}

export interface StoreListing {
  id: number;
  product_id: number;
  store_name: string;
  price: number;
  original_price: number;
  delivery_charge: number;
  availability_status: string;
  store_url: string;
  bank_offer?: string;
  last_checked_at: string;
}

export interface PriceSnapshot {
  id: number;
  product_id: number;
  price: number;
  timestamp: string;
  store_name: string;
}

export interface Coupon {
  id: number;
  store_name: string;
  code: string;
  discount_text: string;
  min_order_amount: number;
  expiry_date: string;
  is_verified: number;
  verified_date: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedStore?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface PriceAlert {
  id: number;
  product_id: number;
  product_title?: string;
  target_price: number;
  current_price?: number;
  status: string;
  created_at: string;
}
