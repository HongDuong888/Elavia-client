import { log } from "console";
import React from "react";

type AddressForm = {
  _id: string;
  receiver_name: string;
  phone: string;
  address: string;
  ward?: { name: string };
  district?: { name: string };
  city?: { name: string };
  type?: "home" | "work";
};

interface SelectAddressModalProps {
  addresses: AddressForm[];
  defaultAddressId?: string;
  onSelect: (address: AddressForm) => void;
  onClose: () => void;
}

const SelectAddressModal = ({
  addresses,
  defaultAddressId,
  onSelect,
  onClose,
}: SelectAddressModalProps) => {
  const sortedAddresses = [...addresses].sort((a, b) =>
    a._id === defaultAddressId ? -1 : b._id === defaultAddressId ? 1 : 0
  );

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg w-[800px] max-h-[80vh] overflow-y-auto relative border-r-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl font-bold text-gray-500 hover:text-black transition"
          aria-label="Đóng"
          type="button"
        >
          ×
        </button>
        <h3 className="text-lg font-bold mb-4">Chọn địa chỉ</h3>
        {Array.isArray(addresses) && addresses.length > 0 ? (
          sortedAddresses.map((address) => (
            <div
              key={address._id}
              className="border-[1px] rounded-tl-2xl rounded-br-2xl mb-4 p-6 flex justify-between items-center"
              onClick={() => onSelect(address)}
            >
              <div>
                <div className="font-semibold">{address.receiver_name}</div>
                <div className="text-sm mb-1">
                  Loại địa chỉ: {address.type === "home" ? "Nhà ở" : "Công ty"}
                </div>
                <div className="text-sm">Điện thoại: {address.phone}</div>
                <div className="text-sm">
                  Địa chỉ: {address.address}, {address.ward?.name},{" "}
                  {address.district?.name}, {address.city?.name}
                </div>
              </div>
              {defaultAddressId === address._id && (
                <button
                  className="bg-black text-white px-2 py-0 text-xs rounded-tl-[10px] rounded-br-[10px] w-[90px] h-[32px] flex justify-center items-center transition-all duration-300 hover:bg-white hover:text-black hover:border-[1px] hover:border-black"
                >
                  Mặc định
                </button>
              )}
            </div>
          ))
        ) : (
          <div>Không có địa chỉ nào.</div>
        )}
      </div>
    </div>
  );
};

export default SelectAddressModal;