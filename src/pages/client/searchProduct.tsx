import React, { useState, useEffect } from "react";
import axiosInstance from "../../services/axiosInstance";
import FilterSidebar from "../../components/FilterSidebar";
import ClientLayout from "../../layouts/clientLayout";
import { useLocation } from "react-router-dom";
import ProductItemVariantForm from "../../components/productItemVariant";
const SearchProduct = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const keywordParam = searchParams.get("keyword") || "";

  type FilterState = {
    sizes: string[];
    color: string | null;
    priceRange: [number, number];
    attributes: Record<string, string[]>;
    keyword: string;
  };

  const [filters, setFilters] = useState<FilterState>({
    sizes: [],
    color: null,
    priceRange: [0, 10000000],
    attributes: {},
    keyword: keywordParam,
  });

  const [pendingFilters, setPendingFilters] = useState<FilterState>(filters);
  const [products, setProducts] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async (page = 1, customFilters = filters) => {
    try {
      setLoading(true);
      const res = await axiosInstance.post("/product-variants/search", {
        ...customFilters,
        page,
        limit: 12,
      });

      setProducts(res.data.data);
      setTotalPages(res.data.totalPages);
      setCurrentPage(res.data.currentPage);
      setTotalItems(res.data.total);
    } catch (error) {
      console.error("Lỗi khi lọc sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1, filters);
  }, []); // Không có filters trong dependency

  useEffect(() => {
    const defaultFilters: FilterState = {
      sizes: [],
      color: null,
      priceRange: [0, 10000000],
      attributes: {},
      keyword: keywordParam,
    };
    setFilters(defaultFilters);
    setPendingFilters(defaultFilters);
    fetchProducts(1, defaultFilters);
  }, [keywordParam]);

  const handleResetFilters = () => {
    const defaultFilters: FilterState = {
      sizes: [],
      color: null,
      priceRange: [0, 10000000],
      attributes: {},
      keyword: keywordParam,
    };

    setPendingFilters(defaultFilters);
    setFilters(defaultFilters);
    fetchProducts(1, defaultFilters);
  };

  const applyFilters = () => {
    setFilters({
      ...pendingFilters,
      keyword: keywordParam,
    });
    fetchProducts(1, { ...pendingFilters, keyword: keywordParam });
  };

  return (
    <ClientLayout>
      <div className="flex flex-col md:flex-row py-6 mt-20">
        <FilterSidebar
          filters={{
            sizes: pendingFilters.sizes,
            color: pendingFilters.color,
            priceRange: pendingFilters.priceRange,
            attributes: pendingFilters.attributes,
          }}
          setFilters={(update) =>
            setPendingFilters((prev) => {
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

        <div className="w-full md:w-3/4 ml-8">
          <h2 className="text-xl font-semibold mb-6">
            Kết quả tìm kiếm theo '{keywordParam}' ({totalItems} sản phẩm)
          </h2>

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
            <div className="flex justify-center gap-2 mt-6">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => fetchProducts(i + 1)}
                  className={`px-3 py-1 border ${
                    currentPage === i + 1 ? "bg-black text-white" : "text-black"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </ClientLayout>
  );
};

export default SearchProduct;
