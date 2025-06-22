import React, { useState } from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  // Trạng thái mở/đóng của các dropdown
  const [isOpen, setIsOpen] = useState({
    about: true,
    services: false,
    contact: false,
  });

  // Hàm toggle dropdown với kiểu TypeScript
  const toggleDropdown = (section: "about" | "services" | "contact") => {
    setIsOpen((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <footer className="w-full px-0 mx-0">
      {/* Đường phân cách */}
      <hr className="mt-6" />

      {/* Nội dung chính của footer */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-12 mt-6 mb-4">
        {/* Cột 1: Logo, mạng xã hội, hotline */}
        <div className="col-span-1">
          <div className="flex justify-between items-center">
            <img
              src="/images/logo.png"
              alt="Logo"
              className="w-20 h-auto mr-4"
            />
            <img src="/images/dmca.png" alt="DMCA" className="w-15 h-5 mr-4" />
            <img
              src="/images/congthuong.png"
              alt="Cong Thuong"
              className="w-15 h-8"
            />
          </div>
          <div className="grid grid-cols-5 py-5 items-center">
            {["ic_fb", "ic_gg", "ic_instagram", "ic_pinterest", "ic_ytb"].map(
              (icon) => (
                <img
                  key={icon}
                  src={`/svg/${icon}.svg`}
                  className="w-6 h-6 mx-auto"
                  alt={icon}
                />
              )
            )}
          </div>
          <div>
            <p className="bg-black w-68 h-[50px] rounded-tl-2xl rounded-br-2xl flex items-center justify-center lg:text-[16px] md:text-[12px] text-white font-semibold hover:bg-white hover:text-black hover:border hover:border-black cursor-pointer transition-all duration-300">
              HOTLINE: 0353 608 533
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr_1fr] gap-4">
          <div>
            <p
              className="font-semibold lg:text-xl md:text-[16px] pb-2 cursor-pointer flex items-center"
              onClick={() => toggleDropdown("about")}
            >
              Giới thiệu
              <svg
                className={`w-4 h-4 ml-2 transform transition-transform duration-300 ${
                  isOpen.about ? "rotate-180" : ""
                } md:hidden`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </p>
            <div className={`md:block ${isOpen.about ? "block" : "hidden"}`}>
              <p className="py-2">
                <a
                  className="font-[300] text-sm hover:text-orange-600 transition-all duration-300 cursor-pointer"
                  href="#"
                >
                  Về ELA via
                </a>
              </p>
              <p className="py-2">
                <a
                  className="font-[300] text-sm hover:text-orange-600 transition-all duration-300 cursor-pointer"
                  href="#"
                >
                  Tuyển dụng
                </a>
              </p>
              <p className="py-2">
                <a
                  className="font-[300] text-sm hover:text-orange-600 transition-all duration-300 cursor-pointer"
                  href="#"
                >
                  Hệ Thống cửa hàng
                </a>
              </p>
            </div>
          </div>

          {/* Phần Dịch vụ khách hàng */}
          <div>
            <p
              className="font-semibold lg:text-xl md:text-[16px] pb-2 cursor-pointer flex items-center"
              onClick={() => toggleDropdown("services")}
            >
              Dịch vụ khách hàng
              <svg
                className={`w-4 h-4 ml-2 transform transition-transform duration-300 ${
                  isOpen.services ? "rotate-180" : ""
                } md:hidden`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </p>
            <div className={`md:block ${isOpen.services ? "block" : "hidden"}`}>
              <p className="py-2">
                <Link
                  className="text-sm font-[300] hover:text-orange-600 transition-all duration-300 cursor-pointer"
                  to="/terms-policy"
                >
                  Chính sách điều khoản
                </Link>
              </p>
              <p className="py-2">
                <Link
                  className="text-sm font-[300] hover:text-orange-600 transition-all duration-300 cursor-pointer"
                  to="/buying-guide"
                >
                  Hướng dẫn mua hàng
                </Link>
              </p>
              <p className="py-2">
                <Link
                  className="text-sm font-[300] hover:text-orange-600 transition-all duration-300 cursor-pointer"
                  to="/payment-policy"
                >
                  Chính sách thanh toán
                </Link>
              </p>
              <p className="py-2">
                <Link
                  className="text-sm font-[300] hover:text-orange-600 transition-all duration-300 cursor-pointer"
                  to="/return-policy"
                >
                  Chính sách đổi trả
                </Link>
              </p>
              <p className="py-2">
                <a
                  className="text-sm font-[300] hover:text-orange-600 transition-all duration-300 cursor-pointer"
                  href="?action=chinhsachbaohanh"
                >
                  Chính sách bảo hành
                </a>
              </p>
              <p className="py-2">
                <a
                  className="text-sm font-[300] hover:text-orange-600 transition-all duration-300 cursor-pointer"
                  href="?action=chinhsachvanchuyen"
                >
                  Chính sách giao nhận vận chuyển
                </a>
              </p>
              <p className="py-2">
                <a
                  className="text-sm font-[300] hover:text-orange-600 transition-all duration-300 cursor-pointer"
                  href="?action=chinhsachthethanhvien"
                >
                  Chính sách thẻ thành viên
                </a>
              </p>
              <p className="py-2">
                <a
                  className="text-sm font-[300] hover:text-orange-600 transition-all duration-300 cursor-pointer"
                  href="?action=qanda"
                >
                  Q&A
                </a>
              </p>
            </div>
          </div>

          {/* Phần Liên hệ */}
          <div>
            <p
              className="font-semibold lg:text-xl md:text-[16px] pb-2 cursor-pointer flex items-center"
              onClick={() => toggleDropdown("contact")}
            >
              Liên hệ
              <svg
                className={`w-4 h-4 ml-2 transform transition-transform duration-300 ${
                  isOpen.contact ? "rotate-180" : ""
                } md:hidden`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </p>
            <div className={`md:block ${isOpen.contact ? "block" : "hidden"}`}>
              <p className="py-2">
                <a
                  className="text-sm font-[300] hover:text-orange-600 transition-all duration-300 cursor-pointer"
                  href="#"
                >
                  Hotline
                </a>
              </p>
              <p className="py-2">
                <a
                  className="text-sm font-[300] hover:text-orange-600 transition-all duration-300 cursor-pointer"
                  href="#"
                >
                  Email
                </a>
              </p>
              <p className="py-2">
                <a
                  className="text-sm font-[300] hover:text-orange-600 transition-all duration-300 cursor-pointer"
                  href="#"
                >
                  Live chat
                </a>
              </p>
              <p className="py-2">
                <a
                  className="text-sm font-[300] hover:text-orange-600 transition-all duration-300 cursor-pointer"
                  href="#"
                >
                  Messenger
                </a>
              </p>
              <p className="py-2">
                <a
                  className="text-sm font-[300] hover:text-orange-600 transition-all duration-300 cursor-pointer"
                  href="#"
                >
                  Liên hệ
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Cột 3: Nhận thông tin và Download App */}
        <div>
          <div className="border-[4px] border-[#9999]-500 p-4 rounded-tl-[45px] rounded-br-[45px]">
            <p className="font-[600] lg:text-lg md:text-[16px] pt-2 pr-4 pb-4">
              Nhận thông tin các chương trình của ELA via
            </p>
            <div className="flex pb-4 w-full">
              <div className="w-full border-b flex items-center">
                <p className="text-[12px] text-gray-500">Nhập địa chỉ email</p>
              </div>
              <div>
                <a
                  className="border border-black rounded-tl-[15px] rounded-br-[15px] w-24 h-10 flex justify-center items-center hover:bg-black hover:text-white transition-all duration-300"
                  href="#"
                >
                  <button>Đăng ký</button>
                </a>
              </div>
            </div>
          </div>
          <div className="lg:text-xl md:text-[16px] font-semibold py-4">
            Download App
          </div>
          <img
            src="/images/appstore.png"
            className="w-42 h-auto pb-2"
            alt="Appstore"
          />
          <img
            src="/images/googleplay.png"
            className="w-42 h-auto pt-2"
            alt="Google Play"
          />
        </div>
      </div>

      {/* Đường phân cách và bản quyền */}
      <hr />
      <div className="flex justify-center items-center h-16">
        <p>©Elavia All rights reserved - Tạ Hoàng Hiệp</p>
      </div>
    </footer>
  );
};

export default Footer;
