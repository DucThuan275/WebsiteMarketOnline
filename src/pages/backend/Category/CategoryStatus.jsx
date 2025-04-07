import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import CategoryService from '../../../api/CategoryService';

const CategoryStatus = () => {
  const { id, action } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        const allCategories = await CategoryService.getCategories();
        const foundCategory = allCategories.find(c => c.id === parseInt(id, 10));
        
        if (!foundCategory) {
          setError('Category not found');
          return;
        }
        
        setCategory(foundCategory);
      } catch (err) {
        setError('Failed to load category details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id]);

  const handleStatusChange = async () => {
    if (!['activate', 'deactivate'].includes(action)) {
      setError('Invalid action');
      return;
    }

    try {
      setProcessing(true);
      
      if (action === 'activate') {
        await CategoryService.activateCategory(parseInt(id, 10));
      } else { // deactivate
        await CategoryService.deactivateCategory(parseInt(id, 10));
      }
      
      navigate(`/admin/categories/${id}`, { 
        state: { message: `Category successfully ${action === 'activate' ? 'activated' : 'deactivated'}` } 
      });
    } catch (err) {
      setError(`Failed to ${action} category`);
      console.error(err);
      setProcessing(false);
    }
  };

  if (loading) return <div>Loading category details...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!category) return <div>Category not found</div>;

  const isActivate = action === 'activate';
  const buttonLabel = isActivate ? 'Activate' : 'Deactivate';
  
  // Check if action makes sense
  const isActionValid = isActivate ? !category.active : category.active;

  return (
    <div className="category-status-change">
      <h1>{buttonLabel} Category</h1>
      
      {!isActionValid ? (
        <div className="notification warning">
          <p>This category is already {isActivate ? 'active' : 'inactive'}.</p>
          <Link to={`/admin/categories/${id}`} className="button">
            Back to Category
          </Link>
        </div>
      ) : (
        <div className="confirmation-box">
          <p>Are you sure you want to {action} the following category?</p>
          
          <div className="category-summary">
            <h2>{category.name}</h2>
            <p><strong>ID:</strong> {category.id}</p>
            <p><strong>Current Status:</strong> {category.active ? 'Active' : 'Inactive'}</p>
          </div>
          
          <div className="action-description">
            {isActivate ? (
              <p>Activating will make this category visible to customers.</p>
            ) : (
              <p>Deactivating will hide this category from customers but preserve all data.</p>
            )}
          </div>
          
          <div className="action-buttons">
            <button 
              onClick={handleStatusChange} 
              disabled={processing} 
              className={`button ${isActivate ? 'success' : 'warning'}`}
            >
              {processing ? 'Processing...' : `Yes, ${buttonLabel} Category`}
            </button>
            
            <Link to={`/admin/categories/${id}`} className="button secondary">
              Cancel
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryStatus;