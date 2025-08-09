import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Trash2 } from "lucide-react";

type UserMessage = { sender: "user" | "bot"; text: string };
type ProductMessage = { sender: "products"; items: any[] };
type Message = UserMessage | ProductMessage;

export default function ChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("chat_messages");
        if (saved) {
          setMessages(JSON.parse(saved) as Message[]);
        }
      } catch (err) {
        console.error("Lỗi đọc localStorage:", err);
      } finally {
        setIsLoaded(true); // Đánh dấu là đã load xong
      }
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      // Chỉ lưu khi đã load xong
      try {
        localStorage.setItem("chat_messages", JSON.stringify(messages));
      } catch (err) {
        console.error("Lỗi lưu localStorage:", err);
      }
    }
  }, [messages, isLoaded]);

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Xóa tất cả tin nhắn
  const clearMessages = () => {
    setMessages([]);
    // Xóa luôn trong localStorage
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("chat_messages");
      } catch (err) {
        console.error("Lỗi xóa localStorage:", err);
      }
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg: UserMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("http://localhost:5175/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }),
      });
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: data.answer || "Xin lỗi, tôi chưa có câu trả lời.",
        } as UserMessage,
      ]);

      if (data.relatedProducts?.length > 0) {
        setMessages((prev) => [
          ...prev,
          { sender: "products", items: data.relatedProducts } as ProductMessage,
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Lỗi khi kết nối AI." },
      ]);
    }

    setIsTyping(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-black text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {isOpen && (
        <div className="bg-white w-96 h-[500px] shadow-2xl rounded-2xl flex flex-col border border-black animate-fade-in">
          {/* Header */}
          <div className="bg-black text-white px-4 py-3 flex justify-between items-center rounded-t-2xl">
            <span className="font-semibold text-lg">Tư vấn Elavia AI</span>
            <div className="flex space-x-2">
              {messages.length > 0 && (
                <button
                  onClick={clearMessages}
                  className="hover:bg-gray-800 p-1 rounded-full transition-colors duration-200"
                  title="Xóa tất cả tin nhắn"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-gray-800 p-1 rounded-full transition-colors duration-200"
                title="Đóng chat"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Chat content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <MessageCircle
                  size={48}
                  className="mx-auto mb-2 text-gray-300"
                />
                <p className="text-sm">Xin chào! Tôi có thể giúp gì cho bạn?</p>
                <p className="text-xs mt-2 text-gray-400">
                  AI sẽ tìm giúp bạn sản phẩm, nếu cần tư vấn trực tiếp hãy liên
                  hệ chúng tôi qua 0353 608 533
                </p>
              </div>
            )}

            {messages.map((msg, i) => {
              if (msg.sender === "products") {
                return (
                  <div key={i} className="space-y-3">
                    <div className="text-sm text-gray-600 font-medium">
                      Sản phẩm liên quan:
                    </div>
                    {msg.items.map((p, idx) => (
                      <div
                        key={idx}
                        className="flex border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 bg-white"
                      >
                        <div className="w-20 h-20 overflow-hidden relative group">
                          {/* Ảnh chính */}
                          <img
                            src={
                              p.images.main.url ||
                              "https://via.placeholder.com/80"
                            }
                            alt={p.productId?.name}
                            className="w-full h-full object-cover aspect-square absolute inset-0 transition-opacity duration-300 opacity-100 group-hover:opacity-0"
                          />

                          {/* Ảnh hover */}
                          {p.images.hover?.url && (
                            <img
                              src={p.images.hover.url}
                              alt={p.productId?.name}
                              className="w-full h-full object-cover aspect-square absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                            />
                          )}
                        </div>

                        <div className="p-3 flex flex-col justify-between flex-1">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900">
                              {p.productId?.name}
                            </h4>
                            <p className="text-sm text-red-600 font-medium mt-1">
                              {p.price?.toLocaleString()}₫
                            </p>
                          </div>
                          <a
                            href={`/products/${p._id}`}
                            className="text-blue-600 text-sm hover:text-blue-800 font-medium mt-2 inline-flex items-center"
                          >
                            Xem chi tiết →
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              }

              return (
                <div
                  key={i}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  } animate-fade-in`}
                >
                  <div
                    className={`px-4 py-3 rounded-2xl max-w-[80%] text-sm ${
                      msg.sender === "user"
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-900 border border-gray-200"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-3 rounded-2xl border border-gray-200">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-75"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
            <div className="flex space-x-2">
              <input
                className="border border-gray-300 rounded-full flex-1 px-4 py-3 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors duration-200"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập câu hỏi của bạn..."
                onKeyDown={(e) =>
                  e.key === "Enter" && !e.shiftKey && sendMessage()
                }
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isTyping}
                className="bg-black text-white p-3 rounded-full hover:bg-gray-800 transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
