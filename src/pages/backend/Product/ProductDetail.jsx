"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import ProductService from "../../../api/ProductService"
import Lightbox from "react-image-lightbox"
import "react-image-lightbox/style.css"
import {
  ArrowLeft,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Calendar,
  Package,
  DollarSign,
  Tag,
  User,
  Clock,
  Info,
} from "lucide-react"

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [productImages, setProductImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [photoIndex, setPhotoIndex] = useState(0)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const data = await ProductService.getProductById(Number(id))
        setProduct(data)
        setError(null)
      } catch (err) {
        setError("Unable to load product details")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    const fetchProductImages = async () => {
      try {
        const images = await ProductService.getProductImages(Number(id))
        setProductImages(images)
      } catch (err) {
        console.error("Unable to load product images", err)
      }
    }

    fetchProduct()
    fetchProductImages()
  }, [id])

  const handleApprove = async () => {
    try {
      setActionLoading(true)
      const updated = await ProductService.approveProduct(Number(id))
      setProduct(updated)
      setError(null)
    } catch (err) {
      setError("Unable to approve product")
      console.error(err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeactivate = async () => {
    try {
      setActionLoading(true)
      const updated = await ProductService.deactivateProduct(Number(id))
      setProduct(updated)
      setError(null)
    } catch (err) {
      setError("Unable to deactivate product")
      console.error(err)
    } finally {
      setActionLoading(false)
    }
  }

  const openLightbox = (index) => {
    setPhotoIndex(index)
    setIsOpen(true)
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-900 text-green-300"
      case "PENDING":
        return "bg-yellow-900 text-yellow-300"
      case "INACTIVE":
        return "bg-red-900 text-red-300"
      default:
        return "bg-gray-700 text-gray-300"
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    )

  if (error)
    return (
      <div className="bg-red-900 text-red-300 p-4 rounded-lg text-center">
        <XCircle className="mx-auto h-12 w-12 mb-2" />
        {error}
      </div>
    )

  if (!product)
    return (
      <div className="bg-gray-800 p-8 rounded-lg text-center">
        <Info className="mx-auto h-12 w-12 mb-2 text-gray-400" />
        <p className="text-gray-300">Product not found</p>
      </div>
    )

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      {/* Product Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{product.name}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-400">
              <div className="flex items-center">
                <Tag className="w-4 h-4 mr-1" />
                <span>{product.categoryName}</span>
              </div>
              <div className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                <span>{product.sellerName}</span>
              </div>
              <div className="flex items-center">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(product.status)}`}>
                  {product.status}
                </span>
              </div>
            </div>
          </div>

          <Link to="/admin/products" className="flex items-center text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Products
          </Link>
        </div>
      </div>

      {/* Product Images */}
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-lg font-medium text-white mb-4">Product Images</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {productImages.length > 0 ? (
            productImages.map((image, index) => (
              <div
                key={image.id}
                className="aspect-square bg-gray-700 rounded-lg overflow-hidden cursor-pointer group relative"
                onClick={() => openLightbox(index)}
              >
                <img
                  src={`http://localhost:8088/api/v1/product-images/get-image/${image.filename}`}
                  alt={`${product.name} - Image ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = "/placeholder.svg?height=200&width=200"
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                  <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity">View</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-400">No images available for this product</div>
          )}
        </div>
      </div>

      {/* Product Description */}
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-lg font-medium text-white mb-4">Product Description</h2>
        <p className="text-gray-300 leading-relaxed">{product.description || "No description available"}</p>
      </div>

      {/* Product Details */}
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-lg font-medium text-white mb-4">Product Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center">
              <Info className="w-5 h-5 text-gray-400 mr-3" />
              <span className="text-gray-400 mr-2">ID:</span>
              <span className="text-white">{product.id}</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="w-5 h-5 text-pink-500 mr-3" />
              <span className="text-gray-400 mr-2">Price:</span>
              <span className="text-white font-medium">{new Intl.NumberFormat().format(product.price)} VND</span>
            </div>
            <div className="flex items-center">
              <Package className="w-5 h-5 text-gray-400 mr-3" />
              <span className="text-gray-400 mr-2">Stock:</span>
              <span className="text-white">{product.stockQuantity} units</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-gray-400 mr-3" />
              <span className="text-gray-400 mr-2">Created:</span>
              <span className="text-white">{new Date(product.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-gray-400 mr-3" />
              <span className="text-gray-400 mr-2">Last Updated:</span>
              <span className="text-white">{new Date(product.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-6">
        <h2 className="text-lg font-medium text-white mb-4">Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to={`/admin/products/${id}/edit`}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Product
          </Link>

          <Link
            to={`/admin/products/${id}/delete`}
            className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Product
          </Link>

          {product.status === "PENDING" && (
            <button
              onClick={handleApprove}
              disabled={actionLoading}
              className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {actionLoading ? "Processing..." : "Approve Product"}
            </button>
          )}

          {product.status === "ACTIVE" && (
            <button
              onClick={handleDeactivate}
              disabled={actionLoading}
              className="flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              <XCircle className="w-4 h-4 mr-2" />
              {actionLoading ? "Processing..." : "Deactivate Product"}
            </button>
          )}
        </div>
      </div>

      {/* Lightbox for images */}
      {isOpen && productImages.length > 0 && (
        <Lightbox
          mainSrc={`http://localhost:8088/api/v1/product-images/get-image/${productImages[photoIndex].filename}`}
          nextSrc={
            productImages.length > 1
              ? `http://localhost:8088/api/v1/product-images/get-image/${productImages[(photoIndex + 1) % productImages.length].filename}`
              : undefined
          }
          prevSrc={
            productImages.length > 1
              ? `http://localhost:8088/api/v1/product-images/get-image/${productImages[(photoIndex + productImages.length - 1) % productImages.length].filename}`
              : undefined
          }
          onCloseRequest={() => setIsOpen(false)}
          onMovePrevRequest={() => setPhotoIndex((photoIndex + productImages.length - 1) % productImages.length)}
          onMoveNextRequest={() => setPhotoIndex((photoIndex + 1) % productImages.length)}
        />
      )}
    </div>
  )
}

export default ProductDetail

