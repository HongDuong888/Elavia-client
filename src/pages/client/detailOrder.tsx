import React from "react";
import { useParams } from "react-router-dom";
import MenuInfo from "../../components/menuInfo";
import { useQuery } from "@tanstack/react-query";
import { getById } from "../../api/provider";
import Loading from "../../components/loading";
import ClientLayout from "../../layouts/clientLayout";

const Detail_order = () => {
  const { id } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["orders", id],
    queryFn: () => getById({ namespace: "orders", id: id }),
  });
  if (isLoading) {
    return <Loading />;
  }
  if (!data) {
    return (
      <div className="p-10 text-center text-red-500">
        Không tìm thấy đơn hàng.
      </div>
    );
  }
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
              <div>Chi tiết đơn hàng</div>
            </div>
          </div>
          <div className="text-sm">-</div>
          <div className="text-sm">
            <div className="text-sm flex gap-4">
              <div>{data.orderId}</div>
            </div>
          </div>
        </div>
        <hr className="border-t border-gray-300 my-4" />

        <div className="grid grid-cols-[0.7fr_2.5fr] gap-8">
          {/* Menu */}
          <div className="p-4 pl-0 font-bold rounded-tl-[40px] rounded-br-[40px] border-gray-700 h-auto mt-2">
            <MenuInfo />
          </div>
          <div className="p-4 pl-0">
            <div className="flex justify-between mb-6">
              <h2 className="text-2xl font-semibold">
                Chi tiết đơn hàng
                <span className="text-red-600"> {data.orderId}</span>
              </h2>
              <button className="text-sm text-red-500 hover:underline">
                {data.status}
              </button>
            </div>

            <div className="flex flex-col lg:flex-row justify-between ">
              {/* Left: Product info */}
              <div className="grid grid-cols-1">
                {data.items?.map((item: any, index: any) => {
                  return (
                    <div className="flex-1">
                      <div className="flex gap-4">
                        <img
                          src={
                            item.productVariantId?.images?.main?.url
                              ? item.productVariantId.images.main.url
                              : "https://via.placeholder.com/150x215?text=No+Image"
                          }
                          alt={item.productName}
                          className="w-[150px] h-[215px] object-cover"
                        />
                        <div className="flex flex-col justify-between">
                          <div key={index}>
                            <div className="flex justify-between gap-[110px]">
                              <div className="font-semibold">
                                {item.productName}
                              </div>
                              <div className="font-semibold">
                                {item.price.toLocaleString("vi-VN")}đ
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 py-0.5">
                              Màu sắc:{" "}
                              {item.productVariantId?.color?.colorName ||
                                item.color ||
                                "Không có"}
                            </p>
                            <p className="text-sm text-gray-600 py-0.5">
                              Size: {item.size}
                            </p>
                            <p className="text-sm text-gray-600 py-0.5">
                              Số lượng: {item.quantity}
                            </p>
                            <p className="text-sm text-gray-600 py-0.5">
                              SKU:{" "}
                              {item.productVariantId?.sku ||
                                item.sku ||
                                "Không có"}
                            </p>
                          </div>
                          <button className="w-fit mt-2 px-4 py-1 border border-black rounded-md hover:bg-black hover:text-white transition">
                            MUA LẠI
                          </button>
                        </div>
                      </div>
                      <hr className="mt-2 w-[600px]" />
                    </div>
                  );
                })}
              </div>

              {/* Right: Summary */}
              <div className="w-full lg:w-[320px] bg-[#f7f7f7] p-5 rounded-md text-sm space-y-5 shadow-sm">
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

            <div className="mt-8">
              <button className="bg-black text-white px-6 py-2 rounded-full hover:opacity-90 transition">
                THEO DÕI ĐƠN HÀNG
              </button>
            </div>
          </div>
        </div>
      </article>
    </ClientLayout>
  );
};

export default Detail_order;
