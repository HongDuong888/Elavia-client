import React, { useState, useEffect } from "react";
import { Range } from "react-range";
import axiosInstance from "../services/axiosInstance";

const PRICE_MIN = 0;
const PRICE_MAX = 10000000;
const STEP = 100000;

const sizes = ["S", "M", "L", "XL", "XXL"];
const colors = [
  { code: "#000000", name: "Đen", value: "black" },
  { code: "#FFFFFF", name: "Trắng", value: "white" },
  { code: "#007BFF", name: "Xanh dương", value: "blue" },
  { code: "#F3DE2C", name: "Vàng", value: "yellow" },
  { code: "#EE3C56", name: "Hồng", value: "pink" },
  { code: "#FF0000", name: "Đỏ", value: "red" },
  { code: "#808080", name: "Xám", value: "gray" },
  { code: "#F5F5DC", name: "Be", value: "beige" },
  { code: "#8B4513", name: "Nâu", value: "brown" },
  { code: "#28A745", name: "Xanh lá", value: "green" },
  { code: "#FFA500", name: "Cam", value: "orange" },
  { code: "#B197FC", name: "Tím", value: "purple" },
];

interface FilterSidebarProps {
  filters: {
    sizes: string[];
    color: string | null;
    priceRange: [number, number];
    attributes: Record<string, string[]>;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<FilterSidebarProps["filters"]>
  >;
  onFilter: () => void;
  onReset?: () => void;
}

const FilterSidebar = ({
  filters,
  setFilters,
  onFilter,
  onReset,
}: FilterSidebarProps) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    size: true,
    color: true,
    price: true,
    discount: false,
    advanced: false,
  });
  const [expandedAdvanced, setExpandedAdvanced] = useState<
    Record<string, boolean>
  >({});
  const [attributes, setAttributes] = useState<any[]>([]);

  useEffect(() => {
    axiosInstance.get("/attributes").then((res) => {
      setAttributes(res.data.data || []);
    });
  }, []);

  const toggleSection = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAdvancedGroup = (key: string) => {
    setExpandedAdvanced((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleToggleSize = (size: string) => {
    setFilters((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const toggleAttribute = (slug: string, value: string) => {
    setFilters((prev) => {
      const current = prev.attributes[slug] || [];

      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];

      const newAttributes = { ...prev.attributes };
      if (updated.length > 0) {
        newAttributes[slug] = updated;
      } else {
        delete newAttributes[slug];
      }

      return {
        ...prev,
        attributes: newAttributes,
      };
    });
  };

  const handleReset = () => {
    setFilters({
      sizes: [],
      color: null,
      priceRange: [PRICE_MIN, PRICE_MAX],
      attributes: {},
    });
  };

  return (
    <div className="w-full md:w-1/4 p-4 max-h-[90vh] text-base font-medium text-black flex flex-col relative">
      {/* Nội dung lọc */}
      <div className="flex-1 overflow-y-auto pb-24">
        {/* Size */}
        <div>
          <button
            onClick={() => toggleSection("size")}
            className="w-full flex justify-between items-center py-4"
          >
            Size
            <span>{expanded.size ? "−" : "+"}</span>
          </button>
          {expanded.size && (
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  className={`px-4 py-1 rounded text-sm font-medium mb-4 ${
                    filters.sizes.includes(size)
                      ? "bg-black text-white"
                      : "bg-white text-black"
                  }`}
                  onClick={() => handleToggleSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          )}
        </div>

        <hr />

        {/* Color */}
        <div>
          <button
            onClick={() => toggleSection("color")}
            className="w-full flex justify-between items-center py-4"
          >
            Màu sắc
            <span>{expanded.color ? "−" : "+"}</span>
          </button>
          {expanded.color && (
            <div className="flex flex-wrap gap-3">
              {colors.map(({ code, name, value }, i) => (
                <button
                  key={i}
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, color: value }))
                  }
                  className={`w-6 h-6 rounded-full border-2 mb-4 ${
                    filters.color === value ? "border-black" : "border-gray-300"
                  }`}
                  style={{ backgroundColor: code }}
                  title={`Màu ${name}`}
                />
              ))}
            </div>
          )}
        </div>

        <hr />

        {/* Price */}
        <div>
          <button
            onClick={() => toggleSection("price")}
            className="w-full flex justify-between items-center py-4"
          >
            Mức giá
            <span>{expanded.price ? "−" : "+"}</span>
          </button>
          {expanded.price && (
            <>
              <Range
                min={PRICE_MIN}
                max={PRICE_MAX}
                step={STEP}
                values={filters.priceRange}
                onChange={(values) =>
                  setFilters((prev) => ({
                    ...prev,
                    priceRange: values as [number, number],
                  }))
                }
                renderTrack={({ props, children }) => {
                  const [min, max] = filters.priceRange;
                  const left =
                    ((min - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
                  const right =
                    ((max - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

                  return (
                    <div
                      {...props}
                      className="h-1 w-full max-w-[150px] bg-gray-300 rounded relative my-4 mx-auto"
                      style={{ touchAction: "none" }}
                    >
                      <div
                        className="absolute top-0 h-1 bg-black rounded"
                        style={{ left: `${left}%`, width: `${right - left}%` }}
                      ></div>
                      {children}
                    </div>
                  );
                }}
                renderThumb={({ props, index }) => (
                  <div
                    {...props}
                    className="w-4 h-4 bg-black rounded-full shadow-md outline-none"
                    title={filters.priceRange[index].toLocaleString() + "đ"}
                  />
                )}
              />
              <div className="flex justify-between text-sm text-gray-700 mt-2 mb-4">
                <span>{filters.priceRange[0].toLocaleString()}đ</span>
                <span>{filters.priceRange[1].toLocaleString()}đ</span>
              </div>
            </>
          )}
        </div>

        <hr />

        {/* Advanced */}
        <div>
          <button
            onClick={() => toggleSection("advanced")}
            className="w-full flex justify-between items-center py-4"
          >
            Nâng cao
            <span>{expanded.advanced ? "−" : "+"}</span>
          </button>
          {expanded.advanced && (
            <div className="space-y-2 text-sm text-gray-700">
              {attributes.length === 0 ? (
                <div className="text-gray-400 text-center py-2">
                  Đang tải...
                </div>
              ) : (
                attributes.map((attr) => (
                  <div key={attr._id}>
                    <button
                      type="button"
                      onClick={() => toggleAdvancedGroup(attr.slug)} // ✅ dùng slug
                      className="w-full flex justify-between items-center py-1"
                    >
                      <span>{attr.name}</span>
                      <span>
                        {expandedAdvanced[attr.slug] ? "−" : "+"}
                      </span>{" "}
                      {/* ✅ slug */}
                    </button>
                    {expandedAdvanced[attr.slug] && (
                      <div className="pl-4 space-y-1">
                        {attr.values.map((opt: string) => (
                          <label key={opt} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={
                                filters.attributes[attr.slug]?.includes(opt) ||
                                false
                              } // ✅ dùng slug
                              onChange={() => toggleAttribute(attr.slug, opt)} // ✅ dùng slug
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Nút Lọc và Bỏ lọc luôn nổi dưới cùng */}
      <div className="sticky bottom-0 left-0 bg-white pt-4 pb-2 z-10 flex gap-2 border-t mt-2">
        <button
          className="px-6 py-2 text-sm font-medium border border-black rounded-tl-2xl rounded-br-2xl text-black hover:bg-black hover:text-white transition"
          onClick={() => {
            handleReset();
            onReset?.();
          }}
        >
          BỎ LỌC
        </button>
        <button
          className="px-6 py-2 text-sm font-medium border border-black bg-black text-white rounded-tl-2xl rounded-br-2xl hover:bg-white hover:text-black transition"
          onClick={onFilter}
        >
          LỌC
        </button>
      </div>
    </div>
  );
};

export default FilterSidebar;
