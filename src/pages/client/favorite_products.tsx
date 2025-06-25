import { Link } from "react-router-dom";
import ClientLayout from "../../layouts/clientLayout";
import MenuInfo from "../../components/menuInfo";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getList } from "../../api/provider";
import { usePostItem } from "../../hooks/usePostItem";
import { useEffect, useState } from "react";

interface Color {
  _id: string;
  actualColor: string;
  colorName: string;
}
const FavoriteProducts = () => {
  const queryClient = useQueryClient();
  const [colorsByProductId, setColorsByProductId] = useState<{ [key: string]: Color[] }>({});

  const { data, isLoading, error } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => getList({ namespace: "wishlist" }),
    staleTime: 60 * 1000,
  });

  const wishlist = data?.wishlist?.products || [];

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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/product-variants/colors-product/${productId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
  
      const colors: Color[] = await res.json();
      setColorsByProductId((prev) => ({ ...prev, [productId]: colors }));
    } catch (error) {
      console.error("Lỗi lấy màu:", error);
    }
  };
  
  useEffect(() => {
    data?.wishlist?.products.forEach((variant: any) => {
      const productId = variant.productId?._id;
      if (productId && !colorsByProductId[productId]) {
        fetchColorsByProductId(productId);
      }
    });
  }, [data]);
  
  return (
    <ClientLayout>
      <article className="mb-8 mt-4">
        <hr />
        <nav>
          <div className="flex gap-4 mt-[20px]">
            <div className="text-base">
              <a href="?action=home">Trang chủ</a>
            </div>
            <div className="text-base">-</div>
            <div className="text-base">Tài khoản của tôi</div>
          </div>
        </nav>
        <hr className="border-t border-gray-300 my-4" />

        <div className="grid grid-cols-[1fr_2.5fr] gap-12">
          {/* Menu */}
          <div className="p-4 w-[300px] font-bold rounded-tl-[40px] rounded-br-[40px] border-gray-700 h-auto mt-2 ml-16">
            <MenuInfo />
          </div>

          {/* Danh sách sản phẩm yêu thích */}
          <div className="py-4">
            <h2 className="text-2xl font-bold mb-6">Sản phẩm yêu thích</h2>

            {isLoading ? (
              <p>Đang tải sản phẩm...</p>
            ) : wishlist.length === 0 ? (
              <p>Không có sản phẩm yêu thích nào.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {wishlist.map((variant: any) => (
                  <div key={variant._id} className="relative">
                    <Link
                      to={`/products/${variant._id}`}
                      className="group relative block w-full"
                    >
                      <img
                        src={variant.images?.main.url || "/fallback.jpg"}
                        alt={variant.productId?.name}
                        className="w-full transition-opacity duration-300 ease-in-out opacity-100 group-hover:opacity-0"
                        loading="lazy"
                        onError={handleImageError}
                      />
                      <img
                        src={variant.images?.hover.url || "/fallback.jpg"}
                        alt={variant.productId?.name}
                        className="w-full absolute top-0 left-0 transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100"
                        loading="lazy"
                        onError={handleImageError}
                      />
                    </Link>
                   
                    <div className="flex justify-between items-center py-2">
                      <div className="mt-2">
                        <div className="flex gap-2 mt-1">
                          {(colorsByProductId[variant.productId?._id] || []).map((color) => (
                            <span
                              key={color._id}
                              className="w-4 h-4 rounded-full border border-gray-300"
                              style={{ backgroundColor: color.actualColor }}
                              title={color.colorName}
                            ></span>
                          ))}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => removeWishList(variant._id)}
                        className="text-red-500"
                        aria-label="Xoá khỏi danh sách yêu thích"
                        disabled={removeWishListMutation.isPending}
                      >
                        <img
                          src="/images/heart-black.png"
                          alt="Xoá yêu thích"
                          className="w-4 h-4"
                        />
                      </button>
                    </div>

                    <Link
                      to={`/products/${variant._id}`}
                      className="text-[15px] block hover:text-orange-600 transition-all duration-300 cursor-pointer"
                    >
                      {variant.productId?.name}
                    </Link>

                    <div className="font-semibold pt-1">
                      {variant.price?.toLocaleString()}đ
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </article>
    </ClientLayout>
  );
};

export default FavoriteProducts;
