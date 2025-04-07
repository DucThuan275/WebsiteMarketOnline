import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ProductService from '../../../api/ProductService';

const ProductStatusChange = () => {
  const { id, action } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
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

  const handleStatusChange = async () => {
    try {
      setProcessing(true);
      
      if (action === 'approve') {
        await ProductService.approveProduct(Number(id));
      } else if (action === 'deactivate') {
        await ProductService.deactivateProduct(Number(id));
      } else {
        throw new Error('Invalid action');
      }
      
      navigate(`/admin/products/${id}`, { 
        state: { message: `Product successfully ${action === 'approve' ? 'approved' : 'deactivated'}` }
      });
    } catch (err) {
      setError(`Failed to ${action} product`);
      console.error(err);
      setProcessing(false);
    }
  };

  const actionDisplay = action === 'approve' ? 'Approve' : 'Deactivate';
  const bgColor = action === 'approve' ? 'bg-green-100' : 'bg-yellow-100';
  const buttonColor = action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700';

  if (loading) return <div className="text-center text-gray-500">Loading product details...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;
  if (!product) return <div className="text-center">Product not found</div>;

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">{actionDisplay} Product</h1>

      <div className={`${bgColor} p-4 rounded-lg shadow-sm mb-4`}>
        <p className="text-lg font-medium text-gray-700">Are you sure you want to {action} the following product?</p>
        
        <div className="mt-4">
          <h2 className="text-2xl font-semibold text-gray-800">{product.name}</h2>
          <p className="text-gray-600"><strong>ID:</strong> {product.id}</p>
          <p className="text-gray-600"><strong>Status:</strong> {product.status}</p>
        </div>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg shadow-sm mb-6">
        {action === 'approve' ? (
          <p className="text-gray-700">Approving will make this product active and visible to customers.</p>
        ) : (
          <p className="text-gray-700">Deactivating will hide this product from customers but preserve all data.</p>
        )}
      </div>

      <div className="flex justify-between space-x-4">
        <button 
          onClick={handleStatusChange} 
          disabled={processing} 
          className={`px-6 py-2 ${buttonColor} text-white font-semibold rounded-lg transition disabled:bg-gray-400`}
        >
          {processing ? 'Processing...' : `Yes, ${actionDisplay} Product`}
        </button>

        <Link 
          to={`/admin/products/${id}`} 
          className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition"
        >
          Cancel
        </Link>
      </div>
    </div>
  );
};

export default ProductStatusChange;