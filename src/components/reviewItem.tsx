import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Rate, Empty, Spin } from "antd";
import axiosInstance from "../services/axiosInstance";
import dayjs from "dayjs";

interface ReviewListProps {
  productVariantId: string;
  orderId?: string;
  userId?: string;
}

const ReviewItem: React.FC<ReviewListProps> = ({
  productVariantId,
  orderId,
  userId,
}) => {
  const [expandedReviewIds, setExpandedReviewIds] = useState<string[]>([]);

  const { data: resData, isLoading, error } = useQuery({
    queryKey: ["reviews", productVariantId, orderId],
    queryFn: async () => {
      if (!productVariantId) return [];
      if (orderId) {
        const res = await axiosInstance.get("reviews", {
          params: { orderId },
        });
        return res.data.filter(
          (review: any) => review.productVariantId === productVariantId
        );
      } else {
        const res = await axiosInstance.get(`reviews/${productVariantId}`);
        return res.data;
      }
    },
    enabled: !!productVariantId,
  });

  const allReviews = Array.isArray(resData?.data)
    ? resData.data
    : Array.isArray(resData)
    ? resData
    : [];

  const toggleExpand = (id: string) => {
    setExpandedReviewIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const MAX_COMMENT_LENGTH = 50;

  const renderReview = (review: any) => {
    const isExpanded = expandedReviewIds.includes(review._id);
    const comment = review.comment || "";
    const shouldTruncate = comment.length > MAX_COMMENT_LENGTH;

    return (
      <div
        key={review._id}
        className="rounded-tl-[15px] rounded-br-[15px] border p-4 bg-white shadow h-full flex flex-col justify-between"
      >
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <img
                src={review.userId?.avatar || "/images/useravt.png"}
                alt="avatar"
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/images/useravt.png";
                }}
              />
              <span>{review.userId?.name || "Người dùng"}</span>
            </div>
            <span className="text-xs text-gray-400">
              {dayjs(review.createdAt).format("DD/MM/YYYY")}
            </span>
          </div>

          <Rate
            disabled
            defaultValue={review.rating}
            className="text-yellow-400 mb-2"
          />

          <p className="text-sm text-gray-600 whitespace-pre-wrap break-words mb-2">
            {isExpanded || !shouldTruncate
              ? comment
              : `${comment.slice(0, MAX_COMMENT_LENGTH)}...`}
            {shouldTruncate && (
              <button
                className="text-blue-500 ml-1 text-xs underline"
                onClick={() => toggleExpand(review._id)}
              >
                {isExpanded ? "Thu gọn" : "Xem thêm"}
              </button>
            )}
          </p>

          {review.images?.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {review.images.map((img: any, idx: number) => (
                <img
                  key={idx}
                  src={img.url}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/image-fallback.png";
                  }}
                  className="w-16 h-16 rounded object-cover border"
                  alt={`review-${idx}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">
        Đánh giá sản phẩm
      </h3>

      {isLoading ? (
        <Spin tip="Đang tải đánh giá..." />
      ) : error ? (
        <p className="text-red-500">Lỗi khi tải đánh giá</p>
      ) : allReviews.length === 0 ? (
        <Empty description="Chưa có đánh giá nào" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-1 gap-4">
          {allReviews.map((review: any) => renderReview(review))}
        </div>
      )}
    </div>
  );
};

export default ReviewItem;
