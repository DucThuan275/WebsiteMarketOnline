"use client"

import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import VNPayService from "../../../api/VNPayService"
import OrderService from "../../../api/OrderService"
import CartService from "../../../api/CartService"

const VNPayCallbackHandler = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [status, setStatus] = useState("processing")
  const [message, setMessage] = useState("Đang xử lý kết quả thanh toán...")
  const [debug, setDebug] = useState({})

  useEffect(() => {
    const processPaymentResult = async () => {
      try {
        // Log all URL parameters for debugging
        const searchParams = new URLSearchParams(location.search)
        const paramsObj = {}
        for (const [key, value] of searchParams.entries()) {
          paramsObj[key] = value
        }
        console.log("VNPay callback parameters:", paramsObj)
        setDebug(paramsObj)

        if (!searchParams.has("vnp_ResponseCode")) {
          setStatus("error")
          setMessage("Không tìm thấy thông tin thanh toán")
          return
        }

        // Process the payment result
        const result = await VNPayService.processPaymentResult(searchParams)
        console.log("Payment result:", result)

        // Get the pending order from localStorage
        const pendingOrderData = localStorage.getItem("pendingOrder")
        console.log("Pending order data from localStorage:", pendingOrderData)

        if (!pendingOrderData) {
          setStatus("error")
          setMessage("Không tìm thấy thông tin đơn hàng trong localStorage. Vui lòng thử lại.")
          return
        }

        try {
          const pendingOrder = JSON.parse(pendingOrderData)
          console.log("Parsed pending order:", pendingOrder)

          if (result.success) {
            // Format the amount correctly (VNPay returns amount in smallest currency unit)
            const amount = searchParams.get("vnp_Amount") ? Number.parseInt(searchParams.get("vnp_Amount")) / 100 : 0

            // Create the order with complete payment information
            const orderData = {
              ...pendingOrder,
              paymentMethod: "VNPAY",
              paymentStatus: "PAID",
              paymentDetails: {
                transactionId: searchParams.get("vnp_TxnRef"),
                amount: amount,
                bankCode: searchParams.get("vnp_BankCode"),
                bankTranNo: searchParams.get("vnp_BankTranNo"),
                cardType: searchParams.get("vnp_CardType"),
                payDate: searchParams.get("vnp_PayDate"),
                transactionNo: searchParams.get("vnp_TransactionNo"),
                responseCode: searchParams.get("vnp_ResponseCode"),
                orderInfo: searchParams.get("vnp_OrderInfo"),
              },
            }

            console.log("Creating order with data:", orderData)

            try {
              // Create the order in the system
              const orderResponse = await OrderService.createOrder(orderData)
              console.log("Order created successfully:", orderResponse)

              // Clear cart and pending order
              await CartService.clearCart()
              localStorage.removeItem("pendingOrder")

              setStatus("success")
              setMessage("Thanh toán thành công! Đơn hàng của bạn đã được xác nhận.")

              // Redirect to order confirmation after a delay
              setTimeout(() => {
                navigate("/trang-chu/gio-hang/thanh-toan/xac-nhan-don-hang/" + result.transactionId, {
                  state: { paymentResult: result },
                })
              }, 2000)
            } catch (orderError) {
              console.error("Error creating order:", orderError)
              setStatus("error")
              setMessage(
                "Thanh toán thành công nhưng không thể tạo đơn hàng: " +
                  (orderError.response?.data?.message || orderError.message),
              )
            }
          } else {
            setStatus("error")
            setMessage(result.message || "Thanh toán thất bại")

            // Clean up
            localStorage.removeItem("pendingOrder")
          }
        } catch (parseError) {
          console.error("Error parsing pending order data:", parseError)
          setStatus("error")
          setMessage("Lỗi khi xử lý dữ liệu đơn hàng: " + parseError.message)
        }
      } catch (error) {
        console.error("Error processing payment callback:", error)
        setStatus("error")
        setMessage("Đã xảy ra lỗi khi xử lý kết quả thanh toán: " + (error.message || "Lỗi không xác định"))
      }
    }

    processPaymentResult()
  }, [location, navigate])

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md text-center">
        {status === "processing" && (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Đang xử lý</h2>
            <p className="text-gray-600">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-green-600 mb-2">Thanh toán thành công!</h2>
            <p className="text-gray-600">{message}</p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-red-600 mb-2">Thanh toán thất bại</h2>
            <p className="text-gray-600">{message}</p>

            {/* Debug information - remove in production */}
            <div className="mt-4 p-4 bg-gray-100 rounded text-left text-xs overflow-auto max-h-40">
              <p className="font-bold">Debug Info:</p>
              <pre>{JSON.stringify(debug, null, 2)}</pre>
            </div>

            <button
              onClick={() => navigate("/trang-chu/gio-hang/thanh-toan")}
              className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Quay lại thanh toán
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default VNPayCallbackHandler

