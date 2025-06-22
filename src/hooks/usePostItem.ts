import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { postItem } from "../api/provider";

interface UsePostItemProps {
  showToast?: boolean;
  onSuccess?: (data: any) => void;
}

export const usePostItem = ({
  showToast = true,
  onSuccess,
}: UsePostItemProps = {}) => {
  return useMutation({
    mutationFn: postItem,
    onSuccess: (data) => {
      if (showToast) toast.success("Gửi dữ liệu thành công");
      if (onSuccess) onSuccess(data);
    },
    onError: (error: any) => {
      if (showToast) toast.error("Có lỗi xảy ra: " + error.message);
    },
  });
};
