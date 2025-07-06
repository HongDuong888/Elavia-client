import React, { useState } from "react";

interface CheckSizeModalProps {
  onClose: () => void;
}

const sizeGuide = {
  men: {
    shirt: [
      {
        size: "S",
        chieuCao: "160-165cm",
        canNang: "50-57kg",
        vongNguc: "88-92cm",
      },
      {
        size: "M",
        chieuCao: "165-170cm",
        canNang: "57-64kg",
        vongNguc: "92-96cm",
      },
      {
        size: "L",
        chieuCao: "170-175cm",
        canNang: "64-71kg",
        vongNguc: "96-100cm",
      },
      {
        size: "XL",
        chieuCao: "175-180cm",
        canNang: "71-78kg",
        vongNguc: "100-104cm",
      },
      {
        size: "XXL",
        chieuCao: "180-185cm",
        canNang: "78-85kg",
        vongNguc: "104-108cm",
      },
    ],
    pants: [
      {
        size: "S",
        chieuCao: "160-165cm",
        canNang: "50-57kg",
        vongEo: "74-78cm",
      },
      {
        size: "M",
        chieuCao: "165-170cm",
        canNang: "57-64kg",
        vongEo: "78-82cm",
      },
      {
        size: "L",
        chieuCao: "170-175cm",
        canNang: "64-71kg",
        vongEo: "82-86cm",
      },
      {
        size: "XL",
        chieuCao: "175-180cm",
        canNang: "71-78kg",
        vongEo: "86-90cm",
      },
      {
        size: "XXL",
        chieuCao: "180-185cm",
        canNang: "78-85kg",
        vongEo: "90-94cm",
      },
    ],
  },
  women: {
    shirt: [
      {
        size: "S",
        chieuCao: "150-155cm",
        canNang: "40-47kg",
        vongNguc: "80-84cm",
      },
      {
        size: "M",
        chieuCao: "155-160cm",
        canNang: "47-54kg",
        vongNguc: "84-88cm",
      },
      {
        size: "L",
        chieuCao: "160-165cm",
        canNang: "54-61kg",
        vongNguc: "88-92cm",
      },
      {
        size: "XL",
        chieuCao: "165-170cm",
        canNang: "61-68kg",
        vongNguc: "92-96cm",
      },
      {
        size: "XXL",
        chieuCao: "170-175cm",
        canNang: "68-75kg",
        vongNguc: "96-100cm",
      },
    ],
    pants: [
      {
        size: "S",
        chieuCao: "150-155cm",
        canNang: "40-47kg",
        vongEo: "62-66cm",
      },
      {
        size: "M",
        chieuCao: "155-160cm",
        canNang: "47-54kg",
        vongEo: "66-70cm",
      },
      {
        size: "L",
        chieuCao: "160-165cm",
        canNang: "54-61kg",
        vongEo: "70-74cm",
      },
      {
        size: "XL",
        chieuCao: "165-170cm",
        canNang: "61-68kg",
        vongEo: "74-78cm",
      },
      {
        size: "XXL",
        chieuCao: "170-175cm",
        canNang: "68-75kg",
        vongEo: "78-82cm",
      },
    ],
  },
  kids: {
    shirt: [
      {
        size: "S",
        chieuCao: "90-100cm",
        canNang: "13-16kg",
        vongNguc: "54-58cm",
      },
      {
        size: "M",
        chieuCao: "100-115cm",
        canNang: "16-20kg",
        vongNguc: "58-62cm",
      },
      {
        size: "L",
        chieuCao: "115-125cm",
        canNang: "20-25kg",
        vongNguc: "62-66cm",
      },
      {
        size: "XL",
        chieuCao: "125-135cm",
        canNang: "25-32kg",
        vongNguc: "66-70cm",
      },
      {
        size: "XXL",
        chieuCao: "135-145cm",
        canNang: "32-38kg",
        vongNguc: "70-74cm",
      },
    ],
    pants: [
      {
        size: "S",
        chieuCao: "90-100cm",
        canNang: "13-16kg",
        vongEo: "48-52cm",
      },
      {
        size: "M",
        chieuCao: "100-115cm",
        canNang: "16-20kg",
        vongEo: "52-56cm",
      },
      {
        size: "L",
        chieuCao: "115-125cm",
        canNang: "20-25kg",
        vongEo: "56-60cm",
      },
      {
        size: "XL",
        chieuCao: "125-135cm",
        canNang: "25-32kg",
        vongEo: "60-64cm",
      },
      {
        size: "XXL",
        chieuCao: "135-145cm",
        canNang: "32-38kg",
        vongEo: "64-68cm",
      },
    ],
  },
};

const TABS = [
  { key: "men", label: "Nam" },
  { key: "women", label: "Nữ" },
  { key: "kids", label: "Trẻ em" },
];

const CheckSizeModal: React.FC<CheckSizeModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<"men" | "women" | "kids">("men");

  const renderTable = (
    data: any[],
    type: "shirt" | "pants",
    color: string,
    title: string
  ) => (
    <div className="mb-6">
      <h4 className={`font-semibold mb-2 ${color}`}>{title}</h4>
      <table className="w-full border text-center mb-2">
        <thead>
          <tr>
            <th className="border px-2 py-1">Size</th>
            <th className="border px-2 py-1">Chiều cao</th>
            <th className="border px-2 py-1">Cân nặng</th>
            <th className="border px-2 py-1">
              {type === "shirt" ? "Vòng ngực" : "Vòng eo"}
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.size}>
              <td className="border px-2 py-1 font-semibold">{row.size}</td>
              <td className="border px-2 py-1">{row.chieuCao}</td>
              <td className="border px-2 py-1">{row.canNang}</td>
              <td className="border px-2 py-1">
                {type === "shirt" ? row.vongNguc : row.vongEo}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  let color = "";
  switch (activeTab) {
    case "men":
      color = "text-black";
      break;
    case "women":
      color = "text-black";
      break;
    case "kids":
      color = "text-black";
      break;
    default:
      color = "";
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl font-bold"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-center mb-6">
          Bảng hướng dẫn chọn size
        </h2>
        <div className="flex justify-center mb-6 gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`px-4 py-2 rounded-tl-lg rounded-br-lg font-semibold border ${
                activeTab === tab.key
                  ? "bg-black text-white border-black"
                  : "bg-white text-black border-gray-300"
              } transition-all`}
              onClick={() => setActiveTab(tab.key as "men" | "women" | "kids")}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {renderTable(
          sizeGuide[activeTab].shirt,
          "shirt",
          color,
          "Áo " + TABS.find((t) => t.key === activeTab)?.label
        )}
        {renderTable(
          sizeGuide[activeTab].pants,
          "pants",
          color,
          "Quần " + TABS.find((t) => t.key === activeTab)?.label
        )}
        <div className="text-xs text-gray-500 text-center mt-4">
          * Bảng size chỉ mang tính chất tham khảo, có thể chênh lệch tuỳ form
          dáng sản phẩm.
        </div>
      </div>
    </div>
  );
};

export default CheckSizeModal;
