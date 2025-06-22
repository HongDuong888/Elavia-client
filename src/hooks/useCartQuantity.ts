import { useQuery } from "@tanstack/react-query";
import { getCartQuantity } from "../api/provider";

const useCartQuantity = () => {
  const { data = 0 } = useQuery({
    queryKey: ["cartQuantity"],
    queryFn: getCartQuantity,
    staleTime: 1000 * 5, // tùy chỉnh, 5s là ví dụ
  });

  return data;
};

export default useCartQuantity;
