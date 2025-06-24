import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Footer from "../../layouts/clientFooter";
import HeaderClient from "../../layouts/clientHeader";
import MenuClient from "../../layouts/clientMenu";
import axios from "axios";
import axiosInstance from "../../services/axiosInstance";
import { toast } from "react-toastify";
import { useAuth } from "../../context/auth.context";
import { useQueryClient } from "@tanstack/react-query";

const RESEND_TIME = 60; // thời gian đếm ngược khi gửi lại mã

const VerifyAccount = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");

  const [code, setCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(true);
  const { setAuth } = useAuth();
  const { auth } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    const stateEmail = location.state?.email;
    const storedEmail = localStorage.getItem("verify_email");

    if (stateEmail) {
      setEmail(stateEmail);
      localStorage.setItem("verify_email", stateEmail);
    } else if (storedEmail) {
      setEmail(storedEmail);
    } else {
      setEmail("");
    }
  }, [location.state]);
  // ⏱ Đếm ngược gửi lại mã
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  // 📩 Gửi lại mã xác thực
  const handleSendCode = async () => {
    if (!email) return setError("Không có địa chỉ email để gửi mã.");

    setIsSending(true);
    setError("");
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/resend-code`, {
        email,
      });
      setMessage(true);
      setCountdown(RESEND_TIME);
    } catch (err: any) {
      setError(err.response?.data?.message || "Gửi lại mã thất bại.");
    } finally {
      setIsSending(false);
    }
  };

  // ✅ Xác thực mã
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/verify`,
        { email, code }
      );

      const tempAuth = localStorage.getItem("temp_auth");
      if (tempAuth) {
        const { email, password } = JSON.parse(tempAuth);
        const loginRes = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/login`,
          { email, password }
        );

        const token = loginRes.data?.user?.token;
        localStorage.setItem("token", token);

        setAuth({
          isAuthenticated: true,
          isAuthenticating: false,
          user: {
            id: loginRes.data?.user?.id ?? "",
            email: loginRes.data?.user?.email ?? "",
            role: loginRes.data?.user?.role ?? "",
          },
        });

        toast.success("Xác thực thành công và tự động đăng nhập!");
        localStorage.removeItem("temp_auth");
        localStorage.removeItem("verify_email");

        queryClient.invalidateQueries({ queryKey: ["user"] });

        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        toast.success("Xác thực thành công! Vui lòng đăng nhập lại.");
        navigate("/login");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Mã xác thực không đúng.");
    }
  };

  return (
    <>
      <HeaderClient />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <MenuClient />
        <article>
          <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white">
            <h2 className="text-2xl font-semibold mt-20">Xác thực tài khoản</h2>
            {message ? (
              <p className="mb-6 text-gray-600">
                Mã xác thực đã được gửi tới email của bạn. Nếu không thấy, hãy
                kiểm tra thư rác hoặc{" "}
                <button
                  onClick={handleSendCode}
                  disabled={isSending || countdown > 0}
                  className="underline text-blue-600"
                >
                  {countdown > 0 ? `Gửi lại sau ${countdown}s` : "gửi lại"}
                </button>
              </p>
            ) : (
              <p className="mb-2 text-gray-600">
                (Nhấn vào nút dưới để nhận mã xác thực qua email)
              </p>
            )}

            {error && <div className="text-red-500 mb-2 text-sm">{error}</div>}

            <form onSubmit={handleSubmit} className="w-full max-w-sm">
              <input
                type="text"
                placeholder="Nhập mã xác thực"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded mb-4 focus:outline-none focus:border-gray-400 text-sm"
                required
              />
              <button
                type="submit"
                className="bg-black w-full h-[50px] rounded-tl-2xl rounded-br-2xl flex items-center justify-center text-white font-semibold hover:bg-white hover:text-black hover:border hover:border-black transition-all duration-300"
              >
                GỬI ĐI
              </button>
            </form>
          </div>
        </article>
        <Footer />
      </div>
    </>
  );
};

export default VerifyAccount;
