import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../layouts/clientFooter";
import HeaderClient from "../../layouts/clientHeader";
import MenuClient from "../../layouts/clientMenu";
import axios from "axios";

const RESEND_TIME = 60; // giây

const VerifyAccount = () => {
  // Lấy email từ localStorage (hoặc context, props)
  const email = localStorage.getItem("userEmail") || "";
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  // Đếm ngược khi gửi lại mã
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Gửi mã xác thực về email
  const handleSendCode = async () => {
    setIsSending(true);
    setError("");
    setMessage("");
    try {
      await axios.post("/api/auth/send-verify-email", { email });
    } catch (err: any) {
      // Không hiển thị lỗi thiếu email
    } finally {
      setMessage("Mã xác thực đã được gửi tới email của bạn.");
      setCountdown(RESEND_TIME);
      setIsSending(false);
    }
  };

  // Xác thực mã
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!code) {
      setError("Vui lòng nhập mã xác thực!");
      return;
    }
    try {
      await axios.post("/api/auth/verify-email", { email, code });
      alert("Xác thực thành công!");
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Xác thực thất bại!");
    }
  };

  return (
    <>
      <HeaderClient />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <MenuClient />
        <article>
          <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white">
            <h2 className="text-2xl font-semibold mt-20">Xác thực tài khoản?</h2>
            {message ? (
              <p className="mb-6 text-gray-600">(Mã xác thực đã được gửi tới email của bạn, nếu không tìm thấy hãy thử kiểm tra trong thư rác hoặc bấm <a href="/#">gửi lại</a>)</p>
            ) : (
              <>
                <p className="mb-2 text-gray-600">(Nhấn vào dòng dưới để nhận mã xác thực qua email)</p>
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={isSending || countdown > 0}
                  className={`mb-4 underline text-blue-600 font-medium bg-transparent border-none outline-none cursor-pointer ${
                    isSending || countdown > 0
                      ? "text-gray-400 cursor-not-allowed"
                      : "hover:text-blue-800"
                  }`}
                >
                  {countdown > 0
                    ? `Gửi lại mã sau ${countdown}s`
                    : isSending
                    ? "Đang gửi..."
                    : "Nhận mã xác thực qua email"}
                </button>
              </>
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