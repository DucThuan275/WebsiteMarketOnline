"use client"

import { useState, useRef, useEffect } from "react"
import { MessageSquare, X, Send, Loader2, ChevronDown, Search, ShoppingCart, Star, BarChart2 } from 'lucide-react'

// Import các service và component cần thiết
import ProductService from "../../api/ProductService"
import ReviewService from "../../api/ReviewService"
import ProductCard from "./product-card"
import ProductComparison from "./product-comparison"

export default function ProductChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Xin chào! Tôi có thể giúp gì cho bạn về các sản phẩm của chúng tôi?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [products, setProducts] = useState([])
  const [productReviews, setProductReviews] = useState({})
  const [productRatings, setProductRatings] = useState({})
  const [comparedProducts, setComparedProducts] = useState([])
  const messagesEndRef = useRef(null)

  // Fetch products when component mounts
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await ProductService.getActiveProducts(
          "", // keyword
          "", // status
          "", // categoryId
          "", // sellerId
          "", // minPrice
          "", // maxPrice
          "", // minStock
          "", // maxStock
          0, // page
          100, // size
          "id", // sortField
          "asc", // sortDirection
        )
        setProducts(data.content || data)
      } catch (error) {
        console.error("Error fetching products:", error)
      }
    }

    fetchProducts()
  }, [])

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Fetch product reviews and ratings when needed
  const fetchProductDetails = async (productId) => {
    try {
      // Chỉ fetch nếu chưa có trong state
      if (!productReviews[productId]) {
        const reviews = await ReviewService.getProductReviews(productId, {
          page: 0,
          size: 5,
        })
        setProductReviews((prev) => ({
          ...prev,
          [productId]: reviews.content || [],
        }))
      }

      if (!productRatings[productId]) {
        const ratings = await ReviewService.getProductRatingStats(productId)
        setProductRatings((prev) => ({
          ...prev,
          [productId]: ratings,
        }))
      }
    } catch (error) {
      console.error("Error fetching product details:", error)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()

    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")

    // Add user message to chat
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    try {
      // Xử lý câu hỏi dựa trên từ khóa và nhận diện nội dung
      const lowerCaseMessage = userMessage.toLowerCase()
      let response = ""
      let productList = []
      let isComparison = false

      // Kiểm tra xem có phải là yêu cầu so sánh sản phẩm không
      if (
        lowerCaseMessage.includes("so sánh") || 
        lowerCaseMessage.includes("đối chiếu") || 
        lowerCaseMessage.includes("compare")
      ) {
        // Tìm các sản phẩm được đề cập trong tin nhắn
        const mentionedProducts = findMentionedProducts(userMessage, products)
        
        if (mentionedProducts.length >= 2) {
          // Nếu tìm thấy ít nhất 2 sản phẩm, thực hiện so sánh
          response = `Dưới đây là bảng so sánh giữa ${mentionedProducts[0].name} và ${mentionedProducts[1].name}:`
          productList = mentionedProducts
          isComparison = true
          setComparedProducts(mentionedProducts)
        } else if (mentionedProducts.length === 1) {
          // Nếu chỉ tìm thấy 1 sản phẩm, yêu cầu người dùng chỉ định sản phẩm thứ 2
          response = `Tôi đã tìm thấy sản phẩm "${mentionedProducts[0].name}". Vui lòng chỉ định thêm một sản phẩm khác để so sánh.`
          productList = mentionedProducts
        } else {
          // Nếu không tìm thấy sản phẩm nào, yêu cầu người dùng cung cấp thông tin
          response = "Vui lòng chỉ định rõ tên các sản phẩm bạn muốn so sánh. Ví dụ: 'So sánh Laptop HP và Laptop Dell'"
        }
      }
      // Tìm sản phẩm cụ thể trước
      else if (comparedProducts.length === 1 && 
              (lowerCaseMessage.includes("với") || 
               lowerCaseMessage.includes("và") || 
               lowerCaseMessage.includes("so sánh với"))) {
        // Người dùng đang cố gắng chỉ định sản phẩm thứ 2 để so sánh
        const secondProduct = findExactProduct(userMessage, products)
        
        if (secondProduct && secondProduct.id !== comparedProducts[0].id) {
          // Nếu tìm thấy sản phẩm thứ 2 và khác với sản phẩm đầu tiên
          response = `Dưới đây là bảng so sánh giữa ${comparedProducts[0].name} và ${secondProduct.name}:`
          productList = [comparedProducts[0], secondProduct]
          isComparison = true
          setComparedProducts([comparedProducts[0], secondProduct])
        } else if (secondProduct && secondProduct.id === comparedProducts[0].id) {
          // Nếu sản phẩm thứ 2 trùng với sản phẩm đầu tiên
          response = "Bạn không thể so sánh một sản phẩm với chính nó. Vui lòng chọn một sản phẩm khác."
          productList = [comparedProducts[0]]
        } else {
          // Nếu không tìm thấy sản phẩm thứ 2
          response = "Tôi không tìm thấy sản phẩm thứ hai để so sánh. Vui lòng cung cấp tên sản phẩm cụ thể hơn."
          productList = [comparedProducts[0]]
        }
      }
      // Tìm sản phẩm cụ thể trước
      else {
        const exactProductMatch = findExactProduct(userMessage, products)
        
        // Nếu tìm thấy sản phẩm cụ thể và câu hỏi yêu cầu thông tin chi tiết
        if (
          exactProductMatch &&
          (lowerCaseMessage.includes("thông tin") ||
            lowerCaseMessage.includes("chi tiết") ||
            lowerCaseMessage.includes("mô tả"))
        ) {
          // Fetch thêm thông tin về sản phẩm nếu cần
          await fetchProductDetails(exactProductMatch.id)

          // Tạo phản hồi chi tiết về sản phẩm
          response = formatDetailedProductInfo(exactProductMatch, productRatings[exactProductMatch.id])
          productList = [exactProductMatch]
          
          // Reset danh sách sản phẩm so sánh
          setComparedProducts([])
        }
        // Xử lý câu hỏi về đánh giá sản phẩm
        else if (
          exactProductMatch &&
          (lowerCaseMessage.includes("đánh giá") ||
            lowerCaseMessage.includes("review") ||
            lowerCaseMessage.includes("nhận xét"))
        ) {
          // Fetch thông tin đánh giá nếu cần
          await fetchProductDetails(exactProductMatch.id)

          // Tạo phản hồi về đánh giá sản phẩm
          const reviews = productReviews[exactProductMatch.id] || []
          const ratings = productRatings[exactProductMatch.id]

          response = formatProductReviews(exactProductMatch, reviews, ratings)
          productList = [exactProductMatch]
          
          // Reset danh sách sản phẩm so sánh
          setComparedProducts([])
        }
        // Xử lý câu hỏi về người bán
        else if (
          exactProductMatch &&
          (lowerCaseMessage.includes("người bán") ||
            lowerCaseMessage.includes("seller") ||
            lowerCaseMessage.includes("shop"))
        ) {
          response = formatSellerInfo(exactProductMatch)
          productList = [exactProductMatch]
          
          // Reset danh sách sản phẩm so sánh
          setComparedProducts([])
        }
        // Xử lý câu hỏi về lượt bán
        else if (
          exactProductMatch &&
          (lowerCaseMessage.includes("lượt bán") ||
            lowerCaseMessage.includes("đã bán") ||
            lowerCaseMessage.includes("bán được"))
        ) {
          response = formatSalesInfo(exactProductMatch)
          productList = [exactProductMatch]
          
          // Reset danh sách sản phẩm so sánh
          setComparedProducts([])
        }
        // Kiểm tra xem có phải đang tìm kiếm sản phẩm không
        else if (isProductSearch(lowerCaseMessage)) {
          const matchingProducts = findRelevantProducts(lowerCaseMessage, products)

          if (matchingProducts.length > 0) {
            response = `Tôi tìm thấy ${matchingProducts.length} sản phẩm phù hợp:`
            productList = matchingProducts
            
            // Reset danh sách sản phẩm so sánh
            setComparedProducts([])
          } else {
            response =
              'Tôi không tìm thấy sản phẩm nào phù hợp với yêu cầu của bạn. Vui lòng thử tìm kiếm với từ khóa ngắn hơn hoặc chung hơn (ví dụ: "laptop Asus" thay vì mã sản phẩm đầy đủ).'
          }
        }
        // Xử lý câu hỏi về giá cả
        else if (lowerCaseMessage.includes("giá") || lowerCaseMessage.includes("bao nhiêu")) {
          const matchingProducts = findRelevantProducts(lowerCaseMessage, products)

          if (matchingProducts.length > 0) {
            response = "Thông tin giá của các sản phẩm phù hợp:"
            productList = matchingProducts
            
            // Reset danh sách sản phẩm so sánh
            setComparedProducts([])
          } else {
            response = "Bạn muốn biết giá của sản phẩm nào? Vui lòng cung cấp thêm thông tin."
          }
        }
        // Xử lý câu hỏi về tồn kho
        else if (lowerCaseMessage.includes("còn hàng") || lowerCaseMessage.includes("tồn kho")) {
          const matchingProducts = findRelevantProducts(lowerCaseMessage, products)

          if (matchingProducts.length > 0) {
            response = "Thông tin tồn kho của các sản phẩm phù hợp:"
            productList = matchingProducts
            
            // Reset danh sách sản phẩm so sánh
            setComparedProducts([])
          } else {
            response = "Bạn muốn biết tình trạng tồn kho của sản phẩm nào? Vui lòng cung cấp thêm thông tin."
          }
        }
        // Xử lý câu hỏi về danh mục
        else if (
          lowerCaseMessage.includes("danh mục") ||
          lowerCaseMessage.includes("loại") ||
          lowerCaseMessage.includes("phân loại")
        ) {
          // Lấy danh sách các danh mục duy nhất
          const categories = [
            ...new Set(
              products
                .filter((product) => product.category && product.category.name)
                .map((product) => product.category.name),
            ),
          ]

          if (categories.length > 0) {
            response = `Chúng tôi có các danh mục sản phẩm sau:\n\n${categories.map((cat) => `- ${cat}`).join("\n")}`
          } else {
            response = "Hiện tại chúng tôi chưa có thông tin về danh mục sản phẩm."
          }
          
          // Reset danh sách sản phẩm so sánh
          setComparedProducts([])
        }
        // Câu trả lời mặc định
        else {
          response =
            "Tôi có thể giúp bạn tìm kiếm sản phẩm, kiểm tra giá cả, tình trạng tồn kho, thông tin chi tiết về sản phẩm, đánh giá, người bán, lượt bán và so sánh các sản phẩm. Vui lòng hỏi cụ thể hơn."
          
          // Reset danh sách sản phẩm so sánh
          setComparedProducts([])
        }
      }

      // Add AI response to chat after a small delay to feel more natural
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: response,
            products: productList.length > 0 ? productList : undefined,
            isComparison: isComparison
          },
        ])
        setIsLoading(false)
      }, 800)
    } catch (error) {
      console.error("Error generating response:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Xin lỗi, tôi đang gặp sự cố khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.",
        },
      ])
      setIsLoading(false)
    }
  }

  // Tìm các sản phẩm được đề cập trong tin nhắn
  const findMentionedProducts = (message, products) => {
    if (!products || products.length === 0) {
      return [];
    }
    
    const lowerCaseMessage = message.toLowerCase();
    const mentionedProducts = [];
    
    // Tìm các sản phẩm được đề cập theo tên
    for (const product of products) {
      if (!product || !product.name) continue;
      
      if (lowerCaseMessage.includes(product.name.toLowerCase())) {
        mentionedProducts.push(product);
      } else if (product.model && lowerCaseMessage.includes(product.model.toLowerCase())) {
        mentionedProducts.push(product);
      }
    }
    
    // Nếu không tìm thấy sản phẩm nào theo tên chính xác, thử tìm theo từ khóa
    if (mentionedProducts.length < 2) {
      const keywords = lowerCaseMessage
        .split(/\s+và\s+|\s+với\s+|\s+or\s+|\s+and\s+|\s+vs\s+|\s+versus\s+/)
        .map(part => part.trim())
        .filter(part => part.length > 3);
      
      if (keywords.length >= 2) {
        for (const keyword of keywords) {
          const matchingProducts = findRelevantProducts(keyword, products);
          
          for (const product of matchingProducts) {
            // Kiểm tra xem sản phẩm đã có trong danh sách chưa
            if (!mentionedProducts.some(p => p.id === product.id)) {
              mentionedProducts.push(product);
              if (mentionedProducts.length >= 2) break;
            }
          }
          
          if (mentionedProducts.length >= 2) break;
        }
      }
    }
    
    return mentionedProducts.slice(0, 2); // Chỉ trả về tối đa 2 sản phẩm
  };

  // Kiểm tra xem có phải đang tìm kiếm sản phẩm không
  const isProductSearch = (message) => {
    return (
      message.includes("sản phẩm") ||
      message.includes("hàng") ||
      message.includes("mua") ||
      message.includes("bán") ||
      message.length > 10
    )
  }

  // Tìm sản phẩm chính xác dựa trên tên đầy đủ
  const findExactProduct = (message, products) => {
    if (!products || products.length === 0) {
      return null
    }

    // Tìm sản phẩm có tên chính xác hoặc gần giống với tin nhắn
    for (const product of products) {
      if (!product || !product.name) continue

      // Nếu tin nhắn chứa tên sản phẩm đầy đủ
      if (message.toLowerCase().includes(product.name.toLowerCase())) {
        return product
      }

      // Nếu sản phẩm có mã model và tin nhắn chứa mã model
      if (product.model && message.toLowerCase().includes(product.model.toLowerCase())) {
        return product
      }
    }

    return null
  }

  // Hàm tìm sản phẩm phù hợp với câu hỏi
  const findRelevantProducts = (message, products) => {
    if (!products || products.length === 0) {
      return []
    }

    // Kiểm tra xem có phải là tìm kiếm chính xác không (nếu tin nhắn chứa nhiều từ và có thể là tên sản phẩm)
    const exactSearch = message.split(" ").length > 2

    // Nếu là tìm kiếm chính xác, thử tìm sản phẩm có tên gần giống với tin nhắn
    if (exactSearch) {
      // Tìm kiếm chính xác trước
      const exactMatches = products.filter((product) => {
        if (!product || !product.name) return false
        return product.name.toLowerCase().includes(message)
      })

      if (exactMatches.length > 0) {
        return exactMatches.slice(0, 5)
      }
    }

    // Nếu không tìm thấy kết quả chính xác, tách từ khóa và tìm kiếm từng từ
    const keywords = message
      .toLowerCase()
      .split(" ")
      .filter((word) => word.length > 2)

    // Tính điểm phù hợp cho mỗi sản phẩm
    const scoredProducts = products
      .filter((product) => product && product.name)
      .map((product) => {
        const productName = product.name.toLowerCase()
        const categoryName = product.category?.name?.toLowerCase() || ""
        const description = product.description?.toLowerCase() || ""
        const model = product.model?.toLowerCase() || ""

        // Tính điểm dựa trên số từ khóa phù hợp
        let score = 0
        for (const keyword of keywords) {
          if (keyword.length <= 2) continue // Bỏ qua từ quá ngắn

          if (productName.includes(keyword)) {
            score += 2 // Từ khóa có trong tên sản phẩm được ưu tiên hơn
          } else if (model.includes(keyword)) {
            score += 2 // Từ khóa có trong mã model được ưu tiên
          } else if (categoryName.includes(keyword)) {
            score += 1
          } else if (description && description.includes(keyword)) {
            score += 0.5
          }
        }

        return { product, score }
      })
      .filter((item) => item.score > 0) // Chỉ giữ lại sản phẩm có điểm > 0
      .sort((a, b) => b.score - a.score) // Sắp xếp theo điểm giảm dần
      .map((item) => item.product)

    return scoredProducts.slice(0, 5) // Giới hạn 5 sản phẩm để không quá dài
  }

  // Format thông tin chi tiết sản phẩm
  const formatDetailedProductInfo = (product, ratings) => {
    if (!product) return "Không tìm thấy thông tin sản phẩm."

    let info = `📌 Thông tin chi tiết về sản phẩm: ${product.name}\n\n`

    // Thông tin cơ bản
    info += `📝 Mô tả: ${product.description || "Không có mô tả"}\n\n`
    info += `💰 Giá: ${product.price?.toLocaleString() || "Liên hệ"}đ\n`
    info += `🏷️ Danh mục: ${product.category?.name || "Chưa phân loại"}\n`
    info += `📦 Tồn kho: ${product.stock || "Đang cập nhật"} sản phẩm\n`

    // Thông tin model nếu có
    if (product.model) {
      info += `🔢 Mã model: ${product.model}\n`
    }

    // Thông tin thương hiệu nếu có
    if (product.brand) {
      info += `🏭 Thương hiệu: ${product.brand}\n`
    }

    // Thông tin đánh giá nếu có
    if (ratings) {
      info += `⭐ Đánh giá trung bình: ${ratings.averageRating?.toFixed(1) || "Chưa có"} (${ratings.totalReviews || 0} đánh giá)\n`
    }

    // Thông tin người bán nếu có
    if (product.seller) {
      info += `\n👤 Người bán: ${product.seller.name || "Không có thông tin"}\n`
    }

    // Thông tin bảo hành nếu có
    if (product.warranty) {
      info += `\n🔧 Bảo hành: ${product.warranty}\n`
    }

    return info
  }

  // Format thông tin đánh giá sản phẩm
  const formatProductReviews = (product, reviews, ratings) => {
    if (!product) return "Không tìm thấy thông tin sản phẩm."

    let info = `📊 Đánh giá về sản phẩm: ${product.name}\n\n`

    // Thông tin đánh giá tổng quan
    if (ratings) {
      info += `⭐ Đánh giá trung bình: ${ratings.averageRating?.toFixed(1) || "Chưa có"} (${ratings.totalReviews || 0} đánh giá)\n\n`
    } else {
      info += "⭐ Chưa có đánh giá cho sản phẩm này.\n\n"
    }

    // Danh sách đánh giá cụ thể
    if (reviews && reviews.length > 0) {
      info += "📝 Một số đánh giá gần đây:\n\n"

      reviews.slice(0, 3).forEach((review, index) => {
        info += `${index + 1}. ${review.user?.name || "Khách hàng"} - ${review.rating}⭐\n`
        info += `   "${review.comment}"\n`
        if (review.verifiedPurchase) {
          info += "   ✅ Đã mua hàng\n"
        }
        info += "\n"
      })

      if (reviews.length > 3) {
        info += `... và ${reviews.length - 3} đánh giá khác.\n`
      }
    } else {
      info += "Chưa có đánh giá nào cho sản phẩm này.\n"
    }

    return info
  }

  // Format thông tin người bán
  const formatSellerInfo = (product) => {
    if (!product) return "Không tìm thấy thông tin sản phẩm."

    let info = `👤 Thông tin người bán sản phẩm: ${product.name}\n\n`

    if (product.seller) {
      info += `Tên shop: ${product.seller.name || "Không có thông tin"}\n`
      info += `Đánh giá shop: ${product.seller.rating?.toFixed(1) || "Chưa có"} ⭐\n`
      info += `Sản phẩm đang bán: ${product.seller.productCount || "Không có thông tin"}\n`
      info += `Thời gian hoạt động: ${product.seller.activeYears || "Không có thông tin"}\n`

      if (product.seller.description) {
        info += `\nGiới thiệu: ${product.seller.description}\n`
      }
    } else {
      info += "Không có thông tin về người bán sản phẩm này.\n"
    }

    return info
  }

  // Format thông tin lượt bán
  const formatSalesInfo = (product) => {
    if (!product) return "Không tìm thấy thông tin sản phẩm."

    let info = `📊 Thông tin lượt bán sản phẩm: ${product.name}\n\n`

    if (product.salesCount !== undefined) {
      info += `Đã bán: ${product.salesCount} sản phẩm\n`

      if (product.lastSoldDate) {
        info += `Lần bán gần nhất: ${new Date(product.lastSoldDate).toLocaleDateString("vi-VN")}\n`
      }

      if (product.salesTrend) {
        info += `Xu hướng bán: ${product.salesTrend}\n`
      }
    } else {
      info += "Chưa có thông tin về lượt bán của sản phẩm này.\n"
    }

    return info
  }

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
    {
      label: "Đánh giá cao",
      icon: <Star size={14} />,
      message: "Sản phẩm nào có đánh giá tốt nhất?",
    },
    {
      label: "So sánh sản phẩm",
      icon: <BarChart2 size={14} />,
      message: "So sánh các sản phẩm",
    },
  ]

  const handleQuickAction = (message) => {
    setInput(message)
    // Automatically submit the form for better user experience
    setTimeout(() => {
      const event = { preventDefault: () => {} }
      handleSendMessage(event)
    }, 100)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {/* Chat window */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-lg w-80 sm:w-96 mb-2 flex flex-col border border-gray-200 overflow-hidden">
          {/* Chat header */}
          <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
            <h3 className="font-medium">Hỗ trợ sản phẩm</h3>
            <button onClick={() => setIsOpen(false)} className="text-white hover:bg-blue-700 rounded-full p-1">
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
                  className={`max-w-[85%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {message.content.split("\n").map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                  
                  {/* Hiển thị bảng so sánh sản phẩm nếu là tin nhắn so sánh */}
                  {message.isComparison && message.products && message.products.length >= 2 && (
                    <div className="mt-3 pt-2">
                      <ProductComparison products={message.products} />
                    </div>
                  )}
                  
                  {/* Hiển thị danh sách sản phẩm nếu không phải là tin nhắn so sánh */}
                  {!message.isComparison && message.products && message.products.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-gray-200 space-y-2">
                      {message.products.map((product, idx) => (
                        <ProductCard key={idx} product={product} />
                      ))}
                    </div>
                  )}
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
          <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-3 flex">
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
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg flex items-center transition-all duration-300 hover:shadow-xl"
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
  )
}
