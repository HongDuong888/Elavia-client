import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/auth.context";

const BottomBar = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("BottomBar phải được sử dụng trong AuthProvider");
  }
  const { auth } = context;
  const { isAuthenticated } = auth;

  const [modalContent, setModalContent] = useState<string | null>(null);

  const openModal = (content: string) => {
    setModalContent(content);
  };

  const closeModal = () => {
    setModalContent(null);
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-md z-50 md:hidden">
        <div className="flex justify-around py-2">
          {/* Ô Tài khoản */}
          <div
            className="flex flex-col items-center cursor-pointer"
            onClick={() => openModal("account")}
          >
            <img src="/images/people.png" alt="Tài khoản" className="w-6 h-6" />
            <span className="text-xs">Tài khoản</span>
          </div>

          {/* Ô Tìm kiếm */}
          <div
            className="flex flex-col items-center cursor-pointer"
            onClick={() => openModal("search")}
          >
            <img
              src="/images/magnifying-glass.png"
              alt="Tìm kiếm"
              className="w-6 h-6"
            />
            <span className="text-xs">Tìm kiếm</span>
          </div>

          {/* Ô Hỗ trợ */}
          <div
            className="flex flex-col items-center cursor-pointer"
            onClick={() => openModal("support")}
          >
            <img src="/images/earphones.png" alt="Hỗ trợ" className="w-6 h-6" />
            <span className="text-xs">Hỗ trợ</span>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white p-4 rounded-lg max-w-md w-full">
            <h2 className="text-lg font-bold mb-4">
              {modalContent === "account" && "Tài khoản"}
              {modalContent === "search" && "Tìm kiếm"}
              {modalContent === "support" && "Hỗ trợ"}
            </h2>
            {/* Nội dung danh sách hoặc form */}
            {modalContent === "account" && (
              <ul className="space-y-2">
                {isAuthenticated ? (
                  <>
                    <li>
                      <Link to="/account" onClick={closeModal}>
                        Thông tin tài khoản
                      </Link>
                    </li>
                    <li>
                      <Link to="/orders" onClick={closeModal}>
                        Đơn hàng của tôi
                      </Link>
                    </li>
                    <li>
                      <Link to="/favorites" onClick={closeModal}>
                        Sản phẩm yêu thích
                      </Link>
                    </li>
                  </>
                ) : (
                  <li>
                    <Link to="/login" onClick={closeModal}>
                      Đăng nhập
                    </Link>
                  </li>
                )}
              </ul>
            )}
            {modalContent === "search" && (
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm"
                className="w-full p-2 border rounded"
              />
            )}
            {modalContent === "support" && (
              <ul className="space-y-2">
                <li>
                  <Link to="/support" onClick={closeModal}>
                    Liên hệ hỗ trợ
                  </Link>
                </li>
                <li>
                  <Link to="/faq" onClick={closeModal}>
                    Câu hỏi thường gặp
                  </Link>
                </li>
              </ul>
            )}
            <button
              onClick={closeModal}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default BottomBar;
