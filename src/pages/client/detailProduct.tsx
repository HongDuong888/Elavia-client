import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/auth.context";
import { toast } from "react-toastify";
import { getById, getList, postItem } from "../../api/provider";
import { addToCart } from "../../services/userService";
import { Rate } from "antd";
import { Link, useNavigate, useParams } from "react-router-dom";
import Loading from "../../components/loading";
import { CartItem } from "../../types/cart";
import ClientLayout from "../../layouts/clientLayout";
import { usePostItem } from "../../hooks/usePostItem";
import { useAddToCart } from "../../hooks/useAddToCart";
import ProductItemVariantForm from "../../components/productItemVariant";
import CheckSizeModal from "../../components/CheckSizeModal";
import { Check, ClipboardList, Heart } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import ReviewList from "../../components/reviewList";
import axiosInstance from "../../services/axiosInstance";

const DetailProduct = ({ productId }: { productId: string }) => {
  const queryClient = useQueryClient();
  const { auth } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product-variants", productId],
    queryFn: () => getById({ namespace: "product-variants/", id: productId }),
  });

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("gioi_thieu");
  const [showCheckSize, setShowCheckSize] = useState(false);
  const formData = new FormData();
  const postItemMutation = usePostItem({ showToast: false });
  const [colors, setColors] = useState<any[]>([]);

  const { data: wishlistData, isLoading: isWishlistLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => getList({ namespace: "wishlist" }),
    staleTime: 60 * 1000,
  });
  const { data } = useQuery({
  queryKey: ["reviews", productId],
  queryFn: () =>
    axiosInstance.get(`/reviews/${productId}`).then((res) => res.data),
});
const reviews = data?.data || []; 
const totalReviews = reviews.length;
const averageRating = totalReviews
  ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / totalReviews).toFixed(1)
  : "0.0";
  const wishlistIds: string[] =
    wishlistData?.data?.map((item: any) => item._id) || [];

  const postItemGetColorsMutation = usePostItem({
    showToast: false,
    onSuccess: (fetchedColors: any) => {
      setColors(fetchedColors);
    },
  });

  useEffect(() => {
    if (product) {
      setSelectedColor(product.color.colorName);

      const firstAvailableSize = product.sizes.find(
        (size: { stock: number }) => size.stock > 0
      );
      if (firstAvailableSize) {
        setSelectedSize(firstAvailableSize.size);
      } else {
        setSelectedSize(null);
      }
    }
  }, [product]);
  const idProduct = product?.productId?._id;
  useEffect(() => {
    if (idProduct) {
      postItemGetColorsMutation.mutate({
        namespace: `product-variants/colors-product/${idProduct}`,
        values: { productId: idProduct },
      });
    }
  }, [idProduct]);

  useEffect(() => {
    if (productId && formData) {
      postItemMutation.mutate({
        namespace: `recently-viewed/products/${productId}/view`,
        values: formData,
      });
    }
  }, [productId]);
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
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
  const addToCartMutation = useAddToCart();
  const handleQuantityChange = (change: number) => {
    const selectedSizeStock =
      product?.sizes.find(
        (s: { size: string | null }) => s.size === selectedSize
      )?.stock || Infinity;
    setQuantity((prev) => {
      const newQuantity = prev + change;
      if (newQuantity < 1) return 1;
      if (newQuantity > selectedSizeStock) return selectedSizeStock;
      return newQuantity;
    });
  };

  const isOutOfStock =
    product?.sizes.every((size: { stock: number }) => size.stock === 0) ||
    false;
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories-parent"],
    queryFn: async () =>
      getList({
        namespace: `categories/parent/${product.productId.categoryId}`,
      }),
  });
  function isDarkColor(hex: string): boolean {
    const cleanHex = hex.replace("#", "");
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);

    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    return brightness < 128;
  }
  const namespaceRelated = product?._id
    ? `product-variants/${product._id}/related-variants`
    : "";

  const { data: relatedVariantsData } = useQuery({
    queryKey: ["relatedVariants", namespaceRelated],
    queryFn: async () => {
      const res = await getList({ namespace: namespaceRelated });
      return res.data;
    },
    enabled: !!product?._id,
  });

  if (isLoading) return <Loading />;
  if (error)
    return <div>Error loading product: {(error as Error).message}</div>;
  if (!product) return <div>Product not found</div>;
  return (
    <>
      <ClientLayout>
        <article className="mt-[98px]">
          <div className="flex gap-4 my-4">
            <div className="text-sm">
              <a href="/">Trang chủ</a>
            </div>

            {categories?.data.map((item: any) => (
              <div key={item._id} className="text-sm">
                <div className="text-sm flex gap-4">
                  <div>-</div> {item.name}
                </div>
              </div>
            ))}
          </div>
          <hr className="mb-8" />

          <div className="grid grid-cols-2 gap-8">
            <div className="w-full flex gap-3">
              {/* Ảnh chính */}
              <div className="relative w-[80%] h-[800.5px] overflow-hidden">
                <img
                  id="mainImage"
                  src={product.images.main.url}
                  className="w-full h-full object-cover transition-transform duration-300 ease-in-out"
                  alt={product.productId.name}
                />
              </div>

              {/* Swiper dọc ảnh nhỏ */}
              <div className="w-[18%] h-[700.5px] mt-12">
                <Swiper
                  direction="vertical"
                  slidesPerView={4}
                  spaceBetween={4}
                  loop={true}
                  autoplay={{
                    delay: 2500,
                    disableOnInteraction: false,
                  }}
                  speed={1000}
                  className="h-full"
                  modules={[Autoplay]}
                >
                  {[
                    product.images.main?.url,
                    product.images.hover?.url,
                    ...product.images.product.map((img: any) => img.url),
                  ].map((img, index) => (
                    <SwiperSlide key={index}>
                      <img
                        src={img}
                        className="w-full h-[165px] object-cover cursor-pointer hover:brightness-90 transition-all duration-300"
                        alt={`Thumbnail ${index + 1}`}
                        onClick={() => {
                          const mainImage = document.getElementById(
                            "mainImage"
                          ) as HTMLImageElement;
                          if (mainImage) mainImage.src = img;
                        }}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>

            <div className="pl-[30px]">
              <div className="text-3xl font-[550]">
                {product.productId.name}
              </div>
              <div className="flex items-center gap-4 py-4">
                <div className="text-gray-500">SKU: {product.sku}</div>
                <div className="flex items-center gap-1">
                  {totalReviews > 0 ? (
                    <>
                      <Rate
                        disabled
                        allowHalf
                        defaultValue={parseFloat(averageRating)}
                        className="text-yellow-500 flex items-center justify-center [&_.ant-rate-star]:!text-[16px] [&_.ant-rate-star-second]:!text-[16px] [&_.ant-rate-star-half]:!text-[16px] [&_.ant-rate-star-full]:!text-[16px] [&_.ant-rate-star-half-left]:!text-[16px] [&_.ant-rate-star-half-right]:!text-[16px] [&_.ant-rate-star]:!mr-[0px]"
                      />
                      <div className="text-gray-500">({totalReviews} đánh giá)</div>
                    </>
                  ) : (
                    <div className="text-sm italic text-gray-400">Chưa có đánh giá</div>
                  )}
                </div>
              </div>
              <div className="text-2xl font-[550]">
                {product.price.toLocaleString("vi-VN")}đ
              </div>

              <div className="text-xl font-[550] my-3">
                Màu sắc: {product.color.colorName}
              </div>
              <div className="flex gap-4">
                {isLoading || !colors.length
                  ? Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={index}
                        className="animate-pulse rounded-tl-lg rounded-br-lg w-[46px] h-[30px] bg-gray-100"
                      />
                    ))
                  : colors.map((color: any) => {
                      const isMainColor =
                        color.actualColor === product.color?.actualColor;
                      const iconColor = isDarkColor(color.actualColor)
                        ? "text-white"
                        : "text-black";
                      return (
                        <Link
                          key={color._id}
                          to={`/products/${color._id}`}
                          className={`relative inline-block rounded-tl-lg rounded-br-lg w-[46px] h-[30px] border border-gray-300`}
                          style={{ backgroundColor: color.actualColor }}
                          title={color.actualColor}
                        >
                          {isMainColor && (
                            <div className="absolute top-[4px] left-[11px]">
                              <Check className={`w-5 h-5 ${iconColor}`} />
                            </div>
                          )}
                        </Link>
                      );
                    })}
              </div>

              <div className="flex gap-4 my-4">
                {product.sizes.map(
                  (item: {
                    _id: React.Key | null;
                    stock: number;
                    size: string;
                  }) => (
                    <div
                      key={item._id}
                      className={`border border-black w-[46px] h-[30px] flex items-center justify-center text-black ${
                        item.stock === 0
                          ? "line-through cursor-not-allowed opacity-50 bg-gray-100"
                          : "cursor-pointer hover:bg-gray-100"
                      } ${selectedSize === item.size ? "bg-gray-200" : ""}`}
                      onClick={() =>
                        item.stock > 0 && setSelectedSize(String(item.size))
                      }
                    >
                      {item.size}
                    </div>
                  )
                )}
              </div>
              <div className="mb-2 text-xs flex gap-1 items-center">
                Số lượng còn lại:
                {selectedSize &&
                  (isLoading ? (
                    <span className="inline-block w-6 h-4 bg-gray-200 animate-pulse rounded align-middle"></span>
                  ) : (
                    (() => {
                      const selected = product.sizes.find(
                        (s: any) => s.size === selectedSize
                      );
                      if (selected) {
                        return (
                          <span className="font-semibold">
                            {selected.stock}
                          </span>
                        );
                      }
                      return null;
                    })()
                  ))}
              </div>
              <div
                className="text-xs flex items-center mb-4 cursor-pointer hover:text-orange-600 transition-all duration-300 group w-[150px]"
                onClick={() => setShowCheckSize(true)}
              >
                <ClipboardList className="w-3 h-3 text-gray-500 mr-1 group-hover:text-orange-600 transition-all duration-300" />
                Kiểm tra size của bạn
              </div>

              {showCheckSize && (
                <CheckSizeModal onClose={() => setShowCheckSize(false)} />
              )}

              <div className="flex items-center gap-4">
                <div className="font-[500] text-[#727171]">Số lượng</div>
                <div className="flex items-center justify-center gap-0.5 relative w-36 h-12 my-4">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="flex items-center justify-center border w-12 h-12 rounded rounded-tl-[15px] rounded-br-[15px] text-xl absolute left-0"
                  >
                    -
                  </button>
                  <div className="flex items-center justify-center text-center text-sm border-y w-20 h-full z-10 absolute">
                    {quantity}
                  </div>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="flex items-center justify-center border w-12 h-12 rounded rounded-tl-[15px] rounded-br-[15px] text-xl absolute right-0"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4 mb-10">
                <div
                  className={`my-4 text-lg font-semibold w-[174px] h-[48px] rounded-tl-[15px] rounded-br-[15px] flex justify-center items-center transition-all duration-300 ${
                    isOutOfStock
                      ? "bg-gray-400 text-white opacity-50 pointer-events-none"
                      : "bg-black text-white hover:bg-white hover:text-black hover:border hover:border-black cursor-pointer"
                  }`}
                  onClick={() => {
                    if (!isOutOfStock && selectedSize) {
                      if (!auth.user?.id) {
                        toast.error("Bạn cần đăng nhập!");
                        return;
                      }

                      addToCartMutation.mutate({
                        userId: auth.user.id,
                        productVariantId: product._id,
                        size: selectedSize,
                        quantity: quantity,
                      });
                    } else if (!selectedSize) {
                      toast.error("Vui lòng chọn size!");
                    }
                  }}
                >
                  {isOutOfStock ? "Hết hàng" : "Thêm vào giỏ"}
                </div>
                <div
                  className={`my-4 text-lg font-semibold w-[124px] h-[46px] rounded-tl-[15px] rounded-br-[15px] flex justify-center items-center transition-all duration-300 ${
                    isOutOfStock
                      ? "bg-white text-gray-400 border border-gray-400 opacity-50 pointer-events-none"
                      : "bg-white text-black border border-black hover:bg-black hover:text-white cursor-pointer"
                  }`}
                  onClick={() => {
                    if (!isOutOfStock && selectedSize) {
                      if (!auth.user.id) {
                        toast.error("Bạn cần đăng nhập!");
                        return;
                      }
                      const cartItem: CartItem = {
                        userId: auth.user.id,
                        productVariantId: product._id,
                        size: selectedSize,
                        quantity: quantity,
                      };
                      addToCartMutation.mutate(cartItem);
                      navigate("/cart");
                    } else if (!selectedSize) {
                      toast.error("Vui lòng chọn size!");
                    }
                  }}
                >
                  {isOutOfStock ? "Hết hàng" : "Mua hàng"}
                </div>
                <div className="relative">
                  {/* Nút Thêm vào wishlist */}
                  <button
                    onClick={() => addWishList(product._id)}
                    className={`add-wishlist bg-white border border-black w-[46px] h-[46px] rounded-tl-[15px] rounded-br-[15px] flex justify-center items-center hover:bg-black transition-all duration-300 group cursor-pointer ${
                      wishlistIds.includes(product._id) ? "hidden" : ""
                    }`}
                    data-id={product._id}
                    aria-label={`Thêm ${product.productId.name} vào danh sách yêu thích`}
                    type="button"
                    disabled={addWishListMutation.isPending}
                  >
                    <Heart
                      className="w-4 h-4 stroke-black fill-white group-hover:fill-white group-hover:stroke-white transition-all duration-300"
                      aria-hidden="true"
                      strokeWidth={1.6}
                    />
                  </button>

                  {/* Nút Xóa khỏi wishlist */}
                  <button
                    onClick={() => removeWishList(product._id)}
                    className={`remove-wishlist bg-white border border-black w-[46px] h-[46px] rounded-tl-[15px] rounded-br-[15px] flex justify-center items-center hover:bg-black transition-all duration-300 group cursor-pointer ${
                      wishlistIds.includes(product._id) ? "" : "hidden"
                    }`}
                    data-id={product._id}
                    aria-label={`Xóa ${product.productId.name} khỏi danh sách yêu thích`}
                    type="button"
                    disabled={removeWishListMutation.isPending}
                  >
                    <Heart
                      className="w-4 h-4 stroke-black fill-black group-hover:fill-white group-hover:stroke-white transition-all duration-300"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>
              <hr />
              <div>
                <div className="flex gap-6">
                  <div
                    className={`tab-button text-xs font-semibold mt-10 mb-5 cursor-pointer px-2 py-1 ${
                      activeTab === "gioi_thieu"
                        ? "text-black"
                        : "text-gray-500"
                    }`}
                    onClick={() => handleTabChange("gioi_thieu")}
                  >
                    GIỚI THIỆU
                  </div>
                  <div
                    className={`tab-button text-xs font-semibold mt-10 mb-5 cursor-pointer px-2 py-1 ${
                      activeTab === "chi_tiet" ? "text-black" : "text-gray-500"
                    }`}
                    onClick={() => handleTabChange("chi_tiet")}
                  >
                    CHI TIẾT SẢN PHẨM
                  </div>
                  <div
                    className={`tab-button text-xs font-semibold mt-10 mb-5 cursor-pointer px-2 py-1 ${
                      activeTab === "bao_quan" ? "text-black" : "text-gray-500"
                    }`}
                    onClick={() => handleTabChange("bao_quan")}
                  >
                    BẢO QUẢN
                  </div>
                </div>
                <hr className="mb-4" />
                <div
                  className={`tab-content text-[14px] leading-6 ${
                    activeTab === "gioi_thieu" ? "" : "hidden"
                  }`}
                >
                  {product.productId.shortDescription ||
                    "Mô tả ngắn về sản phẩm."}
                </div>
                <div
                  className={`tab-content text-[14px] leading-6 ${
                    activeTab === "chi_tiet" ? "" : "hidden"
                  }`}
                  dangerouslySetInnerHTML={{ __html: product.productId.description|| 
                     "Mô tả chi tiết của sản phẩm." }}
                ></div>
                <div
                  className={`tab-content text-[14px] leading-6 ${
                    activeTab === "bao_quan" ? "" : "hidden"
                  }`}
                >
                  Hướng dẫn bảo quản: Chỉ giặt khô, không giặt ướt.
                </div>
              </div>
            </div>
          </div>
          <ReviewList productVariantId={product._id} />
          {relatedVariantsData?.length > 0 && (
            <>
              <p className="text-center font-semibold py-4 text-xl sm:text-2xl md:text-3xl md:py-8 sm:py-8">
                Sản phẩm tương tự
              </p>
              <div className="w-full">
                <ProductItemVariantForm
                  namespace={namespaceRelated}
                  isSlideshow
                />
              </div>
            </>
          )}

          <p className="text-center font-semibold py-4 text-xl sm:text-2xl md:text-3xl md:py-8 sm:py-8">
            Sản phẩm đã xem
          </p>
          <div className="w-full">
            <ProductItemVariantForm
              namespace="product-variants/recently-viewed"
              isSlideshow
            />
          </div>
          
          <div>
            <img
              src="/images/banner1.3.webp"
              className="rounded-tl-[80px] rounded-br-[80px] my-7"
              alt="Banner"
            />
          </div>
        </article>
      </ClientLayout>
    </>
  );
};

export default DetailProduct;

