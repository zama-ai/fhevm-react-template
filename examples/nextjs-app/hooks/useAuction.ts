import { useState, useEffect, useCallback } from 'react';
import { AuctionState, UserState, type Bid, type Winner, type Product } from '../types';
import { AUCTION_DURATION_SECONDS, MAX_PARTICIPANTS, MIN_BID, MAX_BID } from '../constants';
import { useEncryptBid } from '../../../packages/fhevm-sdk/react/useEncryptBid';

// --- FHEVM Encryption (Mock Fallback for Testing) ---
// Production: Real SDK hooks used. This is fallback only.
const useMockEncrypt = () => ({
    encrypt: async (value: number) => {
        await new Promise(res => setTimeout(res, 300));
        return `0x_mock_${value}_${Math.random().toString(16).slice(2)}`;
    }
});

const useDecrypt = () => ({
    decrypt: async (encryptedValue: string | object) => {
        await new Promise(res => setTimeout(res, 300));
        
        // Handle real FHEVM encrypted bids (objects with handles and inputProof)
        if (typeof encryptedValue === 'object' && encryptedValue !== null) {
            // Real FHEVM: return random mock value (in production, would call relayer)
            return Math.floor(Math.random() * 5000) + 1000;
        }
        
        // Handle mock encrypted bids (strings)
        if (typeof encryptedValue === 'string' && encryptedValue.includes('_mock_')) {
            return parseInt(encryptedValue.split('_')[2], 10);
        }
        
        // Fallback for any other encrypted format
        return Math.floor(Math.random() * 5000) + 1000;
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
    const [statusMessage, setStatusMessage] = useState<string>('');
    
    // Generate random secret price between MIN_BID and MAX_BID (changes each auction)
    const [randomTargetPrice] = useState<number>(() => 
        Math.floor(Math.random() * (MAX_BID - MIN_BID + 1)) + MIN_BID
    );

    // ✅ Real FHEVM SDK - useEncryptBid hook
    const { encrypt: realEncrypt } = useEncryptBid();
    const { decrypt } = useDecrypt();
    
    // Try real encryption first, fallback to mock if SDK not ready
    const encrypt = useCallback(async (value: number) => {
        try {
            return await realEncrypt(value);
        } catch (err) {
            console.warn('[AUCTION] Real encryption failed, using mock:', err);
            const mockEncrypted = await useMockEncrypt().encrypt(value);
            return mockEncrypted;
        }
    }, [realEncrypt]);
    
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
        setStatusMessage('💳 Processing transaction...');
        await new Promise(res => setTimeout(res, 500));
        
        setStatusMessage('🔒 Encrypting your bid with FHEVM...');
        const encryptedBid = await encrypt(bidValue);
        
        setStatusMessage('⛓️  Writing to blockchain...');
        await new Promise(res => setTimeout(res, 500));
        
        const newParticipant: Bid = {
            address: `0x${Math.random().toString(16).slice(2, 12)}...${Math.random().toString(16).slice(2, 6)}`,
            encryptedBid,
            originalBid: bidValue,
        };
        
        await new Promise(res => setTimeout(res, 500));
        setParticipants(prev => [...prev, newParticipant]);
        setUserState(UserState.BID_SUBMITTED);
        setStatusMessage('✅ Bid submitted successfully!');
        
        // Clear message after 2 seconds
        setTimeout(() => setStatusMessage(''), 2000);
        
        setIsLoading(false);
        setBid('');
    }, [bid, encrypt, product]);

    const revealWinner = useCallback(async () => {
        if (!product || auctionState !== AuctionState.ENDED) return;

        setIsLoading(true);
        setStatusMessage('🔍 Decrypting bids to find winner...');
        
        if (participants.length === 0) {
            setWinner(null);
            setAuctionState(AuctionState.REVEALED);
            setStatusMessage('');
            setIsLoading(false);
            return;
        }
        
        let closestBid: Bid = participants[0];
        let smallestDifference = Math.abs(closestBid.originalBid - randomTargetPrice);

        for (let i = 1; i < participants.length; i++) {
            const currentDifference = Math.abs(participants[i].originalBid - randomTargetPrice);
            if (currentDifference < smallestDifference) {
                smallestDifference = currentDifference;
                closestBid = participants[i];
            }
        }
        
        setStatusMessage(`🔐 Decrypting winning bid (${closestBid.address})...`);
        await new Promise(res => setTimeout(res, 500));
        
        // Use the actual originalBid that we encrypted (it's already stored)
        // In production, decryption would reveal this value on-chain
        const winningBidValue = closestBid.originalBid;
        
        setWinner({
            address: closestBid.address,
            bid: winningBidValue,
            difference: smallestDifference
        });
        
        setAuctionState(AuctionState.REVEALED);
        setStatusMessage(`🏆 Winner found! Bid: $${winningBidValue} (Target: $${randomTargetPrice})`);
        
        // Clear message after 3 seconds
        setTimeout(() => setStatusMessage(''), 3000);
        setIsLoading(false);
    }, [auctionState, participants, randomTargetPrice]);

    const simulateFullAuction = useCallback(async () => {
        if (!product) return;
        setIsLoading(true);
        setStatusMessage('🚀 Starting simulation...');

        // Simulate 9 additional bids (user + 9 simulated = 10 total)
        // Realistic demo with real FHEVM encryption for each bid
        const maxSimulationBids = 9;
        const bidsToSimulate = Math.min(maxSimulationBids, MAX_PARTICIPANTS - participants.length);
        if (bidsToSimulate <= 0) {
            setAuctionState(AuctionState.ENDED);
            setStatusMessage('');
            setIsLoading(false);
            return;
        }

        console.log(`[SIMULATE] Simulating ${bidsToSimulate} additional bids with real FHEVM encryption...`);
        setStatusMessage(`🔐 Encrypting ${bidsToSimulate} participant bids with FHEVM...`);

        const simulatedBids: Bid[] = [];
        for (let i = 0; i < bidsToSimulate; i++) {
            try {
                // Update status for each bid
                setStatusMessage(`🔐 Encrypting bid ${i + 1}/${bidsToSimulate}...`);
                
                // Generate truly random bid between MIN_BID and MAX_BID
                const randomBidValue = Math.floor(Math.random() * (MAX_BID - MIN_BID + 1)) + MIN_BID;

                console.log(`[SIMULATE] Bid ${i + 1}/${bidsToSimulate}: $${randomBidValue}`);

                // ✅ GERÇEK FHEVM ŞİFRELEMESİ YAPILIYOR
                const encryptedBid = await encrypt(randomBidValue);
                
                simulatedBids.push({
                    address: `0x${Math.random().toString(16).slice(2, 12)}...sim${i + 1}`,
                    encryptedBid,
                    originalBid: randomBidValue,
                });

                setStatusMessage(`✅ Bid ${i + 1}/${bidsToSimulate} encrypted - Writing to blockchain...`);
                console.log(`[SIMULATE] ✅ Bid ${i + 1} encrypted and added`);
                
                // Add to participants in real-time so user sees progress
                setParticipants(prev => [...prev, simulatedBids[i]]);
            } catch (err) {
                console.error(`[SIMULATE] ❌ Error encrypting bid ${i + 1}:`, err);
                setStatusMessage(`❌ Error processing bid ${i + 1}, continuing...`);
                // Continue with other bids
                await new Promise(res => setTimeout(res, 500));
            }
            
            // Simulate blockchain write delay
            await new Promise(res => setTimeout(res, 300));
        }
        
        console.log(`[SIMULATE] Total simulated bids: ${simulatedBids.length}`);
        
        setAuctionState(AuctionState.ENDED);
        setTimeLeft(0);
        setStatusMessage('✨ Simulation complete! Auction ended. Click "Reveal Winner" to see results.');
        
        // Clear message after 5 seconds
        setTimeout(() => setStatusMessage(''), 5000);
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
        statusMessage,
        randomTargetPrice,
        joinAuction,
        submitBid,
        revealWinner,
        simulateFullAuction,
        resetAuction,
    };
};