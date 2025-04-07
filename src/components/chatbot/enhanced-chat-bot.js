"use client";

import { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  X,
  Send,
  Loader2,
  ChevronDown,
  Search,
  ShoppingCart,
} from "lucide-react";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { useProductContext } from "../../context/product-context-provider";

export default function EnhancedProductChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Xin chào! Tôi có thể giúp gì cho bạn về các sản phẩm của chúng tôi?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { products, isLoading: productsLoading } = useProductContext();

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");

    // Add user message to chat
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      // Create a context with product information for the AI
      const productContext = products
        .slice(0, 20)
        .map(
          (product) =>
            `ID: ${product.id}, Tên: ${product.name}, Giá: ${
              product.price
            }đ, Danh mục: ${product.category?.name || "N/A"}, Tồn kho: ${
              product.stock
            }`
        )
        .join("\n");

      // Generate response using AI
      const { text } = await generateText({
        model: openai("gpt-4o"),
        system: `Bạn là trợ lý hỗ trợ khách hàng cho cửa hàng trực tuyến. 
        Hãy trả lời các câu hỏi về sản phẩm dựa trên thông tin sau đây. 
        Nếu không có thông tin về sản phẩm cụ thể, hãy đề nghị khách hàng tìm kiếm trên trang web hoặc liên hệ với bộ phận hỗ trợ.
        Nếu khách hàng hỏi về sản phẩm có sẵn, hãy kiểm tra tồn kho và cho họ biết.
        Nếu khách hàng hỏi về giá cả, hãy cung cấp thông tin chính xác.
        Trả lời bằng tiếng Việt, thân thiện và hữu ích.
        
        THÔNG TIN SẢN PHẨM:
        ${productContext}`,
        prompt: userMessage,
      });

      // Add AI response to chat
      setMessages((prev) => [...prev, { role: "assistant", content: text }]);
    } catch (error) {
      console.error("Error generating response:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Xin lỗi, tôi đang gặp sự cố khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick action buttons
  const quickActions = [
    {
      label: "Sản phẩm mới",
      icon: <Search size={14} />,
      message: "Sản phẩm mới nhất là gì?",
    },
    {
      label: "Giá tốt nhất",
      icon: <ShoppingCart size={14} />,
      message: "Sản phẩm nào có giá tốt nhất?",
    },
  ];

  const handleQuickAction = (message) => {
    setInput(message);
    // Optional: auto-submit the form
    // handleSendMessage({ preventDefault: () => {} });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {/* Chat window */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-lg w-80 sm:w-96 mb-2 flex flex-col border border-gray-200 overflow-hidden">
          {/* Chat header */}
          <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
            <h3 className="font-medium">Hỗ trợ sản phẩm</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-blue-700 rounded-full p-1"
            >
              <X size={18} />
            </button>
          </div>

          {/* Chat messages */}
          <div className="flex-1 p-3 overflow-y-auto max-h-96 space-y-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3 text-gray-800 flex items-center">
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Đang trả lời...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick actions */}
          <div className="border-t border-gray-200 p-2 flex space-x-2 overflow-x-auto">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action.message)}
                className="flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm whitespace-nowrap"
              >
                {action.icon}
                <span>{action.label}</span>
              </button>
            ))}
          </div>

          {/* Chat input */}
          <form
            onSubmit={handleSendMessage}
            className="border-t border-gray-200 p-3 flex"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi về sản phẩm..."
              className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Chat button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg flex items-center"
      >
        {isOpen ? (
          <ChevronDown size={24} />
        ) : (
          <>
            <MessageSquare size={24} />
            {!isOpen && <span className="ml-2 mr-1">Hỗ trợ</span>}
          </>
        )}
      </button>
    </div>
  );
}
