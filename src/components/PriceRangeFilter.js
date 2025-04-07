import React from "react";

const PriceRangeFilter = ({
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
}) => {
  const handleMinPriceChange = (e) => {
    const value = e.target.value;
    // Only allow numbers or empty string
    if (value === "" || /^\d+$/.test(value)) {
      onMinPriceChange(value);
    }
  };

  const handleMaxPriceChange = (e) => {
    const value = e.target.value;
    // Only allow numbers or empty string
    if (value === "" || /^\d+$/.test(value)) {
      onMaxPriceChange(value);
    }
  };

  const handleApplyFilter = () => {
    // This function can be used if you want to add a button to apply filters
    // For now, filters are applied automatically when values change
  };

  return (
    <div className="price-range-filter">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Price Range (VND)
      </label>

      <div className="flex items-center gap-2 mb-3">
        <div className="w-full">
          <input
            type="text"
            placeholder="Min"
            value={minPrice}
            onChange={handleMinPriceChange}
            className="w-full p-2 border border-gray-300 rounded"
            aria-label="Minimum price"
          />
        </div>

        <span className="text-gray-500">-</span>

        <div className="w-full">
          <input
            type="text"
            placeholder="Max"
            value={maxPrice}
            onChange={handleMaxPriceChange}
            className="w-full p-2 border border-gray-300 rounded"
            aria-label="Maximum price"
          />
        </div>
      </div>

      {minPrice && maxPrice && parseInt(minPrice) > parseInt(maxPrice) && (
        <p className="text-red-500 text-xs mt-1">
          Minimum price cannot be greater than maximum price
        </p>
      )}

      {/* Optional Apply button if you want to apply filters on button click instead of automatically */}
      {/* 
      <button 
        onClick={handleApplyFilter}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
      >
        Apply Filter
      </button>
      */}
    </div>
  );
};

export default PriceRangeFilter;
