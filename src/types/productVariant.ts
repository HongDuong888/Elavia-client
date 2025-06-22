import { IProduct } from "./product";

export interface IProductVariant {
  _id: string;
  productId: IProduct; // Liên kết tới IProduct._id
  sku: string;
  price: number;
  color: IColor;
  images: IImages;
  sizes: ISize[];
  createdAt: string;
  updatedAt: string;
}

export interface IColor {
  baseColor: string;
  actualColor: string;
  colorName: string;
}
export interface IImageInfo {
  url: string;
  public_id: string;
}

export interface IProductImage extends IImageInfo {
  _id: string; // Nếu lấy từ MongoDB thì thường là _id: ObjectId, còn ở FE thì cứ string là ổn
}

export interface IImages {
  main: IImageInfo;
  hover: IImageInfo;
  product: IProductImage[];
}

export interface ISize {
  size: "S" | "M" | "L" | "XL" | "XXL";
  stock: number;
}
