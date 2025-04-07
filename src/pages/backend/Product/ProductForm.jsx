"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import CategoryService from "../../../api/CategoryService"
import ProductService from "../../../api/ProductService"
import { ArrowLeft, Upload, Plus, X, AlertCircle, CheckCircle, Info } from "lucide-react"

const ProductForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stockQuantity: "",
    categoryId: "",
  })

  const [primaryImage, setPrimaryImage] = useState(null)
  const [additionalImages, setAdditionalImages] = useState([])
  const [imagePreview, setImagePreview] = useState(null)
  const [additionalPreviews, setAdditionalPreviews] = useState([])

  const [loading, setLoading] = useState(isEditing)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [notification, setNotification] = useState({ show: false, type: "", message: "" })

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true)
        const response = await CategoryService.getActiveCategories()

        const fetchedCategories = Array.isArray(response.data) ? response.data : []
        setCategories(fetchedCategories)
      } catch (err) {
        setError("Failed to load categories")
        console.error("Failed to load categories:", err)
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  // Fetch product data if editing
  useEffect(() => {
    const fetchProductData = async () => {
      if (!isEditing) return

      try {
        setLoading(true)
        const product = await ProductService.getProductById(Number(id))
        setFormData({
          name: product.name,
          description: product.description,
          price: product.price,
          stockQuantity: product.stockQuantity,
          categoryId: product.categoryId,
        })

        // Set image preview if available
        if (product.imageUrl) {
          setImagePreview(
            product.imageUrl.startsWith("http")
              ? product.imageUrl
              : `http://localhost:8088/api/v1/product-images/get-image/${product.imageUrl}`,
          )
        }

        setError(null)
      } catch (err) {
        setError("Failed to load product data")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchProductData()
  }, [id, isEditing])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePrimaryImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type and size
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
      if (!validTypes.includes(file.type)) {
        setError("Primary image must be a valid image file (JPEG, PNG, GIF, WEBP)")
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setError("Primary image must be less than 5MB")
        return
      }

      setPrimaryImage(file)
      console.log(`Selected primary image: ${file.name} (${file.type}, ${file.size} bytes)`)

      // Create a preview of the selected image
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      setAdditionalImages(files)

      // Create previews for all additional images
      const previews = []
      files.forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          previews.push(reader.result)
          if (previews.length === files.length) {
            setAdditionalPreviews(previews)
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message })
    setTimeout(() => {
      setNotification({ show: false, type: "", message: "" })
    }, 5000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Create product data object with proper number conversions
      const productData = {
        name: formData.name,
        description: formData.description,
        price: Number.parseFloat(formData.price),
        stockQuantity: Number.parseInt(formData.stockQuantity, 10),
        categoryId: Number.parseInt(formData.categoryId, 10),
      }

      console.log("Submitting product data:", productData)

      if (isEditing) {
        // Handle update case
        await ProductService.updateProduct(Number(id), productData)
        showNotification("success", "Product updated successfully")
        navigate(`/admin/products/${id}`, {
          state: { message: "Product updated successfully" },
        })
      } else {
        // Create new product
        const response = await ProductService.createProduct(productData, primaryImage, additionalImages)

        showNotification("success", "Product created successfully")
        navigate(`/admin/products/${response.id}`, {
          state: { message: "Product created successfully. It will be reviewed by an admin." },
        })
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || `Failed to ${isEditing ? "update" : "create"} product`
      setError(errorMessage)
      console.error(err)
      showNotification("error", errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    )

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {isEditing ? "Edit Product" : "Create New Product"}
          </h1>
          <Link to="/admin/products" className="flex items-center text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Products
          </Link>
        </div>
      </div>

      <div className="p-6">
        {!isEditing && (
          <div className="flex items-start p-4 mb-6 rounded-lg bg-blue-900/20 border border-blue-800/30">
            <Info className="text-blue-400 w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
            <p className="text-blue-300">New products will be in PENDING status until approved by an admin.</p>
          </div>
        )}

        {notification.show && (
          <div
            className={`flex items-start p-4 mb-6 rounded-lg ${
              notification.type === "success"
                ? "bg-green-900/20 border border-green-800/30 text-green-300"
                : "bg-red-900/20 border border-red-800/30 text-red-300"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
            )}
            {notification.message}
          </div>
        )}

        {error && (
          <div className="flex items-start p-4 mb-6 rounded-lg bg-red-900/20 border border-red-800/30">
            <AlertCircle className="text-red-400 w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
            <p className="text-red-300">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                  Product Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter product name"
                  className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-300">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                  required
                  placeholder="Enter product description"
                  className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="price" className="block text-sm font-medium text-gray-300">
                    Price (VND)
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="stockQuantity" className="block text-sm font-medium text-gray-300">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    id="stockQuantity"
                    name="stockQuantity"
                    value={formData.stockQuantity}
                    onChange={handleChange}
                    min="0"
                    required
                    placeholder="0"
                    className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-300">
                  Category
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  required
                  disabled={loadingCategories}
                  className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {loadingCategories && (
                  <div className="flex items-center mt-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-pink-500 mr-2"></div>
                    <span className="text-gray-400 text-sm">Loading categories...</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="primaryImage" className="block text-sm font-medium text-gray-300">
                  Primary Image
                </label>
                <div className="relative">
                  <input
                    type="file"
                    id="primaryImage"
                    name="primaryImage"
                    accept="image/*"
                    onChange={handlePrimaryImageChange}
                    className="hidden"
                    required={!isEditing}
                  />
                  <label
                    htmlFor="primaryImage"
                    className="flex items-center justify-center w-full px-4 py-6 bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:bg-gray-650 transition-colors"
                  >
                    <div className="flex flex-col items-center">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm font-medium text-gray-300">
                        {primaryImage ? primaryImage.name : "Click to upload primary image"}
                      </span>
                      <span className="text-xs text-gray-400 mt-1">JPEG, PNG, GIF, WEBP (Max 5MB)</span>
                    </div>
                  </label>
                </div>

                {/* Image preview */}
                {imagePreview && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-300 mb-2">Primary Image Preview:</p>
                    <div className="relative inline-block">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Product preview"
                        className="w-32 h-32 object-cover rounded-lg border border-gray-600"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = "/placeholder.svg?height=128&width=128"
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPrimaryImage(null)
                          setImagePreview(null)
                        }}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="additionalImages" className="block text-sm font-medium text-gray-300">
                  Additional Images
                </label>
                <div className="relative">
                  <input
                    type="file"
                    id="additionalImages"
                    name="additionalImages"
                    accept="image/*"
                    multiple
                    onChange={handleAdditionalImagesChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="additionalImages"
                    className="flex items-center justify-center w-full px-4 py-6 bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:bg-gray-650 transition-colors"
                  >
                    <div className="flex flex-col items-center">
                      <Plus className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm font-medium text-gray-300">
                        {additionalImages.length > 0
                          ? `${additionalImages.length} file(s) selected`
                          : "Click to upload additional images"}
                      </span>
                      <span className="text-xs text-gray-400 mt-1">Optional - Select multiple files</span>
                    </div>
                  </label>
                </div>

                {/* Additional images preview */}
                {additionalPreviews.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-300 mb-2">Additional Images Preview:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {additionalPreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview || "/placeholder.svg"}
                            alt={`Additional image ${index + 1}`}
                            className="h-24 w-full object-cover rounded-md border border-gray-600"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newImages = [...additionalImages]
                              newImages.splice(index, 1)
                              setAdditionalImages(newImages)

                              const newPreviews = [...additionalPreviews]
                              newPreviews.splice(index, 1)
                              setAdditionalPreviews(newPreviews)
                            }}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={() => navigate(isEditing ? `/admin/products/${id}` : "/admin/products")}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : isEditing ? (
                "Update Product"
              ) : (
                "Create Product"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductForm

