import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/auth.context";
import { toast } from "react-toastify";
import { getById, getList, postItem } from "../../api/provider";
import { addToCart } from "../../services/userService";
import { Rate } from "antd";
import { Link, useNavigate } from "react-router-dom";
import Loading from "../../components/loading";
import { CartItem } from "../../types/cart";
import ClientLayout from "../../layouts/clientLayout";
import ProductItemForm from "../../components/productItem";
import { usePostItem } from "../../hooks/usePostItem";
import { useAddToCart } from "../../hooks/useAddToCart";
import ProductItemVariantForm from "../../components/productItemVariant";
import { HiCheck } from "react-icons/hi";

const DetailProduct = ({ productId }: { productId: string }) => {
  const queryClient = useQueryClient();
  const { auth } = useAuth();
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
  const formData = new FormData();
  const postItemMutation = usePostItem({ showToast: false });
  const [colors, setColors] = useState<any[]>([]);

  const { data: wishlistData, isLoading: isWishlistLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => getList({ namespace: "wishlist" }),
    staleTime: 60 * 1000,
  });
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
              <a href="?action=home">Trang chủ</a>
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

          <div className="grid grid-cols-2">
            <div className="w-[100%] flex gap-3">
              <div
                id="zoomLayout"
                className="relative w-[80%] h-[844.5px] overflow-hidden"
              >
                <img
                  id="mainImage"
                  src={product.images.main.url}
                  className="w-full h-full object-cover transition-transform duration-300 ease-in-out"
                  alt={product.productId.name}
                />
              </div>
              <div className="relative overflow-hidden h-[720px] mt-[60px]">
                <div
                  id="slideshow"
                  className="flex flex-col gap-4 transition-transform duration-500"
                >
                  {[
                    product.images.main?.url,
                    product.images.hover?.url,
                    ...product.images.product.map((img: any) => img.url),
                  ].map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      className="w-[100%] h-[174px] object-cover cursor-pointer"
                      alt={`Thumbnail ${index + 1}`}
                      onClick={() => {
                        const mainImage = document.getElementById(
                          "mainImage"
                        ) as HTMLImageElement | null;
                        if (mainImage) mainImage.src = img;
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="pl-[30px]">
              <div className="text-3xl font-[550]">
                {product.productId.name}
              </div>
              <div className="flex items-center gap-4 py-4">
                <div className="text-gray-500">SKU: {product.sku}</div>
                <div className="flex items-center gap-1">
                  <Rate
                    disabled
                    allowHalf
                    defaultValue={2.5}
                    className="text-yellow-500 flex items-center justify-center [&_.ant-rate-star]:!text-[16px] [&_.ant-rate-star-second]:!text-[16px] [&_.ant-rate-star-half]:!text-[16px] [&_.ant-rate-star-full]:!text-[16px] [&_.ant-rate-star-half-left]:!text-[16px] [&_.ant-rate-star-half-right]:!text-[16px] [&_.ant-rate-star]:!mr-[0px]"
                  />
                  <div className="text-gray-500">(0 đánh giá)</div>
                </div>
              </div>
              <div className="text-2xl font-[550]">
                {product.price.toLocaleString("vi-VN")}đ
              </div>

              <div className="text-xl font-[550] my-4">
                Màu sắc: {product.color.colorName}
              </div>
              <div className="flex gap-2">
                {colors.map((color: any) => {
                  const isMainColor =
                    color.actualColor === product.color?.actualColor;
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

              <div className="text-xs flex items-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                  className="w-3 h-3 text-gray-500"
                >
                  <path d="M177.9 494.1c-18.7 18.7-49.1 18.7-67.9 0L17.9 401.9c-18.7-18.7-18.7-49.1 0-67.9l50.7-50.7 48 48c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-48-48 41.4-41.4 48 48c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-48-48 41.4-41.4 48 48c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-48-48 50.7-50.7c18.7-18.7 49.1-18.7 67.9 0l92.1 92.1c18.7 18.7 18.7 49.1 0 67.9L177.9 494.1z" />
                </svg>
                Kiểm tra size của bạn
              </div>

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
              <div className="flex items-center gap-4 mb-20">
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
                    <img
                      src="/images/heart.png"
                      alt="Thêm vào danh sách yêu thích"
                      className="w-4 h-4 transition-all duration-300 group-hover:hidden"
                      aria-hidden="true"
                    />
                    <img
                      src="/images/heart-border-white.png"
                      alt="Thêm vào danh sách yêu thích (hover)"
                      className="w-4 h-4 transition-all duration-300 hidden group-hover:block"
                      aria-hidden="true"
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
                    <img
                      src="/images/heart-black.png"
                      alt="Xóa khỏi danh sách yêu thích"
                      className="w-4 h-4 transition-all duration-300 group-hover:hidden"
                      aria-hidden="true"
                    />
                    <img
                      src="/images/heart-white.png"
                      alt="Xóa khỏi danh sách yêu thích (hover)"
                      className="w-4 h-4 transition-all duration-300 hidden group-hover:block"
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
                >
                  {product.productId.description ||
                    "Mô tả chi tiết của sản phẩm."}
                </div>
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
          <p className="text-center font-semibold py-4 text-xl sm:text-2xl md:text-3xl md:py-8 sm:py-8">
            Sản phẩm đã xem
          </p>
          {/* Product Items for Collection */}
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
