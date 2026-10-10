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
  user_id: string;
  product_id: string;
  product_name: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  snap_token: string | null;
  download_url: string;
  created_at: string;
  product?: Product;
}