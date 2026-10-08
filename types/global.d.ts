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

export interface Product {
  id: string;
  title: string;
  short_desc: string;
  long_desc: string;
  price: number;
  category: string;
  features: string[];
  image_url: string;
  is_active: boolean;
  created_at: string;
  file_url: string;
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
  image_url: string;
}