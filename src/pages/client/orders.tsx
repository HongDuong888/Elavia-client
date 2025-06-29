import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getList } from "../../api/provider";
import { useState } from "react";
import Loading from "../../components/loading";
import MenuInfo from "../../components/menuInfo";
import ClientLayout from "../../layouts/clientLayout";

const Orders = () => {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [statusFilter, setStatusFilter] = useState("Tất cả");

  const { data, isLoading, error } = useQuery({
    queryKey: ["orders", pagination.current, pagination.pageSize, statusFilter],
    queryFn: async () => {
      const params = {
        namespace: `orders?_page=${pagination.current}&_limit=${pagination.pageSize}`,
      };
      if (statusFilter !== "Tất cả") {
        params.namespace += `&status=${encodeURIComponent(statusFilter)}`;
      }
      const response = await getList(params);
      console.log("API Response:", response); // Debug
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

  const statusOptions = [
    "Tất cả",
    "Chờ xác nhận",
    "Đã xác nhận",
    "Đang giao hàng",
    "Đã giao hàng",
    "Đã hủy",
    "Chờ thanh toán",
    "Đã thanh toán",
    "Huỷ do quá thời gian thanh toán",
  ];

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPageButtons = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (endPage - startPage < maxPageButtons - 1) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
      } else if (endPage === totalPages) {
        startPage = Math.max(1, endPage - maxPageButtons + 1);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    if (startPage > 2) {
      pageNumbers.unshift("...");
      pageNumbers.unshift(1);
    } else if (startPage === 2) {
      pageNumbers.unshift(1);
    }

    if (endPage < totalPages - 1) {
      pageNumbers.push("...");
      pageNumbers.push(totalPages);
    } else if (endPage === totalPages - 1) {
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  return (
    <ClientLayout>
      <article className="mt-[98px]">
        <div className="flex gap-4 my-4">
          <div className="text-sm"><a href="/">Trang chủ</a></div>
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
              <div className="w-48">
                <span className="block text-sm font-medium text-gray-700 mb-1">Trạng thái đơn hàng:</span>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPagination({ ...pagination, current: 1 });
                    }}
                    className="appearance-none w-full bg-white border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status} className="text-gray-900">
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
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse bg-white">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-3 pr-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Mã đơn hàng</th>
                    <th className="py-3 pr-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Ngày đặt</th>
                    <th className="py-3 pr-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Trạng thái</th>
                    <th className="py-3 pr-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Tổng tiền</th>
                    <th className="py-3 pr-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tableData.length > 0 ? (
                    tableData.map((order: any, index: number) => (
                      <tr key={order._id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="py-4 pr-6 text-sm text-gray-900">{order.orderId}</td>
                        <td className="py-4 pr-6 text-sm text-gray-900">{new Date(order.createdAt).toLocaleString("vi-VN")}</td>
                        <td className="py-4 pr-6">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              order.status === "Huỷ do quá thời gian thanh toán" ? "bg-red-100 text-red-800"
                              : order.status === "Đã thanh toán" ? "bg-green-100 text-green-800"
                              : order.status === "Chờ thanh toán" ? "bg-yellow-100 text-yellow-800"
                              : order.status === "Chờ xác nhận" ? "bg-blue-100 text-blue-800"
                              : order.status === "Đang giao hàng" ? "bg-purple-100 text-purple-800"
                              : order.status === "Đã giao hàng" ? "bg-green-100 text-green-800"
                              : order.status === "Đã hủy" ? "bg-red-100 text-red-800"
                              : ""
                            }`}
                          >
                            {order.status === "Huỷ do quá thời gian thanh toán" ? "Quá hạn thanh toán" : order.status}
                          </span>
                        </td>
                        <td className="py-4 pr-6 text-sm text-gray-900 font-medium">{order.totalAmount.toLocaleString("vi-VN")} đ</td>
                        <td className="py-4 pr-6 text-sm font-medium">
                          <div className="flex items-center gap-3">
                            <Link to={`/order-details/${order._id}`} className="text-blue-600 hover:text-blue-900 transition-colors duration-200">Chi tiết</Link>
                            {order.status === "Chờ thanh toán" && order.paymentUrl && (
                              <a href={order.paymentUrl} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-900 transition-colors duration-200">Thanh toán</a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-sm text-gray-600">Chưa có đơn hàng nào.</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="mt-4 flex justify-center items-center space-x-2">
                <button
                  onClick={() => handleTableChange(currentPage - 1, pagination.pageSize)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-tl-lg rounded-br-lg bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-50 transition-colors duration-200"
                >
                  &lt;
                </button>
                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === "number" && handleTableChange(page, pagination.pageSize)}
                    className={`px-3 py-1 border ${
                      typeof page === "number" && currentPage === page
                        ? "bg-black text-white rounded-tl-lg rounded-br-lg"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    } border-gray-300 transition-colors duration-200 ${typeof page !== "number" ? "cursor-default" : ""}`}
                    disabled={typeof page !== "number"}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handleTableChange(currentPage + 1, pagination.pageSize)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-3 py-1 border border-gray-300 rounded-tl-lg rounded-br-lg bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-50 transition-colors duration-200"
                >
                  &gt;
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