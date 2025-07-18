import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getList } from "../api/provider";
import { Rate } from "antd";
import dayjs from "dayjs";

interface ReviewListProps {
  productVariantId: string;
  orderId?: string;
  userId?: string;
}

const ReviewList: React.FC<ReviewListProps> = ({
  productVariantId,
  orderId,
  userId,
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["reviews", productVariantId],
    queryFn: () =>
      getList({
        namespace: `reviews/${productVariantId}`,
      }),
  });

  const reviews = data?.data || [];

  const myReview = userId
    ? reviews.find((review: any) => review.userId?._id === userId)
    : null;

  const otherReviews = userId
    ? reviews.filter((review: any) => review.userId?._id !== userId)
    : reviews;

  const renderReview = (review: any, isMine = false) => (
    <div
      key={review._id}
      className={`rounded-tl-2xl rounded-br-2xl p-5 bg-white  transition-all hover:shadow-md border ${
        isMine ? "border-blue-500" : "border-gray-200"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <img
            src="../../public/images/user.png"
            alt="avatar"
            className="w-8 h-8 rounded-full object-cover border"
          />
          <div className="text-sm font-medium text-gray-800">
            {review.userId?.name || "Người dùng"} {isMine && "(Bạn)"}
          </div>
        </div>
        <div className="text-xs text-gray-500">
          {dayjs(review.createdAt).format("DD/MM/YYYY")}
        </div>
      </div>

      <Rate disabled defaultValue={review.rating} className="mb-2 text-yellow-500" />

      <p className="text-sm text-gray-700 mb-3 whitespace-pre-wrap">{review.comment}</p>

      {review.images?.length > 0 && (
        <div className="flex gap-3 flex-wrap ">
          {review.images.map((img: any, index: number) => (
            <img
              key={index}
              src={img.url}
              alt={`review-${index}`}
              className="w-20 h-20 rounded border object-cover hover:scale-105 transition-all duration-200 "
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="mt-6">
      <h3 className="text-2xl font-bold mb-6 text-gray-800">Đánh giá sản phẩm</h3>

      {isLoading ? (
        <p>Đang tải đánh giá...</p>
      ) : error ? (
        <p className="text-red-500">Lỗi khi tải đánh giá.</p>
      ) : reviews.length === 0 ? (
        <p className="text-gray-600">Chưa có đánh giá nào cho sản phẩm này.</p>
      ) : (
        <div className="space-y-5 max-h-[600px] overflow-y-auto pr-2">
          {myReview && renderReview(myReview, true)}
          {otherReviews.map((review: any) => renderReview(review))}
        </div>
      )}
    </div>
  );
};

export default ReviewList;
