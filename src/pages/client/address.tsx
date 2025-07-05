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
import EditAddressModal from "../../components/editAddress";
import AddAddressModal from "../../components/addAddress";

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
  ward: z.string().min(1, "Cần chọn phường/xã"),
  address: z.string().min(2, "Địa chỉ tối thiểu 2 ký tự"),
  type: z.enum(["home", "company"]),
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
    ward: "",
    address: "",
    type: "home",
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
  const [showAddModal, setShowAddModal] = useState(false);

  const [editAddress, setEditAddress] = useState(null);
  const [addAddress, setAddAddress] = useState(null);

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
        ward: "",
        address: "",
        type: "home",
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
      ward: "",
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
      ward: "",
    }));
  };
  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const wardId = e.target.value;
    setSelectedWard(wardId);
    const selectedWardData = wards.find((ward) => ward.Id === wardId);
    setFormData((prev) => ({
      ...prev,
      ward: selectedWardData?.Name || "",
    }));
  };

  const cityObj = cities.find((city) => city.Id === selectedCity);
  const districtObj = districts.find((d) => d.Id === selectedDistrict);
  const wardObj = wards.find((c) => c.Id === selectedWard);

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
        ward: {
          id: selectedWard,
          name: wardObj?.Name || "",
        },
        address: validatedData.address,
        type: validatedData.type,
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
    a._id === data.defaultAddress ? -1 : b._id === data.defaultAddress ? 1 : 0
  );

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
              <div>Sổ địa chỉ</div>
            </div>
          </div>
        </div>
        <hr className="border-t border-gray-300 my-4" />

        <div className="grid grid-cols-[0.7fr_2.5fr] gap-8">
          {/* Menu */}
          <div className="p-4 pl-0 font-bold rounded-tl-[40px] rounded-br-[40px] border-gray-700 h-auto mt-2">
            <MenuInfo />
          </div>
          <div className="">
            <div className="flex justify-between content-center gap-4 mt-4 mb-4">
              <h2 className="text-2xl font-bold">Sổ địa chỉ</h2>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(true); // mở modal
                }}
                className=" px-3 bg-black text-white py-0 text-sm rounded-tl-[15px] rounded-br-[15px] w-40 h-[40px] flex justify-center items-center hover:bg-white hover:text-black hover:border hover:border-black transition-all duration-300"
              >
                + Thêm địa chỉ
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedAddresses?.map((address: any) => (
                <div
                  key={address._id}
                  className="border-[1px] rounded-tl-2xl rounded-br-2xl mb-4"
                >
                  <div key={address._id} className="">
                    <div className="">
                      <div className="flex justify-between">
                        <div className="p-6 pt-4 pb-2 font-semibold">
                          {address.receiver_name}
                        </div>

                        <div className="flex gap-2 p-4">
                          {data.defaultAddress == address._id ? (
                            <button
                              disabled
                              className="bg-black text-white px-3 py-0 text-sm rounded-tl-[15px] rounded-br-[15px] w-full h-[40px] flex justify-center items-center"
                            >
                              Mặc định
                            </button>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleSetDefault(address._id)}
                                className="border border-black px-3 py-0 text-sm rounded-tl-[15px] rounded-br-[15px] w-full h-[40px] flex justify-center items-center hover:bg-black hover:text-white transition-all duration-300"
                              >
                                Mặc định
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteAddress(address._id)}
                                className="px-2 hover:underline text-sm"
                              >
                                Xóa
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setEditAddress(address); // set địa chỉ được chọn
                              setShowEditModal(true); // mở modal
                            }}
                            className="px-2 hover:underline text-sm"
                          >
                            Sửa
                          </button>
                        </div>
                      </div>
                      <div className="px-6 mb-2">
                        Loại địa chỉ:{" "}
                        {address.type === "home" ? "Nhà ở" : "Công ty"}
                      </div>
                      <div className="px-6 mb-2">
                        Điện thoại: {address.phone}
                      </div>
                      <div className="px-6 mb-4">
                        Địa chỉ: {address.address}, {address.ward?.name},
                        {address.district?.name}, {address.city?.name}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {showEditModal && editAddress && (
          <EditAddressModal
            defaultAddressId={data.defaultAddress}
            address={editAddress}
            onClose={() => setShowEditModal(false)}
            onSuccess={() =>
              queryClient.invalidateQueries({ queryKey: ["users"] })
            }
          />
        )}
        {showAddModal && (
          <AddAddressModal
            defaultAddressId={data.defaultAddress}
            onClose={() => setShowAddModal(false)}
            onSuccess={() =>
              queryClient.invalidateQueries({ queryKey: ["users"] })
            }
          />
        )}
      </article>
    </ClientLayout>
  );
};

export default Address;
