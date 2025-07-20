import React, { useState, useEffect } from "react";
import axiosInstance from "../../services/axiosInstance";
import FilterSidebar from "../../components/FilterSidebar";
import ClientLayout from "../../layouts/clientLayout";
import { useParams } from "react-router-dom";
import ProductItemVariantForm from "../../components/productItemVariant";
import { getList } from "../../api/provider";
import { useQuery } from "@tanstack/react-query";

const CategoryProducts = () => {
  const { categoryId } = useParams<{ categoryId: string }>();

  type FilterState = {
    sizes: string[];
    color: string | null;
    priceRange: [number, number];
    attributes: Record<string, string[]>;
    categoryId: string;
    sortBy?: string;
  };

  const [filters, setFilters] = useState<FilterState>({
    sizes: [],
    color: null,
    priceRange: [0, 10000000],
    attributes: {},
    categoryId: categoryId || "",
    sortBy: "",
  });

  const [pendingFilters, setPendingFilters] = useState<FilterState>(filters);
  const [products, setProducts] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const { data: allCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => getList({ namespace: `categories` }),
    staleTime: 60 * 1000,
  });

  const { data: categoryData } = useQuery({
    queryKey: ["category", categoryId],
    queryFn: async () => getList({ namespace: `categories/${categoryId}` }),
    enabled: !!categoryId,
    staleTime: 60 * 1000,
  });

  const fetchProducts = async (page = 1, customFilters = filters) => {
    try {
      setLoading(true);
      const res = await axiosInstance.post("/product-variants/by-category", {
        categoryId: customFilters.categoryId,
        sizes: customFilters.sizes,
        color: customFilters.color,
        priceRange: customFilters.priceRange,
        attributes: customFilters.attributes,
        page,
        limit: 12,
        sortBy: customFilters.sortBy,
      });

      setProducts(res.data.data);
      setTotalPages(res.data.totalPages);
      setCurrentPage(res.data.currentPage);
    } catch (error) {
      console.error("Lỗi khi lọc sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (categoryId) {
      const defaultFilters: FilterState = {
        sizes: [],
        color: null,
        priceRange: [0, 10000000],
        attributes: {},
        categoryId: categoryId,
        sortBy: "",
      };
      setFilters(defaultFilters);
      setPendingFilters(defaultFilters);
      fetchProducts(1, defaultFilters);
    }
  }, [categoryId]);

  const handleResetFilters = () => {
    const defaultFilters: FilterState = {
      sizes: [],
      color: null,
      priceRange: [0, 10000000],
      attributes: {},
      categoryId: categoryId || "",
      sortBy: "",
    };

    setPendingFilters(defaultFilters);
    setFilters(defaultFilters);
    fetchProducts(1, defaultFilters);
  };

  const applyFilters = () => {
    setFilters({
      ...pendingFilters,
      categoryId: categoryId || "",
    });
    fetchProducts(1, { ...pendingFilters, categoryId: categoryId || "" });
  };

  const handleSortChange = (sortValue: string) => {
    const newFilters = { ...filters, sortBy: sortValue };
    setFilters(newFilters);
    fetchProducts(1, newFilters);
  };

  // Breadcrumb logic giống detailProduct
  const getBreadcrumbPath = () => {
    const category = categoryData?.data || categoryData;
    const categories = allCategories?.data || [];
    if (!category || !categories.length) return [];
    const path = [];
    let current = category;
    for (let i = 0; i < 10 && current; i++) {
      path.unshift(current);
      if (current.parentId) {
        const parent = categories.find((cat: any) => cat._id === current.parentId);
        if (!parent) break;
        current = parent;
      } else {
        break;
      }
    }
    // Bỏ cấp 1 (level === 1) giống trang gốc
    // return path.filter((cat: any) => cat.level !== 1);
    return path
  };

  const breadcrumbPath = getBreadcrumbPath();

  // Lấy tên danh mục cuối cùng (title)
  const categoryName =
    breadcrumbPath.length > 0
      ? breadcrumbPath[breadcrumbPath.length - 1].name
      : categoryData?.data?.name || categoryData?.name || "";

  const title = categoryName;

  return (
    <ClientLayout>
      {/* Breadcrumb navbar - full width */}
      <div className="max-w-[1400px] mx-auto mt-[98px] px-4">
        <div className="text-sm text-gray-500 py-2 mb-2 flex items-center gap-2">
          <a href="/" className="hover:text-black">Trang chủ</a>
          {breadcrumbPath.map((cat: any, index: number) => (
            <React.Fragment key={cat._id}>
              <span className="mx-1"> - </span>
              <span className={index === breadcrumbPath.length - 1 ? "text-gray-800 font-medium" : ""}>
                {cat.name}
              </span>
            </React.Fragment>
          ))}
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
        </aside>

        {/* Sản phẩm bên phải */}
        <main className="flex-1">
          {/* Title danh mục + Sort Dropdown trên cùng một dòng */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800 uppercase">
              {title}
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

export default CategoryProducts;