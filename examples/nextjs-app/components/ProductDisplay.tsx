import React from 'react';

interface ProductDisplayProps {
  productName: string;
  imageUrl: string;
  entryFee: number;
  prizeEth: number;
}

const ProductDisplay = ({ productName, imageUrl, entryFee, prizeEth }: ProductDisplayProps) => {
  return (
    <div className="p-8 sm:p-12 bg-gray-50 flex flex-col justify-center items-center">
        <img 
            src={imageUrl} 
            alt={productName} 
            className="max-w-full h-auto max-h-[450px] object-contain"
        />
        <div className="text-center mt-8">
            <h3 className="text-3xl font-bold text-gray-900">{productName}</h3>
            <p className="text-gray-600 mt-2">Guess the secret price to win!</p>
            <div className="mt-6 space-y-3 text-left">
                <div className="flex items-center text-md bg-gray-100 border border-gray-200 text-gray-800 rounded-lg px-4 py-2">
                    <span className="font-bold text-lg mr-2">🎁 PRIZE:</span> 
                    This Product OR {prizeEth} ETH
                </div>
                <div className="flex items-center text-md bg-gray-100 border border-gray-200 text-gray-800 rounded-lg px-4 py-2">
                    <span className="font-bold text-lg mr-2">🎟️ ENTRY:</span> 
                    {entryFee} ETH
                </div>
            </div>
        </div>
    </div>
  );
};

export default ProductDisplay;