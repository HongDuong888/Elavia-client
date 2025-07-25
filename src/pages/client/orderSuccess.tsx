import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ClientLayout from "../../layouts/clientLayout";
import { useAuth } from "../../context/auth.context";

import { toast } from "react-toastify";
import axiosInstance from "../../services/axiosInstance";

const orderSuccess = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const userEmail = auth?.user?.email;
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId") || searchParams.get("apptransid");
  console.log("userEmail:", userEmail);
  console.log("orderId:", orderId);

  const handleFollowOrder = async () => {
    try {
      const res = await axiosInstance.get("/orders?userEmail=" + userEmail);
      const order = res.data.data.find((o: any) => o.orderId === orderId);
      if (order) {
        navigate(`/order-follow/${order._id}`);
      } else {
        toast.error("Không tìm thấy đơn hàng!");
      }
    } catch (err) {
      toast.error("Lỗi khi tìm đơn hàng!");
    }
  };

  return (
    <ClientLayout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
          <div className="text-6xl mb-6">🛍️</div>
          <h1 className="text-3xl font-bold mb-4 text-center">
            Cảm ơn đã mua hàng
          </h1>
          <p className="mb-2 text-lg text-center">
            Chào {userEmail || "bạn"}, đơn hàng của bạn với mã
            <span className="text-green-600 font-semibold"> {orderId}</span> đã
            được đặt thành công.
          </p>
          <p className="mb-6 text-gray-600 text-center">
            Hệ thống sẽ tự động gửi Email hoặc SMS xác nhận đơn hàng đến số điện
            thoại hoặc email bạn đã cung cấp.
          </p>
          <div className="flex gap-4 mb-4 flex-wrap justify-center">
            <button
              className="bg-black text-white px-6 py-3 rounded-tl-2xl rounded-br-2xl font-semibold hover:bg-white hover:text-black hover:border hover:border-black transition"
              onClick={() => navigate("/")}
            >
              TIẾP TỤC MUA SẮM
            </button>
            <button
              className="border border-black px-6 py-3 rounded-tl-2xl rounded-br-2xl font-semibold hover:bg-black hover:text-white transition"
              onClick={handleFollowOrder}
            >
              THEO DÕI ĐƠN HÀNG
            </button>
          </div>
          <p className="mt-4 text-gray-500 text-center max-w-xl">
            Sản phẩm nằm trong chương trình KM giảm giá trên 50% không hỗ trợ
            đổi trả
          </p>
        </div>
      </div>
    </ClientLayout>
  );
};

export default orderSuccess;
