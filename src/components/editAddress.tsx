import React, { useEffect, useState } from "react";
import { City, District, Ward } from "../types/city";
import axios from "axios";
import { toast } from "react-toastify";

interface Props {
  address: any;
  defaultAddressId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EditAddressModal = ({
  address,
  defaultAddressId,
  onClose,
  onSuccess,
}: Props) => {
  const [form, setForm] = useState({
    receiver_name: address.receiver_name || "",
    phone: address.phone || "",
    city: address.city?.name || "",
    district: address.district?.name || "",
    ward: address.ward?.name || "",
    address: address.address || "",
    type: address.type || "",
  });

  const [isDefault, setIsDefault] = useState(address._id === defaultAddressId);

  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [selectedCity, setSelectedCity] = useState(address.city?.id || "");
  const [selectedDistrict, setSelectedDistrict] = useState(
    address.district?.id || ""
  );
  const [selectedWard, setSelectedWard] = useState(address.ward?.id || "");

  useEffect(() => {
    axios
      .get(
        "https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json"
      )
      .then((res) => setCities(res.data));
  }, []);

  useEffect(() => {
    const city = cities.find((c) => c.Id === selectedCity);
    if (city) setDistricts(city.Districts);
  }, [selectedCity, cities]);

  useEffect(() => {
    const district = districts.find((d) => d.Id === selectedDistrict);
    if (district) setWards(district.Wards);
  }, [selectedDistrict, districts]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const val =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setForm((prev) => ({
      ...prev,
      [name]: val,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...form,
      city: { id: selectedCity, name: form.city },
      district: { id: selectedDistrict, name: form.district },
      ward: { id: selectedWard, name: form.ward },
    };

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/auth/update-shipping-address/${
          address._id
        }`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Nếu người dùng chọn làm mặc định thì gọi thêm API
      if (isDefault && address._id !== defaultAddressId) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/auth/address/default/${address._id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      }

      toast.success("Cập nhật địa chỉ thành công!");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error("Cập nhật thất bại");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl font-bold"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-center mb-6">Sửa địa chỉ</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              name="receiver_name"
              value={form.receiver_name}
              onChange={handleChange}
              placeholder="Họ tên"
              className="border w-full p-2 rounded"
            />
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Số điện thoại"
              className="border w-full p-2 rounded"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <select
              name="city"
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                const name =
                  cities.find((c) => c.Id === e.target.value)?.Name || "";
                setForm((f) => ({ ...f, city: name }));
              }}
              className="border p-2 rounded"
            >
              <option value="">Chọn tỉnh/thành</option>
              {cities.map((c) => (
                <option key={c.Id} value={c.Id}>
                  {c.Name}
                </option>
              ))}
            </select>

            <select
              name="district"
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                const name =
                  districts.find((d) => d.Id === e.target.value)?.Name || "";
                setForm((f) => ({ ...f, district: name }));
              }}
              className="border p-2 rounded"
            >
              <option value="">Chọn quận/huyện</option>
              {districts.map((d) => (
                <option key={d.Id} value={d.Id}>
                  {d.Name}
                </option>
              ))}
            </select>

            <select
              name="ward"
              value={selectedWard}
              onChange={(e) => {
                setSelectedWard(e.target.value);
                const name =
                  wards.find((w) => w.Id === e.target.value)?.Name || "";
                setForm((f) => ({ ...f, ward: name }));
              }}
              className="border p-2 rounded"
            >
              <option value="">Chọn phường/xã</option>
              {wards.map((w) => (
                <option key={w.Id} value={w.Id}>
                  {w.Name}
                </option>
              ))}
            </select>
          </div>

          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Địa chỉ chi tiết"
            className="border w-full p-2 rounded"
          />
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="border w-full p-2 rounded"
          >
            <option value="home">Nhà ở</option>
            <option value="company">Công ty</option>
          </select>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="isDefault">Đặt làm mặc định</label>
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded hover:opacity-90 font-semibold"
          >
            Cập nhật địa chỉ
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditAddressModal;
