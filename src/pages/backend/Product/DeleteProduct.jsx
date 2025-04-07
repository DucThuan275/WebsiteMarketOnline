import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ProductService from '../../../api/ProductService';
import { AlertTriangle, ArrowLeft, Trash2 } from 'lucide-react';

const DeleteProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await ProductService.getProductById(Number(id));
        setProduct(data);
        setError(null);
      } catch (err) {
        setError('Failed to load product details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await ProductService.deleteProduct(Number(id));
      navigate('/admin/products', { state: { message: 'Product successfully deleted' } });
    } catch (err) {
      setError('Failed to delete product');
      console.error(err);
      setDeleting(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-900 text-green-300';
      case 'PENDING':
        return 'bg-yellow-900 text-yellow-300';
      case 'INACTIVE':
        return 'bg-red-900 text-red-300';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
    </div>
  );
  
  if (error) return (
    <div className="bg-red-900 text-red-300 p-4 rounded-lg text-center">
      {error}
    </div>
  );
  
  if (!product) return (
    <div className="bg-gray-800 p-8 rounded-lg text-center">
      <p className="text-gray-300">Product not found</p>
    </div>
  );

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Delete Product</h1>
          <Link 
            to="/admin/products" 
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Products
          </Link>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-gray-700/50 p-6 rounded-lg mb-6">
          <div className="flex items-start">
            <AlertTriangle className="text-yellow-400 w-6 h-6 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-medium text-white mb-2">
                Are you sure you want to delete this product?
              </h2>
              <p className="text-gray-300 mb-4">
                This action cannot be undone. This will permanently delete the product from the database.
              </p>
              
              <div className="bg-gray-800 p-4 rounded-lg mt-4">
                <div className="flex items-center gap-4 mb-2">
                  {product.imageUrl && (
                    <img 
                      src={`http://localhost:8088/api/v1/product-images/get-image/${product.imageUrl}`}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-md"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/placeholder.svg?height=64&width=64";
                      }}
                    />
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-white">{product.name}</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="text-gray-400 text-sm">ID: {product.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(product.status)}`}>
                        {product.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-400 mt-2">
                  <p>Price: {new Intl.NumberFormat().format(product.price)} VND</p>
                  <p>Category: {product.categoryName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-red-900/20 border border-red-800/30 p-4 rounded-lg mb-6">
          <div className="flex items-center">
            <AlertTriangle className="text-red-400 w-5 h-5 mr-2 flex-shrink-0" />
            <p className="text-red-300 font-medium">This action cannot be undone!</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <Link 
            to={`/admin/products/${id}`} 
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors text-center"
          >
            Cancel
          </Link>
          
          <button 
            onClick={handleDelete} 
            disabled={deleting} 
            className="flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {deleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Yes, Delete Product
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteProduct;
