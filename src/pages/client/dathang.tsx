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
import ClientLayout from "../../layouts/clientLayout";
import AddAddressModal from "../../components/addAddress";
import SelectAddressModal from "../../components/SelectAddressModal";

const Dathang = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { auth } = useAuth();
  const [showProducts, setShowProducts] = useState(false);
  const [isPending, setisPending] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isFetchingShippingFee, setIsFetchingShippingFee] = useState(false);
  const [voucher, setVoucher] = useState("");
  const [voucherTab, setVoucherTab] = useState<"ma-giam-gia" | "ma-cua-toi">(
    "ma-giam-gia"
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);

  interface Address {
    _id?: string;
    receiver_name?: string;
    phone?: string;
    address?: string;
    city?: any;
    district?: any;
    ward?: any;
    type?: string;
  }

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [shippingFee, setShippingFee] = useState(0);
  const [lastAddedAddressId, setLastAddedAddressId] = useState<string | null>(
    null
  );

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

  const {
    data: myInfoData,
    isLoading: isMyInfoLoading,
    error: myInfoError,
  } = useQuery({
    queryKey: ["myInfo"],
    queryFn: async () => getList({ namespace: "auth/my-info" }),
    staleTime: 300 * 1000,
  });

  const { shipping_addresses = [], defaultAddress: defaultAddressId } =
    myInfoData || {};

  let content = null;
  if (cartLoading || userLoading || isMyInfoLoading) {
    content = <Loading />;
  } else if (cartError) {
    content = <div>Lỗi khi tải giỏ hàng: {(cartError as Error).message}</div>;
  } else if (userError) {
    content = (
      <div>
        Lỗi khi tải thông tin người dùng: {(userError as Error).message}
      </div>
    );
  } else if (!userData || userData.length === 0) {
    content = <div>Không tìm thấy thông tin địa chỉ giao hàng</div>;
  }

  useEffect(() => {
    if (myInfoData?.shipping_addresses?.length > 0) {
      // Nếu vừa thêm mới, ưu tiên chọn địa chỉ mới
      if (lastAddedAddressId) {
        const newAddr = myInfoData.shipping_addresses.find(
          (addr: any) => addr._id === lastAddedAddressId
        );
        if (newAddr) {
          setSelectedAddress(newAddr);
          setLastAddedAddressId(null); // reset lại sau khi đã chọn
          return;
        }
      }
      // Nếu không thì chọn mặc định như cũ
      const defaultAddr = myInfoData.shipping_addresses.find(
        (addr: any) => addr._id === myInfoData.defaultAddress
      );
      setSelectedAddress(defaultAddr || myInfoData.shipping_addresses[0]);
    }
  }, [myInfoData]);

  const currentAddress =
    selectedAddress || (userData && userData.length > 0 ? userData[0] : null);

  const address = currentAddress
    ? [
        currentAddress.address,
        currentAddress.district?.name,
        currentAddress.ward?.name,
        currentAddress.city?.name,
      ]
        .filter(Boolean)
        .join(", ")
    : "";

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

  // Hàm helper để lấy giá theo size
  const getPriceForSize = (item: ICartItem) => {
    if (!item.productVariantId?.sizes || !item.size) return 0;
    const sizeInfo = item.productVariantId.sizes.find(
      (s: any) => s.size === item.size
    );
    return sizeInfo?.price || 0;
  };

  const totalPrice = validItems.reduce((sum, item) => {
    const price = getPriceForSize(item);
    if (!price || !item.quantity) return sum;
    return sum + price * item.quantity;
  }, 0);

  const cleanLocationName = (name: string = "") =>
    name.replace(/^(Tỉnh|Thành phố)\s+/g, "").trim();

  useEffect(() => {
    const fetchShippingFee = async () => {
      if (
        currentAddress?.city?.name &&
        currentAddress?.district?.name &&
        currentAddress?.ward?.name &&
        items.length > 0
      ) {
        const cleanedCity = cleanLocationName(currentAddress.city.name);
        const cleanedDistrict = cleanLocationName(currentAddress.district.name);
        const cleanedWard = cleanLocationName(currentAddress.ward.name);

        const validItems = items.filter(
          (item) =>
            item &&
            item.productVariantId &&
            typeof item.productVariantId === "object" &&
            item.productVariantId !== null
        );

        const totalPrice = validItems.reduce((sum, item) => {
          const price = getPriceForSize(item);
          if (!price || !item.quantity) return sum;
          return sum + price * item.quantity;
        }, 0);

        const totalWeight = validItems.reduce((sum, item) => {
          return sum + (item.quantity || 0) * 300;
        }, 0);

        const totalHeight = validItems.reduce((sum, item) => {
          return sum + (item.quantity || 0) * 4;
        }, 0);

        try {
          setIsFetchingShippingFee(true);
          const res = await axiosInstance.post("/cart/fee", {
            cityName: cleanedCity,
            districtName: cleanedDistrict,
            wardName: cleanedWard,
            insurance_value: totalPrice,
            total_weight: totalWeight,
            total_height: totalHeight,
            total_length: 25, // cố định
            total_width: 20, // cố định
          });
          setShippingFee(res.data.shippingFee);
        } catch (error) {
          console.error("Lỗi lấy phí vận chuyển:", error);
          setShippingFee(0);
        } finally {
          setIsFetchingShippingFee(false);
        }
      }
    };

    fetchShippingFee();
  }, [currentAddress, items]);

  // Hàm helper để tạo items payload với version
  const createItemsPayload = (validItems: ICartItem[]) => {
    return validItems.map((item) => ({
      productVariantId: item.productVariantId._id,
      productName: item.productVariantId.productId?.name || "Unnamed Product",
      price: getPriceForSize(item),
      quantity: item.quantity,
      size: item.size,
      version: (item.productVariantId as any).version || 0, // Thêm version từ variant
    }));
  };

  const handlePayment = async () => {
    if (!auth.user.id) {
      toast.error("Bạn cần đăng nhập để thực hiện thanh toán");
      return;
    }

    const currentAddress = selectedAddress || userData[0];
    const addressStr =
      currentAddress.address +
      ", " +
      currentAddress.district.name +
      ", " +
      currentAddress.ward.name +
      ", " +
      currentAddress.city.name;

    try {
      if (paymentMethod === "cod") {
        setisPending(true);
        const payload = {
          orderId: "COD_" + new Date().getTime(),
          items: createItemsPayload(validItems), // Sử dụng helper function
          totalPrice: totalPrice || 0,
          receiver: {
            name: currentAddress.receiver_name,
            cityName: currentAddress.city?.name || "",
            districtName: currentAddress.district?.name || "",
            wardName: currentAddress.ward?.name || "",
            phone: currentAddress.phone,
            address: currentAddress.address || "",
            type: currentAddress.type || "home",
          },
          paymentMethod: "COD",
          voucherCode: voucher || null,
        };

        try {
          await axiosInstance.post(
            `${import.meta.env.VITE_API_URL}/orders`,
            payload
          );

          await axiosInstance.get(`${import.meta.env.VITE_API_URL}/cart/clear`);
          setisPending(false);
          toast.success("Đặt hàng thành công!");
          navigate(
            `/ordersuccess/${payload.orderId}?orderId=${payload.orderId}`
          );
        } catch (error: any) {
          throw new Error(
            error.response?.data?.message || "Thanh toán thất bại"
          );
        }
      } else if (paymentMethod === "momo") {
        if (totalPrice < 1000 || totalPrice > 50000000) {
          toast.error("Số tiền thanh toán phải từ 1.000đ đến 50.000.000đ");
          return;
        }

        setisPending(true);
        const orderId = "MoMo_" + new Date().getTime();

        const payload = {
          orderId,
          items: createItemsPayload(validItems), // Sử dụng helper function
          receiver: {
            name: currentAddress.receiver_name,
            cityName: currentAddress.city?.name || "",
            districtName: currentAddress.district?.name || "",
            wardName: currentAddress.ward?.name || "",
            phone: currentAddress.phone,
            address: currentAddress.address || "",
            type: currentAddress.type || "home",
          },
          totalPrice: totalPrice || 0,
          address: addressStr,
          paymentMethod: "MoMo",
          orderInfo: "Thanh toán qua MoMo",
          extraData: btoa(JSON.stringify({ orderId })),
          orderGroupId: "",
          paymentUrl: "",
          voucherCode: voucher || null,
        };

        try {
          const momoPayload = {
            orderId: payload.orderId,
            items: createItemsPayload(validItems), // Sử dụng helper function
            totalPrice: payload.totalPrice,
            receiver: {
              name: payload.receiver.name,
              cityName: payload.receiver.cityName,
              districtName: payload.receiver.districtName,
              wardName: payload.receiver.wardName,
              phone: payload.receiver.phone,
              address: payload.receiver.address,
              type: payload.receiver.type,
            },
            voucherCode: voucher || null,
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
          setisPending(false);
          window.location.href = momoResponse.data.payUrl;
        } catch (error: any) {
          console.error("Lỗi thanh toán MoMo:", error);
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Có lỗi xảy ra khi thanh toán MoMo";
          toast.error(errorMessage);
        }
      } else if (paymentMethod === "zalopay") {
        setisPending(true);
        const transID = Math.floor(Math.random() * 1000000);
        const orderId = `${moment().format("YYMMDD")}_${transID}`;

        const payload = {
          orderId: orderId,
          receiver: {
            name: currentAddress.receiver_name,
            cityName: currentAddress.city?.name || "",
            districtName: currentAddress.district?.name || "",
            wardName: currentAddress.ward?.name || "",
            phone: currentAddress.phone,
            address: currentAddress.address || "",
            type: currentAddress.type || "home",
          },
          items: createItemsPayload(validItems), // Sử dụng helper function
          totalPrice: totalPrice || 0,
          paymentMethod: "zalopay",
          orderInfo: "Thanh toán qua ZaloPay",
          extraData: "",
          orderGroupId: "",
          paymentUrl: "",
          voucherCode: voucher || null,
        };

        const zaloPayload = {
          orderId: payload.orderId,
          receiver: {
            name: payload.receiver.name,
            cityName: payload.receiver.cityName,
            districtName: payload.receiver.districtName,
            wardName: payload.receiver.wardName,
            phone: payload.receiver.phone,
            address: payload.receiver.address,
            type: payload.receiver.type,
          },
          items: createItemsPayload(validItems), // Sử dụng helper function
          totalPrice: totalPrice,
          voucherCode: voucher || null,
          orderInfo: payload.orderInfo,
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
          setisPending(false);
          window.location.href = zaloResponse.data.order_url;
        } catch (error) {
          console.error("Lỗi ZaloPay:", error);
          throw error;
        }
      }
    } catch (error: any) {
      console.error("Lỗi thanh toán:", error?.message);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Có lỗi xảy ra khi thanh toán"
      );
      setisPending(false);
    }
  };

  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedVoucherId, setAppliedVoucherId] = useState("");

  const handleApplyVoucher = async () => {
    if (!voucher) {
      toast.warning("Vui lòng nhập mã voucher");
      return;
    }

    try {
      const res = await axiosInstance.post("/vouchers/apply", {
        code: voucher,
        userId: auth.user.id,
        cartTotal: totalPrice,
      });

      setDiscountAmount(res.data.discount);
      setAppliedVoucherId(res.data.voucherId);
      toast.success(
        `Áp dụng thành công. Giảm ${res.data.discount.toLocaleString("vi-VN")}đ`
      );
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Mã giảm giá không hợp lệ");
      setDiscountAmount(0);
      setAppliedVoucherId("");
    }
  };

  return (
    <>
      {content ? (
        content
      ) : (
        <ClientLayout>
          <article className="mt-[100px]">
            <article className="grid grid-cols-[4fr_1.5fr] gap-10 mt-[100px]">
              <div>
                <div className="grid grid-cols-2 gap-10 items-stretch">
                  <div className="h-full flex flex-col">
                    <div className="text-[20px] font-semibold py-6">
                      Địa chỉ giao hàng
                    </div>
                    <div className="border p-6 rounded-tl-[28px] rounded-br-[28px]">
                      <div className="flex justify-between">
                        <div className="text-base font-semibold">
                          {currentAddress.receiver_name}
                        </div>
                        <div className="flex gap-4">
                          <button
                            onClick={() => setShowAddressModal(true)}
                            className="text-[14px] underline hover:text-black transition"
                          >
                            Chọn địa chỉ khác
                          </button>
                        </div>
                      </div>
                      <div className="py-0 text-[14px]">
                        Điện thoại: {currentAddress.phone}
                      </div>
                      <div className="py-0 text-[14px]">
                        Loại địa chỉ:
                        {currentAddress.type === "home" ? " Nhà ở" : " Công ty"}
                      </div>
                      <div className="py-0 text-[14px]">Địa chỉ: {address}</div>
                    </div>
                  </div>
                  <div className="h-full flex flex-col">
                    <div className="text-[20px] font-semibold py-6">
                      Phương thức thanh toán
                    </div>
                    <div className="border p-6 rounded-tl-[25px] rounded-br-[25px]">
                      <div className="flex flex-col gap-2">
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
                      <div className="text-xs mt-3 w-full">
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
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="py-1 px-4 text-sm border border-black rounded-tl-[15px] rounded-br-[15px] hover:bg-black hover:text-white transition-all duration-300"
                  >
                    + Thêm địa chỉ
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
                          validItems.map((item: ICartItem, index: number) => {
                            const itemPrice = getPriceForSize(item);
                            return (
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
                                          item?.productVariantId?.productId
                                            ?.name || "Product"
                                        }
                                        className="w-18 h-[100px] object-cover rounded transition-opacity duration-300 ease-in-out opacity-100 group-hover:opacity-0"
                                        onError={(e) =>
                                          (e.currentTarget.src =
                                            "/fallback.jpg")
                                        }
                                      />
                                      <img
                                        src={
                                          item?.productVariantId?.images?.hover
                                            ?.url || "/fallback.jpg"
                                        }
                                        alt={
                                          item?.productVariantId?.productId
                                            ?.name || "Product"
                                        }
                                        className="w-18 h-[100px] object-cover rounded absolute top-0 left-0 transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100"
                                        onError={(e) =>
                                          (e.currentTarget.src =
                                            "/fallback.jpg")
                                        }
                                      />
                                    </Link>
                                    <div>
                                      <Link
                                        to={`/products/${encodeURIComponent(
                                          item?.productVariantId?._id || ""
                                        )}`}
                                        className="hover:text-orange-600 transition-all duration-300 font-medium"
                                      >
                                        {item?.productVariantId?.productId
                                          ?.name || "Unnamed Product"}
                                      </Link>
                                      <div className="text-base text-gray-600 mt-1">
                                        Màu sắc:{" "}
                                        {item.productVariantId?.color
                                          ?.colorName || "Không có"}
                                      </div>
                                    </div>
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
                                  {itemPrice.toLocaleString("vi-VN")} đ
                                </td>
                                <td className="pr-4 py-2 text-sm text-gray-700">
                                  {(
                                    itemPrice * (item?.quantity || 0)
                                  ).toLocaleString("vi-VN")}{" "}
                                  đ
                                </td>
                              </tr>
                            );
                          })
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
                      <div>{shippingFee.toLocaleString("vi-VN")}đ</div>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between mt-2 text-green-600">
                        <div>Giảm giá voucher</div>
                        <div>-{discountAmount.toLocaleString("vi-VN")}đ</div>
                      </div>
                    )}
                    <div className="flex justify-between mt-2 font-semibold">
                      <div>Tiền thanh toán</div>
                      <div>
                        {(
                          totalPrice -
                          discountAmount +
                          shippingFee
                        ).toLocaleString("vi-VN")}
                        đ
                      </div>
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
                          className="border border-black rounded-tl-[15px] rounded-br-[15px] w-24 h-10 flex justify-center items-center hover:bg-black hover:text-white transition-all duration-300"
                          onClick={handleApplyVoucher}
                          type="button"
                        >
                          Áp dụng
                        </button>
                      </div>
                    )}
                    {voucherTab === "ma-cua-toi" && (
                      <div className="mb-2 text-gray-500 text-sm">
                        Bạn chưa có mã nào.
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <button
                    onClick={handlePayment}
                    disabled={validItems.length === 0 || isFetchingShippingFee}
                    className={`bg-black w-full h-[50px] rounded-tl-2xl rounded-br-2xl flex items-center justify-center lg:text-[16px] md:text-[12px] text-white font-semibold
    ${
      validItems.length === 0 || isFetchingShippingFee
        ? "opacity-50 cursor-not-allowed"
        : "hover:bg-white hover:text-black hover:border hover:border-black cursor-pointer"
    } transition-all duration-300`}
                  >
                    {isFetchingShippingFee
                      ? "ĐANG TÍNH PHÍ..."
                      : validItems.length === 0
                      ? "GIỎ HÀNG TRỐNG"
                      : isPending
                      ? "ĐANG XỬ LÝ..."
                      : "HOÀN THÀNH"}
                  </button>
                </div>
              </div>
            </article>
          </article>
        </ClientLayout>
      )}
      {showAddModal && (
        <AddAddressModal
          defaultAddressId={userData[0]?._id || null}
          onClose={() => setShowAddModal(false)}
          onSuccess={(newAddressId?: string) => {
            queryClient.invalidateQueries({
              queryKey: ["users", auth.user.id],
            });
            queryClient.invalidateQueries({ queryKey: ["myInfo"] });
            if (newAddressId) setLastAddedAddressId(newAddressId);
          }}
        />
      )}
      {showAddressModal && (
        <SelectAddressModal
          addresses={shipping_addresses}
          defaultAddressId={defaultAddressId}
          selectedAddressId={selectedAddress?._id}
          onSelect={(address: any) => {
            if (selectedAddress?._id !== address._id) {
              setShippingFee(0);
              setSelectedAddress(address);
            }
            setShowAddressModal(false);
          }}
          onClose={() => setShowAddressModal(false)}
        />
      )}
    </>
  );
};

export default Dathang;
