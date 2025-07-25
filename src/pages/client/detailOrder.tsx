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
      r.productVariantId === item.productVariantId._id &&
      r.orderId === data._id
  );

  return {
    ...item,
    review,
  };
});

const { mutate: deleteReview,   isPending: isDeleting } = useMutation({
  mutationFn: async (reviewId: string) => {
    await axiosInstance.delete(`/reviews/${reviewId}`);
  },
  onSuccess: () => {
    toast.success("Xóa đánh giá thành công");
     queryClient.invalidateQueries({ queryKey: ["orders", id] }); 
     queryClient.invalidateQueries({ queryKey: ["reviews", id] });

  },
  onError: () => {
    toast.error("Xóa đánh giá thất bại");
  },
});
  if (isLoading) return <Loading />;
  if (!data) return <div className="p-10 text-center text-red-500">Không tìm thấy đơn hàng.</div>;

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
const handleDeleteReview = (reviewId: string) => {
  if (!reviewId) {
    console.error("Không tìm thấy reviewId", reviewId);
    toast.error("Không tìm thấy ID đánh giá để xóa");
    return;
  }


  deleteReview(reviewId);
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
              <button className="text-sm text-red-500 hover:underline">
                {data.status}
              </button>
            </div>

            <div className="flex flex-col lg:flex-row justify-between">
              <div className="grid grid-cols-1">
                {itemsWithReview?.map((item: any, index: any) => (
                  <div key={index} className="flex-1">
                    <div className="flex gap-4">
                      <img
                        src={
                            item.productVariantId?.images?.main?.url
                              ? item.productVariantId.images.main.url
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
                              {item.price.toLocaleString("vi-VN")}đ
                              </div>
                          </div>
                          <p className="text-sm text-gray-600 py-0.5">
                            Màu sắc: {item.productVariantId?.color?.colorName || item.colo|| "Không có"}
                            </p>
                          <p className="text-sm text-gray-600 py-0.5">Size: {item.size}</p>
                          <p className="text-sm text-gray-600 py-0.5">Số lượng: {item.quantity}</p>
                          <p className="text-sm text-gray-600 py-0.5">SKU: {item.productVariantId?.sku || item.sku || "Không có"}</p>
                        </div>
                        <div className="flex gap-2">
                           <button
                          onClick={() => handleBuyAgain(item)}
                          className="w-fit mt-2 px-4 py-1 border border-black rounded-tl-[8px] rounded-bl-none rounded-tr-none rounded-br-[8px] hover:bg-black hover:text-white transition"
                        >
                          MUA LẠI
                        </button>
                       {data.status.toLowerCase() === "giao hàng thành công" && (
                            <>
                              {!item.review ? (
                                <button
                                  onClick={() =>
                                    setShowReviewForm({
                                      orderId: data._id,
                                      productVariantId: item.productVariantId._id,
                                    })
                                  }
                                  className="w-fit mt-2 px-4 py-1 border border-black bg-black text-white rounded-tl-[8px] rounded-bl-none rounded-tr-none rounded-br-[8px] hover:bg-white hover:text-black transition"
                                >
                                  Đánh giá
                                </button>
                              ) : (
                                <div className="flex gap-2 mt-2">
                                  <button
                                    onClick={() => handleViewReview(item.productVariantId._id)}
                                    className="px-4 py-1 rounded-tl-[8px] rounded-bl-none rounded-tr-none rounded-br-[8px] border border-black bg-black text-white hover:bg-white hover:text-black transition"
                                  >
                                    XEM ĐÁNH GIÁ
                                  </button>
                                  <button
                                    onClick={() =>
                                      setShowReviewForm({
                                        orderId: data._id,
                                        productVariantId: item.productVariantId._id,
                                        mode: "edit",
                                        initialData: item.review,
                                      })
                                    }
                                    className="px-4 py-1 rounded-tl-[8px] rounded-bl-none rounded-tr-none rounded-br-[8px] border border-black bg-black text-white hover:bg-white hover:text-black transition"
                                  >
                                    SỬA
                                  </button>
                                  <button
                                    className="px-4 py-1 rounded-tl-[8px] rounded-bl-none rounded-tr-none rounded-br-[8px] border border-black bg-black text-white hover:bg-white hover:text-black transition"
                                    onClick={() => handleDeleteReview(item.review?._id)}
                                    disabled={isDeleting}
                                  >
                                    {isDeleting ? "Đang xóa..." : "XÓA"}
                                  </button>
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
                    <span className="font-medium">{data.shippingFee.toLocaleString("vi-VN")} đ</span>
                    </div>
                  <div className="flex justify-between">
                    <span>Giảm giá</span>
                    <span className="font-medium">{data.discountAmount.toLocaleString("vi-VN")} đ</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-3 border-t border-gray-300 mt-2 text-base">
                    <span>Tổng tiền</span>
                    <span>
                      {data.finalAmount.toLocaleString("vi-VN")} đ
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
                  <p className="py-1 text-gray-700">{data.receiver.name}</p>
                  <p className="py-1 text-gray-700">{data.receiver.address}, {data.receiver.communeName}, {data.receiver.districtName}, {data.receiver.cityName} </p>
                  <p className="py-1 text-gray-700">
                    Điện thoại: {data.receiver.phone}
                  </p>
                </div>
              </div>
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

      {showReviewForm && (
        <>
            {console.log("showReviewForm:", showReviewForm)}
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          
          <div className="bg-white p-6 rounded-lg max-w-md w-full relative">
            <button onClick={() => setShowReviewForm(null)} className="absolute top-2 right-2 text-gray-500 hover:text-red-500">✕</button>
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
            <ReviewItem productVariantId={selectedVariantId} orderId={data._id} userId={auth.user?.id} />
            <div className="text-right mt-4">
              <button onClick={handleClose} className="px-4 py-2 bg-gray-300 rounded">Đóng</button>
            </div>
          </div>
        </div>
      )}
    </ClientLayout>
  );
};

export default Detail_order;
