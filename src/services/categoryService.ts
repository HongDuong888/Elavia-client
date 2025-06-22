import axiosInstance from './axiosInstance';
import { Category } from '../types/categories';

const API_URL = import.meta.env.VITE_API_URL;
interface CategoryResponse {
    docs: Category[];
}
export const getCategories = async (): Promise<CategoryResponse> => {
    const response = await axiosInstance.get(`${API_URL}/categories`);
    return response.data;
};