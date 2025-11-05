import React, { useState } from 'react';
import { useFHEVMRelayer } from '../../packages/fhevm-sdk/react/useFHEVMRelayer';
import { useAuction } from './hooks/useAuction';
import { AuctionState, UserState, Product } from './types';
import { PRODUCTS } from './constants';
import AuctionStatus from './components/AuctionStatus';
import UserActions from './components/UserActions';
import WinnerDisplay from './components/WinnerDisplay';
import Header from './components/Header';
import ProductDisplay from './components/ProductDisplay';
import ProductSelector from './components/ProductSelector';

/**
 * Main Auction App
 * Compatible with FHEVM v0.10.0+
 * All bids are fully encrypted and invisible on blockchain explorer
 */
const App = () => {
  // FHEVM Relayer entegrasyonu (v0.10.0+ with full privacy)
  const { sdk, loading, error } = useFHEVMRelayer();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const {
    auctionState,
    userState,
    timeLeft,
    participants,
    winner,
    bid,
    setBid,
    setUserState,
    isLoading,
    statusMessage,
    randomTargetPrice,
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

  // Relayer yükleniyor veya hata varsa ekrana bilgi ver
  if (loading) return <div className="text-center mt-12">FHEVM Relayer yükleniyor...</div>;
  if (error) return <div className="text-center mt-12 text-red-600">Relayer hatası: {error}</div>;

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
                    <AuctionStatus 
                      timeLeft={timeLeft}
                      participantCount={participants.length}
                    />
                    
                    {/* Status Message Display */}
                    {statusMessage && (
                      <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded text-blue-800 animate-pulse">
                        <p className="font-medium text-center">{statusMessage}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-8">
                    {auctionState !== AuctionState.REVEALED ? (
                      <UserActions 
                        userState={userState}
                        auctionEnded={auctionState === AuctionState.ENDED}
                        bid={bid}
                        setBid={setBid}
                        setUserState={setUserState}
                        isLoading={isLoading}
                        onJoin={joinAuction}
                        onSubmitBid={submitBid}
                        onReveal={revealWinner}
                        onSimulate={simulateFullAuction}
                        product={selectedProduct}
                      />
                    ) : (
                      <WinnerDisplay 
                        winner={winner || undefined}
                        targetPrice={randomTargetPrice}
                        contractAddress={process.env.NEXT_PUBLIC_AUCTION_CONTRACT || ''}
                        abi={[]}
                        signer={undefined} // TODO: Pass actual signer from UserActions or context
                      />
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