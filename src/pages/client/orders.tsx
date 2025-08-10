import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getList } from "../../api/provider";
import { useState } from "react";
import Loading from "../../components/loading";
import MenuInfo from "../../components/menuInfo";
import ClientLayout from "../../layouts/clientLayout";
import axiosInstance from "../../services/axiosInstance";
import { ref } from "process";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
const Orders = () => {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("Tất cả");
  const [shippingStatusFilter, setShippingStatusFilter] = useState("Tất cả");
  const userId = localStorage.getItem("user_id");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [
      "orders",
      pagination.current,
      pagination.pageSize,
      paymentStatusFilter,
      shippingStatusFilter,
      userId,
    ],
    queryFn: async () => {
      let url = `orders?_page=${pagination.current}&_limit=${pagination.pageSize}`;
      if (paymentStatusFilter !== "Tất cả") {
        url += `&status=${encodeURIComponent(paymentStatusFilter)}`;
      }
      if (shippingStatusFilter !== "Tất cả") {
        url += `&status=${encodeURIComponent(shippingStatusFilter)}`;
      }
      if (userId) {
        url += `&_userId=${userId}`;
      }
      const response = await getList({ namespace: url });
      return response;
    },
  });

  const tableData = data?.data || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || Math.ceil(total / pagination.pageSize);
  const currentPage = data?.currentPage || pagination.current;

  if (isLoading) {
    return <Loading />;
  }
  if (error) {
    return <p>Error loading orders: {error.message}</p>;
  }

  const handleTableChange = (page: number, pageSize: number) => {
    setPagination({ current: page, pageSize });
  };
  window.scrollTo({ top: 0, behavior: "smooth" });
  const paymentStatusOptions = [
    "Tất cả",
    "Chờ xác nhận",
    "Chờ thanh toán",
    "Đã thanh toán",
    "Huỷ do quá thời gian thanh toán",
    "Người mua huỷ",
    "Người bán huỷ",
  ];

  const shippingStatusOptions = [
    "Tất cả",
    "Chờ xác nhận",
    "Đã xác nhận",
    "Đang giao hàng",
    "Giao hàng thành công",
    "Giao hàng thất bại",
    "Người mua huỷ",
    "Người bán huỷ",
  ];

  const getPageNumbers = () => {
    const pageNumbers: (number | "...")[] = [];
    const totalNumbersToShow = 5;

    if (totalPages <= totalNumbersToShow + 2) {
      // Hiển thị toàn bộ nếu số trang ít
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1); // Luôn có trang 1

      if (currentPage > 3) {
        pageNumbers.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }

      if (currentPage < totalPages - 2) {
        pageNumbers.push("...");
      }

      pageNumbers.push(totalPages); // Luôn có trang cuối
    }

    return pageNumbers;
  };

  const handleCancelOrder = async (orderId: string) => {
    const result = await Swal.fire({
      title: "Xác nhận huỷ?",
      text: "Bạn có chắc muốn huỷ đơn hàng này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Huỷ đơn",
      cancelButtonText: "Không",
      confirmButtonColor: "black",
      cancelButtonColor: "#6c757d",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await axiosInstance.post("orders/cancel", {
        orderId,
        cancelBy: "buyer",
      });

      toast.success(res.data.message || "Huỷ đơn hàng thành công");
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Huỷ đơn hàng thất bại");
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
          <div className="text-sm">Quản lý đơn hàng</div>
        </div>
        <hr className="border-t border-gray-300 my-4" />

        <div className="grid grid-cols-[0.7fr_2.5fr] gap-8">
          <div className="p-4 pl-0 font-bold rounded-tl-[40px] rounded-br-[40px] border-gray-700 h-auto mt-2">
            <MenuInfo />
          </div>
          <div className="flex-1 bg-white rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Quản lý đơn hàng</h2>
              <div className="flex gap-4">
                <div className="w-48">
                  <span className="block text-sm font-medium text-gray-700 mb-1">
                    TT thanh toán:
                  </span>
                  <div className="relative">
                    <select
                      value={paymentStatusFilter}
                      onChange={(e) => {
                        setPaymentStatusFilter(e.target.value);
                        setPagination({ ...pagination, current: 1 });
                      }}
                      className="appearance-none w-full bg-white border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                    >
                      {paymentStatusOptions.map((status) => (
                        <option
                          key={status}
                          value={status}
                          className="text-gray-900"
                        >
                          {status}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600">
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="w-48">
                  <span className="block text-sm font-medium text-gray-700 mb-1">
                    TT giao hàng:
                  </span>
                  <div className="relative">
                    <select
                      value={shippingStatusFilter}
                      onChange={(e) => {
                        setShippingStatusFilter(e.target.value);
                        setPagination({ ...pagination, current: 1 });
                      }}
                      className="appearance-none w-full bg-white border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                    >
                      {shippingStatusOptions.map((status) => (
                        <option
                          key={status}
                          value={status}
                          className="text-gray-900"
                        >
                          {status}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600">
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto min-h-[450px] flex flex-col justify-between">
              <table className="min-w-full border-collapse bg-white">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-3 pr-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      STT
                    </th>
                    <th className="py-3 pr-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Mã đơn hàng
                    </th>
                    <th className="py-3 pr-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Ngày đặt
                    </th>
                    <th className="py-3 pr-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      TT thanh toán
                    </th>
                    <th className="py-3 pr-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      TT giao hàng
                    </th>
                    <th className="py-3 pr-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Tổng tiền
                    </th>
                    <th className="py-3 pr-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tableData.length > 0 ? (
                    tableData.map((order: any, index: number) => (
                      <tr
                        key={order._id}
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="py-4 pr-6 text-sm text-gray-900">
                          {pagination.pageSize * (currentPage - 1) + index + 1}
                        </td>
                        <td className="py-4 pr-6 text-sm text-gray-900">
                          {order.orderId}
                        </td>
                        <td className="py-4 pr-6 text-sm text-gray-900">
                          {new Date(order.createdAt).toLocaleString("vi-VN")}
                        </td>
                        <td className="py-4 pr-6">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              order.paymentStatus ===
                              "Huỷ do quá thời gian thanh toán"
                                ? "bg-red-100 text-red-800"
                                : order.paymentStatus === "Đã thanh toán"
                                ? "bg-green-100 text-green-800"
                                : order.paymentStatus === "Chờ thanh toán"
                                ? "bg-yellow-100 text-yellow-800"
                                : order.paymentStatus === "Chờ xác nhận"
                                ? "bg-blue-100 text-blue-800"
                                : order.paymentStatus === "Người mua huỷ" ||
                                  order.paymentStatus === "Người bán huỷ"
                                ? "bg-red-100 text-red-800"
                                : ""
                            }`}
                          >
                            {order.paymentStatus ===
                            "Huỷ do quá thời gian thanh toán"
                              ? "Quá hạn thanh toán"
                              : order.paymentStatus}
                          </span>
                        </td>
                        <td className="py-4 pr-6">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              order.shippingStatus === "Giao hàng thành công"
                                ? "bg-green-100 text-green-800"
                                : order.shippingStatus === "Đang giao hàng"
                                ? "bg-purple-100 text-purple-800"
                                : order.shippingStatus === "Chờ xác nhận"
                                ? "bg-blue-100 text-blue-800"
                                : order.shippingStatus === "Giao hàng thất bại"
                                ? "bg-red-100 text-red-800"
                                : order.shippingStatus === "Người mua huỷ" ||
                                  order.shippingStatus === "Người bán huỷ"
                                ? "bg-red-100 text-red-800"
                                : order.shippingStatus === "Đã xác nhận"
                                ? "bg-yellow-100 text-yellow-800"
                                : ""
                            }`}
                          >
                            {order.shippingStatus}
                          </span>
                        </td>
                        <td className="py-4 pr-6 text-sm text-gray-900 font-medium">
                          {order.finalAmount.toLocaleString("vi-VN")} đ
                        </td>
                        <td className="py-4 pr-6 text-sm font-medium">
                          <div className="flex items-center gap-3">
                            <Link
                              to={`/order-details/${order._id}`}
                              className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                            >
                              Chi tiết
                            </Link>
                            {order.paymentStatus === "Chờ thanh toán" &&
                              order.paymentUrl && (
                                <a
                                  href={order.paymentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-green-600 hover:text-green-900 transition-colors duration-200"
                                >
                                  Thanh toán
                                </a>
                              )}
                            {([
                              "Chờ xác nhận",
                              "Đã thanh toán",
                              "Chờ thanh toán",
                            ].includes(order.paymentStatus) ||
                              ["Chờ xác nhận", "Đã xác nhận"].includes(
                                order.shippingStatus
                              )) && (
                              <button
                                onClick={() => handleCancelOrder(order.orderId)}
                                className="text-red-600 hover:text-red-900 transition-colors duration-200"
                              >
                                Huỷ đơn
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-4 text-center text-sm text-gray-600"
                      >
                        Chưa có đơn hàng nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="mt-4 flex justify-center items-center space-x-2 text-sm">
                {/* Nút về trang đầu « */}
                <button
                  onClick={() => handleTableChange(1, pagination.pageSize)}
                  className="w-9 h-9 border border-black rounded-tl-lg rounded-br-lg transition-all duration-300 bg-white text-black hover:bg-black hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={currentPage === 1}
                >
                  &laquo;
                </button>
                {/* Các nút số trang */}
                {getPageNumbers().map((p, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      typeof p === "number" &&
                      handleTableChange(p, pagination.pageSize)
                    }
                    className={`w-9 h-9 border rounded-tl-lg rounded-br-lg transition-all duration-300 ${
                      currentPage === p
                        ? "bg-black text-white border-black cursor-default"
                        : "bg-white text-black border-black hover:bg-black hover:text-white"
                    }`}
                    disabled={typeof p !== "number"}
                  >
                    {p}
                  </button>
                ))}
                {/* Nút trang kế tiếp » */}
                <button
                  onClick={() =>
                    handleTableChange(currentPage + 1, pagination.pageSize)
                  }
                  className="w-9 h-9 border border-black rounded-tl-lg rounded-br-lg transition-all duration-300 bg-white text-black hover:bg-black hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={currentPage >= totalPages}
                >
                  &raquo;
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>
    </ClientLayout>
  );
};

export default Orders;
