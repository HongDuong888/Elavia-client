import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ClientLayout from "../../layouts/clientLayout";

const orderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, orderMongoId, receiverName } = location.state || {};

  return (
    <ClientLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-6xl mb-6">🛍️</div>
        <h1 className="text-3xl font-bold mb-4">Cảm ơn đã mua hàng</h1>
        <p className="mb-2 text-lg">
          Chào {receiverName || "bạn"}, đơn hàng của bạn với mã{" "}
          <span className="text-green-600 font-semibold">{orderId}</span> đã được đặt thành công.
        </p>
        <p className="mb-6 text-gray-600">
          Hệ thống sẽ tự động gửi Email và SMS xác nhận đơn hàng đến số điện thoại và email bạn đã cung cấp.
        </p>
        <div className="flex gap-4">
          <button
            className="bg-black text-white px-6 py-3 rounded-tl-2xl rounded-br-2xl font-semibold hover:bg-white hover:text-black hover:border hover:border-black transition"
            onClick={() => navigate("/")}
          >
            TIẾP TỤC MUA SẮM
          </button>
          <button
            className="border border-black px-6 py-3 rounded-tl-2xl rounded-br-2xl font-semibold hover:bg-black hover:text-white transition"
           
          >
            THEO DÕI ĐƠN HÀNG
          </button>
        </div>
        <p className="mt-8 text-gray-500 text-center max-w-xl">
          Sản phẩm nằm trong chương trình KM giảm giá trên 50% không hỗ trợ đổi trả
        </p>
      </div>
    </ClientLayout>
  );
};

export default orderSuccess;