import React, { useEffect, useState } from "react";
import HeaderClient from "../../layouts/clientHeader";
import MenuClient from "../../layouts/clientMenu";
import Footer from "../../layouts/clientFooter";
import axios, { AxiosError } from "axios";
import { City, District, Ward } from "../../types/city";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RegisterForm } from "../../types/user";
import { register } from "../../services/userService";
import { toast } from "react-toastify";
import { z } from "zod";
import { useAuth } from "../../context/auth.context";

const registerSchema = z
  .object({
    first_name: z.string().min(1, "Tên không hợp lệ"),
    name: z.string().min(2, "Tên cần tối thiểu 2 ký tự"),
    email: z.string().email("Sai định dạng email"),
    phone: z
      .string()
      .regex(
        /^(0|\+84)(3[2-9]|5[2689]|7[06-9]|8[1-689]|9[0-46-9])\d{7}$/,
        "Sai định dạng số điện thoại Việt Nam"
      ),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Ngày sinh phải đúng định dạng YYYY-MM-DD",
    }),
    sex: z.string().regex(/^[01]$/, "Giới tính phải là 0 hoặc 1"),
    city: z.string().min(1, "Cần chọn thành phố"),
    district: z.string().min(1, "Cần chọn quận/huyện"),
    commune: z.string().min(1, "Cần chọn phường/xã"),
    address: z.string().min(2, "Địa chỉ tối thiểu 2 ký tự"),
    password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

interface ErrorResponse {
  errors?: string[];
}

const Register = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { auth } = useAuth();
  if (auth?.isAuthenticated) {
    navigate("/");
  }
  const [formData, setFormData] = useState<RegisterFormData>({
    first_name: "",
    name: "",
    email: "",
    phone: "",
    date: "",
    sex: "1",
    city: "",
    district: "",
    commune: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  // Trạng thái lỗi từ Zod
  const [errors, setErrors] = useState<
    z.ZodError<RegisterFormData>["formErrors"] | null
  >(null);

  // Trạng thái cho danh sách địa chỉ
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedWard, setSelectedWard] = useState<string>("");

  // Lấy danh sách tỉnh/thành phố
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

  // Mutation để gửi dữ liệu đăng ký
  const mutation = useMutation<RegisterForm, AxiosError<ErrorResponse>, any>({
    mutationFn: register,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Đăng ký thành công");
      navigate("/login");
    },
    onError: (error) => {
      const errorData = error.response?.data;
      console.error("Lỗi từ server:", errorData);
      if (errorData?.errors) {
        toast.error("Lỗi validation: " + errorData.errors.join(", "));
      } else {
        toast.error("Có lỗi xảy ra khi đăng ký!");
      }
    },
  });

  // Xử lý thay đổi input
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
      const validatedData = registerSchema.parse(formData);
      const registrationData = {
        first_name: validatedData.first_name,
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        date: validatedData.date,
        sex: validatedData.sex,
        password: validatedData.password,
        confirmPassword: validatedData.confirmPassword,
        shipping_addresses: [
          {
            receiver_name: validatedData.name,
            phone: validatedData.phone,
            city: {
              id: cityObj?.Id || "",
              name: cityObj?.Name || "",
            },
            district: {
              id: districtObj?.Id || "",
              name: districtObj?.Name || "",
            },
            commune: {
              id: communeObj?.Id || "",
              name: communeObj?.Name || "",
            },
            address: validatedData.address,
            isDefault: true,
          },
        ],
      };
      mutation.mutate(registrationData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(error.formErrors);
      }
    }
  };
  console.log(formData);
  
  return (
    <>
      <HeaderClient />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <MenuClient />
        <article className="mt-20">
          <div className="flex justify-center">
            <h1 className="text-2xl font-semibold pt-4">ĐĂNG KÝ</h1>
          </div>
          <form
            onSubmit={handleSubmit}
            id="registerForm"
            className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6"
          >
            <div className="flex flex-col space-y-4">
              <h2 className="text-lg font-medium">Thông tin khách hàng</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">
                    Họ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Họ.."
                    required
                  />
                  {errors?.fieldErrors?.first_name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.fieldErrors.first_name[0]}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tên.."
                    required
                  />
                  {errors?.fieldErrors?.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.fieldErrors.name[0]}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Email.."
                    required
                  />
                  {errors?.fieldErrors?.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.fieldErrors.email[0]}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Điện thoại.."
                    required
                  />
                  {errors?.fieldErrors?.phone && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.fieldErrors.phone[0]}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">
                    Ngày sinh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  {errors?.fieldErrors?.date && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.fieldErrors.date[0]}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Giới tính <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="sex"
                    value={formData.sex}
                    onChange={handleChange}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1">Nam</option>
                    <option value="0">Nữ</option>
                  </select>
                  {errors?.fieldErrors?.sex && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.fieldErrors.sex[0]}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">
                    Tỉnh/TP <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedCity}
                    onChange={handleCityChange}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <div>
                  <label className="block text-sm font-medium">
                    Quận/Huyện <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedDistrict}
                    onChange={handleDistrictChange}
                    disabled={!selectedCity}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
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
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Phường/Xã <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedWard}
                  onChange={handleWardChange}
                  disabled={!selectedDistrict}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
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
              <div>
                <label className="block text-sm font-medium">
                  Địa chỉ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Địa chỉ.."
                  required
                />
                {errors?.fieldErrors?.address && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.fieldErrors.address[0]}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col space-y-4">
              <h2 className="text-lg font-medium">Thông tin mật khẩu</h2>
              <div>
                <label className="block text-sm font-medium">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mật khẩu.."
                  required
                />
                {errors?.fieldErrors?.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.fieldErrors.password[0]}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Nhập lại mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập lại mật khẩu.."
                  required
                />
                {errors?.fieldErrors?.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.fieldErrors.confirmPassword[0]}
                  </p>
                )}
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="mr-2 h-4 w-4 text-blue-600" />
                <p className="text-sm">
                  Đồng ý với các{" "}
                  <a href="#" className="text-red-500 hover:underline">
                    điều khoản
                  </a>{" "}
                  của IVY
                </p>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="mr-2 h-4 w-4 text-blue-600" />
                <p className="text-sm">Đăng ký nhận bản tin</p>
              </div>
              <div className="mt-6 space-y-4">
                <button
                  type="submit"
                  // mutation.isPending là trạng thái đang gửi, có thể thay thế bằng isLoading nếu có
                  className="w-full py-3 px-4 bg-black text-white font-semibold text-lg rounded-br-2xl rounded-tl-2xl hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Đăng ký
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="w-full py-3 px-4 bg-white text-black font-semibold text-lg border border-black rounded-br-2xl rounded-tl-2xl hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Quay lại trang đăng nhập
                </button>
              </div>
            </div>
          </form>
        </article>
        <Footer />
      </div>
    </>
  );
};

export default Register;
