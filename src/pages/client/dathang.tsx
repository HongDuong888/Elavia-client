import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ICartItem } from "../../types/cart";
import { useAuth } from "../../context/auth.context";
import { toast } from "react-toastify";
import { getById, getList } from "../../api/provider";
import Loading from "../../components/loading";
import axiosInstance from "../../services/axiosInstance";
import moment from "moment";
import { useGHNMapper } from "../../utils/ghnMapping";
import ClientLayout from "../../layouts/clientLayout";
import axios from "axios";

const Dathang = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { auth } = useAuth();
  const [showProducts, setShowProducts] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [voucher, setVoucher] = useState("");
  const [supportCode, setSupportCode] = useState("");
  const [voucherTab, setVoucherTab] = useState<"ma-giam-gia" | "ma-cua-toi">(
    "ma-giam-gia"
  );

  // const cityName = userData[0].city.name;
  // const districtName = userData[0].district.name;
  // const wardName = userData[0].commune.name;
  const cityName = "Hà Nội";
  const districtName = "Quận Nam Từ Liêm";
  const wardName = "Phường Xuân Phương";

  const {
    provinces,
    districts,
    wards,
    fetchDistricts,
    fetchWards,
    findProvinceId,
    findDistrictId,
    findWardCode,
  } = useGHNMapper("5191a6d2-16d1-11f0-8b10-8e771ee3638b");

  // 1. Khi provinces đã load, tìm provinceId và fetch district
  useEffect(() => {
    if (provinces.length === 0) return;

    const provinceId = findProvinceId(cityName);
    if (provinceId) {
      console.log("✅ Province ID:", provinceId);
      fetchDistricts(provinceId);
    } else {
      console.warn("❌ Không tìm thấy province");
    }
  }, [provinces]);

  // 2. Khi districts đã load, tìm districtId và fetch ward
  useEffect(() => {
    if (districts.length === 0 || provinces.length === 0) return;

    const provinceId = findProvinceId(cityName);
    if (!provinceId) return;

    const districtId = findDistrictId(districtName, provinceId);
    if (districtId) {
      console.log("✅ District ID:", districtId);
      fetchWards(districtId);
    } else {
      console.warn("❌ Không tìm thấy district");
    }
  }, [districts]);

  // 3. Khi wards đã load, tìm wardCode
  useEffect(() => {
    if (wards.length === 0 || districts.length === 0) return;

    const provinceId = findProvinceId(cityName);
    const districtId = findDistrictId(districtName, provinceId!);
    if (!districtId) return;

    const wardCode = findWardCode(wardName, districtId);
    if (wardCode) {
      const wardId = wardCode;
      console.log("✅ Ward Code:", wardCode);
    } else {
      console.warn("❌ Không tìm thấy ward");
    }
  }, [wards]);
  const TOKEN = "1cde9362-529a-11f0-8c19-5aba781b9b65";
  const SHOP_ID = "5858948";

  const {
    data: cartItems,
    isLoading: cartLoading,
    error: cartError,
  } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => getList({ namespace: `cart` }),
    staleTime: 60 * 1000,
  });
  const {
    data: userData,
    isLoading: userLoading,
    error: userError,
  } = useQuery({
    queryKey: ["users", auth.user.id],
    queryFn: async () =>
      getById({ namespace: `auth/shipping-address`, id: auth.user.id }),
    staleTime: 60 * 1000,
  });

  if (cartLoading || userLoading) return <Loading />;
  if (cartError)
    return <div>Lỗi khi tải giỏ hàng: {(cartError as Error).message}</div>;
  if (userError)
    return (
      <div>
        Lỗi khi tải thông tin người dùng: {(userError as Error).message}
      </div>
    );
  if (!userData || userData.length === 0)
    return <div>Không tìm thấy thông tin địa chỉ giao hàng</div>;

  const address =
    userData[0].address +
    ", " +
    userData[0].district.name +
    ", " +
    userData[0].commune.name +
    ", " +
    userData[0].city.name;

  const items: ICartItem[] = cartItems?.items || [];
  const validItems = items.filter(
    (item) =>
      item &&
      item.productVariantId &&
      typeof item.productVariantId === "object" &&
      item.productVariantId !== null
  );

  const totalQuantity = validItems.reduce((sum, item) => {
    if (!item || typeof item.quantity !== "number") return sum;
    return sum + item.quantity;
  }, 0);

  const totalPrice = validItems.reduce((sum, item) => {
    if (
      !item?.productVariantId?.price ||
      typeof item.productVariantId.price !== "number" ||
      !item.quantity
    )
      return sum;
    return sum + item.productVariantId.price * item.quantity;
  }, 0);

  const handlePayment = async () => {
    if (!auth.user.id) {
      toast.error("Bạn cần đăng nhập để thực hiện thanh toán");
      return;
    }

    try {
      if (paymentMethod === "cod") {
        const payload = {
          orderId: "COD_" + new Date().getTime(),
          user: {
            name: userData[0].receiver_name,
            email: auth.user.email,
            phone: userData[0].phone,
            address: address,
          },
          items: validItems.map((item) => ({
            productVariantId: item.productVariantId._id,
            productName:
              item.productVariantId.productId?.name || "Unnamed Product",
            price: item.productVariantId.price,
            quantity: item.quantity,
            size: item.size,
          })),
          totalAmount: totalPrice,
          paymentMethod: "COD",
        };

        try {
          await axiosInstance.post(
            `${import.meta.env.VITE_API_URL}/orders`,
            payload
          );
          await axiosInstance.get(`${import.meta.env.VITE_API_URL}/cart/clear`);
          toast.success("Đặt hàng thành công!");
          navigate("/ordersuccess", {
            state: {
              orderId: payload.orderId,
              receiverName: userData[0].receiver_name,
            },
          });
        } catch (error: any) {
          throw new Error(
            error.response?.data?.message || "Thanh toán thất bại"
          );
        }
      } else if (paymentMethod === "momo") {
        // Kiểm tra số tiền có hợp lệ không
        if (totalPrice < 1000 || totalPrice > 50000000) {
          toast.error("Số tiền thanh toán phải từ 1.000đ đến 50.000.000đ");
          return;
        }

        // Tạo payload cho đơn hàng MoMo
        const payload = {
          orderId: "MoMo_" + new Date().getTime(),
          user: {
            name: userData[0].receiver_name,
            email: auth.user.email,
            phone: userData[0].phone,
            address: address,
          },
          items: validItems.map((item) => ({
            productVariantId: item.productVariantId._id,
            productName:
              item.productVariantId.productId?.name || "Unnamed Product",
            price: item.productVariantId.price,
            quantity: item.quantity,
            size: item.size,
          })),
          totalAmount: totalPrice,
          paymentMethod: "MoMo",
          orderInfo: "Thanh toán qua MoMo",
          extraData: "",
          orderGroupId: "",
          paymentUrl: "",
        };

        try {
          const momoPayload = {
            totalAmount: Math.round(totalPrice),
            orderId: payload.orderId,
            orderInfo: payload.orderInfo,
            extraData: payload.extraData,
            orderGroupId: payload.orderGroupId,
          };

          console.log("MoMo Payment Request:", momoPayload);

          const momoResponse = await axiosInstance.post(
            `${import.meta.env.VITE_API_URL}/orders/momo/create`,
            momoPayload
          );

          console.log("MoMo Response:", momoResponse.data);

          if (!momoResponse.data || momoResponse.data.resultCode !== 0) {
            const errorMessage =
              momoResponse.data?.message || "Khởi tạo thanh toán MoMo thất bại";
            console.error("Lỗi MoMo:", momoResponse.data);
            throw new Error(errorMessage);
          }
          payload.paymentUrl = momoResponse.data.payUrl;
          await axiosInstance.post(
            `${import.meta.env.VITE_API_URL}/orders`,
            payload
          );
          await axiosInstance.get(`${import.meta.env.VITE_API_URL}/cart/clear`);
          window.open(momoResponse.data.payUrl, "_blank");
        } catch (error: any) {
          console.error("Lỗi thanh toán MoMo:", error);
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Có lỗi xảy ra khi thanh toán MoMo";
          toast.error(errorMessage);
        }
      } else if (paymentMethod === "zalopay") {
        const transID = Math.floor(Math.random() * 1000000);
        const orderId = `${moment().format("YYMMDD")}_${transID}`;
        const payload = {
          orderId: orderId,
          user: {
            name: userData[0].receiver_name,
            email: auth.user.email,
            phone: userData[0].phone,
            address: address,
          },
          items: validItems.map((item) => ({
            productVariantId: item.productVariantId._id,
            productName:
              item.productVariantId.productId?.name || "Unnamed Product",
            price: item.productVariantId.price,
            quantity: item.quantity,
            size: item.size,
          })),
          totalAmount: totalPrice,
          paymentMethod: "zalopay",
          orderInfo: "Thanh toán qua ZaloPay",
          extraData: "",
          orderGroupId: "",
          paymentUrl: "",
        };
        const zaloPayload = {
          orderId: payload.orderId,
          orderInfo: payload.orderInfo,
          totalAmount: totalPrice,
        };
        console.log("ZaloPay Payment Request:", zaloPayload);

        try {
          const zaloResponse = await axiosInstance.post(
            `${import.meta.env.VITE_API_URL}/orders/zalopay/create`,
            zaloPayload
          );

          console.log("ZaloPay Response:", zaloResponse.data);

          if (!zaloResponse.data || zaloResponse.data.return_code !== 1) {
            const errorMessage =
              zaloResponse.data?.return_message ||
              "Khởi tạo thanh toán ZaloPay thất bại";
            console.error("Lỗi ZaloPay:", zaloResponse.data);
            throw new Error(errorMessage);
          }

          payload.paymentUrl = zaloResponse.data.order_url;

          await axiosInstance.post(
            `${import.meta.env.VITE_API_URL}/orders`,
            payload
          );
          await axiosInstance.get(`${import.meta.env.VITE_API_URL}/cart/clear`);
          window.open(zaloResponse.data.order_url, "_blank");
        } catch (error) {
          console.error("Lỗi ZaloPay:", error);
          throw error;
        }
      }
    } catch (error: any) {
      console.error("Lỗi thanh toán:", error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi thanh toán"
      );
    }
  };

  return (
    <>
      <ClientLayout>
        <article className="mt-[100px]">
          <article className="grid grid-cols-[4fr_1.5fr] gap-10 mt-[100px]">
            <div>
              {/* Thanh tiến trình */}
              <div className="border w-full h-[96.6px] flex justify-center rounded-tl-[20px] rounded-br-[20px]">
                <div className="w-[14px] h-[14px] rounded-full border-2 border-[#e7e8e9] bg-black mt-6 z-10 relative">
                  <p className="text-[12px] mt-4 left-[-20px] w-16 absolute">
                    Giỏ hàng
                  </p>
                </div>
                <div className="h-[3px] w-[200px] bg-black mx-2 mt-[30px]"></div>
                <div className="w-[14px] h-[14px] rounded-full bg-black border-2 border-[#e7e8e9] mt-6 z-10 relative">
                  <div className="text-[12px] mt-4 left-[-20px] w-16 absolute">
                    Đặt hàng
                  </div>
                </div>
                <div className="h-[3px] w-[200px] bg-[#e7e8e9] mx-2 mt-[30px]"></div>
                <div className="w-[14px] h-[14px] rounded-full bg-white border-2 border-[#e7e8e9] mt-6 z-10 relative">
                  <div className="text-[12px] mt-4 left-[-20px] w-20 absolute">
                    Thanh toán
                  </div>
                </div>
                <div className="h-[3px] w-[200px] bg-[#e7e8e9] mx-2 mt-[30px]"></div>
                <div className="w-[14px] h-[14px] rounded-full bg-white border-2 border-[#e7e8e9] mt-6 z-10 relative">
                  <div className="text-[12px] mt-4 left-[-40px] w-28 absolute">
                    Hoàn thành
                  </div>
                </div>
              </div>

              {/* Nội dung đặt hàng */}
              <div className="grid grid-cols-[1.5fr_1.25fr] gap-10">
                <div>
                  <div className="text-[20px] font-semibold py-6">
                    Địa chỉ giao hàng
                  </div>
                  <div className="border p-6 rounded-tl-[28px] rounded-br-[28px]">
                    <div className="flex justify-between">
                      <div className="text-base font-semibold">
                        {userData[0].receiver_name}
                      </div>
                      <div className="flex gap-4">
                        <Link
                          to="/address"
                          className="text-[14px] underline hover:text-black transition"
                        >
                          Chọn địa chỉ khác
                        </Link>
                        <div>
                          <a
                            className="py-[10px] px-[16px] border border-black text-white bg-black rounded-tl-[20px] rounded-br-[20px] mt-8 hover:text-black hover:bg-white"
                            href=""
                          >
                            Mặc định
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="py-2 text-[14px]">
                      Điện thoại: {userData[0].phone}
                    </div>
                    <div className="py-2 text-[14px]">Địa chỉ: {address}</div>
                  </div>
                </div>
                <div>
                  <div className="text-[20px] font-semibold py-6">
                    Phương thức thanh toán
                  </div>
                  <div className="border p-8 rounded-tl-[25px] rounded-br-[25px]">
                    <div className="flex flex-col gap-4 mb-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="payment"
                          value="cod"
                          checked={paymentMethod === "cod"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-4 h-4"
                        />
                        <span className="text-[14px] font-semibold">
                          Thanh toán khi nhận hàng
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="payment"
                          value="momo"
                          checked={paymentMethod === "momo"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-4 h-4"
                        />
                        <span className="text-[14px] font-semibold">
                          Thanh toán MoMo
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="payment"
                          value="zalopay"
                          checked={paymentMethod === "zalopay"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-4 h-4"
                        />
                        <span className="text-[14px] font-semibold">
                          Thanh toán ZaloPay
                        </span>
                      </label>
                    </div>
                    <div className="text-xs mt-4 w-full">
                      Thời gian giao hàng dự kiến:{" "}
                      {new Date(
                        Date.now() + 3 * 24 * 60 * 60 * 1000
                      ).toLocaleDateString("vi-VN", {
                        weekday: "long",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mb-4 pt-6">
                <button
                  onClick={() => setShowProducts(!showProducts)}
                  className="py-1 px-4 text-sm border border-black rounded-tl-[15px] rounded-br-[15px] hover:bg-black hover:text-white transition-all duration-300"
                >
                  {showProducts ? "Ẩn sản phẩm" : "Hiển thị sản phẩm"}
                </button>
              </div>

              {showProducts && (
                <div>
                  <table className="w-full bg-white table-auto border-collapse">
                    <thead className="border-b bg-gray-100">
                      <tr>
                        <th className="pr-4 py-2 text-left text-sm font-semibold text-gray-700">
                          Sản phẩm
                        </th>
                        <th className="pr-4 py-2 text-left text-sm font-semibold text-gray-700">
                          Số lượng
                        </th>
                        <th className="pr-4 py-2 text-left text-sm font-semibold text-gray-700">
                          Size
                        </th>
                        <th className="pr-4 py-2 text-left text-sm font-semibold text-gray-700">
                          Giá
                        </th>
                        <th className="pr-4 py-2 text-left text-sm font-semibold text-gray-700">
                          Tổng tiền
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {validItems.length > 0 ? (
                        validItems.map((item: ICartItem, index: number) => (
                          <tr
                            key={item._id}
                            className={`border-b hover:bg-gray-50 ${
                              index % 2 === 1 ? "bg-gray-100" : ""
                            }`}
                          >
                            <td className="pr-4 py-2 text-sm text-gray-700">
                              <div className="flex items-center gap-4">
                                <Link
                                  to={`/products/${encodeURIComponent(
                                    item?.productVariantId?._id || ""
                                  )}`}
                                  className="group relative block"
                                >
                                  <img
                                    src={
                                      item?.productVariantId?.images?.main
                                        ?.url || "/fallback.jpg"
                                    }
                                    alt={
                                      item?.productVariantId?.productId?.name ||
                                      "Product"
                                    }
                                    className="w-18 h-[100px] object-cover rounded transition-opacity duration-300 ease-in-out opacity-100 group-hover:opacity-0"
                                    onError={(e) =>
                                      (e.currentTarget.src = "/fallback.jpg")
                                    }
                                  />
                                  <img
                                    src={
                                      item?.productVariantId?.images?.hover
                                        ?.url || "/fallback.jpg"
                                    }
                                    alt={
                                      item?.productVariantId?.productId?.name ||
                                      "Product"
                                    }
                                    className="w-18 h-[100px] object-cover rounded absolute top-0 left-0 transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100"
                                    onError={(e) =>
                                      (e.currentTarget.src = "/fallback.jpg")
                                    }
                                  />
                                </Link>
                                <Link
                                  to={`/products/${encodeURIComponent(
                                    item?.productVariantId?._id || ""
                                  )}`}
                                  className="hover:text-orange-600 transition-all duration-300"
                                >
                                  {item?.productVariantId?.productId?.name ||
                                    "Unnamed Product"}
                                </Link>
                              </div>
                            </td>
                            <td className="pr-4 py-2 text-sm text-gray-700">
                              <div
                                id={`quantityDisplay-${item._id}`}
                                className="flex items-center justify-center text-center text-sm border border-gray-300 w-12 h-8 z-10 rounded-tl-[20px] rounded-br-[20px]"
                              >
                                {item.quantity}
                              </div>
                            </td>
                            <td className="pr-4 py-2 text-sm text-gray-700">
                              {item.size}
                            </td>
                            <td className="pr-4 py-2 text-sm text-gray-700">
                              {item?.productVariantId?.price.toLocaleString(
                                "vi-VN"
                              )}{" "}
                              đ
                            </td>
                            <td className="pr-4 py-2 text-sm text-gray-700">
                              {(
                                (item?.productVariantId?.price || 0) *
                                (item?.quantity || 0)
                              ).toLocaleString("vi-VN")}{" "}
                              đ
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-2 text-center text-gray-500"
                          >
                            Giỏ hàng của bạn trống.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div>
              <div className="bg-[#fbfbfc] p-[22px] w-[400px]">
                <div className="text-[20px] text-[#221F20]">
                  Tóm tắt đơn hàng
                </div>
                <br />
                <div className="text-[14px] text-[#57585A]">
                  <div className="flex justify-between">
                    <div>Tổng tiền hàng</div>
                    <div>{totalPrice.toLocaleString("vi-VN")}đ</div>
                  </div>
                  <div className="flex justify-between mt-2">
                    <div>Tạm tính</div>
                    <div>{totalPrice.toLocaleString("vi-VN")}đ</div>
                  </div>
                  <div className="flex justify-between mt-2">
                    <div>Phí vận chuyển</div>
                    <div>0đ</div>
                  </div>
                  <div className="flex justify-between mt-2 font-semibold">
                    <div>Tiền thanh toán</div>
                    <div>{totalPrice.toLocaleString("vi-VN")}đ</div>
                  </div>
                </div>
                <hr className="my-4" />

                {/* VOUCHER */}
                <div>
                  <div className="flex border-b mb-2">
                    <button
                      className={`px-4 py-2 text-sm font-semibold ${
                        voucherTab === "ma-giam-gia"
                          ? "border-b-2 border-black"
                          : "text-gray-500"
                      }`}
                      onClick={() => setVoucherTab("ma-giam-gia")}
                    >
                      Mã phiếu giảm giá
                    </button>
                    <button
                      className={`px-4 py-2 text-sm font-semibold ${
                        voucherTab === "ma-cua-toi"
                          ? "border-b-2 border-black"
                          : "text-gray-500"
                      }`}
                      onClick={() => setVoucherTab("ma-cua-toi")}
                    >
                      Mã của tôi
                    </button>
                  </div>
                  {voucherTab === "ma-giam-gia" && (
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Mã giảm giá"
                        value={voucher}
                        onChange={(e) => setVoucher(e.target.value)}
                        className="flex-1 border px-3 py-2 rounded"
                      />
                      <button
                        className="border px-4 py-2 rounded bg-white font-semibold"
                        // onClick={handleApplyVoucher}
                        type="button"
                      >
                        ÁP DỤNG
                      </button>
                    </div>
                  )}
                  {voucherTab === "ma-cua-toi" && (
                    <div className="mb-2 text-gray-500 text-sm">
                      Bạn chưa có mã nào.
                    </div>
                  )}
                  <input
                    type="text"
                    placeholder="Mã nhân viên hỗ trợ"
                    value={supportCode}
                    onChange={(e) => setSupportCode(e.target.value)}
                    className="w-full border px-3 py-2 rounded mb-2"
                  />
                </div>
              </div>
              <div>
                <button
                  onClick={handlePayment}
                  className={`bg-black w-full h-[50px] rounded-tl-2xl rounded-br-2xl flex items-center justify-center lg:text-[16px] md:text-[12px] text-white font-semibold mt-4
                    ${
                      validItems.length === 0
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-white hover:text-black hover:border hover:border-black cursor-pointer"
                    } transition-all duration-300`}
                >
                  {validItems.length === 0 ? "GIỎ HÀNG TRỐNG" : "HOÀN THÀNH"}
                </button>
              </div>
            </div>
          </article>
        </article>
      </ClientLayout>
    </>
  );
};

export default Dathang;
