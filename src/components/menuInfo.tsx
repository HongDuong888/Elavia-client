import React from "react";
import { useAuth } from "../context/auth.context";
import { Link, useLocation } from "react-router-dom";
import {
  User,
  Fingerprint,
  ClipboardList,
  MapPin,
  Heart,
  Eye,
} from "lucide-react";

const MenuInfo = () => {
  const { auth } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="py-6 px-4 font-bold border border-gray-300 rounded-tl-[40px] rounded-br-[40px]">
      <nav>
        {/* Avatar + Tooltip */}
        <div className="relative font-semibold text-gray-500 flex items-center gap-2 p-4 cursor-pointer group">
          <img
            src="/images/useravt.png"
            className="w-8 h-8 rounded-full"
            alt="Avatar"
          />
          <span className="truncate max-w-[140px]">{auth.user.email}</span>
          <div className="absolute top-full left-4 mt-2 hidden group-hover:flex flex-col items-start bg-white border border-gray-300 shadow-md rounded-lg px-4 py-2 z-50 w-[240px]">
            <p className="text-sm text-gray-700 break-all">{auth.user.email}</p>
          </div>
        </div>

        <hr />

        {/* Menu List */}
        <ul>
          <li className="px-4 py-2">
            <Link
              to="/user-details"
              className={`flex items-center gap-2 text-sm font-medium transition ${
                currentPath === "/user-details"
                  ? "font-bold text-black"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              <User className="w-4 h-4" strokeWidth={1.25} />
              Thông tin tài khoản
            </Link>
          </li>

          <li className="px-4 py-2">
            <Link
              to="/loginHistory"
              className={`flex items-center gap-2 text-sm font-medium transition ${
                currentPath === "/loginHistory"
                  ? "font-bold text-black"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              <Fingerprint className="w-4 h-4" strokeWidth={1.25} />
              Lịch sử đăng nhập
            </Link>
          </li>

          <li className="px-4 py-2">
            <Link
              to="/orders"
              className={`flex items-center gap-2 text-sm font-medium transition ${
                currentPath === "/orders"
                  ? "font-bold text-black"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              <ClipboardList className="w-4 h-4" strokeWidth={1.25} />
              Quản lý đơn hàng
            </Link>
          </li>

          <li className="px-4 py-2">
            <Link
              to="/address"
              className={`flex items-center gap-2 text-sm font-medium transition ${
                currentPath === "/address"
                  ? "font-bold text-black"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              <MapPin className="w-4 h-4" strokeWidth={1.25} />
              Sổ địa chỉ
            </Link>
          </li>

          <li className="px-4 py-2">
            <Link
              to="/wish-products"
              className={`flex items-center gap-2 text-sm font-medium transition ${
                currentPath === "/wish-products"
                  ? "font-bold text-black"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              <Heart className="w-4 h-4" strokeWidth={1.25} />
              Sản phẩm yêu thích
            </Link>
          </li>

          <li className="px-4 py-2">
            <Link
              to="/viewed-products"
              className={`flex items-center gap-2 text-sm font-medium transition ${
                currentPath === "/viewed-products"
                  ? "font-bold text-black"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              <Eye className="w-4 h-4" strokeWidth={1.25} />
              Sản phẩm đã xem
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default MenuInfo;
