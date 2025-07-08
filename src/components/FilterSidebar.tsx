import React, { useState } from "react";
import { Range } from "react-range";

const PRICE_MIN = 0;
const PRICE_MAX = 10000000;
const STEP = 100000;

const sizes = ["S", "M", "L", "XL", "XXL"];
const colors = [
  { code: "#000000", name: "Đen" },
  { code: "#FFFFFF", name: "Trắng" },
  { code: "#F3B228", name: "Vàng nghệ" },
  { code: "#F3DE2C", name: "Vàng nhạt" },
  { code: "#EE3C56", name: "Hồng sen" },
  { code: "#474747", name: "Xám đậm" },
  { code: "#B99470", name: "Nâu kem" },
  { code: "#2D6A4F", name: "Xanh rêu" },
  { code: "#F77F00", name: "Cam đất" },
  { code: "#B197FC", name: "Tím pastel" },
];

const advancedFilters = {
  "Chất liệu": ["Cotton", "Lụa", "Len"],
  "Kiểu dáng": ["Xòe", "Ôm", "Suông"],
  "Họa tiết": ["Trơn", "Chấm bi", "Kẻ sọc"],
  "Cổ áo": ["Cổ tròn", "Cổ tim", "Cổ vuông"],
  "Tay áo": ["Ngắn", "Dài", "Không tay"],
  "Cạp quần": ["Cao", "Thấp"],
  "Cạp zuýp": ["Cao", "Vừa"]
};

const FilterSidebar = () => {
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    size: false,
    color: false,
    price: false,
    discount: false,
    advanced: false,
  });
  const [expandedAdvanced, setExpandedAdvanced] = useState<Record<string, boolean>>({});

  const toggleSection = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAdvancedGroup = (key: string) => {
    setExpandedAdvanced((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleToggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleReset = () => {
    setSelectedSizes([]);
    setSelectedColor(null);
    setPriceRange([PRICE_MIN, PRICE_MAX]);
  };

  return (
    <div className="w-full md:w-1/4 p-4 overflow-y-auto max-h-[90vh] text-base font-medium text-black">
      {/* Size */}
      <div>
        <button
          onClick={() => toggleSection("size")}
          className="w-full flex justify-between items-center px-3 py-4 "
        >
          Size
          <span>{expanded.size ? "−" : "+"}</span>
        </button>
        {expanded.size && (
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                className={` px-4 py-1 rounded text-sm font-medium mb-4 ${
                  selectedSizes.includes(size)
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
          className="w-full flex justify-between items-center px-3 py-4"
        >
          Màu sắc
          <span>{expanded.color ? "−" : "+"}</span>
        </button>
        {expanded.color && (
          <div className="flex flex-wrap gap-3">
            {colors.map(({ code, name }, i) => (
              <button
                key={i}
                onClick={() => setSelectedColor(code)}
                className={`w-6 h-6 rounded-full border-2 mb-4 ${
                  selectedColor === code ? "border-black" : "border-gray-300"
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
          className="w-full flex justify-between items-center px-3 py-4"
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
              values={priceRange}
              onChange={(values) => setPriceRange(values as [number, number])}
              renderTrack={({ props, children }) => {
                const [min, max] = priceRange;
                const left = ((min - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
                const right = ((max - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

                return (
                  <div
                    {...props}
                    className="h-1 w-full bg-gray-300 rounded relative my-4"
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
                  title={priceRange[index].toLocaleString() + "đ"}
                />
              )}
            />
            <div className="flex justify-between text-sm text-gray-700 mt-2 mb-4">
              <span>{priceRange[0].toLocaleString()}đ</span>
              <span>{priceRange[1].toLocaleString()}đ</span>
            </div>
          </>
        )}
      </div>



      <hr />

      {/* Advanced */}
      <div>
        <button
          onClick={() => toggleSection("advanced")}
          className="w-full flex justify-between items-center px-3 py-4"
        >
          Nâng cao
          <span>{expanded.advanced ? "−" : "+"}</span>
        </button>
        {expanded.advanced && (
          <div className="space-y-2 text-sm text-gray-700">
            {Object.entries(advancedFilters).map(([group, options]) => (
              <div key={group}>
                <button
                  type="button"
                  onClick={() => toggleAdvancedGroup(group)}
                  className="w-full flex justify-between items-center py-1"
                >
                  <span>{group}</span>
                  <span>{expandedAdvanced[group] ? "−" : "+"}</span>
                </button>
                {expandedAdvanced[group] && (
                  <div className="pl-4 space-y-1">
                    {options.map((opt) => (
                      <label key={opt} className="flex items-center gap-2">
                        <input type="checkbox" />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-2 mt-6">
        <button
          className="px-6 py-2 text-sm font-medium border border-black rounded-tl-2xl rounded-br-2xl text-black hover:bg-black hover:text-white transition"
          onClick={handleReset}
        >
          BỎ LỌC
        </button>
        <button
          className="px-6 py-2 text-sm font-medium border  border-black bg-black text-white rounded-tl-2xl rounded-br-2xl hover:bg-white hover:text-black transition"
        >
          LỌC
        </button>
      </div>
    </div>
  );
};

export default FilterSidebar;
