import { useState } from "react";
import { Bell, X } from "lucide-react";

interface Order {
  _id: string;
  orderId: string;
  finalAmount: number;
  paymentStatus: string;
}

interface Props {
  orders: Order[];
}

export default function PendingPaymentOrdersBox({ orders }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  if (!orders || orders.length === 0) return null;

  return (
    <div className="fixed bottom-24 right-6 z-50">
      {/* Icon + Tooltip */}
      {!isOpen && (
        <div className="relative group">
          <button
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-all duration-200 animate-bell-shake"
            title="Đơn hàng chưa thanh toán"
          >
            <Bell size={28} />
          </button>
          <div className="absolute right-16 bottom-0 bg-black text-white px-4 py-2 rounded-xl shadow-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            Bạn có {orders.length} đơn hàng chưa thanh toán!
          </div>
        </div>
      )}

      {/* Popup danh sách đơn hàng */}
      {isOpen && (
        <div className="bg-white w-96 max-h-[400px] shadow-2xl rounded-2xl flex flex-col border border-red-600 animate-fade-in">
          <div className="bg-red-600 text-white px-4 py-3 flex justify-between items-center rounded-t-2xl">
            <span className="font-semibold text-lg">
              Đơn hàng chưa thanh toán
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-red-700 p-1 rounded-full transition-colors duration-200"
              title="Đóng"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
            {orders.map((order) => (
              <div
                key={order._id}
                className="border border-gray-200 rounded-xl p-3 flex flex-col gap-2 bg-gray-50"
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm">
                    Mã đơn: {order.orderId}
                  </span>
                  <span className="text-red-600 text-xs font-medium">
                    {order.paymentStatus}
                  </span>
                </div>
                <div className="text-sm">
                  Tổng tiền:{" "}
                  <span className="font-bold">
                    {order.finalAmount?.toLocaleString()}₫
                  </span>
                </div>
                <a
                  href={`/order-details/${order._id}`}
                  className="text-blue-600 text-xs hover:underline font-medium mt-1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Xem chi tiết →
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        @keyframes bell-shake {
          0% { transform: rotate(0deg); }
          10% { transform: rotate(-15deg); }
          20% { transform: rotate(10deg); }
          30% { transform: rotate(-10deg); }
          40% { transform: rotate(6deg); }
          50% { transform: rotate(-4deg); }
          60% { transform: rotate(2deg); }
          70% { transform: rotate(-1deg); }
          80% { transform: rotate(0deg); }
          100% { transform: rotate(0deg); }
        }
        .animate-bell-shake {
          animation: bell-shake 1s infinite;
        }
      `}</style>
    </div>
  );
}
