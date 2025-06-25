import MenuInfo from "../../components/menuInfo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getList, postItem } from "../../api/provider";
import ClientLayout from "../../layouts/clientLayout";
import React, { useEffect, useState } from "react";
import { City, District, Ward } from "../../types/city";
import { z } from "zod";
import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import EditAddressModal from "./editAddressModal";

const AddressSchema = z.object({
  receiver_name: z.string().min(2, "Tên người nhận tối thiểu 2 ký tự"),
  phone: z
    .string()
    .regex(
      /^(0|\+84)(3[2-9]|5[2689]|7[06-9]|8[1-689]|9[0-46-9])\d{7}$/,
      "Sai định dạng số điện thoại Việt Nam"
    ),
  city: z.string().min(1, "Cần chọn thành phố"),
  district: z.string().min(1, "Cần chọn quận/huyện"),
  commune: z.string().min(1, "Cần chọn phường/xã"),
  address: z.string().min(2, "Địa chỉ tối thiểu 2 ký tự"),
});

type AddressFormDta = z.infer<typeof AddressSchema>;
interface ErrorResponse {
  errors?: string[];
}

const Address = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => getList({ namespace: "auth/my-info" }),
  });

  const [formData, setFormData] = useState<AddressFormDta>({
    receiver_name: "",
    phone: "",
    city: "",
    district: "",
    commune: "",
    address: "",
  });

  const [errors, setErrors] = useState<
    z.ZodError<AddressFormDta>["formErrors"] | null
  >(null);

  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedWard, setSelectedWard] = useState<string>("");
  const [error, setError] = useState("");
const [showEditModal, setShowEditModal] = useState(false);
const [editAddress, setEditAddress] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json"
        );
        setCities(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const mutation = useMutation({
    mutationFn: (payload: any) =>
      postItem({ namespace: "auth/add-shipping-address", values: payload }),
    onSuccess: () => {
      toast.success("Thêm địa chỉ thành công!");
      queryClient.invalidateQueries({ queryKey: ["users"] });

      // Reset form
      setFormData({
        receiver_name: "",
        phone: "",
        city: "",
        district: "",
        commune: "",
        address: "",
      });
      setSelectedCity("");
      setSelectedDistrict("");
      setSelectedWard("");
    },
    onError: (error: AxiosError<ErrorResponse>) => {
    const errorData = error.response?.data;
    if (errorData?.errors) {
      toast.error("Lỗi validation: " + errorData.errors.join(", "));
    } else {
      toast.error("Có lỗi xảy ra khi thêm địa chỉ!");
    }
  },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityId = e.target.value;
    setSelectedCity(cityId);
    setSelectedDistrict("");
    setSelectedWard("");
    setDistricts([]);
    setWards([]);
    const selected = cities.find((city) => city.Id === cityId);
    if (selected) setDistricts(selected.Districts);
    setFormData((prev) => ({
      ...prev,
      city: selected?.Name || "",
      district: "",
      commune: "",
    }));
  };
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtId = e.target.value;
    setSelectedDistrict(districtId);
    setSelectedWard("");
    setWards([]);
    const selectedCityData = cities.find((city) => city.Id === selectedCity);
    const selectedDistrictData = selectedCityData?.Districts.find(
      (district) => district.Id === districtId
    );
    if (selectedDistrictData) setWards(selectedDistrictData.Wards);
    setFormData((prev) => ({
      ...prev,
      district: selectedDistrictData?.Name || "",
      commune: "",
    }));
  };
  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const wardId = e.target.value;
    setSelectedWard(wardId);
    const selectedWardData = wards.find((ward) => ward.Id === wardId);
    setFormData((prev) => ({
      ...prev,
      commune: selectedWardData?.Name || "",
    }));
  };

  const cityObj = cities.find((city) => city.Id === selectedCity);
  const districtObj = districts.find((d) => d.Id === selectedDistrict);
  const communeObj = wards.find((c) => c.Id === selectedWard);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors(null);

    try {
      // Validate dữ liệu với Zod
      const validatedData = AddressSchema.parse(formData);

      // Tạo payload
      const payload = {
        receiver_name: validatedData.receiver_name,
        phone: validatedData.phone,
        city: {
          id: selectedCity,
          name: cityObj?.Name || "",
        },
        district: {
          id: selectedDistrict,
          name: districtObj?.Name || "",
        },
        commune: {
          id: selectedWard,
          name: communeObj?.Name || "",
        },
        address: validatedData.address,
        isDefault: false,
      };

      // Gửi payload qua mutation
      mutation.mutate(payload);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(error.formErrors);
      }
    }
  };

  const showData = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form data:", formData);
  };

  const handleSetDefault = async (id: string) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Bạn chưa đăng nhập!");
      return;
    }

    await axios.put(
      `${import.meta.env.VITE_API_URL}/auth/address/default/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    queryClient.invalidateQueries({ queryKey: ["users"] });
    toast.success("Cập nhật địa chỉ mặc định thành công!");
  } catch (err) {
    toast.error("Không thể cập nhật địa chỉ mặc định");
  }
};

const handleDeleteAddress = async (id: string) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Bạn chưa đăng nhập!");
      return;
    }

    await axios.delete(`${import.meta.env.VITE_API_URL}/auth/address/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    queryClient.invalidateQueries({ queryKey: ["users"] });
    toast.success("Xoá địa chỉ thành công!");
  } catch (err) {
    toast.error("Không thể xoá địa chỉ");
  }
};

const sortedAddresses = data?.shipping_addresses?.sort((a: any, b: any) =>
  a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1
);

  return (
    <>
      <ClientLayout>
        <article className="mb-8 mt-8 ">
          <hr />
          <nav>
            <div className="flex gap-4 mt-[80px] mb-6">
              <div className="text-base">
                <a href="?action=home">Trang chủ</a>
              </div>
              <div className="text-base">-</div>
              <div className="text-base">Danh sách địa chỉ</div>
            </div>
          </nav>
          <hr className="border-t-1 border-gray-100 " />
          <div className="grid grid-cols-[1fr_2.5fr]">
            <div className="p-8 w-[300px] font-bold rounded-tl-[40px] rounded-br-[40px] h-auto mt-2 ">
              <nav>
                <MenuInfo />
              </nav>
            </div>
            <div className=" mt-8">
              <div className="grid grid-cols-2 gap-4">
                <h2 className="text-2xl font-bold mb-4">Sổ địa chỉ</h2>
                <div className=" p-2 flex text-black  text-[18px] mr-20  ">
                  <div className="text-2xl font-bold mb-4">Thêm địa chỉ</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 ">
                <div>
                  {sortedAddresses?.map((address: any) => (
                    <div key={address._id} className="...">
                      <div className="flex justify-between">
                        <div className="p-6 font-semibold">{address.receiver_name}</div>
                        <div className="flex gap-2 p-4">
                          {/* Nút chọn mặc định hoặc hiển thị đã mặc định */}
                          {address.isDefault ? (
                            <span className="bg-black text-white px-3 py-2 text-sm rounded">Mặc định</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetDefault(address._id)}
                              className="text-sm border border-black px-3 py-1 rounded hover:bg-black hover:text-white transition"
                            >
                              Chọn làm mặc định
                            </button>
                          )}
                           <button
                            type="button"
                            onClick={() => handleDeleteAddress(address._id)}
                            className="px-3 py-1 text-sm border border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white transition"
                          >
                            Xóa
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditAddress(address); // set địa chỉ được chọn
                              setShowEditModal(true);  // mở modal
                            }}
                            className="px-3 py-1 text-sm border border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white transition"
                          >
                            Sửa
                          </button>
                        </div>
                      </div>
                      <div className="px-6 mb-2">Điện thoại: {address.phone}</div>
                        <div className="px-6 mb-2">
                          Địa chỉ: {address.address}, {address.commune?.name}, {address.district?.name}, {address.city?.name}
                        </div>
                    </div>
                  ))}

                </div>
                <div>
                  <form onSubmit={handleSubmit}>
                    <div className="border h-11 flex items-center p-4 mb-4 rounded-lg">
                      <input
                        type="text"
                        name="receiver_name"
                        value={formData.receiver_name}
                        onChange={handleChange}
                        placeholder="Họ tên"
                        className="text-sm outline-none w-full border-0"
                      />
                      {errors?.fieldErrors?.receiver_name && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.fieldErrors.receiver_name[0]}
                        </p>
                      )}
                    </div>
                    <div className="border h-11 flex items-center p-4 mb-4 rounded-lg">
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Số điện thoại"
                        className="text-sm outline-none w-full border-0"
                      />
                      {errors?.fieldErrors?.phone && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.fieldErrors.phone[0]}
                        </p>
                      )}
                    </div>
                    <div className="border h-11 flex items-center p-4 rounded-lg mb-4">
                      <select
                        value={selectedCity}
                        onChange={handleCityChange}
                        className="text-sm outline-none w-full border-0"
                        required
                      >
                        <option value="">Chọn tỉnh/thành phố</option>
                        {cities.map((city) => (
                          <option key={city.Id} value={city.Id}>
                            {city.Name}
                          </option>
                        ))}
                      </select>
                      {errors?.fieldErrors?.city && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.fieldErrors.city[0]}
                        </p>
                      )}
                    </div>
                    <div className="border h-11 flex items-center p-4 rounded-lg mb-4">
                      <select
                        value={selectedDistrict}
                        onChange={handleDistrictChange}
                        disabled={!selectedCity}
                        className="text-sm outline-none w-full border-0"
                        required
                      >
                        <option value="">Chọn quận/huyện</option>
                        {districts.map((district) => (
                          <option key={district.Id} value={district.Id}>
                            {district.Name}
                          </option>
                        ))}
                      </select>
                      {errors?.fieldErrors?.district && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.fieldErrors.district[0]}
                        </p>
                      )}
                    </div>
                    <div className="border h-11 flex items-center p-4 rounded-lg mb-4">
                      <select
                        value={selectedWard}
                        onChange={handleWardChange}
                        disabled={!selectedDistrict}
                        className="text-sm outline-none w-full border-0"
                        required
                      >
                        <option value="">Chọn phường/xã</option>
                        {wards.map((ward) => (
                          <option key={ward.Id} value={ward.Id}>
                            {ward.Name}
                          </option>
                        ))}
                      </select>
                      {errors?.fieldErrors?.commune && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.fieldErrors.commune[0]}
                        </p>
                      )}
                    </div>
                    <div className="border h-11 flex items-center p-4 rounded-lg mb-4">
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Địa chỉ"
                        className="text-sm outline-none w-full border-0"
                      />
                      {errors?.fieldErrors?.address && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.fieldErrors.address[0]}
                        </p>
                      )}
                    </div>
                    <div className="mt-4">
                      <button
                        type="submit"
                        className="border border-black rounded-tl-[15px] rounded-br-[15px] w-full h-[50px] flex justify-center items-center hover:bg-black hover:text-white transition-all duration-300 font-semibold"
                      >
                        Thêm địa chỉ
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          {showEditModal && editAddress && (
            <EditAddressModal
              address={editAddress}
              onClose={() => setShowEditModal(false)}
              onSuccess={() => queryClient.invalidateQueries({ queryKey: ["users"] })}
            />
          )}
        </article>
      </ClientLayout>
    </>
  );
};

export default Address;
