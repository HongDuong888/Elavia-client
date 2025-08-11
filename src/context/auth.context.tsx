// Kiểu đơn hàng chưa thanh toán
interface Order {
  _id: string;
  orderId: string;
  finalAmount: number;
  paymentStatus: string;
}
import {
  createContext,
  ReactNode,
  useEffect,
  useState,
  Dispatch,
  SetStateAction,
  useContext,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { info, logout } from "../services/userService";
import { AxiosError } from "axios";
import Loading from "../components/loading";
import ChatBox from "../components/ChatBox";

// Định nghĩa state xác thực
interface AuthState {
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

// Interface cho context
interface AuthContextType {
  auth: AuthState;
  setAuth: Dispatch<SetStateAction<AuthState>>;
  pendingOrders: Order[];
  setPendingOrders: Dispatch<SetStateAction<Order[]>>;
}

// Tạo context
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

// Custom hook để dùng context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth phải được sử dụng trong AuthProvider");
  }
  return context;
};

// Props cho AuthWrapper
interface AuthWrapperProps {
  children: ReactNode;
}

// Component bao bọc xác thực
export const AuthWrapper = ({ children }: AuthWrapperProps) => {
  const queryClient = useQueryClient();
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    isAuthenticating: true,
    user: {
      id: "",
      email: "",
      role: "",
    },
  });
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);

  // Gọi API user info nếu có token
  const { data, isLoading, error } = useQuery({
    queryKey: ["userInfo"],
    queryFn: info,
    enabled: !!localStorage.getItem("token"),
    staleTime: 1000 * 60 * 5, // optional: cache 5 phút
    retry: false, // Không retry khi lỗi 401
  });

  // Kiểm tra token ngay khi component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      // Nếu không có token, set auth ngay lập tức
      setAuth({
        isAuthenticated: false,
        isAuthenticating: false,
        user: { id: "", email: "", role: "" },
      });
    }
  }, []);

  // Xử lý logout
  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem("token");

      // Clear tất cả React Query cache
      queryClient.clear();

      setAuth({
        isAuthenticated: false,
        isAuthenticating: false,
        user: {
          id: "",
          email: "",
          role: "",
        },
      });
      setPendingOrders([]);

      // Không dùng window.location.href để tránh reload
      // window.location.href = "/login";
    } catch (logoutError) {
      console.error("Lỗi khi đăng xuất:", logoutError);
    }
  };

  // Khi có thay đổi từ react-query, cập nhật lại auth
  useEffect(() => {
    console.log("📦 useEffect: ", { data, error, isLoading });

    if (isLoading) {
      setAuth((prev) => ({ ...prev, isAuthenticating: true }));
    } else if (data) {
      setAuth({
        isAuthenticated: true,
        isAuthenticating: false,
        user: {
          id: data.id || "",
          email: data.email || "",
          role: data.role || "",
        },
      });

      // Gọi API đơn hàng chưa thanh toán sau khi xác thực thành công
      import("../services/axiosInstance").then(({ default: axiosInstance }) => {
        axiosInstance
          .get("/orders/get-pending-payment-orders")
          .then((res) => {
            const orders = res.data?.data || [];
            setPendingOrders(orders);
          })
          .catch((err) => {
            setPendingOrders([]);
          });
      });
    } else if (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
        handleLogout();
      } else {
        setAuth({
          isAuthenticated: false,
          isAuthenticating: false,
          user: {
            id: "",
            email: "",
            role: "",
          },
        });
      }
    } else {
      // Nếu không có data, không có error, nhưng isLoading = false → fallback
      setAuth((prev) => ({ ...prev, isAuthenticating: false }));
    }
  }, [data, error, isLoading]);

  // Hiển thị loading khi đang xác thực
  if (auth.isAuthenticating) {
    return <Loading />;
  }

  // Trả về context cho toàn bộ app
  return (
    <AuthContext.Provider
      value={{ auth, setAuth, pendingOrders, setPendingOrders }}
    >
      {children}
      {/* ChatBox sẽ tự động hiển thị khi user đăng nhập */}
      <ChatBox />
    </AuthContext.Provider>
  );
};
