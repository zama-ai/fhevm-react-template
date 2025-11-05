import React from 'react';
import { Product } from '../types';

interface ProductSelectorProps {
  products: Product[];
  onSelect: (product: Product) => void;
}

const ProductSelector = ({ products, onSelect }: ProductSelectorProps) => {
  return (
    <div className="mt-12">
      <h2 className="text-center text-3xl font-bold text-gray-900 mb-2">Choose an Auction</h2>
      <p className="text-center text-gray-600 mb-8">Select a product to enter the secret price auction.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {products.map((product) => (
          <div
            key={product.id}
            onClick={() => onSelect(product)}
            className="bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
          >
            <div className="h-64 p-4 bg-gray-50 flex items-center justify-center">
              <img src={product.imageUrl} alt={product.name} className="max-h-full w-auto object-contain" />
            </div>
            <div className="p-6 text-center">
              <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
              <p className="text-gray-500 mt-1">Entry Fee: {product.entryFee} ETH</p>
              <button className="mt-4 w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                Select
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductSelector;