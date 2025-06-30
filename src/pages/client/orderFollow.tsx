import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getById } from "../../api/provider";
import ClientLayout from "../../layouts/clientLayout";
import Loading from "../../components/loading";
import { useAddToCart } from "../../hooks/useAddToCart";
import { useAuth } from "../../context/auth.context";
import { toast } from "react-toastify";

const ORDER_STEPS = [
  "Đơn hàng đã đặt",
  "Đang xử lý",
  "Chờ giao vận",
  "Đã gửi",
  "Đã nhận hàng",
];

const statusMap: Record<string, number> = {
  // Bước 0: Đơn hàng đã đặt
  "Chờ xác nhận": 0,
  "Đã thanh toán": 0,
  "Chờ thanh toán": 0,
  "Người bán huỷ": 0,
  "Người mua huỷ": 0,
  "Huỷ do quá thời gian thanh toán": 0,

  // Bước 1: Đang xử lý
  "Đã xác nhận": 1,
  "Đang xử lý": 1,

  // Bước 2: Chờ giao vận
  "Chờ giao vận": 2,
  "Đang giao hàng": 2,

  // Bước 3: Đã gửi
  "Đã gửi": 3,
  "Giao hàng thất bại": 3,

  // Bước 4: Đã nhận hàng (hoặc giao thành công)
  "Giao hàng thành công": 4,
  "Đã nhận hàng": 4,
};

const OrderFollow = () => {
  const { id } = useParams();
  const { auth } = useAuth();
  const addToCartMutation = useAddToCart();

  const { data, isLoading } = useQuery({
    queryKey: ["orders", id],
    queryFn: () => getById({ namespace: "orders", id }),
    refetchInterval: 5000,
  });

  if (isLoading) return <Loading />;
  if (!data)
    return (
      <div className="p-10 text-center text-red-500">
        Không tìm thấy đơn hàng.
      </div>
    );

  const currentStep = statusMap[data.status] ?? 0;

  const handleBuyAgain = (item: any) => {
    if (!auth.user?.id) {
      toast.error("Bạn cần đăng nhập để mua lại sản phẩm!");
      return;
    }
    addToCartMutation.mutate({
      productVariantId: item.productVariantId?._id,
      size: item.size,
      quantity: 1,
      userId: auth.user.id,
    });
  };

  return (
    <ClientLayout>
      <div className="mt-24 px-2">
        <div className="text-sm text-gray-500 mb-2">
          Trang chủ &nbsp; - &nbsp; Thông tin đơn hàng
          <span className="float-right font-medium text-red-600">
            {data.status}
          </span>
        </div>
        <hr className="border-t border-gray-300 my-4" />
        <h2 className="text-3xl font-bold mb-8">THEO DÕI ĐƠN HÀNG</h2>
        <div className="grid grid-cols-[2fr_1.1fr] gap-8">
          {/* LEFT: Theo dõi đơn hàng */}
          <div>
            {/* Progress Bar */}
            <div className="bg-white border mb-8 px-6 py-6 rounded-tl-2xl rounded-tr-none rounded-bl-none rounded-br-2xl">
              <div className="flex items-center w-full">
                {ORDER_STEPS.map((step, idx) => (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center ">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                          ${
                            idx <= currentStep
                              ? "bg-black border-black"
                              : "bg-white border-gray-300"
                          }
                          transition-all duration-300
                        `}
                      ></div>
                    </div>
                    {idx < ORDER_STEPS.length - 1 && (
                      <div
                        className={`h-1 flex-1 ${
                          idx < currentStep ? "bg-black" : "bg-gray-200"
                        } transition-all duration-300`}
                      ></div>
                    )}
                  </React.Fragment>
                ))}
              </div>

              <div className="flex w-full mt-3">
                {ORDER_STEPS.map((step, idx) => (
                  <div
                    key={step}
                    className="flex-1 flex text-center items-center justify-center "
                    style={{ minWidth: "0" }}
                  >
                    <span
                      className={`text-[11px] font-semibold leading-tight text-center whitespace-normal break-words ${
                        idx <= currentStep ? "text-black" : "text-gray-400"
                      }`}
                      style={{ maxWidth: 80 }}
                    >
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chi tiết trạng thái đơn hàng */}
            <div className="mt-8">
              <h3 className="font-semibold mb-4 text-lg">
                Chi tiết trạng thái đơn hàng
              </h3>
              <div className="relative ml-4">
                <div
                  className="absolute left-2 top-2 bottom-2 w-1 bg-gray-200 z-0 rounded-full"
                  style={{ height: `calc(100% - 16px)` }}
                ></div>
                <ul className="space-y-6 relative z-10">
                  {ORDER_STEPS.map((step, idx) => (
                    <li key={step} className="flex items-start relative z-10">
                      <span
                        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5
                          ${
                            idx <= currentStep
                              ? "bg-black border-black"
                              : "bg-white border-gray-400"
                          }
                        `}
                      ></span>
                      <div className="ml-4">
                        <span
                          className={`font-semibold text-base ${
                            idx <= currentStep ? "text-black" : "text-gray-400"
                          }`}
                        >
                          {step}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          {idx === 0 &&
                            new Date(data.createdAt).toLocaleDateString(
                              "vi-VN"
                            ) +
                              " " +
                              new Date(data.createdAt).toLocaleTimeString(
                                "vi-VN"
                              )}
                          {idx === currentStep &&
                            idx !== 0 &&
                            new Date(data.updatedAt).toLocaleDateString(
                              "vi-VN"
                            ) +
                              " " +
                              new Date(data.updatedAt).toLocaleTimeString(
                                "vi-VN"
                              )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Sản phẩm */}
            {data.items?.map((item: any, idx: number) => (
              <div
                key={idx}
                className="flex gap-4 mb-6 items-center bg-[#f7f7f7] rounded-lg p-4"
              >
                <img
                  src={
                    item.productVariantId?.images?.main?.url ||
                    "https://via.placeholder.com/150x215?text=No+Image"
                  }
                  alt={item.productName}
                  className="w-[120px] h-[160px] object-cover rounded"
                />
                <div>
                  <div className="font-semibold text-lg">
                    {item.productName}
                  </div>
                  <div className="text-sm">
                    Màu sắc:{" "}
                    {item.productVariantId?.color?.colorName || "Không có"}
                  </div>
                  <div className="text-sm">Size: {item.size}</div>
                  <div className="text-sm">Số lượng: {item.quantity}</div>
                  <div className="text-sm">
                    SKU: {item.productVariantId?.sku || "Không có"}
                  </div>
                  <button
                    className="mt-2 px-4 py-1 border border-black 
  rounded-tl-[8px] rounded-bl-none rounded-tr-none rounded-br-[8px] 
  bg-white text-black hover:bg-black hover:text-white transition text-sm"
                    onClick={() => handleBuyAgain(item)}
                  >
                    MUA LẠI
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT: Tóm tắt đơn hàng */}
          <div>
            <div className="w-full lg:w-[320px] bg-[#f7f7f7] p-5 rounded-md text-sm space-y-5 shadow-sm ml-14">
              <h3 className="text-base font-semibold pb-3 border-b border-gray-300">
                Tóm tắt đơn hàng
              </h3>

              <div className="space-y-2 text-gray-700">
                <div className="flex justify-between">
                  <span>Ngày tạo đơn</span>
                  <span className="font-medium">
                    {new Date(data.updatedAt).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tạm tính</span>
                  <span className="font-medium">
                    {data.totalAmount.toLocaleString("vi-VN")} đ
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển</span>
                  <span className="font-medium">38.000 đ</span>
                </div>
                <div className="flex justify-between font-semibold pt-3 border-t border-gray-300 mt-2 text-base">
                  <span>Tổng tiền</span>
                  <span>
                    {(data.totalAmount + 38000).toLocaleString("vi-VN")} đ
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold border-t pt-3 mb-1">
                  Hình thức thanh toán
                </h4>
                <p className="py-1 text-gray-700">{data.paymentMethod}</p>
              </div>

              <div>
                <h4 className="font-semibold border-t pt-3 mb-1">
                  Đơn vị vận chuyển
                </h4>
                <p className="py-1 text-gray-700">Chuyển phát nhanh</p>
              </div>

              <div>
                <h4 className="font-semibold border-t pt-3 mb-1">Địa chỉ</h4>
                <p className="py-1 text-gray-700">{data.user.name}</p>
                <p className="py-1 text-gray-700">{data.user.address}</p>
                <p className="py-1 text-gray-700">
                  Điện thoại: {data.user.phone}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
};

export default OrderFollow;
