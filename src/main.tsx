// index.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthWrapper } from "./context/auth.context.tsx";
import ScrollToTop from "./components/scrollToTop.tsx";
import ChatBox from "./components/ChatBox.tsx";
import PendingPaymentOrdersBox from "./components/PendingPaymentOrdersBox";
import { useContext } from "react";
import { AuthContext } from "./context/auth.context";

// Tạo QueryClient instance
const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById("root")!);

function MainRoot() {
  const { pendingOrders } = useContext(AuthContext) ?? {};
  return (
    <>
      <App />
      <ChatBox />
      <PendingPaymentOrdersBox orders={pendingOrders || []} />
      <ToastContainer
        position="bottom-right"
        autoClose={2000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
      />
    </>
  );
}

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthWrapper>
        <BrowserRouter>
          <HelmetProvider>
            <ScrollToTop />
            <MainRoot />
          </HelmetProvider>
        </BrowserRouter>
      </AuthWrapper>
    </QueryClientProvider>
  </React.StrictMode>
);
