export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  image_url: string;
  category: string;
  is_active: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Customer {
  id?: string;
  name: string;
  phone: string;
  email: string;
}

export interface Order {
  id: string;
  customer_id: string;
  total_amount: number;
  status: string;
  payment_reference: string;
  payment_method: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  price: number;
  duration: string;
  quantity: number;
}