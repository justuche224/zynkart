export type Store = {
  id: number;
  name: string;
  slug: string;
  template: string;
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  price: number;
  description: string;
  imageUrl: string;
  storeId: number;
};
