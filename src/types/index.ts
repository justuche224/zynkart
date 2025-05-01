export type Store = {
  id: number;
  name: string;
  slug: string;
  template: string;
};

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  slashedFrom: number | null;
  inStock: number;
  trackQuantity: boolean;
  // categoryId: string;
  createdAt: string;
  updatedAt: string;
  images: {
    id: string;
    url: string;
    alt: string;
    position: number;
    isDefault: boolean;
  }[];
}
