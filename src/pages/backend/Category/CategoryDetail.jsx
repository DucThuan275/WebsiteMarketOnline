"use client"

import { useState, useEffect } from "react"
import { useParams, Link, useNavigate, useLocation } from "react-router-dom"
import CategoryService from "../../../api/CategoryService"
import { ArrowLeft, Edit, Check, X, Plus, Trash2, AlertCircle, Info, Tag, Layers, Eye } from "lucide-react"

const CategoryDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [category, setCategory] = useState(null)
  const [subCategories, setSubCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingSubCategories, setLoadingSubCategories] = useState(true)
  const [error, setError] = useState(null)
  const [statusMessage, setStatusMessage] = useState(location.state?.message || "")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const allCategories = await CategoryService.getCategories()

        // Check if it's an array
        if (Array.isArray(allCategories)) {
          const foundCategory = allCategories.find((c) => c.id === Number.parseInt(id, 10))
          if (!foundCategory) {
            setError("Category not found")
            return
          }
          setCategory(foundCategory)
        } else {
          setError("Expected an array of categories, but got something else.")
        }

        // Get subcategories if any
        try {
          setLoadingSubCategories(true)
          const subCats = await CategoryService.getSubCategories(Number.parseInt(id, 10))
          setSubCategories(subCats)
        } catch (subErr) {
          console.error("Failed to load subcategories:", subErr)
        } finally {
          setLoadingSubCategories(false)
        }
      } catch (err) {
        setError("Failed to load category details")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleStatusChange = async (activate) => {
    try {
      if (activate) {
        await CategoryService.activateCategory(Number.parseInt(id, 10))
        setStatusMessage("Kích hoạt danh mục thành công!")
      } else {
        await CategoryService.deactivateCategory(Number.parseInt(id, 10))
        setStatusMessage("Ngưng kích hoạt danh mục thành công!")
      }

      // Refresh category data
      const allCategories = await CategoryService.getAllCategories()
      const updatedCategory = allCategories.find((c) => c.id === Number.parseInt(id, 10))
      setCategory(updatedCategory)
    } catch (err) {
      setError(`Failed to ${activate ? "activate" : "deactivate"} category`)
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-white">Lỗi</h1>
        </div>
        <div className="p-6">
          <div className="bg-red-900/20 border border-red-800/30 p-4 rounded-lg flex items-center">
            <AlertCircle className="text-red-400 w-6 h-6 mr-3 flex-shrink-0" />
            <p className="text-red-300">{error}</p>
          </div>
          <div className="mt-6 flex justify-end">
            <Link
              to="/admin/categories"
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-white">Không tìm thấy</h1>
        </div>
        <div className="p-6">
          <p className="text-gray-300">Không tìm thấy danh mục này.</p>
          <div className="mt-6 flex justify-end">
            <Link
              to="/admin/categories"
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Chi tiết danh mục</h1>
          <Link
            to="/admin/categories"
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
          >
            <ArrowLeft size={16} />
            Quay lại danh sách
          </Link>
        </div>
      </div>

      {statusMessage && (
        <div className="mx-6 mt-4 p-4 bg-green-900/20 border border-green-800/30 rounded-lg text-green-300 flex justify-between items-center">
          <div className="flex items-center">
            <Check className="w-5 h-5 mr-2" />
            <span>{statusMessage}</span>
          </div>
          <button
            onClick={() => setStatusMessage("")}
            className="text-green-300 hover:text-green-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <div className="p-6">
        <div className="bg-gray-750 rounded-lg p-5 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <Tag className="mr-2 text-pink-500" size={20} />
              Thông tin danh mục
            </h2>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                category.active ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"
              }`}
            >
              {category.active ? "Kích hoạt" : "Ngưng kích hoạt"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="text-gray-400 w-32">ID:</span>
                <span className="text-white">{category.id}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-400 w-32">Tên danh mục:</span>
                <span className="text-white font-medium">{category.name}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="text-gray-400 w-32">Danh mục cha:</span>
                <span className="text-white">
                  {category.parentCategory ? (
                    <Link
                      to={`/admin/categories/${category.parentCategory.id}`}
                      className="text-pink-400 hover:text-pink-300 hover:underline transition-colors"
                    >
                      {category.parentCategory.name}
                    </Link>
                  ) : (
                    "Không có"
                  )}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-400 w-32">Trạng thái:</span>
                <span className="text-white">{category.active ? "Đang kích hoạt" : "Đã ngưng kích hoạt"}</span>
              </div>
            </div>
          </div>

          {category.description && (
            <div className="mb-6">
              <h3 className="text-gray-400 mb-2">Mô tả:</h3>
              <p className="text-white bg-gray-700/50 p-3 rounded-lg">{category.description}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Link
              to={`/admin/categories/${id}/edit`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <Edit size={16} />
              Cập nhật
            </Link>

            {category.active ? (
              <button
                onClick={() => handleStatusChange(false)}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors"
              >
                <X size={16} />
                Ngưng kích hoạt
              </button>
            ) : (
              <button
                onClick={() => handleStatusChange(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                <Check size={16} />
                Kích hoạt
              </button>
            )}

            <Link
              to={`/admin/categories/${id}/delete`}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
            >
              <Trash2 size={16} />
              Xóa
            </Link>
          </div>
        </div>

        <div className="bg-gray-750 rounded-lg p-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <Layers className="mr-2 text-pink-500" size={20} />
              Danh mục con
            </h2>
            <Link
              to={`/admin/categories/new?parentId=${id}`}
              className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg transition-colors"
            >
              <Plus size={16} />
              Thêm danh mục con
            </Link>
          </div>

          {loadingSubCategories ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
            </div>
          ) : subCategories.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Tên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {subCategories.map((subCategory) => (
                    <tr key={subCategory.id} className="hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">{subCategory.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-white font-medium">{subCategory.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            subCategory.active ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"
                          }`}
                        >
                          {subCategory.active ? "Kích hoạt" : "Ngưng kích hoạt"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/admin/categories/${subCategory.id}`}
                          className="p-1.5 text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-md transition-colors inline-flex items-center"
                          title="Xem"
                        >
                          <Eye size={16} />
                          <span className="sr-only">Xem</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-700/50 p-6 rounded-lg text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-700 text-gray-400 mb-3">
                <Info size={24} />
              </div>
              <p className="text-gray-300">Không có danh mục con nào.</p>
              <p className="text-gray-400 mt-1">
                Bạn có thể thêm danh mục con bằng cách nhấn vào nút "Thêm danh mục con".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CategoryDetail

