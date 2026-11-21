export { }

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: 'admin' | 'user';
    };
  }

  interface SnapResult {
    order_id?: string;
    status_code?: string;
    status_message?: string;
    transaction_id?: string;
    [key: string]: unknown;
  }

  interface SnapCallbacks {
    onSuccess?: (result: SnapResult) => void;
    onPending?: (result: SnapResult) => void;
    onError?: (result: SnapResult) => void;
    onClose?: () => void;
  }

  interface Snap {
    pay: (token: string, callbacks?: SnapCallbacks) => void;
  }

  interface Window {
    snap?: Snap;
  }
}

/** State yang dikembalikan Server Action ke `useActionState`. */
export type ActionState = {
  success: boolean;
  message: string;
};

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

/** Satu layanan jasa berkas lamaran yang dijual dengan harga tetap. */
export interface Service {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  languages: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type ServiceOrderStatus = Order["status"];

/** Pesanan jasa; `order_id` selalu diawali `SVC-`. */
export interface ServiceOrder {
  order_id: string;
  user_id: string;
  email: string | null;
  service_id: string | null;
  service_name: string;
  service_slug: string | null;
  language: string;
  amount: number;
  status: ServiceOrderStatus;
  brief: string | null;
  source_file_url: string | null;
  source_file_name: string | null;
  result_file_url: string | null;
  result_file_name: string | null;
  admin_notes: string | null;
  delivered_at: string | null;
  snap_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceMessage {
  id: string;
  order_id: string;
  sender_id: string;
  sender_role: "user" | "admin";
  body: string;
  created_at: string;
}

export interface ProductSnapshot {
  id: string;
  original_product_id: string | null;
  title: string;
  short_desc: string | null;
  long_desc: string | null;
  price: number;
  category_id: string | null;
  features: string[];
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