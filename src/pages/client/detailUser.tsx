import React, { useState } from "react";
import MenuInfo from "../../components/menuInfo";
import ClientLayout from "../../layouts/clientLayout";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getList, putItem } from "../../api/provider";
import { z } from "zod";
import { toast } from "react-toastify";

const PassWordSchema = z
  .object({
    oldPassword: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
    newPassword: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

const DetailUser = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["myInfo"],
    queryFn: () => getList({ namespace: "auth/my-info" }),
  });
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [oldpassword, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [userInfo, setUserInfo] = useState({
    first_name: "",
    name: "",
    phone: "",
    date: "",
    sex: "1",
  });
  React.useEffect(() => {
    if (data) {
      setUserInfo({
        first_name: data.first_name || "",
        name: data.name || "",
        phone: data.phone || "",
        date: data.date || "",
        sex: String(data.sex) || "1",
      });
    }
  }, [data]);
  const updateInfo = useMutation({
    mutationFn: (values: any) =>
      putItem({ namespace: "auth/update-user-info", values }),
    onSuccess: () => {
      toast.success("Cập nhật thông tin thành công!");
      queryClient.invalidateQueries({ queryKey: ["myInfo"] });
      setTimeout(() => {
        window.location.reload(); // Reload lại trang
      }, 1000);
    },
    onError: () => {
      toast.error("Cập nhật thất bại. Vui lòng thử lại!");
    },
  });
  const handleUpdate = () => {
    updateInfo.mutate(userInfo);
  };

  //Đổi mật khẩu
  const mutate = useMutation({
    mutationFn: ({ namespace, values }: { namespace: string; values: any }) =>
      putItem({ namespace, values }),

    onSuccess: () => {
      toast.success("Đổi mật khẩu thành công!");
      setTimeout(() => {
        window.location.reload(); // Reload lại trang
      }, 1000);
    },
    onError: (error: any) => {
      toast.error("Mật khẩu cũ không đúng");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate dữ liệu với Zod
    const result = PassWordSchema.safeParse({
      oldPassword: oldpassword,
      newPassword: newPassword,
      confirmPassword: confirmPassword,
    });

    if (!result.success) {
      setError(result.error.errors[0]?.message || "Dữ liệu không hợp lệ");
      return;
    }

    // Tạo payload
    const payload = {
      oldPassword: oldpassword,
      newPassword: newPassword,
    };

    // Gọi mutate với namespace và payload
    mutate.mutate({
      namespace: "auth/change-password",
      values: payload,
    });
  };

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
              <div>Thông tin tài khoản</div>
            </div>
          </div>
        </div>
        <hr className="border-t border-gray-300 my-4" />

        <div className="grid grid-cols-[0.7fr_2.5fr] gap-8">
          {/* Menu */}
          <div className="p-4 pl-0 font-bold rounded-tl-[40px] rounded-br-[40px] border-gray-700 h-auto mt-2">
            <MenuInfo />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-6 mt-4">Tài khoản của tôi</h2>
            <div className="border border-blue-300 bg-blue-200 p-2 rounded-lg text-blue-900">
              Vì chính sách an toàn thẻ, bạn không thể thay đổi SĐT, Ngày sinh,
              Họ tên. Vui lòng liên hệ CSKH 0905898683 để được hỗ trợ
            </div>

            <div className="grid grid-cols-[2fr_1fr] gap-8 my-10">
              <div className="grid grid-cols-[1fr_2.5fr] gap-4">
                <div className="grid grid-rows-6 gap-4">
                  <p className="p-4">Họ</p>
                  <p className="p-4">Tên</p>
                  <p className="p-4">Số điện thoại</p>
                  <p className="p-4">Email</p>
                  <p className="p-4">Giới tính</p>
                  <p className="p-4">Ngày sinh</p>
                </div>
                <div className="grid grid-rows-6 gap-4">
                  <input
                    value={userInfo.first_name}
                    className="border p-3 rounded-md text-sm"
                    onChange={(e) =>
                      setUserInfo({ ...userInfo, first_name: e.target.value })
                    }
                  />
                  <input
                    value={userInfo.name}
                    className="border p-3 rounded-md text-sm"
                    onChange={(e) =>
                      setUserInfo({ ...userInfo, name: e.target.value })
                    }
                  />
                  <input
                    value={userInfo.phone}
                    className="border p-3 rounded-md text-sm"
                    onChange={(e) =>
                      setUserInfo({ ...userInfo, phone: e.target.value })
                    }
                  />
                  <input
                    value={data?.email}
                    disabled
                    className="border p-3 rounded-md text-sm font-semibold bg-gray-200 opacity-50"
                  />
                  <div className="flex gap-2 items-center">
                    <label className="mr-8">
                      <input
                        type="radio"
                        name="gender"
                        checked={String(userInfo?.sex) === "1"}
                        readOnly
                        onChange={() => setUserInfo({ ...userInfo, sex: "1" })}
                      />{" "}
                      Nam
                    </label>
                    <label className="mr-8">
                      <input
                        type="radio"
                        name="gender"
                        checked={String(userInfo?.sex) === "0"}
                        readOnly
                        onChange={() => setUserInfo({ ...userInfo, sex: "0" })}
                      />{" "}
                      Nữ
                    </label>
                  </div>
                  <input
                    type="date"
                    value={userInfo?.date}
                    className="border p-3 rounded-md text-sm"
                    onChange={(e) =>
                      setUserInfo({ ...userInfo, date: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Form đổi mật khẩu (gợi ý: nên tách riêng) */}
              <div>
                <div className="text-xl font-semibold mb-4">Đổi mật khẩu</div>
                <form onSubmit={handleSubmit}>
                  <div className="border h-11 flex items-center p-4 mb-4 rounded-lg">
                    <input
                      type="password"
                      placeholder="Mật khẩu cũ"
                      className="text-sm outline-none w-full border-0"
                      value={oldpassword}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="border h-11 flex items-center p-4 mb-4 rounded-lg">
                    <input
                      type="password"
                      placeholder="Mật khẩu mới"
                      className="text-sm outline-none w-full border-0"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="border h-11 flex items-center p-4 rounded-lg">
                    <input
                      type="password"
                      placeholder="Nhập lại mật khẩu mới"
                      className="text-sm outline-none w-full border-0"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <div className="mt-4">
                    {error && <p style={{ color: "red" }}>{error}</p>}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`border border-black rounded-tl-[15px] rounded-br-[15px] w-full h-[50px] flex justify-center items-center transition-all duration-300 font-semibold ${
                        isLoading
                          ? "bg-gray-400 cursor-not-allowed"
                          : "hover:bg-black hover:text-white"
                      }`}
                    >
                      {isLoading ? "Đang xử lý..." : "ĐỔI MẬT KHẨU"}
                    </button>
                  </div>
                </form>
              </div>
              <div>
                <button
                  onClick={handleUpdate}
                  className="bg-black w-full h-[50px] rounded-tl-2xl rounded-br-2xl flex items-center justify-center text-white font-semibold hover:bg-white hover:text-black hover:border hover:border-black cursor-pointer transition-all duration-300"
                >
                  CẬP NHẬT
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>
    </ClientLayout>
  );
};

export default DetailUser;
