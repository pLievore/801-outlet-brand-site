export type LeadProductView = {
  handle: string;
  title: string;
  image?: string | null;
  price?: string | null;
  viewCount: number;
  firstViewedAt: string;
  lastViewedAt: string;
};

export type LeadCartItem = {
  title: string;
  variantTitle?: string;
  quantity: number;
  price: string;
};

export type LeadCart = {
  hasItems: boolean;
  totalQuantity: number;
  totalAmount: string;
  items: LeadCartItem[];
  discountCode?: string | null;
};

export type LeadStatus = 'new' | 'contacted' | 'converted' | 'archived';

export type LeadRecord = {
  id: string;
  contact: string;
  channel: 'email' | 'phone';
  createdAt: string;
  updatedAt: string;
  status: LeadStatus;
  topProduct: LeadProductView | null;
  totalViews: number;
  views: LeadProductView[];
  cart: LeadCart | null;
  notes?: string;
};

export type LeadSyncPayload = {
  contact: string;
  channel: 'email' | 'phone';
  views?: Array<{
    handle: string;
    title: string;
    image?: string | null;
    price?: string | null;
    viewCount?: number;
    firstViewedAt?: string;
    lastViewedAt?: string;
  }>;
  cart?: LeadCart | null;
  coupon?: string | null;
};
