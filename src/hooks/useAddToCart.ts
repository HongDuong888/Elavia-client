// hooks/useAddToCart.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postItem } from "../api/provider"; // hoặc axios.post wrapper của bạn
import { toast } from "react-toastify";

export const useAddToCart = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      productVariantId: string;
      size: string;
      quantity: number;
      userId: string;
    }) => postItem({ namespace: "cart/add", values: payload }),
    onSuccess: () => {
      toast.success("Thêm vào giỏ hàng thành công");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["cartQuantity"] });
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Thêm vào giỏ hàng thất bại";
      toast.error(message);
    },
  });
};
