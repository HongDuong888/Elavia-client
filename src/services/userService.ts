import axios from 'axios';
import { Login, RegisterForm } from '../types/user';
import axiosInstance from '../services/axiosInstance';
import { CartData, CartItem, ICartItem } from '../types/cart';

const API_URL = import.meta.env.VITE_API_URL;

export const login = async (data: Login) => {
    const res = await axiosInstance.post('/auth/login', data);
    return res.data;
};
export const logout = async () => {
    const res = await axiosInstance.post('/auth/logout');
    return res.data;
};
export const info = async () => {
    const res = await axiosInstance.post('/auth/info');
    return res.data;
};
export const register = async (userData: RegisterForm): Promise<RegisterForm> => {
    const response = await axiosInstance.post('/auth/register', userData, {
        headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
};
export const addToCart = async (cartItem: CartItem): Promise<any> => {
    const response = await axiosInstance.post('/cart/add', cartItem, {
        headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
};
export const deleteCart = async (
    userId: string,
    productVariantId: string,
    size: string
): Promise<any> => {
    const response = await axiosInstance.post(
        `/cart/remove`,
        { userId, productVariantId, size },
        { headers: { 'Content-Type': 'application/json' } } // Headers để tách riêng
    );
    return response.data;
};
