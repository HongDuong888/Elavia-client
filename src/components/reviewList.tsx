import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Rate, Select, Empty, Spin, Pagination, message, Modal } from "antd";
import axiosInstance from "../services/axiosInstance";
import dayjs from "dayjs";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { AxiosResponse } from "axios";
import TextArea from "antd/es/input/TextArea";

const { Option } = Select;

interface ReviewListProps {
  productVariantId: string;
  orderId?: string;
  userId?: string;
  currentUserRole?: number | string;
}
interface UpdateReplyVariables {
  reviewId: string;
  comment: string;
}

const ReviewList: React.FC<ReviewListProps> = ({
  productVariantId,
  orderId,
  userId,
  currentUserRole,
}) => {
  const [selectedStar, setSelectedStar] = useState<"all" | "hasImage" | number>(
    "all"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedReviewIds, setExpandedReviewIds] = useState<string[]>([]);
  const [editingReply, setEditingReply] = useState<{
    reviewId: string;
    comment: string;
  } | null>(null);
  const pageSize = 4;
  const queryClient = useQueryClient();
  const {
    data: resData,
    isLoading,
    error,
    refetch,
  } = useQuery({
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

  const updateReplyMutation = useMutation({
    mutationFn: (variables: UpdateReplyVariables) =>
      axiosInstance.put(`/reviews/${variables.reviewId}/reply`, {
        comment: variables.comment,
      }),
    onSuccess: () => {
      message.success("Cập nhật phản hồi thành công");
      queryClient.invalidateQueries({
        queryKey: ["reviews", productVariantId, orderId],
      });
      setEditingReply(null);
    },
    onError: () => {
      message.error("Cập nhật phản hồi thất bại");
    },
  });

  const deleteReplyMutation = useMutation({
    mutationFn: (reviewId: string) =>
      axiosInstance.delete(`/reviews/${reviewId}/reply`),
    onSuccess: () => {
      message.success("Xóa phản hồi thành công");
      queryClient.invalidateQueries({
        queryKey: ["reviews", productVariantId, orderId],
      });
      refetch();
    },
    onError: () => {
      message.error("Xóa phản hồi thất bại");
    },
  });
  const allReviews = Array.isArray(resData)
    ? resData
    : Array.isArray(resData?.data)
    ? resData.data
    : [];

  const filteredReviews =
    selectedStar === "all"
      ? allReviews
      : selectedStar === "hasImage"
      ? allReviews.filter(
          (r: any) => Array.isArray(r.images) && r.images.length > 0
        )
      : allReviews.filter((r: any) => r.rating === Number(selectedStar));

  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleEditReply = (reviewId: string, currentComment: string) => {
    setEditingReply({ reviewId, comment: currentComment });
  };
  // Hàm lưu sửa phản hồi
  const handleReplySave = () => {
    if (!editingReply) return;
    if (!editingReply.comment.trim()) {
      message.warning("Nội dung phản hồi không được để trống");
      return;
    }
    updateReplyMutation.mutate(editingReply);
  };

  // Hàm xóa phản hồi có confirm
  const handleDeleteReply = (reviewId: string) => {
    Modal.confirm({
      title: "Xác nhận",
      content: "Bạn có chắc muốn xóa phản hồi này?",
      okText: "Xóa",
      cancelText: "Hủy",
      onOk: () => deleteReplyMutation.mutate(reviewId),
    });
  };
  const handleStarChange = (value: string | number) => {
    setSelectedStar(
      value === "all" || value === "hasImage" ? value : Number(value)
    );
    setCurrentPage(1);
  };

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
            <div className="flex gap-2 flex-wrap mt-2">
              {review.images.map((img: any, idx: number) => (
                <Zoom key={idx}>
                  <img
                    src={img.url}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/images/image-fallback.png";
                    }}
                    className="w-16 h-16 rounded object-cover border cursor-pointer hover:opacity-80 transition"
                    alt={`review-${idx}`}
                  />
                </Zoom>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h3 className="text-lg font-semibold text-gray-800">
          Đánh giá sản phẩm
        </h3>
        <Select
          value={selectedStar}
          onChange={handleStarChange}
          className="!w-44"
        >
          <Option value="all">Tất cả</Option>
          <Option value="hasImage">📷 Có ảnh</Option>
          {[5, 4, 3, 2, 1].map((star) => (
            <Option key={star} value={star}>
              {star} sao
            </Option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <Spin tip="Đang tải đánh giá..." />
      ) : error ? (
        <p className="text-red-500">Lỗi khi tải đánh giá</p>
      ) : filteredReviews.length === 0 ? (
        <Empty description="Chưa có đánh giá nào phù hợp" />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
            {paginatedReviews.map((review: any) => (
              <div
                key={review._id}
                className="rounded-tl-[15px] rounded-br-[15px] border p-4 bg-white shadow h-full flex flex-col justify-between"
              >
                {renderReview(review)}

                {/* Thêm phần phản hồi admin */}
                {review.reply && review.reply.comment ? (
                  <div className="mt-4 rounded-tl-[15px] rounded-br-[15px] border p-4 bg-white shadow h-full flex flex-col justify-between relative">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <img
                          src={
                            review.reply.adminId?.avatar || "/images/logo.png"
                          }
                          alt="admin avatar"
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/images/useravt.png";
                          }}
                        />
                        <span>{review.reply.adminId?.name || "Elavia"}</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {dayjs(
                          review.reply.updatedAt || review.reply.createdAt
                        ).format("DD/MM/YYYY")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap break-words">
                      {review.reply.comment}
                    </p>

                    
                  </div>
                ) : (
                  <div className="mt-4 text-sm text-gray-500">
                    Chưa có phản hồi từ admin
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-4">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredReviews.length}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={false}
              showQuickJumper={false}
              itemRender={(page, type, originalElement) => {
                if (type === "prev") return <a>«</a>;
                if (type === "next") return <a>»</a>;
                if (type === "page") return <a>{page}</a>;
                return originalElement;
              }}
              locale={{ items_per_page: "" }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ReviewList;
