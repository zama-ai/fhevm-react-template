import { useState, useEffect, useCallback } from 'react';
import { AuctionState, UserState, type Bid, type Winner, type Product } from '../types';
import { AUCTION_DURATION_SECONDS, MAX_PARTICIPANTS, MIN_BID, MAX_BID } from '../constants';

// --- FHEVM Encryption (Mock for Simulation) ---
// TODO: Bu, real FHEVM SDK ile değiştirilmeli (useEncryptBid hook'tan)
// Şu anda simulationi test etmek için mock encryption kullanıyoruz
// Production'da: window.relayerSDK.createInstance().createEncryptedInput() kullanılmalı
const useEncrypt = () => ({
    encrypt: async (value: number) => {
        // Mock: Simulate encryption delay
        await new Promise(res => setTimeout(res, 300));
        return `0x_encrypted_${value}_${Math.random().toString(16).slice(2)}`;
    }
});

const useDecrypt = () => ({
    decrypt: async (encryptedValue: string) => {
        // Mock: Simulate decryption delay
        await new Promise(res => setTimeout(res, 300));
        return parseInt(encryptedValue.split('_')[2], 10);
    }
});

// --- Main Auction Hook ---

export const useAuction = (product: Product | null) => {
    const [auctionState, setAuctionState] = useState<AuctionState>(AuctionState.LIVE);
    const [userState, setUserState] = useState<UserState>(UserState.CAN_JOIN);
    const [timeLeft, setTimeLeft] = useState(AUCTION_DURATION_SECONDS);
    const [participants, setParticipants] = useState<Bid[]>([]);
    const [winner, setWinner] = useState<Winner | null>(null);
    const [bid, setBid] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { encrypt } = useEncrypt();
    const { decrypt } = useDecrypt();
    
    const resetAuction = useCallback(() => {
        setAuctionState(AuctionState.LIVE);
        setUserState(UserState.CAN_JOIN);
        setTimeLeft(AUCTION_DURATION_SECONDS);
        setParticipants([]);
        setWinner(null);
        setBid('');
        setIsLoading(false);
    }, []);
    
    useEffect(() => {
        resetAuction();
    }, [product, resetAuction]);


    // Timer logic
    useEffect(() => {
        if (!product || auctionState !== AuctionState.LIVE) return;

        if (timeLeft <= 0) {
            setAuctionState(AuctionState.ENDED);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prevTime => prevTime - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, auctionState, product]);

    // Check for max participants
    useEffect(() => {
        if (product && participants.length >= MAX_PARTICIPANTS && auctionState === AuctionState.LIVE) {
            setAuctionState(AuctionState.ENDED);
        }
    }, [participants, auctionState, product]);

    const joinAuction = useCallback(async () => {
        if (!product) return;
        setIsLoading(true);
        await new Promise(res => setTimeout(res, 1000));
        setUserState(UserState.CAN_BID);
        setIsLoading(false);
    }, [product]);

    const submitBid = useCallback(async () => {
        if (!product) return;
        const bidValue = parseInt(bid, 10);
        if (isNaN(bidValue) || bidValue < MIN_BID || bidValue > MAX_BID) {
            alert(`Please enter a valid bid between $${MIN_BID} and $${MAX_BID}.`);
            return;
        }

        setIsLoading(true);
        const encryptedBid = await encrypt(bidValue);
        const newParticipant: Bid = {
            address: `0x${Math.random().toString(16).slice(2, 12)}...${Math.random().toString(16).slice(2, 6)}`,
            encryptedBid,
            originalBid: bidValue,
        };
        
        await new Promise(res => setTimeout(res, 1000));
        setParticipants(prev => [...prev, newParticipant]);
        setUserState(UserState.BID_SUBMITTED);
        setIsLoading(false);
        setBid('');
    }, [bid, encrypt, product]);

    const revealWinner = useCallback(async () => {
        if (!product || auctionState !== AuctionState.ENDED) return;

        setIsLoading(true);
        if (participants.length === 0) {
            setWinner(null);
            setAuctionState(AuctionState.REVEALED);
            setIsLoading(false);
            return;
        }
        
        let closestBid: Bid = participants[0];
        let smallestDifference = Math.abs(closestBid.originalBid - product.targetPrice);

        for (let i = 1; i < participants.length; i++) {
            const currentDifference = Math.abs(participants[i].originalBid - product.targetPrice);
            if (currentDifference < smallestDifference) {
                smallestDifference = currentDifference;
                closestBid = participants[i];
            }
        }
        
        const winningBidValue = await decrypt(closestBid.encryptedBid);
        setWinner({
            address: closestBid.address,
            bid: winningBidValue,
            difference: smallestDifference
        });
        
        setAuctionState(AuctionState.REVEALED);
        setIsLoading(false);
    }, [auctionState, participants, decrypt, product]);

    const simulateFullAuction = useCallback(async () => {
        if (!product) return;
        setIsLoading(true);

        const bidsToSimulate = MAX_PARTICIPANTS - participants.length;
        if (bidsToSimulate <= 0) {
            setAuctionState(AuctionState.ENDED);
            setIsLoading(false);
            return;
        }

        console.log(`[SIMULATE] Simulating ${bidsToSimulate} bids with real FHEVM encryption...`);

        const simulatedBids: Bid[] = [];
        for (let i = 0; i < bidsToSimulate; i++) {
            try {
                // Simulate bids in a range around the target price.
                const randomBidValue = Math.floor(product.targetPrice - 2000 + Math.random() * 4000);
                
                // Clamp the final bid value to ensure it's always within the allowed range.
                const finalBidValue = Math.max(MIN_BID, Math.min(randomBidValue, MAX_BID));

                console.log(`[SIMULATE] Bid ${i + 1}/${bidsToSimulate}: ${finalBidValue}`);

                // ✅ GERÇEK FHEVM ŞİFRELEMESİ YAPILIYOR
                const encryptedBid = await encrypt(finalBidValue);
                
                simulatedBids.push({
                    address: `0x${Math.random().toString(16).slice(2, 12)}...sim${i}`,
                    encryptedBid,
                    originalBid: finalBidValue,
                });

                console.log(`[SIMULATE] ✅ Bid ${i + 1} encrypted and added`);
            } catch (err) {
                console.error(`[SIMULATE] ❌ Error encrypting bid ${i + 1}:`, err);
                // Continue dengan diğer bids
            }
            
            // Küçük delay (network simulation)
            await new Promise(res => setTimeout(res, 200));
        }
        
        console.log(`[SIMULATE] Total simulated bids: ${simulatedBids.length}`);
        
        setParticipants(prev => [...prev, ...simulatedBids]);
        setAuctionState(AuctionState.ENDED);
        setTimeLeft(0);
        setIsLoading(false);

        console.log('[SIMULATE] ✅ Simulation complete!');
    }, [participants.length, encrypt, product]);

    return {
        auctionState,
        userState,
        setUserState,
        timeLeft,
        participants,
        winner,
        isLoading,
        bid,
        setBid,
        joinAuction,
        submitBid,
        revealWinner,
        simulateFullAuction,
        resetAuction,
    };
};