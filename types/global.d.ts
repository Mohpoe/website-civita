export { }

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: 'admin' | 'user';
    };
  }

  interface Window {
    snap: any;
  }
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
  product_count?: number;
};

export interface Product {
  id: string;
  title: string;
  short_desc: string;
  long_desc: string;
  price: number;
  category_id: string;
  features: string[];
  image_url: string;
  is_active: boolean;
  created_at: string;
  file_url: string;
  category?: Category;
}

export interface Order {
  order_id: string;
  user_id: string | null;
  product_id: string | null;
  product_snapshot_id: string | null;
  amount: number;
  status: 'pending' | 'success' | 'failed' | 'expired' | 'canceled' | 'challenge';
  snap_token: string | null;
  created_at: string;
  clerk_user_deleted_at: string | null;
  product?: Product;
  product_snapshot?: ProductSnapshot;
  email?: string;
}

export interface ProductSnapshot {
  id: string;
  original_product_id: string | null;
  title: string;
  short_desc: string | null;
  long_desc: string | null;
  price: number;
  image_url: string;
  file_url: string;
  created_at: string;
  deleted_at: string;
}

export interface ReportKPI {
  total_revenue: number;
  total_orders: number;
  total_success: number;
}

export interface ReportChartData {
  date: string;
  success_revenue: number;
  failed_revenue: number;
  success_orders: number;
  failed_orders: number;
}

export interface TopProduct {
  id: string;
  title: string;
  category: string;
  sold_count: number;
  revenue: number;
}

export interface ReportOrderHistory {
  order_id: string;
  user_id: string | null;
  email: string | null;
  amount: number;
  status: string;
  created_at: string;
  clerk_user_deleted_at: string | null;
  product_title: string | null;
}