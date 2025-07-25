import React, { useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../../services/axiosInstance";
import { toast } from "react-toastify";
import ClientLayout from "../../layouts/clientLayout";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!token) {
      return setError("Token không hợp lệ.");
    }
    if (newPassword !== confirmPassword) {
      return setError("Mật khẩu xác nhận không khớp.");
    }
    if (newPassword.length < 6) {
      return setError("Mật khẩu phải có ít nhất 6 ký tự.");
    }

    try {
      setLoading(true);
      const res = await axiosInstance.post("auth/reset-password", {
        token,
        newPassword,
      });

      toast.success(res.data.message);
      setTimeout(() => navigate("/login"), 2000); // chuyển về login
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

    return (
    <ClientLayout>
      <article className="mt-[140px] mb-[100px]">
         <div className="flex items-center justify-center bg-white">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg  w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">
          Đặt lại mật khẩu
        </h2>
        <input
          type="password"
          placeholder="Mật khẩu mới"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full border px-4 py-2 rounded mb-4 outline-none"
          required
        />
        <input
          type="password"
          placeholder="Xác nhận mật khẩu"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full border px-4 py-2 rounded mb-4 outline-none"
          required
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {successMsg && <p className="text-green-600 text-sm">{successMsg}</p>}
        <button
          type="submit"
          className="border border-black bg-black text-white my-4 text-lg font-semibold w-full h-[46px] rounded-tl-[15px] rounded-br-[15px] flex justify-center items-center transition-all hover:bg-white hover:text-black"
           disabled={loading}
        >
          {loading ? "Đang xử lý..." : "Xác nhận"}
        </button>
      </form>
    </div>
      </article>
    </ClientLayout>
  );
};

export default ResetPassword;
