import callApi from "./apiService"


const VNPayService = {
  createPaymentRequest: async (amount, bankCode = "") => {
    try {
      // Convert amount to BigDecimal format for the backend
      const amountValue = Math.round(Number(amount))

      // Prepare the request payload according to VNPay requirements
      const payload = {
        amount: amountValue,
        // Only include bankCode if it's not empty
        ...(bankCode ? { bankCode } : {}),
      }

      console.log("Sending VNPay request with payload:", payload)

      const response = await callApi(
        "vnpay/withdraw", // Endpoint matching the backend controller
        "POST", // Method
        payload, // Body data
        {}, // Empty params object
      )

      return response
    } catch (error) {
      console.error("Error creating VNPay payment:", error)

      // Check if there's a more specific error message from the server
      if (error.response && error.response.data) {
        const serverError = error.response.data
        console.error("Server error details:", serverError)

        // Throw a more informative error
        throw new Error(serverError.message || serverError.error || "Server error when creating payment request")
      }

      throw error
    }
  },

  processPaymentResult: async (searchParams) => {
    const vnpResponseCode = searchParams.get("vnp_ResponseCode")
    const vnpTxnRef = searchParams.get("vnp_TxnRef")
    const vnpAmount = searchParams.get("vnp_Amount")
    const vnpBankCode = searchParams.get("vnp_BankCode")
    const vnpPayDate = searchParams.get("vnp_PayDate")
    const vnpTransactionNo = searchParams.get("vnp_TransactionNo")
    const vnpCardType = searchParams.get("vnp_CardType")
    const vnpOrderInfo = searchParams.get("vnp_OrderInfo")
    const vnpBankTranNo = searchParams.get("vnp_BankTranNo")

    // Map error codes to user-friendly messages
    const errorMessages = {
      "00": "Giao dịch thành công",
      "01": "Giao dịch đã tồn tại",
      "02": "Merchant không hợp lệ",
      "03": "Dữ liệu gửi sang không đúng định dạng",
      "04": "Khởi tạo GD không thành công do Website đang bị tạm khóa",
      "05": "Giao dịch không thành công do: Quý khách nhập sai mật khẩu thanh toán quá số lần quy định",
      "06": "Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch",
      "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường)",
      "09": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking",
      10: "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần",
      11: "Giao dịch không thành công do: Đã hết hạn chờ thanh toán",
      12: "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa",
      13: "Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch",
      24: "Giao dịch không thành công do: Khách hàng hủy giao dịch",
      51: "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch",
      65: "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày",
      75: "Ngân hàng thanh toán đang bảo trì",
      79: "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán nhiều lần",
      99: "Các lỗi khác",
    }

    // For client-side validation only
    if (vnpResponseCode === "00") {
      return {
        success: true,
        message: errorMessages[vnpResponseCode] || "Thanh toán thành công",
        transactionId: vnpTxnRef,
        amount: vnpAmount ? Number.parseInt(vnpAmount) / 100 : 0, // VNPay returns amount in smallest currency unit
        bankCode: vnpBankCode,
        payDate: vnpPayDate,
        transactionNo: vnpTransactionNo,
        cardType: vnpCardType,
        orderInfo: vnpOrderInfo,
        bankTranNo: vnpBankTranNo,
      }
    } else {
      const errorMessage = errorMessages[vnpResponseCode] || `Thanh toán thất bại. Mã lỗi: ${vnpResponseCode}`

      return {
        success: false,
        message: errorMessage,
        transactionId: vnpTxnRef,
        responseCode: vnpResponseCode,
      }
    }
  },
}

export default VNPayService

