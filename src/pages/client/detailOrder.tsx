import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MenuInfo from "../../components/menuInfo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getById } from "../../api/provider";
import Loading from "../../components/loading";
import ClientLayout from "../../layouts/clientLayout";
import { useAddToCart } from "../../hooks/useAddToCart";
import { useAuth } from "../../context/auth.context";
import { toast } from "react-toastify";
import ReviewForm from "../../components/reviewForm";
import ReviewList from "../../components/reviewList";
import axiosInstance from "../../services/axiosInstance";
import ReviewItem from "../../components/reviewItem";
import Swal from "sweetalert2";

const Detail_order = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const addToCartMutation = useAddToCart();
  const [open, setOpen] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [showReviewForm, setShowReviewForm] = useState<null | {
    orderId: string;
    productVariantId: string;
    mode?: "create" | "edit";
    initialData?: {
      _id: string;
      rating: number;
      comment: string;
      images: { url: string; public_id: string }[];
    };
  }>(null);

  const [showComplaintForm, setShowComplaintForm] = useState(false);

  const { data: reviewList = [] } = useQuery({
    queryKey: ["reviews", id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/reviews?orderId=${id}`);
      return res.data;
    },
  });
  const { data, isLoading } = useQuery({
    queryKey: ["orders", id],
    queryFn: () => getById({ namespace: "orders", id: id }),
  });

  const itemsWithReview = data?.items?.map((item: any) => {
    const review = reviewList.find(
      (r: any) =>
        r.productVariantId === item.productVariantId && r.orderId === data._id
    );
    const productInfo = item.productInfo || {};
    const productName =
      productInfo.product?.name || item.productName || "Không có tên";
    let price = item.price;
    if (productInfo.sizes && item.size) {
      const sizeObj = productInfo.sizes.find((s: any) => s.size === item.size);
      if (sizeObj && sizeObj.price) {
        price = sizeObj.price;
      }
    }
    return {
      ...item,
      review,
      productInfo,
      productName,
      price,
    };
  });

  

  // Mutation xác nhận đã nhận hàng
  const { mutate: confirmReceived, isPending: isConfirming } = useMutation({
    mutationFn: async () => {
      await axiosInstance.post(
        `/orders/orders/${data.orderId}/confirm-received`
      );
    },
    onSuccess: () => {
      toast.success("Xác nhận đã nhận hàng thành công!");
      queryClient.invalidateQueries({ queryKey: ["orders", id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    },
  });

  // Mutation khiếu nại
  const { mutate: createComplaint, isPending: isComplaining } = useMutation({
    mutationFn: async (complaintData: {
      reason: string;
      description: string;
      images?: string[];
    }) => {
      await axiosInstance.post(
        `/orders/orders/${data.orderId}/complaint`,
        complaintData
      );
    },
    onSuccess: () => {
      toast.success("Khiếu nại đã được gửi thành công!");
      setShowComplaintForm(false);
      queryClient.invalidateQueries({ queryKey: ["orders", id] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi gửi khiếu nại"
      );
    },
  });
  if (isLoading) return <Loading />;
  if (!data)
    return (
      <div className="p-10 text-center text-red-500">
        Không tìm thấy đơn hàng.
      </div>
    );

  const handleViewReview = (variantId: string) => {
    setSelectedVariantId(variantId);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedVariantId("");
  };

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
  const handleConfirmReceived = () => {
    if (window.confirm("Bạn có chắc chắn đã nhận được hàng?")) {
      confirmReceived();
    }
  };

  const handleSubmitComplaint = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const reason = formData.get("reason") as string;
    const description = formData.get("description") as string;

    if (!reason || !description) {
      toast.error("Vui lòng điền đầy đủ thông tin khiếu nại");
      return;
    }

    createComplaint({ reason, description });
  };

  // Hàm hủy đơn hàng
  const handleCancelOrder = async () => {
    // Hiển thị form nhập lý do hủy đơn
    const { value: formValues } = await Swal.fire({
      title: "Hủy đơn hàng",
      html: `
        <div class="text-left">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Lý do hủy đơn <span class="text-red-500">*</span>
          </label>
          <select id="cancelReason" class="swal2-input" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
            <option value="">Chọn lý do hủy đơn</option>
            <option value="Đổi ý không muốn mua">Đổi ý không muốn mua</option>
            <option value="Tìm được giá rẻ hơn">Tìm được giá rẻ hơn</option>
            <option value="Thông tin sản phẩm không chính xác">Thông tin sản phẩm không chính xác</option>
            <option value="Thời gian giao hàng quá lâu">Thời gian giao hàng quá lâu</option>
            <option value="Khác">Khác</option>
          </select>
          <label class="block text-sm font-medium text-gray-700 mb-2 mt-4">
            Ghi chú thêm (tùy chọn)
          </label>
          <textarea id="cancelNote" class="swal2-textarea" placeholder="Nhập ghi chú thêm nếu có..." style="width: 100%; min-height: 80px; padding: 10px; border: 1px solid #ddd; border-radius: 5px; resize: vertical;"></textarea>
          
          ${
            data.paymentStatus === "Đã thanh toán"
              ? `
            <div class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p class="text-sm text-blue-800">
                <strong>📝 Thông báo:</strong> Đơn hàng đã thanh toán sẽ được hoàn tiền tự động trong vòng 1-3 ngày làm việc.
              </p>
              <p class="text-sm text-blue-700 mt-1">
                Số tiền hoàn: <strong>${data.finalAmount.toLocaleString(
                  "vi-VN"
                )}đ</strong>
              </p>
            </div>
          `
              : ""
          }
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Xác nhận hủy",
      cancelButtonText: "Đóng",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      focusConfirm: false,
      preConfirm: () => {
        const reason = (
          document.getElementById("cancelReason") as HTMLSelectElement
        )?.value;
        const note = (
          document.getElementById("cancelNote") as HTMLTextAreaElement
        )?.value;

        if (!reason) {
          Swal.showValidationMessage("Vui lòng chọn lý do hủy đơn");
          return false;
        }

        return {
          reason: reason,
          note: note,
        };
      },
    });

    if (!formValues) return;

    // Xác nhận cuối cùng
    const confirmResult = await Swal.fire({
      title: "Xác nhận hủy đơn hàng?",
      html: `
        <div class="text-left">
          <p><strong>Mã đơn hàng:</strong> ${data.orderId}</p>
          <p><strong>Lý do:</strong> ${formValues.reason}</p>
          ${
            formValues.note
              ? `<p><strong>Ghi chú:</strong> ${formValues.note}</p>`
              : ""
          }
          ${
            data.paymentStatus === "Đã thanh toán"
              ? `
            <div class="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p class="text-sm text-yellow-800">
                ⚠️ Đơn hàng đã thanh toán sẽ được hoàn tiền tự động
              </p>
            </div>
          `
              : ""
          }
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hủy đơn",
      cancelButtonText: "Quay lại",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
    });

    if (!confirmResult.isConfirmed) return;

    try {
      const res = await axiosInstance.post("orders/cancel", {
        orderId: data.orderId,
        cancelBy: "buyer",
        reason: formValues.reason,
        note: formValues.note,
      });

      // Hiển thị thông báo thành công với thông tin hoàn tiền nếu có
      let successMessage = res.data.message || "Hủy đơn hàng thành công";

      if (res.data.refundInfo && res.data.refundInfo.requiresRefund) {
        successMessage += `\n💰 Hoàn tiền: ${res.data.refundInfo.amount.toLocaleString(
          "vi-VN"
        )}đ`;
        if (res.data.refundInfo.autoRefund) {
          successMessage += `\n✅ ${res.data.refundInfo.message}`;
        } else {
          successMessage += `\n⏳ Hoàn tiền đang được xử lý`;
        }
      }

      await Swal.fire({
        title: "Hủy đơn hàng thành công!",
        text: successMessage,
        icon: "success",
        confirmButtonColor: "#059669",
      });

      // Refresh data để cập nhật trạng thái
      queryClient.invalidateQueries({ queryKey: ["orders", id] });

      // Chuyển về trang quản lý đơn hàng
      navigate("/orders");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Hủy đơn hàng thất bại";

      await Swal.fire({
        title: "Hủy đơn hàng thất bại",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#dc2626",
      });
    }
  };

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
          <div className="p-4 pl-0 font-bold rounded-tl-[40px] rounded-br-[40px] border-gray-700 h-auto mt-2">
            <MenuInfo />
          </div>
          <div className="p-4 pl-0">
            <div className="flex justify-between mb-6">
              <h2 className="text-2xl font-semibold">
                Chi tiết đơn hàng
                <span className="text-red-600 ml-2">#{data.orderId}</span>
              </h2>
              <div className="flex flex-col items-end text-sm">
                <span className="text-red-500">
                  TT thanh toán: {data.paymentStatus}
                </span>
                <span className="text-red-500">
                  TT giao hàng: {data.shippingStatus}
                </span>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row justify-between">
              <div className="grid grid-cols-1">
                {itemsWithReview?.map((item: any, index: any) => (
                  <div key={index} className="flex-1">
                    <div className="flex gap-4">
                      <img
                        src={
                          item.productInfo?.images?.main?.url
                            ? item.productInfo.images.main.url
                            : "https://via.placeholder.com/150x215?text=No+Image"
                        }
                        alt={item.productName}
                        className="w-[100px] h-[165px] object-cover"
                      />
                      <div className="flex flex-col justify-between">
                        <div key={index}>
                          <div className="flex justify-between gap-[110px]">
                            <div className="font-semibold">
                              {item.productName}
                            </div>
                            <div className="font-semibold">
                              {Number(item.price || 0).toLocaleString("vi-VN")}đ
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 py-0.5">
                            Màu sắc:{" "}
                            {item.productInfo?.color?.colorName ||
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
                            {item.productInfo?.sku || item.sku || "Không có"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleBuyAgain(item)}
                            className="w-fit mt-2 px-4 py-1 border border-black rounded-tl-[8px] rounded-bl-none rounded-tr-none rounded-br-[8px] hover:bg-black hover:text-white transition"
                          >
                            MUA LẠI
                          </button>
                          {data.shippingStatus?.toLowerCase() ===
                            "đã nhận hàng" && (
                            <>
                              {!item.review ? (
                                <button
                                  onClick={() =>
                                    setShowReviewForm({
                                      orderId: data._id,
                                      productVariantId: item.productVariantId,
                                    })
                                  }
                                  className="w-fit mt-2 px-4 py-1 border border-black bg-black text-white rounded-tl-[8px] rounded-bl-none rounded-tr-none rounded-br-[8px] hover:bg-white hover:text-black transition"
                                >
                                  Đánh giá
                                </button>
                              ) : (
                                <div className="flex gap-2 mt-2">
                                  <button
                                    onClick={() =>
                                      handleViewReview(item.productVariantId)
                                    }
                                    className="px-4 py-1 rounded-tl-[8px] rounded-bl-none rounded-tr-none rounded-br-[8px] border border-black bg-black text-white hover:bg-white hover:text-black transition"
                                  >
                                    XEM ĐÁNH GIÁ
                                  </button>
                                  
                                  {item.review?.updatedCount === 0 && (
                                    <>
                                      <button
                                        onClick={() =>
                                          setShowReviewForm({
                                            orderId: data._id,
                                            productVariantId:
                                              item.productVariantId,
                                            mode: "edit",
                                            initialData: item.review,
                                          })
                                        }
                                        className="px-4 py-1 rounded-tl-[8px] rounded-bl-none rounded-tr-none rounded-br-[8px] border border-black bg-black text-white hover:bg-white hover:text-black transition"
                                      >
                                        SỬA
                                      </button>
                                    </>
                                  )}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <hr className="mt-2 w-[600px]" />
                  </div>
                ))}
              </div>

              <div className="w-full lg:w-[320px] bg-[#f7f7f7] p-5 rounded-md text-sm space-y-5 shadow-sm">
                <h3 className="text-base font-semibold pb-3 border-b border-gray-300">
                  Tóm tắt đơn hàng
                </h3>

                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between">
                    <span>Ngày tạo đơn</span>
                    <span className="font-medium">
                      {new Date(data.updatedAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tạm tính</span>
                    <span className="font-medium">
                      {data.totalPrice.toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phí vận chuyển</span>
                    <span className="font-medium">
                      {data.shippingFee.toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Giảm giá</span>
                    <span className="font-medium">
                      {data.discountAmount.toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold pt-3 border-t border-gray-300 mt-2 text-base">
                    <span>Tổng tiền</span>
                    <span>{data.finalAmount.toLocaleString("vi-VN")} đ</span>
                  </div>

                  {/* Hiển thị thông tin hoàn tiền nếu có */}
                  {data.paymentDetails?.refundRequested && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <h5 className="font-semibold text-blue-800 mb-2">
                        💰 Thông tin hoàn tiền
                      </h5>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Số tiền hoàn:</span>
                          <span className="font-medium">
                            {data.paymentDetails.refundAmount?.toLocaleString(
                              "vi-VN"
                            )}{" "}
                            đ
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Trạng thái:</span>
                          <span
                            className={`font-medium ${
                              data.paymentDetails.refundStatus ===
                                "completed" ||
                              data.paymentDetails.refundStatus ===
                                "Đã hoàn thành"
                                ? "text-green-600"
                                : data.paymentDetails.refundStatus ===
                                    "pending" ||
                                  data.paymentDetails.refundStatus ===
                                    "Đang xử lý"
                                ? "text-yellow-600"
                                : data.paymentDetails.refundStatus ===
                                    "failed" ||
                                  data.paymentDetails.refundStatus ===
                                    "Bị từ chối"
                                ? "text-red-600"
                                : "text-blue-600"
                            }`}
                          >
                            {data.paymentDetails.refundStatus === "completed"
                              ? "Đã hoàn thành"
                              : data.paymentDetails.refundStatus === "pending"
                              ? "Đang xử lý"
                              : data.paymentDetails.refundStatus === "failed"
                              ? "Thất bại"
                              : data.paymentDetails.refundStatus ||
                                "Đang xử lý"}
                          </span>
                        </div>
                        {data.paymentDetails.refundRequestedAt && (
                          <div className="flex justify-between">
                            <span>Ngày yêu cầu:</span>
                            <span className="font-medium">
                              {new Date(
                                data.paymentDetails.refundRequestedAt
                              ).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                        )}
                        {data.paymentDetails.refundProcessedAt && (
                          <div className="flex justify-between">
                            <span>Ngày xử lý:</span>
                            <span className="font-medium">
                              {new Date(
                                data.paymentDetails.refundProcessedAt
                              ).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                        )}
                        {data.paymentDetails.refundNote && (
                          <div className="mt-2">
                            <span className="font-medium">Ghi chú:</span>
                            <p className="text-gray-600 mt-1">
                              {data.paymentDetails.refundNote}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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
                  <p className="py-1 text-gray-700">{data.receiver.name}</p>
                  <p className="py-1 text-gray-700">
                    {data.receiver.address}, {data.receiver.communeName},{" "}
                    {data.receiver.districtName}, {data.receiver.cityName}{" "}
                  </p>
                  <p className="py-1 text-gray-700">
                    Điện thoại: {data.receiver.phone}
                  </p>
                </div>
              </div>
            </div>

            {/* Các nút thao tác dựa trên trạng thái đơn hàng */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-3">Thao tác với đơn hàng</h3>

              {/* Nút hủy đơn hàng - chỉ hiển thị khi có thể hủy */}
              {["Chờ xác nhận", "Đã xác nhận"].includes(
                data.shippingStatus
              ) && (
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <button
                    onClick={handleCancelOrder}
                    className="px-4 py-2 bg-red-600 text-white rounded-tl-xl rounded-br-xl hover:bg-red-700 transition"
                  >
                    Hủy đơn hàng
                  </button>
                  <p className="text-sm text-gray-600 mt-2">
                    Bạn có thể hủy đơn hàng trước khi bắt đầu giao hàng
                  </p>
                </div>
              )}

              {data.shippingStatus === "Giao hàng thành công" && (
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={handleConfirmReceived}
                    disabled={isConfirming}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {isConfirming ? "Đang xử lý..." : "✓ Xác nhận đã nhận hàng"}
                  </button>

                  <button
                    onClick={() => setShowComplaintForm(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    ⚠ Khiếu nại chưa nhận hàng
                  </button>
                </div>
              )}

              {data.shippingStatus === "Đang giao hàng" && (
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowComplaintForm(true)}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                  >
                    ⚠ Báo cáo vấn đề giao hàng
                  </button>
                </div>
              )}

              {data.shippingStatus === "Đã nhận hàng" && (
                <div className="text-green-600 font-medium">
                  ✓ Bạn đã xác nhận nhận hàng thành công
                </div>
              )}

              {(data.shippingStatus === "Khiếu nại" ||
                data.shippingStatus === "Đang xử lý khiếu nại") && (
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <div className="text-yellow-800 font-medium mb-2">
                    📋 Trạng thái khiếu nại: {data.shippingStatus}
                  </div>
                  {data.complaint && (
                    <div className="text-sm text-gray-700">
                      <p>
                        <strong>Lý do:</strong> {data.complaint.reason}
                      </p>
                      <p>
                        <strong>Mô tả:</strong> {data.complaint.description}
                      </p>
                      <p>
                        <strong>Ngày tạo:</strong>{" "}
                        {new Date(data.complaint.createdAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </p>
                      <p>
                        <strong>Trạng thái:</strong> {data.complaint.status}
                      </p>
                      {data.complaint.adminNote && (
                        <p>
                          <strong>Ghi chú admin:</strong>{" "}
                          {data.complaint.adminNote}
                        </p>
                      )}
                      {data.complaint.resolution && (
                        <p>
                          <strong>Cách giải quyết:</strong>{" "}
                          {data.complaint.resolution}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {data.shippingStatus === "Khiếu nại được giải quyết" && (
                <div className="bg-green-100 p-3 rounded-lg">
                  <div className="text-green-800 font-medium mb-2">
                    ✅ Khiếu nại đã được giải quyết
                  </div>
                  {data.complaint && (
                    <div className="text-sm text-gray-700">
                      <p>
                        <strong>Cách giải quyết:</strong>{" "}
                        {data.complaint.resolution}
                      </p>
                      {data.complaint.adminNote && (
                        <p>
                          <strong>Ghi chú:</strong> {data.complaint.adminNote}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {data.shippingStatus === "Khiếu nại bị từ chối" && (
                <div className="bg-red-100 p-3 rounded-lg">
                  <div className="text-red-800 font-medium mb-2">
                    ❌ Khiếu nại bị từ chối
                  </div>
                  {data.complaint?.adminNote && (
                    <div className="text-sm text-gray-700">
                      <p>
                        <strong>Lý do từ chối:</strong>{" "}
                        {data.complaint.adminNote}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-8">
              <button
                className="bg-black text-white px-6 py-2 rounded-tl-[8px] rounded-bl-none rounded-tr-none rounded-br-[8px] hover:opacity-90 transition"
                onClick={() => navigate(`/order-follow/${data._id}`)}
              >
                THEO DÕI ĐƠN HÀNG
              </button>
            </div>
          </div>
        </div>
      </article>

      {showComplaintForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4 relative">
            <button
              onClick={() => setShowComplaintForm(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl"
            >
              ✕
            </button>

            <h3 className="text-lg font-semibold mb-4">Khiếu nại đơn hàng</h3>

            <form onSubmit={handleSubmitComplaint} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Lý do khiếu nại <span className="text-red-500">*</span>
                </label>
                <select
                  name="reason"
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Chọn lý do khiếu nại</option>
                  <option value="Chưa nhận được hàng">
                    Chưa nhận được hàng
                  </option>
                  <option value="Hàng bị hư hỏng">Hàng bị hư hỏng</option>
                  <option value="Sai sản phẩm">Sai sản phẩm</option>
                  <option value="Thiếu hàng">Thiếu hàng</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Mô tả chi tiết <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  placeholder="Vui lòng mô tả chi tiết vấn đề bạn gặp phải..."
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="text-sm text-gray-600">
                <p>• Khiếu nại sẽ được xử lý trong vòng 24-48h</p>
                <p>
                  • Chúng tôi sẽ liên hệ với bạn qua email hoặc số điện thoại
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowComplaintForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isComplaining}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                >
                  {isComplaining ? "Đang gửi..." : "Gửi khiếu nại"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showReviewForm && (
        <>
          {console.log("showReviewForm:", showReviewForm)}
          <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg max-w-md w-full relative">
              <button
                onClick={() => setShowReviewForm(null)}
                className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
              >
                ✕
              </button>
              <ReviewForm
                mode={showReviewForm.mode}
                orderId={showReviewForm.orderId}
                productVariantId={showReviewForm.productVariantId}
                initialData={showReviewForm.initialData}
                onSuccess={() => {
                  setShowReviewForm(null);
                  window.location.reload();
                }}
              />
            </div>
          </div>
        </>
      )}

      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-xl w-full max-w-xl">
            <ReviewItem
              productVariantId={selectedVariantId}
              orderId={data._id}
              userId={auth.user?.id}
            />
            <div className="text-right mt-4">
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </ClientLayout>
  );
};

export default Detail_order;
