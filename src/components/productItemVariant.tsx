import React, { useState, useEffect } from "react";
import { getList } from "../api/provider";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Autoplay } from "swiper/modules";
import { Link } from "react-router-dom";
import { usePostItem } from "../hooks/usePostItem";
import { useAddToCart } from "../hooks/useAddToCart";
import { useAuth } from "../context/auth.context";
import { toast } from "react-toastify";
import { Check, Heart } from "lucide-react";

interface ProductVariantWithDetails {
  _id: string;
  images: {
    main: { url: string };
    hover: { url: string };
  };
  color: {
    actualColor: string;
    colorName: string;
  };
  productId: {
    _id: string;
    name: string;
  };
  sizes: { size: string; stock: number; price: number }[];
}

interface Color {
  _id: string;
  actualColor: string;
}

interface ProductItemFormProps {
  namespace?: string;
  productVariants?: ProductVariantWithDetails[];
  isSlideshow?: boolean;
  maxColumns?: 4 | 5;
}

const ProductItemVariantForm: React.FC<ProductItemFormProps> = ({
  namespace,
  productVariants: externalVariants, // ✅
  isSlideshow = true,
  maxColumns = 5,
}) => {
  const { data, isLoading, error } = useQuery({
    // 🟡
    queryKey: ["product-variants", namespace],
    queryFn: namespace ? async () => getList({ namespace }) : async () => [],
    enabled: !!namespace && !externalVariants, // ✅ chỉ fetch nếu không có externalVariants
    staleTime: 60 * 1000,
  });
  const queryClient = useQueryClient();
  const { auth } = useAuth();
  const productVariants: ProductVariantWithDetails[] =
    externalVariants || data?.data || (Array.isArray(data) ? data : []) || [];

  const { data: wishlistData, isLoading: isWishlistLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => getList({ namespace: "wishlist" }),
    staleTime: 60 * 1000,
  });

  const wishlistIds: string[] =
    wishlistData?.data?.map((item: any) => item._id) || [];
  const fetchVariantByColor = async (
    productId: string,
    actualColor: string
  ) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/product-variants/by-color`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId, actualColor }),
      }
    );

    if (!response.ok) {
      throw new Error("Không tìm thấy biến thể");
    }

    const variant = await response.json();
    return variant;
  };

  const [colorsByProductId, setColorsByProductId] = useState<{
    [key: string]: Color[];
  }>({});
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<{
    variantId: string;
    sizes: { size: string; stock: number }[];
  } | null>(null);

  const fetchColorsByProductId = async (productId: string) => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/product-variants/colors-product/${productId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch colors");
      }

      const colors: Color[] = await response.json();
      setColorsByProductId((prev) => ({
        ...prev,
        [productId]: colors,
      }));
    } catch (error) {
      console.error("Error fetching colors:", error);
      setFetchError("Lỗi khi tải màu sắc sản phẩm!");
    }
  };

  useEffect(() => {
    productVariants.forEach((variant) => {
      if (!colorsByProductId[variant.productId._id]) {
        fetchColorsByProductId(variant.productId._id);
      }
    });
  }, [productVariants, colorsByProductId]);

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

  const addToCartMutation = useAddToCart(() => {
    setSelectedProduct(null);
  });

  const addWishList = (id: string) => {
    if (id) {
      addWishListMutation.mutate({
        namespace: `wishlist/${id}`,
        values: new FormData(),
      });
    }
  };

  const removeWishList = (id: string) => {
    if (id) {
      removeWishListMutation.mutate({
        namespace: `wishlist/remove/${id}`,
        values: new FormData(),
      });
    }
  };

  // ✅ Helper function để lấy giá của size nhỏ nhất còn hàng
  const getDisplayPrice = (variant: ProductVariantWithDetails): number => {
    if (!variant.sizes || variant.sizes.length === 0) return 0;

    // Lọc các size còn hàng
    const availableSizes = variant.sizes.filter((size) => size.stock > 0);

    if (availableSizes.length === 0) {
      // Nếu không có size nào còn hàng, lấy giá của size đầu tiên
      return variant.sizes[0].price;
    }

    // Sắp xếp theo size và lấy size nhỏ nhất còn hàng
    const sortedSizes = availableSizes.sort((a, b) => {
      // Nếu size là số thì so sánh theo số
      const sizeA = parseInt(a.size);
      const sizeB = parseInt(b.size);

      if (!isNaN(sizeA) && !isNaN(sizeB)) {
        return sizeA - sizeB;
      }

      // Nếu không phải số thì so sánh theo chuỗi
      return a.size.localeCompare(b.size);
    });

    return sortedSizes[0].price;
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

  const loadingPlaceholders = Array.from({ length: maxColumns });
  const [selectedVariants, setSelectedVariants] = useState<{
    [variantId: string]: ProductVariantWithDetails;
  }>({});

  const renderProductContent = (
    displayVariant: ProductVariantWithDetails,
    originalVariant: ProductVariantWithDetails
  ) => {
    return (
      <div className="relative">
        <Link
          to={`/products/${encodeURIComponent(displayVariant._id)}`}
          className="group relative block max-w-[250px]"
        >
          <img
            src={displayVariant.images?.main.url || "/fallback.jpg"}
            alt={displayVariant.productId.name}
            className="w-full transition-opacity duration-300 ease-in-out opacity-100 group-hover:opacity-0"
            loading="lazy"
            onError={handleImageError}
          />
          <img
            src={displayVariant.images?.hover.url || "/fallback.jpg"}
            alt={displayVariant.productId.name}
            className="w-full absolute top-0 left-0 transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100"
            loading="lazy"
            onError={handleImageError}
          />
        </Link>
        <div className="flex gap-2 py-2 justify-between items-center pt-4">
          <div className="flex gap-2">
            {(colorsByProductId[originalVariant.productId._id] || []).map(
              (color: any) => {
                const isMainColor =
                  color.actualColor === displayVariant.color?.actualColor;

                const iconColor = isDarkColor(color.actualColor)
                  ? "text-white"
                  : "text-black";
                return (
                  <button
                    onClick={() => {
                      const found = productVariants.find(
                        (v) =>
                          v.productId._id === originalVariant.productId._id &&
                          v.color.actualColor === color.actualColor
                      );
                      if (found) {
                        // Có sẵn trong cache
                        setSelectedVariants((prev) => ({
                          ...prev,
                          [originalVariant._id]: found,
                        }));
                      } else {
                        // Không có sẵn → fetch thêm
                        fetchVariantByColor(
                          originalVariant.productId._id,
                          color.actualColor
                        )
                          .then((variant) => {
                            setSelectedVariants((prev) => ({
                              ...prev,
                              [originalVariant._id]: variant,
                            }));
                          })
                          .catch((err) => {
                            toast.error("Không tìm thấy biến thể màu này!");
                          });
                      }
                    }}
                    key={color._id || color.actualColor}
                    className={`relative inline-block rounded-full w-5 h-5 border border-gray-300`}
                    style={{ backgroundColor: color.actualColor }}
                    title={color.actualColor}
                  >
                    {isMainColor && (
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <Check className={`w-3 h-3 ${iconColor}`} />
                      </div>
                    )}
                  </button>
                );
              }
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => addWishList(displayVariant._id)}
              className={`add-wishlist ${
                wishlistIds.includes(displayVariant._id) ? "hidden" : ""
              }`}
              data-id={displayVariant._id}
              aria-label={`Thêm ${displayVariant.productId.name} vào danh sách yêu thích`}
              type="button"
              disabled={addWishListMutation.isPending}
            >
              <Heart className="w-5 h-5 text-black" strokeWidth={1} />
            </button>
            <button
              onClick={() => removeWishList(displayVariant._id)}
              className={`remove-wishlist ${
                wishlistIds.includes(displayVariant._id) ? "" : "hidden"
              }`}
              data-id={displayVariant._id}
              aria-label={`Xóa ${displayVariant.productId.name} khỏi danh sách yêu thích`}
              type="button"
              disabled={removeWishListMutation.isPending}
            >
              <Heart className="w-5 h-5 text-black fill-black" />
            </button>
          </div>
        </div>
        <Link
          to={`/products/${encodeURIComponent(displayVariant._id)}`}
          className="text-[14px] min-h-[55px] pt-3 block hover:text-orange-600 transition-all duration-300 cursor-pointer line-clamp-2"
        >
          {displayVariant.productId.name}
        </Link>
        <div className="flex justify-between">
          <div className="font-semibold pt-2">
            {/* ✅ Sử dụng helper function để lấy giá đúng */}
            {getDisplayPrice(displayVariant).toLocaleString()}đ
          </div>
          <div
            onClick={() =>
              setSelectedProduct({
                variantId: displayVariant._id,
                sizes: displayVariant.sizes,
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
    );
  };
  console.log("namespace:", namespace, "data:", data);
  return (
    <div className="mb-8">
      {error && (
        <p className="text-red-500 text-center">Lỗi khi tải sản phẩm!</p>
      )}
      {fetchError && <p className="text-red-500 text-center">{fetchError}</p>}

      {isLoading || isWishlistLoading ? (
        <div
          className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-${maxColumns} gap-4`}
        >
          {loadingPlaceholders.map((_, index) => (
            <div key={index} className="relative">
              <div className="w-full h-48 bg-gray-200 animate-pulse rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {isSlideshow ? (
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
              {productVariants.map((variant) => {
                const displayVariant = selectedVariants[variant._id] || variant;

                return (
                  <SwiperSlide key={variant._id} className="relative">
                    {renderProductContent(displayVariant, variant)}
                  </SwiperSlide>
                );
              })}
            </Swiper>
          ) : (
            <div
              className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-${maxColumns} gap-4`}
            >
              {productVariants.map((variant) => {
                const displayVariant = selectedVariants[variant._id] || variant;

                return (
                  <div key={variant._id} className="relative">
                    {renderProductContent(displayVariant, variant)}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

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

export default ProductItemVariantForm;
