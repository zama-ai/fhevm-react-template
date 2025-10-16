import React, { useState } from 'react';
import { useAuction } from './hooks/useAuction';
import { AuctionState, UserState, Product } from './types';
import { PRODUCTS } from './constants';
import AuctionStatus from './components/AuctionStatus';
import UserActions from './components/UserActions';
import WinnerDisplay from './components/WinnerDisplay';
import Header from './components/Header';
import ProductDisplay from './components/ProductDisplay';
import ProductSelector from './components/ProductSelector';

const App: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const {
    auctionState,
    userState,
    timeLeft,
    participants,
    winner,
    bid,
    setBid,
    isLoading,
    joinAuction,
    submitBid,
    revealWinner,
    simulateFullAuction,
    resetAuction,
  } = useAuction(selectedProduct);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleBackToSelection = () => {
    setSelectedProduct(null);
  }

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-5xl mx-auto">
        <Header />
        
        {!selectedProduct ? (
          <ProductSelector products={PRODUCTS} onSelect={handleProductSelect} />
        ) : (
          <main className="mt-8">
            <button onClick={handleBackToSelection} className="mb-6 text-blue-600 hover:text-blue-800 transition-colors">
              &larr; Choose another product
            </button>
            <div className="bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
              <div className="grid md:grid-cols-2 gap-0">
                <ProductDisplay 
                  productName={selectedProduct.name}
                  imageUrl={selectedProduct.imageUrl}
                  entryFee={selectedProduct.entryFee}
                  prizeEth={selectedProduct.prizeEth}
                />

                <div className="p-8 flex flex-col justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-wide">AUCTION STATUS</h2>
                    <AuctionStatus 
                      timeLeft={timeLeft}
                      participantCount={participants.length}
                    />
                  </div>

                  <div className="mt-8">
                    {auctionState !== AuctionState.REVEALED ? (
                      <UserActions 
                        userState={userState}
                        auctionEnded={auctionState === AuctionState.ENDED}
                        bid={bid}
                        setBid={setBid}
                        isLoading={isLoading}
                        onJoin={joinAuction}
                        onSubmitBid={submitBid}
                        onReveal={revealWinner}
                        onSimulate={simulateFullAuction}
                        product={selectedProduct}
                      />
                    ) : (
                      winner && <WinnerDisplay winner={winner} targetPrice={selectedProduct.targetPrice} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </main>
        )}
      </div>
       <footer className="text-center mt-8 text-gray-500 text-sm">
          <p>This is a Zama project showcasing Fully Homomorphic Encryption (FHE) technology.</p>
          <p>All bids are processed with complete confidentiality, ensuring a private and secure auction.</p>
        </footer>
    </div>
  );
};

export default App;