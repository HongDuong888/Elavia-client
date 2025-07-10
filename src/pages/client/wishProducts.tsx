import { Link } from "react-router-dom";
import ClientLayout from "../../layouts/clientLayout";
import MenuInfo from "../../components/menuInfo";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getList } from "../../api/provider";
import { usePostItem } from "../../hooks/usePostItem";
import { useEffect, useState } from "react";
import ProductItemVariantForm from "../../components/productItemVariant";
import axiosInstance from "../../services/axiosInstance"; // Thêm nếu chưa có

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
  const [products, setProducts] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);

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

  // Hàm fetch sản phẩm yêu thích có phân trang
  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      // Gọi đúng endpoint RESTful, truyền page & limit qua query string
      const res = await axiosInstance.get(`/wishlist?page=${page}&limit=12`);
      setProducts(res.data.data || res.data); // tuỳ BE trả về
      setTotalPages(res.data.totalPages || Math.ceil((res.data.total || 0) / 12));
      setCurrentPage(res.data.currentPage || page);
      setTotalItems(res.data.total || (res.data.data ? res.data.data.length : 0));
    } catch (error) {
      setProducts([]);
      setTotalPages(0);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1);
  }, []);

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
              {loading ? (
                <p className="text-gray-500">Đang tải sản phẩm...</p>
              ) : (
                <ProductItemVariantForm
                  productVariants={products}
                  isSlideshow={false}
                  maxColumns={4}
                />
              )}
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center space-x-2 text-sm">
                  <button
                    onClick={() => fetchProducts(1)}
                    className="w-9 h-9 border border-black rounded-tl-lg rounded-br-lg transition-all duration-300 bg-white text-black hover:bg-black hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={currentPage === 1}
                  >
                    &laquo;
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => fetchProducts(p)}
                      className={`w-9 h-9 border rounded-tl-lg rounded-br-lg transition-all duration-300 ${
                        currentPage === p
                          ? "bg-black text-white border-black cursor-default"
                          : "bg-white text-black border-black hover:bg-black hover:text-white"
                      }`}
                      disabled={currentPage === p}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => fetchProducts(currentPage + 1)}
                    className="w-9 h-9 border border-black rounded-tl-lg rounded-br-lg transition-all duration-300 bg-white text-black hover:bg-black hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={currentPage >= totalPages}
                  >
                    &raquo;
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </article>
    </ClientLayout>
  );
};

export default WishProducts;
