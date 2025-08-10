export interface CartItem {
  productVariantId: string;
  size: string;
  quantity: number;
  userId: string;
}
export interface AddToCartItem {
  productId: string;
  size: string;
  quantity: number;
  userId: string;
}
export interface ICartItem {
  productVariantId: {
    _id: string;
    name: string;
    images: {
      main: {
        url: string;
        id: string;
      };
      hover?: {
        url: string;
        id: string;
      };
      product: string[];
    };
    sku: string;
    productId?: {
      _id: string;
      name: string;
      categoryId: string;
      shortDescription?: string;
      description?: string;
      sku: string;
      createdAt: string;
      updatedAt: string;
    };
    sizes?: Array<{
      size: string;
      stock: number;
      price: number;
    }>;
    color?: {
      colorName?: string;
    };
  };
  quantity: number;
  size: string;
  _id: string;
}

export interface CartData {
  _id: string;
  userId: string;
  items: ICartItem[];
  createdAt: string;
  updatedAt: string;
}
