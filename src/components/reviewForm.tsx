import React, { useState, ChangeEvent, useEffect } from "react";
import axiosInstance from "../services/axiosInstance";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";

interface ReviewFormProps {
  orderId: string;
  productVariantId: string;
  onSuccess?: (data: any) => void;
  mode?: "create" | "edit";
  initialData?: {
    _id: string;
    rating: number;
    comment: string;
    images: { url: string; public_id: string }[];
  };
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  orderId,
  productVariantId,
  onSuccess,
  mode = "create",
  initialData,
}) => {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [existingImages, setExistingImages] = useState<
    { url: string; public_id: string }[]
  >([]);
  const [removedImagePublicIds, setRemovedImagePublicIds] = useState<string[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setRating(initialData.rating);
      setComment(initialData.comment);
      setExistingImages(initialData.images || []);
      setImages([]);
      setPreviewUrls([]);
      setRemovedImagePublicIds([]);
    }
  }, [mode, initialData]);

const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files) return;

  const selectedFiles = Array.from(files);

  const totalImages = existingImages.length + images.length + selectedFiles.length;

  if (totalImages > 6) {
    const allowedCount = 6 - existingImages.length - images.length;
    if (allowedCount <= 0) {
      toast.warn("Bạn chỉ có thể đăng tối đa 6 ảnh.");
      return;
    }
    toast.info(`Chỉ thêm tối đa ${allowedCount} ảnh nữa.`);
    selectedFiles.splice(allowedCount);
  }

  setImages((prev) => [...prev, ...selectedFiles]);

  const newPreviews = selectedFiles.map((file) => 
    URL.createObjectURL(file)
);
  setPreviewUrls((prev) => [...prev, ...newPreviews]);
};
const handleGetSuggestion = async () => {
  setSuggestLoading(true);
  try {
    const res = await axiosInstance.get("/reviews/suggestion", {
      params: { orderId, productVariantId },
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (res.data?.suggestion) {
      setComment(res.data.suggestion);
      toast.success("Đã lấy gợi ý từ AI");
    } else {
      toast.info("Không có gợi ý phù hợp");
    }
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Lấy gợi ý thất bại");
  } finally {
    setSuggestLoading(false);
  }
};
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      alert("Vui lòng nhập nhận xét.");
      return;
    }

    const formData = new FormData();
    formData.append("orderId", orderId);
    formData.append("productVariantId", productVariantId);
    formData.append("rating", rating.toString());
    formData.append("comment", comment);
    images.forEach((file) => formData.append("images", file));
    removedImagePublicIds.forEach((id) =>
      formData.append("removedImages[]", id)
    );

    const token = localStorage.getItem("token");

    try {
      setLoading(true);

      let res;
      if (mode === "edit" && initialData?._id) {
        res = await axiosInstance.patch(`/reviews/${initialData._id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success("Cập nhật đánh giá thành công!");
      } else {
        res = await axiosInstance.post("/reviews", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success("Đánh giá thành công!");
      }

      queryClient.invalidateQueries({ queryKey: ["orders", orderId] });
      onSuccess?.(res.data);

      // Reset state
      setRating(5);
      setComment("");
      setImages([]);
      setPreviewUrls([]);
      setExistingImages([]);
      setRemovedImagePublicIds([]);
    } catch (error: any) {
       toast.error(error.response?.data?.message || "Gửi đánh giá thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border bg-white max-w-xl mx-auto">
      <h2 className="text-lg font-semibold mb-3">
        {mode === "edit" ? "Chỉnh sửa đánh giá" : "Đánh giá sản phẩm"}
      </h2>

      {/* Rating */}
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((value) => (
          <svg
            key={value}
            onClick={() => setRating(value)}
            xmlns="http://www.w3.org/2000/svg"
            className={`h-6 w-6 cursor-pointer ${
              value <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927a.5.5 0 01.902 0l1.563 3.165a.5.5 0 00.376.274l3.502.51a.5.5 0 01.277.854l-2.533 2.47a.5.5 0 00-.144.443l.598 3.487a.5.5 0 01-.725.527L10 13.187l-3.128 1.644a.5.5 0 01-.725-.527l.598-3.487a.5.5 0 00-.144-.443L4.068 7.73a.5.5 0 01.277-.854l3.502-.51a.5.5 0 00.376-.274L9.049 2.927z" />
          </svg>
        ))}
      </div>

      <div className="flex justify-between items-center mb-2">
        <label className="font-medium">Nhận xét</label>
        <button
          type="button"
          onClick={handleGetSuggestion}
          disabled={suggestLoading}
          className="text-sm text-blue-600 hover:underline disabled:text-gray-400"
        >
          {suggestLoading ? "Đang gợi ý..." : "Gợi ý từ AI"}
        </button>
      </div>
      {/* Comment */}
      <textarea
        maxLength={200}
        className="w-full border border-gray-300 focus:border-gray-400 focus:outline-none rounded p-2 mb-1"
        rows={4}
        placeholder="Nhận xét của bạn về sản phẩm..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <div className="text-right text-sm text-gray-500 mb-3">
        {comment.length}/200 ký tự
      </div>

      {/* Upload ảnh */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Ảnh sản phẩm</label>

        <p className="text-sm text-gray-500 mb-1">
          Đã chọn: {existingImages.length + previewUrls.length}/6 ảnh
        </p>

        {/* Ẩn nếu đã đủ 6 ảnh */}
        {existingImages.length + previewUrls.length < 6 && (
          <div
            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition"
            onClick={() => document.getElementById("fileInput")?.click()}
          >
            <p className="text-sm text-gray-500">Click để chọn ảnh</p>
            <input
              id="fileInput"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        )}

        {/* Hiển thị ảnh đã upload */}
        {existingImages.length > 0 && (
          <div className="mt-3 flex gap-2 flex-wrap">
            {existingImages.map((img, index) => (
              <div key={img.public_id} className="relative w-[80px] h-[80px]">
                <img
                  src={img.url}
                  alt={`existing-${index}`}
                  className="object-cover w-full h-full rounded border"
                />
                <button
                  type="button"
                  onClick={() => {
                    setRemovedImagePublicIds((prev) => [
                      ...prev,
                      img.public_id,
                    ]);
                    setExistingImages((prev) =>
                      prev.filter((_, i) => i !== index)
                    );
                  }}
                  className="absolute top-0 right-0 text-xs bg-black bg-opacity-60 text-white px-1 rounded-bl hover:bg-opacity-80"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Hiển thị ảnh mới chọn */}
        {previewUrls.length > 0 && (
          <div className="mt-3 flex gap-2 flex-wrap">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative w-[80px] h-[80px]">
                <img
                  src={url}
                  alt={`preview-${index}`}
                  className="object-cover w-full h-full rounded border"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImages((prev) => prev.filter((_, i) => i !== index));
                    setPreviewUrls((prev) =>
                      prev.filter((_, i) => i !== index)
                    );
                  }}
                  className="absolute top-0 right-0 text-xs bg-black bg-opacity-60 text-white px-1 rounded-bl hover:bg-opacity-80"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-fit mt-2 px-4 py-1 border border-black bg-black text-white rounded-tl-[8px] rounded-bl-none rounded-tr-none rounded-br-[8px] hover:bg-white hover:text-black transition"
      >
        {loading
          ? "Đang gửi..."
          : mode === "edit"
          ? "Cập nhật"
          : "Gửi đánh giá"}
      </button>
    </div>
  );
};

export default ReviewForm;
