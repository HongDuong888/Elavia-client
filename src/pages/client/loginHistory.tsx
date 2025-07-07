import React, { useEffect, useState } from "react";
import ClientLayout from "../../layouts/clientLayout";
import { Link } from "react-router-dom";
import MenuInfo from "../../components/menuInfo";
import axios from "axios";
import axiosInstance from "../../services/axiosInstance";

interface LoginLog {
  device: string;
  platform: string;
  loginType: string;
  location: string;
  ip: string;
  timestamp: string;
}
const LoginHistory = () => {
  const [loginHistory, setLoginHistory] = useState<LoginLog[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  // TODO: thay bằng ID thật của người dùng
  const userId = localStorage.getItem("user_id"); // hoặc từ context/auth
  console.log("userId:", userId);
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axiosInstance.get(
          `${import.meta.env.VITE_API_URL}/auth/login-history`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const json = await res.data;
        setLoginHistory(json.data);
        setTotal(json.total);
      } catch (err) {
        console.error("Lỗi lấy lịch sử đăng nhập:", err);
      }
    };

    if (userId) {
      fetchHistory();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [userId, page]);
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
              <div>Lịch sử đăng nhập</div>
            </div>
          </div>
        </div>
        <hr className="border-t border-gray-300 my-4" />

        <div className="grid grid-cols-[0.7fr_2.5fr] gap-8">
          {/* Menu */}
          <div className="p-4 pl-0 font-bold rounded-tl-[40px] rounded-br-[40px] border-gray-700 h-auto mt-2">
            <MenuInfo />
          </div>
          <div className="flex-1 bg-white rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-6 mt-4">Lịch sử đăng nhập</h2>
            <div className="overflow-x-auto min-h-[450px] flex flex-col justify-between">
              <table className="min-w-full border-collapse bg-white">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-3 pr-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      STT
                    </th>
                    <th className="py-3 pr-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Thiết bị
                    </th>
                    <th className="py-3 pr-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Phần mềm
                    </th>
                    <th className="py-3 pr-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Kiểu đăng nhập
                    </th>
                    <th className="py-3 pr-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      IP
                    </th>
                    <th className="py-3 pr-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Thời gian
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loginHistory.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-4 text-center text-gray-500"
                      >
                        Không có lịch sử đăng nhập
                      </td>
                    </tr>
                  ) : (
                    loginHistory.map((log, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="py-4 pr-6 text-sm text-gray-900">
                          {page * limit - limit + index + 1}
                        </td>
                        <td className="py-4 pr-6 text-sm text-gray-900">
                          {log.device}
                        </td>
                        <td className="py-4 pr-6 text-sm text-gray-900">
                          {log.platform}
                        </td>
                        <td className="py-4 pr-6 text-sm">{log.loginType}</td>
                        <td className="py-4 pr-6 text-sm font-medium">
                          {log.ip}
                        </td>
                        <td className="py-4 pr-6 text-sm font-medium">
                          {new Date(
                            log.timestamp.replace("_", ".")
                          ).toLocaleString("vi-VN", {
                            timeZone: "Asia/Ho_Chi_Minh",
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: false,
                          })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <div className="mt-4 flex justify-center items-center space-x-2 text-sm">
                {/* Nút đầu tiên « */}
                <button
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="w-9 h-9 border border-black rounded-tl-[8px] rounded-br-[8px] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-black hover:bg-black hover:text-white"
                >
                  &laquo;
                </button>
                {Array.from({ length: Math.ceil(total / limit) }).map(
                  (_, i) => {
                    const p = i + 1;
                    const isActive = page === p;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        disabled={isActive}
                        className={`w-9 h-9 border rounded-tl-[8px] rounded-br-[8px] transition-all duration-300 ${
                          isActive
                            ? "bg-black text-white border-black cursor-default"
                            : "bg-white text-black border-black hover:bg-black hover:text-white"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  }
                )}
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(total / limit)}
                  className="w-9 h-9 border border-black rounded-tl-[8px] rounded-br-[8px] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-black hover:bg-black hover:text-white"
                >
                  &raquo;
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>
    </ClientLayout>
  );
};

export default LoginHistory;
