"use client";

const StockFilter = ({
  minStock,
  maxStock,
  onMinStockChange,
  onMaxStockChange,
}) => {
  const handleMinStockChange = (e) => {
    const value = e.target.value;
    // Only allow numbers or empty string
    if (value === "" || /^\d+$/.test(value)) {
      onMinStockChange(value);
    }
  };

  const handleMaxStockChange = (e) => {
    const value = e.target.value;
    // Only allow numbers or empty string
    if (value === "" || /^\d+$/.test(value)) {
      onMaxStockChange(value);
    }
  };

  return (
    <div className="stock-filter">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Stock Quantity
      </label>

      <div className="flex items-center gap-2 mb-3">
        <div className="w-full">
          <input
            type="text"
            placeholder="Min"
            value={minStock}
            onChange={handleMinStockChange}
            className="w-full p-2 border border-gray-300 rounded"
            aria-label="Minimum stock"
          />
        </div>

        <span className="text-gray-500">-</span>

        <div className="w-full">
          <input
            type="text"
            placeholder="Max"
            value={maxStock}
            onChange={handleMaxStockChange}
            className="w-full p-2 border border-gray-300 rounded"
            aria-label="Maximum stock"
          />
        </div>
      </div>

      {minStock &&
        maxStock &&
        Number.parseInt(minStock) > Number.parseInt(maxStock) && (
          <p className="text-red-500 text-xs mt-1">
            Minimum stock cannot be greater than maximum stock
          </p>
        )}
    </div>
  );
};

export default StockFilter;
