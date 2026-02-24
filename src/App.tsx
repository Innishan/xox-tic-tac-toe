/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WagmiProvider, useAccount, useSendTransaction, useBalance, useConnect, useDisconnect } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from './wagmi';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Users, 
  Zap, 
  Shield, 
  CreditCard, 
  RefreshCw,
  X,
  Circle,
  LayoutGrid,
  History,
  Crown,
  Wallet,
  LogOut,
  CheckCircle2,
  Image as ImageIcon,
  Link as LinkIcon,
  Copy,
  UserPlus,
  Info,
  Share2,
  ExternalLink
} from 'lucide-react';
import { parseEther } from 'viem';

const queryClient = new QueryClient();

const XLogo = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FarcasterLogo = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="4" fill="#8a63d2"/>
    <path d="M12 18V13.5M12 13.5C10.5 13.5 9 14.5 9 16V18M12 13.5C13.5 13.5 15 14.5 15 16V18M7 18V13.5C7 10.5 9 8.5 12 8.5C15 8.5 17 10.5 17 13.5V18M5 6.5H19V8.5H5V6.5Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const FoundersNFT = ({ size = 200 }: { size?: number }) => (
  <div className="relative group cursor-pointer" style={{ width: size, height: size }}>
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-[2.5rem] blur-xl group-hover:blur-2xl transition-all duration-500" />
    <svg width={size} height={size} viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 drop-shadow-2xl">
      <defs>
        <linearGradient id="nftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#D4FF00', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#8FFF00', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#FF5CFF', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      
      {/* Card Base */}
      <rect x="20" y="20" width="200" height="200" rx="40" fill="#0B1020" stroke="url(#nftGrad)" strokeWidth="4" />
      <rect x="30" y="30" width="180" height="180" rx="30" fill="white" fillOpacity="0.03" />
      
      {/* Slime Pattern */}
      <path d="M40 40 Q120 20 200 40 L200 60 Q120 80 40 60 Z" fill="url(#nftGrad)" fillOpacity="0.2" />
      
      {/* Central Logo */}
      <g transform="translate(60, 80) scale(0.5)">
        <path d="M15,10 L55,50 M55,10 L15,50" stroke="#8FFF00" strokeWidth="18" strokeLinecap="round" />
        <circle cx="105" cy="30" r="28" stroke="#FF5CFF" strokeWidth="18" fill="none" />
        <path d="M155,10 L195,50 M195,10 L155,50" stroke="#8FFF00" strokeWidth="18" strokeLinecap="round" />
      </g>
      
      {/* Text */}
      <text x="120" y="190" textAnchor="middle" fill="white" fontSize="14" fontWeight="900" letterSpacing="2">FOUNDERS EDITION</text>
      <text x="120" y="210" textAnchor="middle" fill="url(#nftGrad)" fontSize="10" fontWeight="bold">#0001 / 3333</text>
      
      {/* Shine */}
      <path d="M40 40 L80 40 L40 80 Z" fill="white" fillOpacity="0.1" />
    </svg>
  </div>
);

const BaseLogo = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="baseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#0052FF', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#00A3FF', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <rect width="24" height="24" rx="6" fill="url(#baseGrad)"/>
    <rect x="5" y="5" width="14" height="14" rx="3" fill="white" fillOpacity="0.2"/>
    <circle cx="12" cy="12" r="4" fill="white"/>
  </svg>
);

const XOXLogo = ({ scale = 1 }: { scale?: number }) => {
  return (
    <div className="xox-logo-container" style={{ transform: `scale(${scale})` }}>
      <div className="logo-glow-green" style={{ left: '-20px' }} />
      <div className="logo-glow-pink" style={{ left: '50px' }} />
      <div className="logo-glow-green" style={{ left: '120px' }} />
      
      <svg width="240" height="120" viewBox="0 0 240 120" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Green Slime Gradient */}
          <linearGradient id="slimeGreen" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#D4FF00', stopOpacity: 1 }} />
            <stop offset="40%" style={{ stopColor: '#8FFF00', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#4CAF50', stopOpacity: 1 }} />
          </linearGradient>
          
          {/* Purple Slime Gradient */}
          <linearGradient id="slimePurple" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#FF5CFF', stopOpacity: 1 }} />
            <stop offset="40%" style={{ stopColor: '#B026FF', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#7B1FA2', stopOpacity: 1 }} />
          </linearGradient>

          {/* Shadow Filter */}
          <filter id="logoShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* X (Left) */}
        <g transform="translate(10, 10)" filter="url(#logoShadow)">
          {/* Black Outline */}
          <path d="M15,10 L55,50 M55,10 L15,50" stroke="#000000" strokeWidth="28" strokeLinecap="round" />
          {/* Main Body */}
          <path d="M15,10 L55,50 M55,10 L15,50" stroke="url(#slimeGreen)" strokeWidth="18" strokeLinecap="round" />
          {/* Highlights */}
          <path d="M18,12 Q25,8 32,12" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
          <path d="M48,12 Q55,8 58,12" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
          {/* Drips */}
          <circle cx="15" cy="55" r="7" fill="#4CAF50" />
          <path d="M15,50 L15,65" stroke="#4CAF50" strokeWidth="8" strokeLinecap="round" />
          <circle cx="55" cy="55" r="6" fill="#4CAF50" />
          <path d="M55,50 L55,62" stroke="#4CAF50" strokeWidth="6" strokeLinecap="round" />
          <circle cx="35" cy="58" r="5" fill="#4CAF50" />
        </g>

        {/* O (Middle) */}
        <g transform="translate(85, 10)" filter="url(#logoShadow)">
          {/* Black Outline */}
          <circle cx="35" cy="35" r="32" stroke="#000000" strokeWidth="28" />
          {/* Main Body */}
          <circle cx="35" cy="35" r="32" fill="url(#slimePurple)" />
          {/* Inner Hole */}
          <circle cx="35" cy="35" r="12" fill="#0B1020" />
          {/* Highlights */}
          <path d="M20,20 Q35,10 50,20" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.5" />
          <circle cx="55" cy="50" r="4" fill="white" opacity="0.4" />
          {/* Drips */}
          <circle cx="35" cy="72" r="8" fill="#7B1FA2" />
          <path d="M35,65 L35,78" stroke="#7B1FA2" strokeWidth="10" strokeLinecap="round" />
          <circle cx="20" cy="68" r="5" fill="#7B1FA2" />
          <circle cx="50" cy="68" r="6" fill="#7B1FA2" />
        </g>

        {/* X (Right) */}
        <g transform="translate(160, 10)" filter="url(#logoShadow)">
          {/* Black Outline */}
          <path d="M15,10 L55,50 M55,10 L15,50" stroke="#000000" strokeWidth="28" strokeLinecap="round" />
          {/* Main Body */}
          <path d="M15,10 L55,50 M55,10 L15,50" stroke="url(#slimeGreen)" strokeWidth="18" strokeLinecap="round" />
          {/* Highlights */}
          <path d="M18,12 Q25,8 32,12" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
          {/* Drips */}
          <circle cx="15" cy="55" r="6" fill="#4CAF50" />
          <path d="M15,50 L15,62" stroke="#4CAF50" strokeWidth="6" strokeLinecap="round" />
          <circle cx="55" cy="55" r="7" fill="#4CAF50" />
          <path d="M55,50 L55,65" stroke="#4CAF50" strokeWidth="8" strokeLinecap="round" />
          <circle cx="35" cy="58" r="5" fill="#4CAF50" />
        </g>
      </svg>
    </div>
  );
};

const FEE_COLLECTOR = import.meta.env.VITE_FEE_COLLECTOR_ADDRESS || '0x0000000000000000000000000000000000000000';

const WalletConnect = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        <div className="hidden md:block text-right">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Connected</p>
          <p className="text-xs font-bold text-indigo-400">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {connectors.map((connector) => (
        <button
          key={connector.uid}
          onClick={() => connect({ connector })}
          className="primary-button"
        >
          <Wallet size={16} />
          Connect
        </button>
      ))}
    </div>
  );
};

// --- Components ---

const GameBoard = ({ board, onMove, turn, symbol, isMyTurn, size }: { 
  board: (string | null)[], 
  onMove: (i: number) => void, 
  turn: string, 
  symbol: string,
  isMyTurn: boolean,
  size: number
}) => {
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  return (
    <div 
      className="grid w-full max-w-[400px] mx-auto aspect-square p-4 rounded-[2.5rem] relative z-10 select-none overflow-hidden"
      style={{ 
        gridTemplateColumns: `repeat(${size}, 1fr)`,
        gap: size === 3 ? '16px' : '10px',
        backgroundColor: '#f5e6d3',
        backgroundImage: `
          linear-gradient(to bottom right, rgba(255,255,255,0.3), rgba(0,0,0,0.05)),
          url("https://www.transparenttextures.com/patterns/wood-pattern.png")
        `,
        boxShadow: '0 20px 50px rgba(0,0,0,0.1), inset 0 0 40px rgba(139, 69, 19, 0.05)',
        border: '8px solid #dcd0c0'
      }}
      onMouseLeave={() => setHoveredCol(null)}
    >
      {/* Column Highlights */}
      {isMyTurn && Array.from({ length: size }).map((_, colIdx) => (
        <div 
          key={`col-highlight-${colIdx}`}
          className={`absolute top-0 bottom-0 pointer-events-none transition-opacity duration-300 bg-white/20 z-0`}
          style={{ 
            left: `${(colIdx / size) * 100}%`, 
            width: `${(1 / size) * 100}%`,
            opacity: hoveredCol === colIdx ? 1 : 0
          }}
        />
      ))}

      {board.map((cell, i) => {
        const colIdx = i % size;
        return (
          <motion.button
            key={`cell-${i}`}
            whileHover={isMyTurn && !cell ? { scale: 1.02, backgroundColor: 'rgba(255,255,255,0.4)' } : {}}
            whileTap={isMyTurn && !cell ? { scale: 0.98 } : {}}
            onMouseEnter={() => isMyTurn && setHoveredCol(colIdx)}
            onClick={() => isMyTurn && !cell && onMove(i)}
            className={`
              relative z-10 flex items-center justify-center rounded-[1.5rem] border-2 transition-all duration-200
              ${cell 
                ? 'border-white/20 bg-white/10 shadow-inner' 
                : isMyTurn 
                  ? 'border-white/10 bg-white/5 hover:border-indigo-500/50' 
                  : 'border-transparent bg-transparent opacity-40'}
              ${size === 3 ? 'text-4xl' : 'text-2xl'} font-bold
              ${!cell && isMyTurn ? 'cursor-pointer' : 'cursor-default'}
            `}
          >
            <AnimatePresence mode="wait">
              {cell === 'X' && (
                <motion.div
                  key="x-icon"
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0 }}
                  className="text-indigo-600 drop-shadow-[0_4px_6px_rgba(99,102,241,0.2)] pointer-events-none"
                >
                  <X size={size === 3 ? 48 : 32} strokeWidth={3} />
                </motion.div>
              )}
              {cell === 'O' && (
                <motion.div
                  key="o-icon"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="text-indigo-400 drop-shadow-[0_4px_6px_rgba(129,140,248,0.2)] pointer-events-none"
                >
                  <Circle size={size === 3 ? 40 : 28} strokeWidth={3} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
};

const Leaderboard = ({ refreshTrigger }: { refreshTrigger?: number }) => {
  const [data, setData] = useState<{ address: string; points: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch('/api/leaderboard', { cache: 'no-store' });
      if (!res.ok) return;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error('Leaderboard error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 15000);
    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  useEffect(() => {
    if (refreshTrigger) {
      fetchLeaderboard();
    }
  }, [refreshTrigger, fetchLeaderboard]);

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          Leaderboard
        </h3>
        <button onClick={fetchLeaderboard} className="text-white/30 hover:text-white transition-colors">
          <RefreshCw size={18} />
        </button>
      </div>
      <div className="space-y-3">
        {loading ? (
          <div className="h-40 flex items-center justify-center text-white/20">Loading...</div>
        ) : data.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-white/20">No players yet</div>
        ) : (
          data.map((player, i) => (
            <div 
              key={player.address} 
              className="flex items-center justify-between p-4 rounded-3xl bg-white/5 border border-white/10 soft-shadow hover:scale-[1.02] transition-transform"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${i === 0 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-white/10 text-white/60'}`}>
                  {i + 1}
                </div>
                <span className="font-bold text-white">
                  {player.address.slice(0, 6)}...{player.address.slice(-4)}
                </span>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-indigo-400">
                  {Number.isInteger(player.points) ? player.points : player.points.toFixed(1)}
                </p>
                <p className="text-[10px] font-bold uppercase text-white/30">PTS</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const GameView = () => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { sendTransactionAsync } = useSendTransaction();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'queueing' | 'playing' | 'finished'>('idle');
  const [gameData, setGameData] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [referralInput, setReferralInput] = useState('');
  const [referralStatus, setReferralStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [selectedSize, setSelectedSize] = useState<3 | 4>(3);
  const [leaderboardRefresh, setLeaderboardRefresh] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [showCheckin, setShowCheckin] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchUserDataRef = useRef<() => Promise<void>>(null);

  const fetchUserData = useCallback(async () => {
    if (!address) return;
    try {
      const res = await fetch(`/api/user/${address}`, { cache: 'no-store' });
      if (!res.ok) {
        const text = await res.text();
        console.error('User data fetch failed:', text);
        return;
      }
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const json = await res.json();
        setUserData(json);
      } else {
        const text = await res.text();
        console.warn('User data expected JSON but got:', text.slice(0, 50));
      }
    } catch (e) {
      console.error('User data error:', e);
    }
  }, [address]);

  useEffect(() => {
    fetchUserDataRef.current = fetchUserData;
  }, [fetchUserData]);

  useEffect(() => {
    if (!isConnected) return;
    
    const s = io();
    setSocket(s);

    s.on('game_start', (data) => {
      setGameData({
        ...data,
        board: Array(data.size * data.size).fill(null),
        turn: data.turn
      });
      setGameState('playing');
    });

    s.on('game_update', (data) => {
      setGameData((prev: any) => prev ? ({ ...prev, ...data }) : null);
    });

    s.on('game_over', (data) => {
      setGameData((prev: any) => prev ? ({ ...prev, board: data.board }) : null);
      setWinner(data.winner);
      setGameState('finished');
      fetchUserDataRef.current?.();
      setLeaderboardRefresh(prev => prev + 1);
    });

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [isConnected]);

  useEffect(() => {
    if (isConnected) fetchUserData();
  }, [isConnected, fetchUserData]);

  const handleJoinQueue = async () => {
    if (!isConnected) return;
    setError(null);

    try {
      // If subscribed, game is free
      if (!userData?.is_subscribed) {
        setIsPaying(true);
        // Game fee: 0.000001 ETH
        await sendTransactionAsync({
          to: FEE_COLLECTOR as `0x${string}`,
          value: parseEther('0.000001'),
        });
      }

      setGameState('queueing');
      socket?.emit('join_queue', { address, size: selectedSize });
    } catch (e: any) {
      console.error('Payment failed', e);
      if (e.message?.includes('User rejected')) {
        setError('Transaction was rejected in your wallet.');
      } else {
        setError('Payment failed. Please check your balance and try again.');
      }
    } finally {
      setIsPaying(false);
    }
  };

  const handleSubscribe = async () => {
    if (!isConnected) return;
    setError(null);
    setIsSubscribing(true);
    try {
      // Subscription: $3 (approx 0.0015 ETH)
      await sendTransactionAsync({
        to: FEE_COLLECTOR as `0x${string}`,
        value: parseEther('0.0015'),
      });

      const res = await fetch('/api/user/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      });
      if (!res.ok) {
        const text = await res.text();
        console.error('Subscription API failed:', text);
        setError('Server failed to record subscription.');
        return;
      }
      fetchUserData();
    } catch (e: any) {
      console.error('Subscription failed', e);
      if (e.message?.includes('User rejected')) {
        setError('Subscription transaction was rejected.');
      } else {
        setError('Subscription failed. Please try again.');
      }
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleCheckin = async () => {
    if (!isConnected) return;
    setError(null);
    setIsCheckingIn(true);
    try {
      const res = await fetch('/api/user/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Check-in failed');
        return;
      }
      
      alert(`Check-in successful! +${data.pointsAdded} points added. Streak: ${data.streak}`);
      fetchUserData();
      setShowCheckin(false);
    } catch (e: any) {
      console.error('Checkin failed', e);
      setError('Check-in failed. Please try again.');
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleSetReferrer = async () => {
    if (!isConnected || !referralInput) return;
    setReferralStatus('loading');
    try {
      const res = await fetch('/api/user/referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, referrer: referralInput })
      });
      if (res.ok) {
        setReferralStatus('success');
        fetchUserData();
      } else {
        const text = await res.text();
        console.error('Referral API failed:', text);
        setReferralStatus('error');
      }
    } catch (e) {
      setReferralStatus('error');
    }
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}?ref=${address}`;
    navigator.clipboard.writeText(link);
    alert('Referral link copied!');
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref && ref !== address) {
      setReferralInput(ref);
    }
  }, [address]);

  const handleMove = useCallback((index: number) => {
    if (!socket || !gameData?.gameId || !address) return;
    socket.emit('make_move', { gameId: gameData.gameId, index, address });
  }, [socket, gameData?.gameId, address]);

  const handleShare = (platform: 'x' | 'base' | 'farcaster') => {
    const referralLink = `${window.location.origin}?ref=${address}`;
    // Using a placeholder victory image URL that matches the user's description
    const victoryImageUrl = "https://i.imgur.com/8Q7pZ6x.png"; 
    const text = `I just won a match on xox! 🏆\n\nXOX is the first tic tac toe game in baseapp miniapp. Join me and climb the leaderboard!\n\nFirst 3333 subscribers will get founders NFT! 🚀\n\nPlay here: ${referralLink}`;
    
    let shareUrl = '';
    if (platform === 'x') {
      shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralLink)}`;
    } else if (platform === 'farcaster') {
      shareUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(referralLink)}`;
    } else if (platform === 'base') {
      if (navigator.share) {
        navigator.share({
          title: 'xox Victory',
          text: text,
          url: referralLink,
        }).catch(() => {});
        return;
      }
      shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    }
    
    window.open(shareUrl, '_blank');
  };

  return (
    <div className="min-h-screen text-white font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <nav className="bg-transparent sticky top-0 z-50 px-4 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <XOXLogo scale={0.8} />
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowCheckin(true)}
              className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center soft-shadow cursor-pointer hover:bg-white/10 transition-colors text-xl border border-white/10"
              title="Daily Check-in"
            >
              📅
            </button>
            <button 
              onClick={() => setShowInfo(true)}
              className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center soft-shadow cursor-pointer hover:bg-white/10 transition-colors text-xl border border-white/10"
              title="Rewards & Incentives"
            >
              🎁
            </button>
            <WalletConnect />
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {showCheckin && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
            onClick={() => setShowCheckin(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#0B1020] border border-white/10 rounded-[2.5rem] p-8 max-w-lg w-full soft-shadow space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black tracking-tighter text-white">DAILY CHECK-IN</h2>
                <button onClick={() => setShowCheckin(false)} className="text-white/20 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-center space-y-2">
                  <p className="text-sm font-bold text-indigo-400 uppercase tracking-widest">Current Streak</p>
                  <p className="text-5xl font-black text-indigo-400">{userData?.streak || 0} Days</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Streak Benefits</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                      <span className="text-sm font-bold text-white">Daily Reward</span>
                      <span className="text-indigo-400 font-black">+1 Point</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                      <span className="text-sm font-bold text-white">7 Day Streak</span>
                      <span className="text-indigo-400 font-black">+7 Points Bonus</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                      <span className="text-sm font-bold text-white">30 Day Streak</span>
                      <span className="text-indigo-400 font-black">+30 Points Bonus</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleCheckin}
                  disabled={isCheckingIn}
                  className="primary-button w-full py-5 text-lg disabled:opacity-50"
                >
                  {isCheckingIn ? 'Checking in...' : 'Check-in Now'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showInfo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
            onClick={() => setShowInfo(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#0B1020] border border-white/10 rounded-[2.5rem] p-8 max-w-lg w-full soft-shadow space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black tracking-tighter text-white">REWARDS & FUTURE INCENTIVES</h2>
                <button onClick={() => setShowInfo(false)} className="text-white/20 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-4 text-white/70 leading-relaxed">
                <p className="font-bold text-white">
                  XOX is the first tic tac toe game in baseapp miniapp.
                </p>
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium">
                  "First 3333 subscribers will get founders NFT"
                </div>
                <div className="flex justify-center py-4">
                  <FoundersNFT size={160} />
                </div>
                <p className="text-sm">
                  NFT holders and top 100 in leaderboard will share 50% of the project revenue on monthly basis with snapshot on end of the every month.
                </p>
                <div className="pt-4 border-t border-white/10">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Rewards Structure</p>
                  <ul className="space-y-2 text-xs font-medium">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      50% Revenue Share for Founders & Top Players
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      Monthly Snapshots & Payouts
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      Exclusive NFT Holder Benefits
                    </li>
                  </ul>
                </div>
              </div>

              <button 
                onClick={() => setShowInfo(false)}
                className="primary-button w-full py-4"
              >
                Got it!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-12 gap-8 pb-32">
        {/* Left Column: Stats & Actions */}
        <div className="lg:col-span-4 space-y-8">
          <section className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 soft-shadow space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center">
                  <UserPlus size={32} className="text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </h2>
                  <p className="text-sm text-white/40 font-bold uppercase tracking-widest">
                    {userData?.is_subscribed ? 'Pro Member' : 'Free Tier'}
                  </p>
                </div>
              </div>
              {userData?.is_subscribed && (
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <CheckCircle2 size={20} className="text-indigo-400" />
                </div>
              )}
            </div>

            {isConnected && (
              <button 
                onClick={() => disconnect()}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-500/10 text-red-500 font-bold hover:bg-red-500/20 transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10">
                <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1">Points</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-3xl font-black text-indigo-400">{userData?.points || 0}</p>
                </div>
                {userData?.has_nft === 1 && (
                  <p className="text-[10px] text-indigo-300 font-bold mt-1">2X ACTIVE</p>
                )}
              </div>
              <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10">
                <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1">Rank</p>
                <p className="text-3xl font-black text-white">#--</p>
              </div>
            </div>

            {!userData?.is_subscribed && (
              <div className="space-y-4">
                <button 
                  onClick={handleSubscribe}
                  disabled={isSubscribing}
                  className="primary-button w-full py-5 text-lg disabled:opacity-50"
                >
                  <Shield size={20} className={isSubscribing ? 'animate-pulse' : ''} />
                  {isSubscribing ? 'Processing...' : 'Get Pro ($3)'}
                </button>
                <p className="text-[10px] text-center text-white/30 uppercase font-black tracking-widest">
                  Unlimited Games • NFT Reward
                </p>
              </div>
            )}

            {userData?.has_nft === 1 && (
              <div className="pt-8 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white/40">My Collection</h3>
                  <span className="text-[10px] font-bold text-indigo-400">1 ITEM</span>
                </div>
                <div className="flex justify-center">
                  <FoundersNFT size={180} />
                </div>
              </div>
            )}

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold flex items-center justify-between"
              >
                <span>{error}</span>
                <button onClick={() => setError(null)} className="hover:text-red-800">
                  <X size={14} />
                </button>
              </motion.div>
            )}
          </section>
        </div>

        {/* Middle Column: Game Area, Leaderboard & Referrals */}
        <div className="lg:col-span-8 space-y-8">
          <div className="relative min-h-[600px] rounded-[3rem] bg-white/5 border border-white/10 soft-shadow flex items-center justify-center p-8 overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

            <AnimatePresence mode="wait">
              {gameState === 'idle' && (
                <motion.div 
                  key="idle"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center space-y-12 max-w-md relative z-10"
                >
                  <div className="space-y-6">
                    <h1 className="text-6xl font-black tracking-tighter leading-[0.9]">
                      READY TO <br />
                      <span className="text-indigo-600">PLAY?</span>
                    </h1>
                    <p className="text-[#1A1A1A]/40 text-lg font-medium">
                      Select your board size and find a match to start earning points.
                    </p>
                  </div>

                  <div className="flex justify-center gap-6">
                    {[3, 4].map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size as 3 | 4)}
                        className={`w-24 h-24 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                          selectedSize === size 
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-600' 
                            : 'border-[#F1F5F9] bg-[#F8FAFC] text-[#1A1A1A]/40 hover:border-indigo-200'
                        }`}
                      >
                        <span className="text-2xl font-black">{size}x{size}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest">Board</span>
                      </button>
                    ))}
                  </div>
                  
                  <div className="space-y-6">
                    <button 
                      onClick={handleJoinQueue}
                      disabled={!isConnected || isPaying}
                      className="primary-button w-full py-6 text-xl shadow-2xl disabled:opacity-50"
                    >
                      <Zap size={24} className={isPaying ? 'animate-pulse' : ''} />
                      {isPaying ? 'Confirming...' : 'FIND MATCH'}
                    </button>
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                      <p className="text-[10px] text-[#1A1A1A]/40 uppercase font-black tracking-[0.2em]">
                        {userData?.is_subscribed ? 'FREE FOR PRO' : 'Fee: 0.000001 ETH'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {gameState === 'queueing' && (
                <motion.div 
                  key="queueing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center space-y-8 relative z-10"
                >
                  <div className="relative">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="w-32 h-32 border-[6px] border-indigo-50 border-t-indigo-600 rounded-full mx-auto"
                    />
                    <Users className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600" size={40} />
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-3xl font-black">Finding Opponent</h2>
                    <p className="text-[#1A1A1A]/40 font-bold uppercase tracking-widest text-xs">Matching you now...</p>
                  </div>
                </motion.div>
              )}

              {gameState === 'playing' && (
                <motion.div 
                  key="playing"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full max-w-md space-y-12 relative z-10"
                >
                  <div className="flex items-center justify-between px-4">
                    <div className="flex flex-col items-center gap-3">
                      <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center border-2 transition-all ${gameData?.symbol === 'X' ? 'border-indigo-600 bg-indigo-50' : 'border-[#F1F5F9] bg-[#F8FAFC]'}`}>
                        <X size={32} className={gameData?.symbol === 'X' ? 'text-indigo-600' : 'text-[#1A1A1A]/20'} />
                      </div>
                      <span className="text-[10px] font-black uppercase text-[#1A1A1A]/40 tracking-widest">You (X)</span>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                      <div className="px-6 py-2 rounded-full bg-indigo-600 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20">
                        {gameData?.turn === address ? "Your Turn" : "Wait..."}
                      </div>
                      <div className="w-32 h-1.5 bg-indigo-50 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: "0%" }}
                          animate={{ width: gameData?.turn === address ? "100%" : "0%" }}
                          className="h-full bg-indigo-600"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                      <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center border-2 transition-all ${gameData?.symbol === 'O' ? 'border-indigo-600 bg-indigo-50' : 'border-[#F1F5F9] bg-[#F8FAFC]'}`}>
                        <Circle size={28} className={gameData?.symbol === 'O' ? 'text-indigo-600' : 'text-[#1A1A1A]/20'} />
                      </div>
                      <span className="text-[10px] font-black uppercase text-[#1A1A1A]/40 tracking-widest">Opponent (O)</span>
                    </div>
                  </div>

                  <GameBoard 
                    board={gameData?.board || []} 
                    onMove={handleMove} 
                    turn={gameData?.turn || ''} 
                    symbol={gameData?.symbol || ''}
                    isMyTurn={gameData?.turn === address}
                    size={gameData?.size || 3}
                  />

                  <div className="text-center">
                    <p className="text-[#1A1A1A]/20 text-[10px] font-black uppercase tracking-[0.2em]">Game ID: {gameData?.gameId?.slice(0, 12) || '...'}</p>
                  </div>
                </motion.div>
              )}

              {gameState === 'finished' && (
                <motion.div 
                  key="finished"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-12 relative z-10"
                >
                  <div className="space-y-6">
                    {winner === address ? (
                      <>
                        <div className="w-32 h-32 bg-indigo-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto border-2 border-indigo-500/20 shadow-xl shadow-indigo-500/10">
                          <Trophy size={64} className="text-indigo-400" />
                        </div>
                        <div className="space-y-2">
                          <h2 className="text-5xl font-black text-indigo-400 tracking-tighter">VICTORY!</h2>
                          <p className="text-white/40 font-bold uppercase tracking-widest">+3 Points Earned</p>
                        </div>
                      </>
                    ) : winner === null ? (
                      <>
                        <div className="w-32 h-32 bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto border-2 border-white/10">
                          <LayoutGrid size={64} className="text-white/20" />
                        </div>
                        <div className="space-y-2">
                          <h2 className="text-5xl font-black text-white tracking-tighter">DRAW</h2>
                          <p className="text-white/40 font-bold uppercase tracking-widest">+1 Point added to your score</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-32 h-32 bg-red-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto border-2 border-red-500/20">
                          <X size={64} className="text-red-500" />
                        </div>
                        <div className="space-y-2">
                          <h2 className="text-5xl font-black text-red-500 tracking-tighter">DEFEAT</h2>
                          <p className="text-white/40 font-bold uppercase tracking-widest">Try again soon</p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex flex-col gap-4 items-center">
                    <button 
                      onClick={handleJoinQueue}
                      className="primary-button px-12 py-5 text-lg w-full max-w-xs"
                    >
                      <Zap size={20} />
                      PLAY AGAIN
                    </button>
                    <button 
                      onClick={() => setGameState('idle')}
                      className="secondary-button px-12 py-5 text-lg w-full max-w-xs"
                    >
                      RETURN TO LOBBY
                    </button>

                    {winner === address && (
                      <div className="pt-4 space-y-4 w-full max-w-xs">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Share Your Victory</p>
                        <div className="flex gap-4 justify-center">
                          <button 
                            onClick={() => handleShare('x')}
                            className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center soft-shadow hover:scale-110 transition-transform"
                            title="Share on X"
                          >
                            <XLogo size={24} />
                          </button>
                          <button 
                            onClick={() => handleShare('farcaster')}
                            className="w-14 h-14 rounded-2xl bg-[#8a63d2] text-white flex items-center justify-center soft-shadow hover:scale-110 transition-transform"
                            title="Share on Farcaster"
                          >
                            <FarcasterLogo size={32} />
                          </button>
                          <button 
                            onClick={() => handleShare('base')}
                            className="w-14 h-14 rounded-2xl bg-[#0052FF] text-white flex items-center justify-center soft-shadow hover:scale-110 transition-transform"
                            title="Share on Baseapp"
                          >
                            <BaseLogo size={32} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Leaderboard & Referrals Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 soft-shadow">
              <Leaderboard refreshTrigger={leaderboardRefresh} />
            </div>
            
            <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 soft-shadow space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Referrals</h3>
                <button 
                  onClick={copyReferralLink}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <Copy size={14} /> Copy Link
                </button>
              </div>
              
              {!userData?.referrer ? (
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    placeholder="Referrer Address"
                    value={referralInput}
                    onChange={(e) => setReferralInput(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-indigo-500/50 text-white placeholder:text-white/20"
                  />
                  <button 
                    onClick={handleSetReferrer}
                    disabled={referralStatus === 'loading'}
                    className="w-12 h-12 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-500 transition-all flex items-center justify-center"
                  >
                    <UserPlus size={20} />
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between">
                  <span className="text-xs text-indigo-400 font-black uppercase">Referred By</span>
                  <span className="text-xs font-bold text-white/60">
                    {userData.referrer.slice(0, 6)}...{userData.referrer.slice(-4)}
                  </span>
                </div>
              )}
              <p className="text-xs text-white/40 font-medium">
                Invite friends to earn 50% of their points!
              </p>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
};

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <GameView />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
