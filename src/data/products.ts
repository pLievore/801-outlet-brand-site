export type ProductCategory =
  | 'sofas'
  | 'sectionals'
  | 'recliners'
  | 'beds'
  | 'mattresses'
  | 'dining'
  | 'storage'
  | 'other';

export type Product = {
  slug: string;
  title: string;
  category: ProductCategory;
  price: number; // USD
  compareAtPrice?: number; // opcional (para mostrar "save")
  shortDescription: string;

  // para card e galeria
  images: {
    src: string; // em /public/products/...
    alt: string;
  }[];

  // detalhes
  specs: {
    material?: string;
    color?: string;
    dimensions?: string; // ex: "112” W × 68” D × 34” H"
    seating?: string; // ex: "Seats 4–5"
    condition?: 'New' | 'Like New' | 'Open Box';
  };

  // operacional
  inStock: boolean;
  fastDelivery: boolean;
  utahOnly: boolean;

  // link para Shopify (por produto)
  shopifyUrl: string;
};

export const categories: { key: ProductCategory; label: string }[] = [
  { key: 'sofas', label: 'Sofas' },
  { key: 'sectionals', label: 'Sectionals' },
  { key: 'recliners', label: 'Recliners' },
  { key: 'beds', label: 'Beds' },
  { key: 'mattresses', label: 'Mattresses' },
  { key: 'dining', label: 'Dining' },
  { key: 'storage', label: 'Storage' },
  { key: 'other', label: 'Other' },
];

export const products: Product[] = [
  {
    slug: 'harlow-sectional-cream',
    title: 'Harlow Sectional (Cream Bouclé)',
    category: 'sectionals',
    price: 1299,
    compareAtPrice: 1899,
    shortDescription: 'Deep seats, modern profile, premium bouclé texture. Fast Utah delivery.',
    images: [
      { src: '/products/placeholder-1.jpg', alt: 'Harlow Sectional in cream bouclé' },
      { src: '/products/placeholder-2.jpg', alt: 'Harlow Sectional close-up texture' },
    ],
    specs: {
      material: 'Bouclé fabric',
      color: 'Cream',
      dimensions: '112” W × 68” D × 34” H',
      seating: 'Seats 4–5',
      condition: 'New',
    },
    inStock: true,
    fastDelivery: true,
    utahOnly: true,
    shopifyUrl:
      'https://your-shopify-store.com/products/harlow-sectional-cream?utm_source=brand_site&utm_medium=product&utm_campaign=shop_redirect',
  },
  {
    slug: 'milo-sofa-sand',
    title: 'Milo Sofa (Sand Linen)',
    category: 'sofas',
    price: 699,
    compareAtPrice: 999,
    shortDescription: 'Clean lines, comfy cushions, durable linen blend. Great everyday sofa.',
    images: [{ src: '/products/placeholder-3.jpg', alt: 'Milo sofa in sand linen' }],
    specs: {
      material: 'Linen blend',
      color: 'Sand',
      dimensions: '86” W × 38” D × 34” H',
      seating: 'Seats 3',
      condition: 'New',
    },
    inStock: true,
    fastDelivery: true,
    utahOnly: true,
    shopifyUrl:
      'https://your-shopify-store.com/products/milo-sofa-sand?utm_source=brand_site&utm_medium=product&utm_campaign=shop_redirect',
  },
  {
    slug: 'atlas-recliner-charcoal',
    title: 'Atlas Power Recliner (Charcoal)',
    category: 'recliners',
    price: 599,
    shortDescription: 'Smooth recline, supportive comfort, modern finish. Outlet pricing.',
    images: [{ src: '/products/placeholder-4.jpg', alt: 'Atlas recliner charcoal' }],
    specs: {
      material: 'Performance fabric',
      color: 'Charcoal',
      dimensions: '38” W × 40” D × 41” H',
      seating: 'Seats 1',
      condition: 'Like New',
    },
    inStock: true,
    fastDelivery: false,
    utahOnly: true,
    shopifyUrl:
      'https://your-shopify-store.com/products/atlas-recliner-charcoal?utm_source=brand_site&utm_medium=product&utm_campaign=shop_redirect',
  },
  {
    slug: 'nova-bed-frame-queen',
    title: 'Nova Bed Frame (Queen)',
    category: 'beds',
    price: 399,
    shortDescription: 'Modern frame, sturdy build, easy setup. Delivery Utah only.',
    images: [{ src: '/products/placeholder-5.jpg', alt: 'Nova bed frame queen' }],
    specs: {
      material: 'Wood + upholstered headboard',
      color: 'Oat',
      dimensions: 'Queen',
      condition: 'New',
    },
    inStock: true,
    fastDelivery: true,
    utahOnly: true,
    shopifyUrl:
      'https://your-shopify-store.com/products/nova-bed-frame-queen?utm_source=brand_site&utm_medium=product&utm_campaign=shop_redirect',
  },
  // Adicione os próximos aqui (até 40)
];

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug);
}
