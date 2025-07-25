import React, { useEffect, useRef, useState } from "react";
import ClientLayout from "../../layouts/clientLayout";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import axiosInstance from "../../services/axiosInstance";

const ForgotPasswordWithCaptcha: React.FC = () => {
  const [email, setEmail] = useState("");
  const [inputCaptcha, setInputCaptcha] = useState("");
  const [captchaCode, setCaptchaCode] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateCaptchaCode = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let code = "";
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    drawCaptcha(code);
  };

  const drawCaptcha = (code: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "24px Arial";
    ctx.fillStyle = "black";

    for (let i = 0; i < code.length; i++) {
      const x = 10 + i * 20;
      const y = 30 + Math.random() * 5;
      const angle = (Math.random() - 0.5) * 0.5;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillText(code[i], 0, 0);
      ctx.restore();
    }

    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * 120, Math.random() * 50);
      ctx.lineTo(Math.random() * 120, Math.random() * 50);
      ctx.strokeStyle = "rgba(0,0,0,0.3)";
      ctx.stroke();
    }
  };

  useEffect(() => {
    generateCaptchaCode();
  }, []);

  // ✅ Mutation gọi API quên mật khẩu
  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await axiosInstance.post("auth/forgot-password", { email });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success("Đã gửi link đặt lại mật khẩu qua email!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Gửi email thất bại.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (inputCaptcha.toLowerCase() !== captchaCode.toLowerCase()) {
      toast.error("Mã xác thực không đúng!");
      return;
    }

    forgotPasswordMutation.mutate(email); // 🔥 Gọi API
  };

  return (
    <ClientLayout>
      <article className="mt-[100px]">
        <div className="flex items-center justify-center bg-white">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md bg-white text-center"
          >
            <h2 className="text-lg font-semibold mb-2">Bạn muốn tìm lại mật khẩu?</h2>
            <p className="text-sm text-gray-500 mb-6">
              Vui lòng nhập email đã đăng ký. Hệ thống sẽ gửi hướng dẫn để thay đổi mật khẩu.
            </p>

            <input
              type="email"
              className="w-full px-4 py-2 border rounded mb-4 text-sm"
              placeholder="Email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="text"
              className="w-full px-4 py-2 border rounded mb-4 text-sm"
              placeholder="Nhập mã xác thực"
              value={inputCaptcha}
              onChange={(e) => setInputCaptcha(e.target.value)}
              required
            />
            <div className="flex items-center gap-4 mb-4">
              <canvas
                ref={canvasRef}
                width={120}
                height={50}
                className="border rounded"
              />
            </div>
            <button
              type="submit"
              disabled={forgotPasswordMutation.status === "pending"}
              className="w-full bg-black text-white py-2 rounded font-semibold"
            >
              {forgotPasswordMutation.status ==="pending" ? "Đang gửi..." : "GỬI ĐI"}
            </button>
          </form>
        </div>
      </article>
    </ClientLayout>
  );
};

export default ForgotPasswordWithCaptcha;


