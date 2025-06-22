import React, { useState, useEffect } from "react";
import { getList } from "../api/provider";
import { useQuery, useQueryClient } from "@tanstack/react-query"; // Thêm useQueryClient
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Autoplay } from "swiper/modules";
import { Link } from "react-router-dom";
import { usePostItem } from "../hooks/usePostItem";

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
  price: number;
  productId: {
    _id: string;
    name: string;
  };
}

interface Color {
  _id: string;
  actualColor: string;
}

interface ProductItemFormProps {
  namespace: string;
}

const ProductItemForm: React.FC<ProductItemFormProps> = ({ namespace }) => {
  const queryClient = useQueryClient(); // Thêm queryClient để quản lý query

  const { data, isLoading, error } = useQuery({
    queryKey: ["product-variants", namespace],
    queryFn: async () =>
      getList({ namespace: `product-variants/${namespace}` }),
    staleTime: 60 * 1000,
  });

  const { data: wishlistData, isLoading: isWishlistLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => getList({ namespace: "wishlist" }),
    staleTime: 60 * 1000,
  });

  const productVariants: ProductVariantWithDetails[] = data?.data || [];
  const wishlistIds: string[] =
    wishlistData?.wishlist?.products?.map((item: any) => item._id) || [];

  const [colorsByProductId, setColorsByProductId] = useState<{
    [key: string]: Color[];
  }>({});
  const [fetchError, setFetchError] = useState<string | null>(null);

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

  // Thêm onSuccess để làm mới wishlist sau khi mutation thành công
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

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "/fallback.jpg";
  };

  const loadingPlaceholders = Array.from({ length: 5 });

  return (
    <div className="mb-8">
      {error && (
        <p className="text-red-500 text-center">Lỗi khi tải sản phẩm!</p>
      )}
      {fetchError && <p className="text-red-500 text-center">{fetchError}</p>}
      <Swiper
        spaceBetween={30}
        slidesPerView={5}
        loop={true}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
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
          : productVariants.map((variant) => (
              <SwiperSlide key={variant._id} className="relative">
                <div className="relative">
                  <Link
                    to={`/products/${encodeURIComponent(variant._id)}`}
                    className="group relative block w-full"
                  >
                    <img
                      src={variant.images?.main.url || "/fallback.jpg"}
                      alt={variant.productId.name}
                      className="w-full transition-opacity duration-300 ease-in-out opacity-100 group-hover:opacity-0"
                      loading="lazy"
                      onError={handleImageError}
                    />
                    <img
                      src={variant.images?.hover.url || "/fallback.jpg"}
                      alt={variant.productId.name}
                      className="w-full absolute top-0 left-0 transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100"
                      loading="lazy"
                      onError={handleImageError}
                    />
                  </Link>
                  <div className="flex gap-2 py-2 justify-between items-center pt-4">
                    <div className="flex gap-2">
                      {colorsByProductId[variant.productId._id]?.map(
                        (color) => (
                          <Link
                            key={color._id}
                            to={`/products/${color._id}`}
                            className="rounded-full w-5 h-5 border border-gray-300"
                            style={{ backgroundColor: color.actualColor }}
                            title={color.actualColor}
                            aria-label={`Xem sản phẩm màu ${color.actualColor}`}
                          ></Link>
                        )
                      )}
                    </div>
                    <div>
                      <button
                        onClick={() => addWishList(variant._id)}
                        className={`add-wishlist ${
                          wishlistIds.includes(variant._id) ? "hidden" : ""
                        }`}
                        data-id={variant._id}
                        aria-label={`Thêm ${variant.productId.name} vào danh sách yêu thích`}
                        type="button"
                        disabled={addWishListMutation.isPending}
                      >
                        <img
                          src="/images/heart.png" // Đường dẫn đến PNG lòng trắng
                          alt="Thêm vào danh sách yêu thích"
                          className="w-4 h-4"
                          aria-hidden="true"
                        />
                      </button>
                      <button
                        onClick={() => removeWishList(variant._id)}
                        className={`remove-wishlist ${
                          wishlistIds.includes(variant._id) ? "" : "hidden"
                        }`}
                        data-id={variant._id}
                        aria-label={`Xóa ${variant.productId.name} khỏi danh sách yêu thích`}
                        type="button"
                        disabled={removeWishListMutation.isPending}
                      >
                        <img
                          src="/images/heart-black.png" // Đường dẫn đến PNG lòng đen
                          alt="Xóa khỏi danh sách yêu thích"
                          className="w-4 h-4"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </div>
                  <Link
                    to={`/products/${encodeURIComponent(variant._id)}`}
                    className="text-[15px] block hover:text-orange-600 transition-all duration-300 cursor-pointer"
                  >
                    {variant.productId.name}
                  </Link>
                  <div className="font-semibold pt-4">
                    {variant.price?.toLocaleString()}đ
                  </div>
                </div>
              </SwiperSlide>
            ))}
      </Swiper>
    </div>
  );
};

export default ProductItemForm;
