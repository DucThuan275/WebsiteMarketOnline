"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Home, ChevronRight, Truck, ShoppingBag, Loader2, AlertCircle, Check, ArrowRight } from "lucide-react"
import CartService from "../../../api/CartService"
import OrderService from "../../../api/OrderService"
import VNPayService from "../../../api/VNPayService"
import axios from "axios"

const Checkout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [paymentSuccess, setPaymentSuccess] = useState(null)

  // Step-by-step checkout
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3

  // Location data
  const [provinces, setProvinces] = useState([])
  const [districts, setDistricts] = useState([])
  const [wards, setWards] = useState([])
  const [loadingLocations, setLoadingLocations] = useState(false)

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    provinceCode: "",
    provinceName: "",
    districtCode: "",
    districtName: "",
    wardCode: "",
    wardName: "",
    paymentMethod: "CREDIT_CARD",
    notes: "",
    bankCode: "", // For VNPay bank selection
  })

  // Check for VNPay callback on component mount
  const checkVNPayCallback = async () => {
    const searchParams = new URLSearchParams(location.search)
    if (searchParams.has("vnp_ResponseCode") && searchParams.has("vnp_TxnRef")) {
      try {
        setLoading(true)
        const result = await VNPayService.processPaymentResult(searchParams)

        if (result.success) {
          setPaymentSuccess(result)

          // Retrieve pending order from localStorage
          const pendingOrder = JSON.parse(localStorage.getItem("pendingOrder") || "{}")

          // Format the amount correctly (VNPay returns amount in smallest currency unit)
          const amount = searchParams.get("vnp_Amount") ? Number.parseInt(searchParams.get("vnp_Amount")) / 100 : 0

          // Create the order with complete payment information
          const orderData = {
            ...pendingOrder,
            paymentMethod: "VNPAY",
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

          try {
            console.log("Creating order with data:", orderData)

            // Create order in the system
            const orderResponse = await OrderService.createOrder(orderData)
            console.log("Order created successfully:", orderResponse)

            // Clear pending order from localStorage
            localStorage.removeItem("pendingOrder")

            // Clear cart after successful order
            await CartService.clearCart()

            // Redirect to the order confirmation page with the transaction ID from VNPay
            navigate(`/trang-chu/gio-hang/thanh-toan/xac-nhan-don-hang/${searchParams.get("vnp_TxnRef")}`, {
              state: {
                paymentResult: {
                  ...result,
                  amount: amount,
                  bankCode: searchParams.get("vnp_BankCode"),
                  payDate: searchParams.get("vnp_PayDate"),
                },
              },
            })
          } catch (orderError) {
            console.error("Lỗi khi tạo đơn hàng:", orderError)
            setError(
              "Thanh toán thành công nhưng không thể tạo đơn hàng: " +
                (orderError.response?.data?.message || orderError.message),
            )
          }
        } else {
          setError(result.message)
        }
      } catch (err) {
        setError("Lỗi xử lý kết quả thanh toán: " + err.message)
      } finally {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    checkVNPayCallback()
  }, [location, navigate])

  // Fetch cart data when component mounts
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true)
        const data = await CartService.getCurrentUserCart()
        setCart(data)
        setError(null)
      } catch (err) {
        setError("Không thể tải giỏ hàng")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchCart()

    // Fetch provinces on component mount
    fetchProvinces()
  }, [])

  // Fetch provinces from API
  const fetchProvinces = async () => {
    try {
      setLoadingLocations(true)
      const response = await axios.get("https://provinces.open-api.vn/api/p/")
      setProvinces(response.data)
    } catch (err) {
      console.error("Lỗi khi tải danh sách tỉnh/thành phố:", err)
    } finally {
      setLoadingLocations(false)
    }
  }

  // Fetch districts when province changes
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!formData.provinceCode) {
        setDistricts([])
        return
      }

      try {
        setLoadingLocations(true)
        const response = await axios.get(`https://provinces.open-api.vn/api/p/${formData.provinceCode}?depth=2`)
        setDistricts(response.data.districts || [])
      } catch (err) {
        console.error("Lỗi khi tải danh sách quận/huyện:", err)
      } finally {
        setLoadingLocations(false)
      }
    }

    fetchDistricts()
  }, [formData.provinceCode])

  // Fetch wards when district changes
  useEffect(() => {
    const fetchWards = async () => {
      if (!formData.districtCode) {
        setWards([])
        return
      }

      try {
        setLoadingLocations(true)
        const response = await axios.get(`https://provinces.open-api.vn/api/d/${formData.districtCode}?depth=2`)
        setWards(response.data.wards || [])
      } catch (err) {
        console.error("Lỗi khi tải danh sách phường/xã:", err)
      } finally {
        setLoadingLocations(false)
      }
    }

    fetchWards()
  }, [formData.districtCode])

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    // Handle special cases for location selects
    if (name === "provinceCode" && value) {
      const selectedProvince = provinces.find((p) => p.code.toString() === value)
      setFormData((prev) => ({
        ...prev,
        provinceCode: value,
        provinceName: selectedProvince?.name || "",
        districtCode: "",
        districtName: "",
        wardCode: "",
        wardName: "",
      }))
    } else if (name === "districtCode" && value) {
      const selectedDistrict = districts.find((d) => d.code.toString() === value)
      setFormData((prev) => ({
        ...prev,
        districtCode: value,
        districtName: selectedDistrict?.name || "",
        wardCode: "",
        wardName: "",
      }))
    } else if (name === "wardCode" && value) {
      const selectedWard = wards.find((w) => w.code.toString() === value)
      setFormData((prev) => ({
        ...prev,
        wardCode: value,
        wardName: selectedWard?.name || "",
      }))
    }
  }

  // Navigate to next step
  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
      window.scrollTo(0, 0)
    }
  }

  // Navigate to previous step
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo(0, 0)
    }
  }

  // Validate current step
  const validateCurrentStep = () => {
    if (currentStep === 1) {
      // Validate personal information
      return formData.fullName && formData.email && formData.phone
    } else if (currentStep === 2) {
      // Validate address
      return formData.address && formData.provinceCode && formData.districtCode && formData.wardCode
    }
    return true
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!cart || cart.items.length === 0) {
      setError("Giỏ hàng trống, không thể đặt hàng")
      return
    }

    try {
      // If payment method is VNPay, redirect to VNPay payment gateway
      if (formData.paymentMethod === "VNPAY") {
        // Create a temporary order or store order data in session/local storage
        const orderData = {
          shippingAddress: `${formData.address}, ${formData.wardName}, ${formData.districtName}, ${formData.provinceName}`,
          contactPhone: formData.phone,
          paymentMethod: formData.paymentMethod,
          fullName: formData.fullName,
          email: formData.email,
          notes: formData.notes,
          items: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.productPrice,
          })),
        }

        // Store order data in localStorage with a timestamp to ensure it's fresh
        localStorage.setItem(
          "pendingOrder",
          JSON.stringify({
            ...orderData,
            timestamp: new Date().getTime(),
          }),
        )
        console.log("Stored pending order in localStorage:", orderData)

        try {
          // Create VNPay payment request
          const response = await VNPayService.createPaymentRequest(cart.totalAmount, formData.bankCode)

          if (response && response.paymentUrl) {
            console.log("Redirecting to VNPay payment URL:", response.paymentUrl)
            // Redirect to VNPay payment URL
            window.location.href = response.paymentUrl
          } else {
            throw new Error("Không nhận được URL thanh toán từ máy chủ")
          }
        } catch (paymentError) {
          console.error("Lỗi khi tạo yêu cầu thanh toán:", paymentError)
          setError("Không thể tạo yêu cầu thanh toán: " + (paymentError.message || "Lỗi không xác định"))
        }
        return
      }

      // For other payment methods, proceed with normal order creation
      const orderData = {
        shippingAddress: `${formData.address}, ${formData.wardName}, ${formData.districtName}, ${formData.provinceName}`,
        contactPhone: formData.phone,
        paymentMethod: formData.paymentMethod,
        fullName: formData.fullName,
        email: formData.email,
        notes: formData.notes,
        items: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.productPrice,
        })),
      }

      // Create order
      const orderResponse = await OrderService.createOrder(orderData)

      // Clear cart after successful order
      await CartService.clearCart()

      // Redirect to order confirmation page
      navigate(`/trang-chu/gio-hang/thanh-toan/xac-nhan-don-hang/${orderResponse.id}`)
    } catch (err) {
      setError("Đã xảy ra lỗi khi đặt hàng: " + (err.response?.data?.message || err.message))
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-neutral-50">
        <Loader2 className="w-12 h-12 animate-spin text-neutral-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-6 max-w-md w-full">
          <div className="flex items-center mb-4">
            <AlertCircle className="w-6 h-6 text-rose-500 mr-3" />
            <h2 className="text-lg font-semibold text-rose-700">Đã xảy ra lỗi</h2>
          </div>
          <p className="text-rose-600 mb-4">{error}</p>
          <div className="flex justify-between">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors"
            >
              Thử lại
            </button>
            <Link
              to="/trang-chu/gio-hang"
              className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 transition-colors"
            >
              Quay lại giỏ hàng
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <ShoppingBag className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4 text-neutral-900">Giỏ hàng của bạn đang trống</h2>
          <p className="mb-6 text-neutral-600">Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán</p>
          <Link
            to="/trang-chu/san-pham"
            className="inline-flex items-center px-6 py-3 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-neutral-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-1 text-sm">
            <li className="inline-flex items-center">
              <Link to="/trang-chu" className="text-neutral-600 hover:text-neutral-900 inline-flex items-center">
                <Home className="w-4 h-4 mr-2" />
                Trang chủ
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight className="w-5 h-5 text-neutral-400" />
                <Link to="/trang-chu/gio-hang" className="text-neutral-600 hover:text-neutral-900 ml-1 md:ml-2 text-sm">
                  Giỏ hàng
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight className="w-5 h-5 text-neutral-400" />
                <span className="text-neutral-500 ml-1 md:ml-2 text-sm" aria-current="page">
                  Thanh toán
                </span>
              </div>
            </li>
          </ol>
        </nav>

        <h1 className="text-2xl md:text-3xl font-bold mb-8 text-neutral-900">Thanh toán</h1>

        {/* Checkout Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= 1 ? "bg-neutral-900 text-white" : "bg-neutral-200 text-neutral-500"}`}
              >
                {currentStep > 1 ? <Check className="w-5 h-5" /> : 1}
              </div>
              <span
                className={`text-sm mt-2 ${currentStep >= 1 ? "text-neutral-900 font-medium" : "text-neutral-500"}`}
              >
                Thông tin
              </span>
            </div>

            <div className={`flex-1 h-1 mx-2 ${currentStep >= 2 ? "bg-neutral-900" : "bg-neutral-200"}`}></div>

            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= 2 ? "bg-neutral-900 text-white" : "bg-neutral-200 text-neutral-500"}`}
              >
                {currentStep > 2 ? <Check className="w-5 h-5" /> : 2}
              </div>
              <span
                className={`text-sm mt-2 ${currentStep >= 2 ? "text-neutral-900 font-medium" : "text-neutral-500"}`}
              >
                Địa chỉ
              </span>
            </div>

            <div className={`flex-1 h-1 mx-2 ${currentStep >= 3 ? "bg-neutral-900" : "bg-neutral-200"}`}></div>

            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= 3 ? "bg-neutral-900 text-white" : "bg-neutral-200 text-neutral-500"}`}
              >
                {currentStep > 3 ? <Check className="w-5 h-5" /> : 3}
              </div>
              <span
                className={`text-sm mt-2 ${currentStep >= 3 ? "text-neutral-900 font-medium" : "text-neutral-500"}`}
              >
                Thanh toán
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="animate-fadeIn">
                  <div className="flex items-center mb-6">
                    <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center mr-3">
                      <span className="text-sm font-medium">1</span>
                    </div>
                    <h2 className="text-xl font-semibold text-neutral-900">Thông tin cá nhân</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-neutral-700 mb-1">
                        Họ và tên *
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-transparent"
                        placeholder="Nguyễn Văn A"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-transparent"
                        placeholder="example@email.com"
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-1">
                      Số điện thoại *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-transparent"
                      placeholder="0912345678"
                    />
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button
                      type="button"
                      onClick={goToNextStep}
                      disabled={!validateCurrentStep()}
                      className={`flex items-center px-6 py-3 rounded-md transition-colors ${
                        validateCurrentStep()
                          ? "bg-neutral-900 text-white hover:bg-neutral-800"
                          : "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                      }`}
                    >
                      Tiếp tục
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Shipping Address */}
              {currentStep === 2 && (
                <div className="animate-fadeIn">
                  <div className="flex items-center mb-6">
                    <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center mr-3">
                      <span className="text-sm font-medium">2</span>
                    </div>
                    <h2 className="text-xl font-semibold text-neutral-900">Địa chỉ giao hàng</h2>
                  </div>

                  <div className="mb-6">
                    <label htmlFor="address" className="block text-sm font-medium text-neutral-700 mb-1">
                      Địa chỉ *
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-transparent"
                      placeholder="Số nhà, tên đường"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <label htmlFor="provinceCode" className="block text-sm font-medium text-neutral-700 mb-1">
                        Tỉnh/Thành phố *
                      </label>
                      <div className="relative">
                        <select
                          id="provinceCode"
                          name="provinceCode"
                          value={formData.provinceCode}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-transparent appearance-none"
                        >
                          <option value="">Chọn Tỉnh/Thành phố</option>
                          {provinces.map((province) => (
                            <option key={province.code} value={province.code}>
                              {province.name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                          <ChevronRight className="w-4 h-4 text-neutral-500 rotate-90" />
                        </div>
                      </div>
                      {loadingLocations && formData.provinceCode === "" && (
                        <div className="text-xs text-neutral-500 mt-1">Đang tải...</div>
                      )}
                    </div>

                    <div>
                      <label htmlFor="districtCode" className="block text-sm font-medium text-neutral-700 mb-1">
                        Quận/Huyện *
                      </label>
                      <div className="relative">
                        <select
                          id="districtCode"
                          name="districtCode"
                          value={formData.districtCode}
                          onChange={handleInputChange}
                          required
                          disabled={!formData.provinceCode || loadingLocations}
                          className={`w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-transparent appearance-none ${
                            !formData.provinceCode || loadingLocations ? "bg-neutral-100 cursor-not-allowed" : ""
                          }`}
                        >
                          <option value="">Chọn Quận/Huyện</option>
                          {districts.map((district) => (
                            <option key={district.code} value={district.code}>
                              {district.name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                          <ChevronRight className="w-4 h-4 text-neutral-500 rotate-90" />
                        </div>
                      </div>
                      {loadingLocations && formData.provinceCode !== "" && formData.districtCode === "" && (
                        <div className="text-xs text-neutral-500 mt-1">Đang tải...</div>
                      )}
                    </div>

                    <div>
                      <label htmlFor="wardCode" className="block text-sm font-medium text-neutral-700 mb-1">
                        Phường/Xã *
                      </label>
                      <div className="relative">
                        <select
                          id="wardCode"
                          name="wardCode"
                          value={formData.wardCode}
                          onChange={handleInputChange}
                          required
                          disabled={!formData.districtCode || loadingLocations}
                          className={`w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-transparent appearance-none ${
                            !formData.districtCode || loadingLocations ? "bg-neutral-100 cursor-not-allowed" : ""
                          }`}
                        >
                          <option value="">Chọn Phường/Xã</option>
                          {wards.map((ward) => (
                            <option key={ward.code} value={ward.code}>
                              {ward.name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                          <ChevronRight className="w-4 h-4 text-neutral-500 rotate-90" />
                        </div>
                      </div>
                      {loadingLocations && formData.districtCode !== "" && formData.wardCode === "" && (
                        <div className="text-xs text-neutral-500 mt-1">Đang tải...</div>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label htmlFor="notes" className="block text-sm font-medium text-neutral-700 mb-1">
                      Ghi chú
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-transparent"
                      placeholder="Thông tin bổ sung về đơn hàng của bạn"
                    ></textarea>
                  </div>

                  <div className="mt-8 flex justify-between">
                    <button
                      type="button"
                      onClick={goToPreviousStep}
                      className="flex items-center px-6 py-3 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 transition-colors"
                    >
                      <ChevronRight className="mr-2 w-4 h-4 rotate-180" />
                      Quay lại
                    </button>

                    <button
                      type="button"
                      onClick={goToNextStep}
                      disabled={!validateCurrentStep()}
                      className={`flex items-center px-6 py-3 rounded-md transition-colors ${
                        validateCurrentStep()
                          ? "bg-neutral-900 text-white hover:bg-neutral-800"
                          : "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                      }`}
                    >
                      Tiếp tục
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment Method */}
              {currentStep === 3 && (
                <div className="animate-fadeIn">
                  <div className="flex items-center mb-6">
                    <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center mr-3">
                      <span className="text-sm font-medium">3</span>
                    </div>
                    <h2 className="text-xl font-semibold text-neutral-900">Phương thức thanh toán</h2>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div
                      className={`flex items-center p-4 border rounded-lg transition-colors cursor-pointer ${
                        formData.paymentMethod === "CREDIT_CARD"
                          ? "border-neutral-900 bg-neutral-50"
                          : "border-neutral-200 hover:border-neutral-300"
                      }`}
                      onClick={() => handleInputChange({ target: { name: "paymentMethod", value: "CREDIT_CARD" } })}
                    >
                      <input
                        type="radio"
                        id="CREDIT_CARD"
                        name="paymentMethod"
                        value="CREDIT_CARD"
                        checked={formData.paymentMethod === "CREDIT_CARD"}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-neutral-900 focus:ring-neutral-500"
                      />
                      <label htmlFor="CREDIT_CARD" className="ml-3 flex flex-col cursor-pointer">
                        <span className="text-sm font-medium text-neutral-900">Thẻ tín dụng (Credit Card)</span>
                        <span className="text-xs text-neutral-500">Visa, Mastercard, JCB</span>
                      </label>
                      <div className="ml-auto flex items-center space-x-2">
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg"
                          alt="Visa"
                          className="h-6"
                        />
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                          alt="Mastercard"
                          className="h-6"
                        />
                      </div>
                    </div>

                    <div
                      className={`flex items-center p-4 border rounded-lg transition-colors cursor-pointer ${
                        formData.paymentMethod === "CASH_ON_DELIVERY"
                          ? "border-neutral-900 bg-neutral-50"
                          : "border-neutral-200 hover:border-neutral-300"
                      }`}
                      onClick={() =>
                        handleInputChange({ target: { name: "paymentMethod", value: "CASH_ON_DELIVERY" } })
                      }
                    >
                      <input
                        type="radio"
                        id="CASH_ON_DELIVERY"
                        name="paymentMethod"
                        value="CASH_ON_DELIVERY"
                        checked={formData.paymentMethod === "CASH_ON_DELIVERY"}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-neutral-900 focus:ring-neutral-500"
                      />
                      <label htmlFor="CASH_ON_DELIVERY" className="ml-3 flex flex-col cursor-pointer">
                        <span className="text-sm font-medium text-neutral-900">Thanh toán khi nhận hàng (COD)</span>
                        <span className="text-xs text-neutral-500">Thanh toán bằng tiền mặt khi nhận hàng</span>
                      </label>
                      <div className="ml-auto">
                        <Truck className="h-5 w-5 text-neutral-500" />
                      </div>
                    </div>

                    <div
                      className={`flex items-center p-4 border rounded-lg transition-colors cursor-pointer ${
                        formData.paymentMethod === "VNPAY"
                          ? "border-neutral-900 bg-neutral-50"
                          : "border-neutral-200 hover:border-neutral-300"
                      }`}
                      onClick={() => handleInputChange({ target: { name: "paymentMethod", value: "VNPAY" } })}
                    >
                      <input
                        type="radio"
                        id="VNPAY"
                        name="paymentMethod"
                        value="VNPAY"
                        checked={formData.paymentMethod === "VNPAY"}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-neutral-900 focus:ring-neutral-500"
                      />
                      <label htmlFor="VNPAY" className="ml-3 flex flex-col cursor-pointer">
                        <span className="text-sm font-medium text-neutral-900">Thanh toán qua VNPAY</span>
                        <span className="text-xs text-neutral-500">Thanh toán an toàn với VNPAY</span>
                      </label>
                      <div className="ml-auto">
                        <img
                          src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR.png"
                          alt="VNPAY"
                          className="h-6"
                        />
                      </div>
                    </div>

                    {formData.paymentMethod === "VNPAY" && (
                      <div className="ml-6 p-4 border border-neutral-200 rounded-lg bg-neutral-50 animate-fadeIn">
                        <label htmlFor="bankCode" className="block text-sm font-medium text-neutral-700 mb-2">
                          Chọn ngân hàng (tùy chọn)
                        </label>
                        <div className="relative">
                          <select
                            id="bankCode"
                            name="bankCode"
                            value={formData.bankCode}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-transparent appearance-none"
                          >
                            <option value="">Cổng thanh toán VNPAY</option>
                            <option value="NCB">Ngân hàng NCB</option>
                            <option value="VIETCOMBANK">Ngân hàng VIETCOMBANK</option>
                            <option value="VIETINBANK">Ngân hàng VIETINBANK</option>
                            <option value="BIDV">Ngân hàng BIDV</option>
                            <option value="TECHCOMBANK">Ngân hàng TECHCOMBANK</option>
                            <option value="MBBANK">Ngân hàng MBBANK</option>
                            <option value="SACOMBANK">Ngân hàng SACOMBANK</option>
                            <option value="AGRIBANK">Ngân hàng AGRIBANK</option>
                            <option value="TPBANK">Ngân hàng TPBank</option>
                            <option value="VPBANK">Ngân hàng VPBank</option>
                            <option value="VNPAYQR">Thanh toán bằng ứng dụng hỗ trợ VNPAYQR</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <ChevronRight className="w-4 h-4 text-neutral-500 rotate-90" />
                          </div>
                        </div>
                        <p className="text-xs text-neutral-500 mt-2">
                          Bạn sẽ được chuyển đến cổng thanh toán VNPAY để hoàn tất giao dịch
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 flex justify-between">
                    <button
                      type="button"
                      onClick={goToPreviousStep}
                      className="flex items-center px-6 py-3 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 transition-colors"
                    >
                      <ChevronRight className="mr-2 w-4 h-4 rotate-180" />
                      Quay lại
                    </button>

                    <button
                      type="submit"
                      className="flex items-center px-6 py-3 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors"
                    >
                      {formData.paymentMethod === "VNPAY" ? <>Tiếp tục thanh toán với VNPAY</> : <>Hoàn tất đặt hàng</>}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-4">
              <h2 className="text-xl font-semibold mb-4 text-neutral-900">Tóm tắt đơn hàng</h2>

              <div className="max-h-80 overflow-y-auto mb-4 pr-2">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex items-center py-3 border-b border-neutral-200">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-neutral-200">
                      <img
                        src={`http://localhost:8088/api/v1/product-images/get-image/${item.productImageUrl}`}
                        alt={item.productName}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <div className="ml-4 flex flex-1 flex-col">
                      <div>
                        <div className="flex justify-between text-base font-medium text-neutral-900">
                          <h3 className="line-clamp-1">{item.productName}</h3>
                          <p className="ml-4">
                            {new Intl.NumberFormat("vi-VN").format(item.productPrice * item.quantity)} VND
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-1 items-end justify-between text-sm">
                        <p className="text-neutral-500">SL: {item.quantity}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-neutral-200 pt-4 space-y-3">
                <div className="flex justify-between text-sm text-neutral-600">
                  <p>Tạm tính</p>
                  <p>{new Intl.NumberFormat("vi-VN").format(cart.totalAmount)} VND</p>
                </div>
                <div className="flex justify-between text-sm text-neutral-600">
                  <p>Phí vận chuyển</p>
                  <p>0 VND</p>
                </div>
                <div className="flex justify-between text-lg font-bold text-neutral-900 pt-3 border-t border-neutral-200">
                  <p>Tổng cộng</p>
                  <p>{new Intl.NumberFormat("vi-VN").format(cart.totalAmount)} VND</p>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  to="/trang-chu/gio-hang"
                  className="flex items-center justify-center text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
                  Quay lại giỏ hàng
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout

