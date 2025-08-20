import React, { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  Send,
  X,
  Minimize2,
  Image,
  Paperclip,
} from "lucide-react";
import axiosInstance from "../services/axiosInstance";
import { useAuth } from "../context/auth.context";

interface Message {
  _id: string;
  content: string;
  senderType: "user" | "admin";
  type?: "text" | "image" | "product" | "product_with_size";
  createdAt: string;
  senderId: {
    name: string;
    email: string;
  };
}

interface Conversation {
  _id: string;
  status: "waiting" | "active" | "closed";
  aiEnabled?: boolean;
  adminId?: {
    name: string;
    email: string;
  };
}

const ChatBox: React.FC = () => {
  const { auth } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [isAIEnabled, setIsAIEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(
    null
  );
  const lastMessageCountRef = useRef(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();

    // Check for new messages
    if (messages.length > lastMessageCountRef.current && !isOpen) {
      setHasNewMessages(true);
    }
    lastMessageCountRef.current = messages.length;
  }, [messages, isOpen]);

  // Auto-refresh messages khi chat đang mở
  useEffect(() => {
    if (isOpen && conversation && !isMinimized) {
      // Polling mỗi 3 giây
      const interval = setInterval(() => {
        loadMessages(conversation._id, true); // silent = true để không spam logs
      }, 3000);

      setPollingInterval(interval);

      return () => {
        clearInterval(interval);
        setPollingInterval(null);
      };
    } else if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  }, [isOpen, conversation, isMinimized]);

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, []);

  // Không hiển thị ChatBox nếu chưa đăng nhập
  if (!auth.isAuthenticated) {
    return null;
  }

  // Lấy hoặc tạo conversation
  const getOrCreateConversation = async () => {
    try {
      setIsLoading(true);
      console.log("Getting conversation from:", `/chat/conversation`);

      const response = await axiosInstance.get("/chat/conversation");

      console.log("Conversation response:", response.status, response.data);
      setConversation(response.data.conversation);
      setIsAIEnabled(response.data.conversation.aiEnabled || false);
      await loadMessages(response.data.conversation._id);
    } catch (error: any) {
      console.error("Error getting conversation:", error);
      const status = error.response?.status || "unknown";
      const message = error.response?.data?.message || error.message;
      console.error("Failed to get conversation:", status, message);
      alert(`Lỗi tạo cuộc trò chuyện: ${status} - ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Lấy tin nhắn
  const loadMessages = async (conversationId: string, silent = false) => {
    try {
      if (!silent) {
        console.log("Loading messages for conversation:", conversationId);
      }

      const response = await axiosInstance.get(
        `/chat/conversation/${conversationId}/messages`
      );

      if (!silent) {
        console.log("Messages loaded:", response.data);
      }

      const newMessages = response.data.messages || [];

      // Chỉ update nếu có thay đổi
      setMessages((prevMessages) => {
        const hasChanges =
          JSON.stringify(prevMessages) !== JSON.stringify(newMessages);
        return hasChanges ? newMessages : prevMessages;
      });
    } catch (error: any) {
      if (!silent) {
        console.error("Error loading messages:", error);
        const message = error.response?.data?.message || error.message;
        console.error("Failed to load messages:", message);
      }
    }
  };

  // Gửi tin nhắn
  const sendMessage = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault(); // Prevent form submission
    }

    if (!newMessage.trim() || !conversation || isSending) return;

    console.log("Sending message:", {
      conversationId: conversation._id,
      content: newMessage.trim(),
    });

    try {
      setIsSending(true);
      const response = await axiosInstance.post("/chat/message", {
        conversationId: conversation._id,
        content: newMessage.trim(),
        type: "text",
      });

      console.log("Message sent successfully:", response.data);
      setMessages((prev) => [...prev, response.data.message]);
      setNewMessage("");
    } catch (error: any) {
      console.error("Error sending message:", error);
      const status = error.response?.status || "unknown";
      const message = error.response?.data?.message || error.message;
      console.error("Failed to send message:", status, message);
      alert(`Lỗi gửi tin nhắn: ${status} - ${message}`);
    } finally {
      setIsSending(false);
    }
  };

  // Upload và gửi ảnh
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !conversation) return;

    // Kiểm tra loại file
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file ảnh!");
      return;
    }

    // Kiểm tra kích thước file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File ảnh không được vượt quá 5MB!");
      return;
    }

    try {
      setIsUploading(true);

      // Upload ảnh lên server
      const formData = new FormData();
      formData.append("image", file);

      const uploadResponse = await axiosInstance.post(
        "/chat/upload-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Image uploaded:", uploadResponse.data);

      // Gửi tin nhắn với ảnh
      const messageResponse = await axiosInstance.post("/chat/message", {
        conversationId: conversation._id,
        content: uploadResponse.data.imageUrl,
        type: "image",
      });

      console.log("Image message sent:", messageResponse.data);
      setMessages((prev) => [...prev, messageResponse.data.message]);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      console.error("Error uploading image:", error);
      const message = error.response?.data?.message || error.message;
      alert(`Lỗi upload ảnh: ${message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Quick reply function
  const handleQuickReply = (message: string) => {
    setNewMessage(message);
  };

  // Toggle AI Advisor
  const toggleAIAdvisor = async () => {
    if (!conversation) return;

    try {
      const newAIState = !isAIEnabled;
      
      const response = await axiosInstance.put(
        `/chat/conversation/${conversation._id}/ai`,
        { enableAI: newAIState }
      );

      if (response.data.success) {
        setIsAIEnabled(newAIState);
        
        // Thêm system message để thông báo
        const systemMessage = {
          _id: Date.now().toString(),
          content: newAIState 
            ? "🤖 Tư vấn viên AI đã được kích hoạt! Tôi sẽ hỗ trợ bạn ngay lập tức." 
            : "👨‍💼 Tư vấn viên AI đã được tắt. Bạn có thể chờ tư vấn viên con người hỗ trợ.",
          senderType: "admin" as const,
          type: "text" as const,
          createdAt: new Date().toISOString(),
          senderId: {
            name: newAIState ? "AI Assistant" : "System",
            email: "ai@elavia.com",
          },
        };
        
        setMessages(prev => [...prev, systemMessage]);
      }
    } catch (error: any) {
      console.error("Error toggling AI:", error);
      alert("Lỗi khi bật/tắt tư vấn viên AI");
    }
  };

  // Quick reply suggestions for customer
  const quickReplies = [
    "Xin chào! Tôi cần hỗ trợ.",
    "Sản phẩm này có bảo hành không?",
    "Khi nào hàng được giao?",
    "Tôi muốn đổi/trả hàng.",
    "Có khuyến mãi gì không?",
    "Cảm ơn bạn đã hỗ trợ!",
  ];

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const openChat = () => {
    setIsOpen(true);
    setHasNewMessages(false); // Reset new message indicator
    if (!conversation && !isLoading) {
      getOrCreateConversation();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusText = () => {
    if (!conversation) return "";

    switch (conversation.status) {
      case "waiting":
        return "Đang chờ hỗ trợ...";
      case "active":
        return conversation.adminId
          ? `Đang chat với ${conversation.adminId.name}`
          : "Đang được hỗ trợ";
      case "closed":
        return "Cuộc trò chuyện đã kết thúc";
      default:
        return "";
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={openChat}
          className="fixed bottom-6 right-6 bg-gray-900 hover:bg-black text-white p-4 rounded-full shadow-xl transition-all duration-300 z-50 flex items-center justify-center group"
          aria-label="Mở chat hỗ trợ"
        >
          <MessageCircle
            size={24}
            className="group-hover:scale-110 transition-transform"
          />
          {hasNewMessages && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-semibold animate-pulse">
              !
            </span>
          )}
          {!hasNewMessages && (
            <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-semibold animate-pulse">
              ?
            </span>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 ${
            isMinimized ? "h-16" : "h-[450px]"
          } transition-all duration-300 overflow-hidden`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-black text-white p-4 rounded-t-xl flex justify-between items-center">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="font-bold text-base">💬 Hỗ trợ khách hàng</h3>
                  <span className="text-xs text-gray-300">{getStatusText()}</span>
                </div>
                {conversation && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleAIAdvisor}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                        isAIEnabled 
                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                          : 'bg-gray-600 hover:bg-gray-700 text-gray-300'
                      }`}
                      title={isAIEnabled ? 'Tắt AI' : 'Bật AI'}
                    >
                      <span>{isAIEnabled ? '🤖' : '🤖'}</span>
                      <span>{isAIEnabled ? 'AI ON' : 'AI OFF'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="hover:bg-gray-700 p-2 rounded-lg transition-colors"
                aria-label="Thu nhỏ"
              >
                <Minimize2 size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-gray-700 p-2 rounded-lg transition-colors"
                aria-label="Đóng"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 h-80 bg-gradient-to-b from-gray-50 to-gray-100">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    <p className="mt-3 text-gray-600 text-sm">
                      Đang kết nối...
                    </p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="text-4xl mb-3">👋</div>
                    <p className="text-gray-700 text-sm font-medium">
                      Xin chào! Chúng tôi có thể giúp gì cho bạn?
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      Hãy gửi tin nhắn để bắt đầu trò chuyện
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message._id}
                        className={`flex ${
                          message.senderType === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-sm ${
                            message.senderType === "user"
                              ? "bg-gradient-to-r from-gray-800 to-gray-900 text-white"
                              : "bg-white border border-gray-200 text-gray-800"
                          } rounded-2xl p-3 shadow-sm`}
                        >
                          <div className="text-sm leading-relaxed">
                            {message.type === "image" ? (
                              <div className="relative">
                                <img
                                  src={message.content}
                                  alt="Ảnh đã gửi"
                                  className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() =>
                                    window.open(message.content, "_blank")
                                  }
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = "/images/image-error.png";
                                    target.alt = "Lỗi tải ảnh";
                                  }}
                                />
                                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                  📷
                                </div>
                              </div>
                            ) : message.type === "product" ? (
                              <div className="w-full max-w-sm">
                                {(() => {
                                  try {
                                    const productData = JSON.parse(
                                      message.content
                                    );
                                    const finalPrice =
                                      productData.price *
                                      (1 - (productData.discount || 0) / 100);
                                    return (
                                      <div
                                        className="bg-white border-2 border-gray-100 rounded-xl p-4 cursor-pointer hover:border-gray-300 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                                        onClick={() => {
                                          // Navigate to product detail page với variant và size parameter
                                          const params = new URLSearchParams();
                                          if (productData.size) {
                                            params.set(
                                              "size",
                                              productData.size
                                            );
                                          }
                                          // Sử dụng variantId làm ID chính trong URL
                                          window.location.href = `/products/${
                                            productData.variantId
                                          }?${params.toString()}`;
                                        }}
                                      >
                                        {/* Header với icon */}
                                        <div className="flex items-center gap-2 mb-3">
                                          <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                            Sản phẩm được gợi ý
                                          </span>
                                        </div>

                                        {/* Product content */}
                                        <div className="flex gap-4">
                                          <div className="relative">
                                            <img
                                              src={productData.image}
                                              alt={productData.name}
                                              className="w-20 h-20 rounded-lg object-cover shadow-sm"
                                              onError={(e) => {
                                                const target =
                                                  e.target as HTMLImageElement;
                                                target.src =
                                                  "/images/no-image.png";
                                              }}
                                            />
                                            {productData.discount > 0 && (
                                              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                                                -{productData.discount}%
                                              </div>
                                            )}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-gray-900 mb-2 text-sm leading-tight">
                                              {productData.name}
                                            </h4>

                                            {/* Variant info */}
                                            <div className="flex flex-wrap gap-1 mb-3">
                                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 font-medium">
                                                {productData.color}
                                              </span>
                                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 font-medium">
                                                Size: {productData.size}
                                              </span>
                                            </div>

                                            {/* Price */}
                                            <div className="flex items-center gap-2 mb-2">
                                              <span className="text-lg font-bold text-red-600">
                                                {finalPrice.toLocaleString(
                                                  "vi-VN"
                                                )}
                                                đ
                                              </span>
                                              {productData.discount > 0 && (
                                                <span className="text-sm text-gray-400 line-through">
                                                  {productData.price.toLocaleString(
                                                    "vi-VN"
                                                  )}
                                                  đ
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>

                                        {/* Call to action */}
                                        <div className="mt-4 pt-3 border-t border-gray-100">
                                          <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">
                                              Nhấn để xem chi tiết
                                            </span>
                                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                                              <span className="text-gray-600 text-xs">
                                                →
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  } catch (error) {
                                    return (
                                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                        <div className="text-red-600 text-sm font-medium">
                                          ⚠️ Lỗi hiển thị sản phẩm
                                        </div>
                                      </div>
                                    );
                                  }
                                })()}
                              </div>
                            ) : (
                              message.content
                            )}
                          </div>
                          <div
                            className={`mt-2 text-xs ${
                              message.senderType === "user"
                                ? "text-gray-300"
                                : "text-gray-500"
                            } flex justify-between items-center`}
                          >
                            {message.senderType === "admin" && (
                              <span className="font-semibold text-gray-700 flex items-center">
                                {message.senderId?.name === "AI Assistant" ? (
                                  <>
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                                    <span className="text-blue-600">🤖 AI Assistant</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                                    {message.senderId?.name || "Admin"}
                                  </>
                                )}
                              </span>
                            )}
                            <span
                              className={
                                message.senderType === "user"
                                  ? "ml-auto"
                                  : "ml-auto"
                              }
                            >
                              {formatTime(message.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies - Chỉ hiển thị khi cuộc trò chuyện mới (chưa có tin nhắn) */}
              {conversation &&
                conversation.status !== "closed" &&
                messages.length === 0 && (
                  <div className="px-4 py-2 border-t border-gray-100">
                    <div className="text-xs text-gray-600 mb-2 font-medium">
                      💡 Câu hỏi thường gặp:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {quickReplies.map((reply, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickReply(reply)}
                          className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors duration-200 border border-gray-200"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              {/* Input Area */}
              <div className="p-4 border-t border-gray-200 bg-white rounded-b-xl">
                <form onSubmit={sendMessage} className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={conversation?.status === "closed" || isUploading}
                    className="bg-gray-100 hover:bg-gray-200 disabled:bg-gray-300 text-gray-700 p-3 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100"
                    aria-label="Gửi ảnh"
                  >
                    {isUploading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700"></div>
                    ) : (
                      <Image size={16} />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Nhập tin nhắn của bạn..."
                    rows={1}
                    disabled={conversation?.status === "closed" || isSending}
                    className="flex-1 resize-none border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-100 placeholder-gray-500"
                  />
                  <button
                    type="submit"
                    disabled={
                      !newMessage.trim() ||
                      isSending ||
                      conversation?.status === "closed"
                    }
                    className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black disabled:from-gray-300 disabled:to-gray-400 text-white p-3 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 shadow-lg"
                    aria-label="Gửi tin nhắn"
                  >
                    {isSending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Send size={16} />
                    )}
                  </button>
                </form>
                {conversation?.status === "closed" && (
                  <div className="mt-3 p-3 bg-gray-100 rounded-lg">
                    <p className="text-xs text-gray-600 text-center">
                      ⚠️ Cuộc trò chuyện đã kết thúc. Bạn có thể mở chat mới bất
                      cứ lúc nào.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatBox;
