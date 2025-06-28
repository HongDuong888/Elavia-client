import React, { useState, useEffect } from "react";
import { getList } from "../api/provider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"; // Thêm useQueryClient
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Autoplay } from "swiper/modules";
import { Link } from "react-router-dom";
import { usePostItem } from "../hooks/usePostItem";
import { HiCheck } from "react-icons/hi";
import { useAuth } from "../context/auth.context";
import { toast } from "react-toastify";
import { useAddToCart } from "../hooks/useAddToCart";

// types.ts (bổ sung hoặc giữ nguyên)
interface ProductWithVariant {
  _id: string;
  name: string;
  sku: string;
  representativeVariantId: {
    _id: string;
    images: {
      main: { url: string };
      hover: { url: string };
    };
    price: number;
    color: {
      actualColor: string;
      colorName: string;
    };
    sizes: { size: string; stock: number }[];
  };
  availableColors: Array<{
    _id: string;
    actualColor: string;
    colorName: string;
  }>;
}

interface ProductItemFormProps {
  namespace: string;
}
const ProductItemForm: React.FC<ProductItemFormProps> = ({ namespace }) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["products", namespace],
    queryFn: async () => getList({ namespace: `${namespace}` }), // Đổi namespace gọi API Product
    staleTime: 60 * 1000,
  });

  const { data: wishlistData, isLoading: isWishlistLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => getList({ namespace: "wishlist" }),
    staleTime: 60 * 1000,
  });

  const products: ProductWithVariant[] = data?.data || [];
  const wishlistIds: string[] =
    wishlistData?.data?.map((item: any) => item._id) || [];

  const addWishListMutation = usePostItem({
    showToast: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });

  const removeWishListMutation = usePostItem({
    showToast: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });

  const addWishList = (id: string) => {
    if (id) {
      addWishListMutation.mutate({
        namespace: `wishlist/${id}`,
        values: new FormData(),
      });
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    }
  };

  const removeWishList = (id: string) => {
    if (id) {
      removeWishListMutation.mutate({
        namespace: `wishlist/remove/${id}`,
        values: new FormData(),
      });
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    }
  };
  function isDarkColor(hex: string): boolean {
    const cleanHex = hex.replace("#", "");
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);

    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    return brightness < 128;
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "/fallback.jpg";
  };

  const loadingPlaceholders = Array.from({ length: 5 });
  const [selectedProduct, setSelectedProduct] = useState<{
    variantId: string;
    sizes: { size: string; stock: number }[];
  } | null>(null);
  const { auth } = useAuth();
  const addToCartMutation = useAddToCart(() => {
    setSelectedProduct(null); // callback riêng
  });
  return (
    <div className="mb-8">
      {error && (
        <p className="text-red-500 text-center">Lỗi khi tải sản phẩm!</p>
      )}
      <Swiper
        spaceBetween={30}
        slidesPerView={5}
        loop={true}
        autoplay={{ delay: 3000, disableOnInteraction: true }}
        speed={500}
        modules={[Autoplay]}
        breakpoints={{
          320: { slidesPerView: 2 },
          480: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
          1280: { slidesPerView: 5 },
        }}
      >
        {isLoading || isWishlistLoading
          ? loadingPlaceholders.map((_, index) => (
              <SwiperSlide key={index} className="relative">
                <div className="w-full h-48 bg-gray-200 animate-pulse rounded"></div>
              </SwiperSlide>
            ))
          : products.map((product) => {
              console.log(product);

              const variant = product.representativeVariantId;
              if (!variant) return null;

              return (
                <SwiperSlide key={product._id} className="relative">
                  <div className="relative">
                    <Link
                      to={`/products/${encodeURIComponent(
                        product.representativeVariantId?._id
                      )}`}
                      className="group relative block w-full"
                    >
                      <img
                        src={variant.images?.main.url || "/fallback.jpg"}
                        alt={product.name}
                        className="w-full transition-opacity duration-300 ease-in-out opacity-100 group-hover:opacity-0"
                        loading="lazy"
                        onError={handleImageError}
                      />
                      <img
                        src={variant.images?.hover.url || "/fallback.jpg"}
                        alt={product.name}
                        className="w-full absolute top-0 left-0 transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100"
                        loading="lazy"
                        onError={handleImageError}
                      />
                    </Link>
                    <div className="flex justify-between pt-4">
                      <div className="flex gap-2">
                        {product.availableColors?.map((color: any) => {
                          const isMainColor =
                            color.actualColor ===
                            product.representativeVariantId?.color?.actualColor;
                          const iconColor = isDarkColor(color.actualColor)
                            ? "text-white"
                            : "text-black";
                          return (
                            <Link
                              key={color._id}
                              to={`/products/${color._id}`}
                              className={`relative inline-block rounded-full w-5 h-5 border border-gray-300`}
                              style={{ backgroundColor: color.actualColor }}
                              title={color.actualColor}
                            >
                              {isMainColor && (
                                <div className="absolute p-[3px]">
                                  <HiCheck className={`w-3 h-3 ${iconColor}`} />
                                </div>
                              )}
                            </Link>
                          );
                        })}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            addWishList(product.representativeVariantId?._id)
                          }
                          className={`add-wishlist ${
                            wishlistIds.includes(
                              product.representativeVariantId?._id
                            )
                              ? "hidden"
                              : ""
                          }`}
                          data-id={product.representativeVariantId?._id}
                          aria-label={`Thêm ${product.name} vào danh sách yêu thích`}
                          type="button"
                          disabled={addWishListMutation.isPending}
                        >
                          <img
                            src="/images/heart.png"
                            alt="Thêm vào danh sách yêu thích"
                            className="w-4 h-4"
                            aria-hidden="true"
                          />
                        </button>
                        <button
                          onClick={() =>
                            removeWishList(product.representativeVariantId?._id)
                          }
                          className={`remove-wishlist ${
                            wishlistIds.includes(
                              product.representativeVariantId?._id
                            )
                              ? ""
                              : "hidden"
                          }`}
                          data-id={product.representativeVariantId?._id}
                          aria-label={`Xóa ${product.name} khỏi danh sách yêu thích`}
                          type="button"
                          disabled={removeWishListMutation.isPending}
                        >
                          <img
                            src="/images/heart-black.png"
                            alt="Xóa khỏi danh sách yêu thích"
                            className="w-4 h-4"
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                    </div>
                    <Link
                      to={`/products/${encodeURIComponent(
                        product.representativeVariantId?._id
                      )}`}
                      className="text-[14px] min-h-[55px] pt-3 block hover:text-orange-600 transition-all duration-300 cursor-pointer line-clamp-2"
                    >
                      {product.name}
                    </Link>
                    <div className="flex justify-between">
                      <div className="font-semibold pt-2">
                        {variant.price?.toLocaleString()}đ
                      </div>
                      <div
                        onClick={() =>
                          setSelectedProduct({
                            variantId: product.representativeVariantId._id,
                            sizes: product.representativeVariantId.sizes,
                          })
                        }
                        className="relative w-[32px] h-[32px] bg-black rounded-tl-lg rounded-br-lg group cursor-pointer hover:bg-gray-800 transition-all duration-300 ease-in-out"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="size-5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out group-hover:scale-110 group-hover:text-white"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-white"
                            d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
      </Swiper>
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-md p-4 w-[300px]">
            <h2 className="text-center font-semibold mb-3">Chọn size</h2>
            <div className="flex flex-wrap justify-center gap-2">
              {selectedProduct.sizes.map((item) => {
                const isOutOfStock = item.stock === 0;
                return (
                  <button
                    key={item.size}
                    disabled={isOutOfStock}
                    onClick={() => {
                      if (!auth.user?.id) {
                        toast.error("Bạn cần đăng nhập!");
                        return;
                      }

                      addToCartMutation.mutate({
                        productVariantId: selectedProduct.variantId,
                        size: item.size,
                        quantity: 1,
                        userId: auth.user.id,
                      });
                    }}
                    className={`px-3 py-1 rounded border text-sm font-medium ${
                      isOutOfStock
                        ? "text-gray-400 line-through border-gray-300 cursor-not-allowed"
                        : "hover:bg-black hover:text-white border-black text-black"
                    }`}
                  >
                    {item.size}
                  </button>
                );
              })}
            </div>
            <div className="text-center mt-4">
              <button
                className="text-sm text-gray-600 hover:underline"
                onClick={() => setSelectedProduct(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductItemForm;
