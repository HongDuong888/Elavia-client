import { useState } from "react";
import axiosInstance from "../services/axiosInstance";
import { toast } from "react-toastify";

export const useVoucher = (userId: string, cartTotal: number) => {
  const [voucher, setVoucher] = useState("");
  const [discount, setDiscount] = useState(0);
  const [voucherId, setVoucherId] = useState<string | null>(null);

  const handleApplyVoucher = async (userId?: string, totalPrice: number = 0) => {
    if (!voucher) {
      toast.error("Vui lòng nhập mã giảm giá");
      return;
    }
    try {
      const res = await axiosInstance.post("/vouchers/apply", {
        code: voucher,
        userId,
        cartTotal,
      });

      const data = res.data;
      if (data?.discount) {
        setDiscount(data.discount);
        setVoucherId(data.voucherId);
        toast.success(`Áp dụng thành công: Giảm ${data.discount.toLocaleString("vi-VN")}đ`);
      }
    } catch (err: any) {
      setDiscount(0);
      setVoucherId(null);
      toast.error(err.response?.data?.message || "Không thể áp dụng voucher");
    }
  };

  return {
    voucher,
    setVoucher,
    discount,
    voucherId,
    handleApplyVoucher,
  };
};
