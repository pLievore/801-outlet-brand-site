import { ProductForm } from '../product-form';

export default function NewProductPage() {
  return (
    <div className="px-6 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <a href="/admin/products" className="text-sm text-neutral-400 hover:text-white transition">
          ← Products
        </a>
      </div>
      <h1 className="text-xl font-bold text-white">New product</h1>
      <ProductForm product={null} />
    </div>
  );
}
