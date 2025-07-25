import React, { useState, useEffect } from "react";
import axiosInstance from "../../services/axiosInstance";
import FilterSidebar from "../../components/FilterSidebar";
import ClientLayout from "../../layouts/clientLayout";
import { useParams, useLocation } from "react-router-dom";
import ProductItemVariantForm from "../../components/productItemVariant";

const NewArrivalProducts = () => {
  const { gender } = useParams();
  const location = useLocation();

  let namespace = "";
  if (location.pathname.startsWith("/spring-summer-collection")) {
    namespace =
      gender === "men"
        ? "product-variants/spring-summer-collection/men"
        : "product-variants/spring-summer-collection/women";
  } else {
    namespace =
      gender === "men"
        ? "product-variants/new-arrival/men"
        : "product-variants/new-arrival/women";
  }

  const [products, setProducts] = useState<any[]>([]);
  const [filters, setFilters] = useState<any>({
    sizes: [],
    color: null,
    priceRange: [0, 10000000],
    attributes: {},
    sortBy: "",
    order: "",
  });
  const [pendingFilters, setPendingFilters] = useState(filters);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchProducts = async (page = 1, customFilters = filters) => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: 12,
        // Đảm bảo luôn truyền priceRange
        priceRange: customFilters.priceRange,
      };
      if (customFilters.sizes && customFilters.sizes.length > 0)
        params.size = customFilters.sizes;
      if (customFilters.color) params.color = customFilters.color;
      if (customFilters.attributes) params.attributes = customFilters.attributes;
      if (customFilters.sortBy) {
        if (customFilters.sortBy === "price-asc") {
          params.sortBy = "price";
          params.order = "asc";
        } else if (customFilters.sortBy === "price-desc") {
          params.sortBy = "price";
          params.order = "desc";
        } else if (customFilters.sortBy === "newest") {
          params.sortBy = "createdAt";
          params.order = "desc";
        }
      }
      // Gọi API new arrival
      const res = await axiosInstance.get(`/${namespace}`, { params });
      setProducts(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
      setCurrentPage(res.data.currentPage || 1);
    } catch (error) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1, filters);
    // eslint-disable-next-line
  }, [gender]);

  const applyFilters = () => {
    setFilters(pendingFilters);
    fetchProducts(1, pendingFilters);
  };

  const handleResetFilters = () => {
    const reset = {
      sizes: [],
      color: null,
      priceRange: [0, 10000000],
      attributes: {},
      sortBy: "",
      order: "",
    };
    setPendingFilters(reset);
    setFilters(reset);
    fetchProducts(1, reset);
  };

  const handleSortChange = (value: string) => {
    setFilters((prev: any) => ({
      ...prev,
      sortBy: value,
    }));
    fetchProducts(1, { ...filters, sortBy: value });
  };

  const isSpringSummer = location.pathname.startsWith("/spring-summer-collection");
  const pageTitle = isSpringSummer
    ? (gender === "men" ? "SPRING - SUMMER COLLECTION - NAM" : "SPRING - SUMMER COLLECTION - NỮ")
    : (gender === "men" ? "NEW ARRIVAL - NAM" : "NEW ARRIVAL - NỮ");

  // Sửa breadcrumb cho đúng từng trang
  const breadcrumb = [
    <a href="/" className="hover:text-black" key="home">Trang chủ</a>,
    <span className="mx-1" key="sep">-</span>,
    <span className="text-gray-800 font-medium" key="label">
      {isSpringSummer
        ? (gender === "men" ? "SPRING - SUMMER COLLECTION - NAM" : "SPRING - SUMMER COLLECTION - NỮ")
        : (gender === "men" ? "NEW ARRIVAL - NAM" : "NEW ARRIVAL - NỮ")}
    </span>
  ];

  return (
    <ClientLayout>
      {/* Breadcrumb navbar */}
      <div className="max-w-[1400px] mx-auto mt-[98px] px-4">
        <div className="text-sm text-gray-500 py-2 mb-2 flex items-center gap-2">
          {breadcrumb}
        </div>
      </div>

      {/* Main content: filter + products */}
      <div className="grid grid-cols-[300px_1fr] gap-8 px-2 md:px-0">
        {/* FilterSidebar bên trái */}
        <aside>
          <FilterSidebar
            filters={{
              sizes: pendingFilters.sizes,
              color: pendingFilters.color,
              priceRange: pendingFilters.priceRange,
              attributes: pendingFilters.attributes,
            }}
            setFilters={(update) =>
              setPendingFilters((prev: any) => {
                const base =
                  typeof update === "function"
                    ? update({
                        sizes: prev.sizes,
                        color: prev.color,
                        priceRange: prev.priceRange,
                        attributes: prev.attributes,
                      })
                    : update;
                return { ...prev, ...base };
              })
            }
            onFilter={applyFilters}
            onReset={handleResetFilters}
          />
        </aside>

        {/* Sản phẩm bên phải */}
        <main className="flex-1">
          {/* Title danh mục + Sort Dropdown trên cùng một dòng */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800 uppercase">
              {pageTitle}
            </h1>
            <select
              className="border border-gray-300 rounded px-3 py-2 text-sm"
              value={filters.sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <option value="">Sắp xếp theo</option>
              <option value="newest">Mới nhất</option>
              <option value="popular">Được yêu thích nhất</option>
              <option value="price-asc">Giá: thấp đến cao</option>
              <option value="price-desc">Giá: cao đến thấp</option>
            </select>
          </div>

          {/* Danh sách sản phẩm */}
          {loading ? (
            <p className="text-gray-500 ">Đang tải sản phẩm...</p>
          ) : products.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Không có sản phẩm</p>
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
                  className={`w-9 h-9 border rounded-tl-lg rounded-br-lg transition-all duration-300 ${currentPage === p
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
        </main>
      </div>
    </ClientLayout>
  );
};

export default NewArrivalProducts;