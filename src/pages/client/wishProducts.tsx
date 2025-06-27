import { Link } from "react-router-dom";
import ClientLayout from "../../layouts/clientLayout";
import MenuInfo from "../../components/menuInfo";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getList } from "../../api/provider";
import { usePostItem } from "../../hooks/usePostItem";
import { useEffect, useState } from "react";
import ProductItemVariantForm from "../../components/productItemVariant";

interface Color {
  _id: string;
  actualColor: string;
  colorName: string;
}
const WishProducts = () => {
  const queryClient = useQueryClient();
  const [colorsByProductId, setColorsByProductId] = useState<{
    [key: string]: Color[];
  }>({});

  const addWishListMutation = usePostItem({
    showToast: false,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wishlist"] }),
  });

  const removeWishListMutation = usePostItem({
    showToast: false,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wishlist"] }),
  });

  const addWishList = (id: string) => {
    addWishListMutation.mutate({
      namespace: `wishlist/${id}`,
      values: new FormData(),
    });
  };

  const removeWishList = (id: string) => {
    removeWishListMutation.mutate({
      namespace: `wishlist/remove/${id}`,
      values: new FormData(),
    });
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "/fallback.jpg";
  };

  const fetchColorsByProductId = async (productId: string) => {
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/product-variants/colors-product/${productId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        }
      );

      const colors: Color[] = await res.json();
      setColorsByProductId((prev) => ({ ...prev, [productId]: colors }));
    } catch (error) {
      console.error("Lỗi lấy màu:", error);
    }
  };

  return (
    <ClientLayout>
      <article className="mt-[98px]">
        <div className="flex gap-4 my-4">
          <div className="text-sm">
            <a href="/">Trang chủ</a>
          </div>
          <div className="text-sm">-</div>
          <div className="text-sm">
            <div className="text-sm flex gap-4">
              <div>Sản phẩm yêu thích</div>
            </div>
          </div>
        </div>
        <hr className="border-t border-gray-300 my-4" />

        <div className="grid grid-cols-[0.7fr_2.5fr] gap-8">
          {/* Menu */}
          <div className="p-4 pl-0 font-bold rounded-tl-[40px] rounded-br-[40px] border-gray-700 h-auto mt-2">
            <MenuInfo />
          </div>

          <div className="check w-full overflow-hidden">
            <h2 className="text-2xl font-bold mb-6 mt-4">Sản phẩm yêu thích</h2>
            <div className="">
              <ProductItemVariantForm
                namespace="wishlist"
                isSlideshow={false}
                maxColumns={4}
              />
            </div>
          </div>
        </div>
      </article>
    </ClientLayout>
  );
};

export default WishProducts;
