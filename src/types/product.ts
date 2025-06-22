import { IProductVariant } from './productVariant';

export interface IProduct {
    _id: string;
    name: string;
    sku: string;
    categoryId: string;
    shortDescription?: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export interface IProductDetail {
    product: IProduct;
    variants: IProductVariant[];
}
