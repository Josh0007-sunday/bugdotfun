import { useEffect, useState } from 'react';
import { useProgram } from '../context/ProgramContext';
import { PublicKey } from '@solana/web3.js';
import { Idl, Program } from '@project-serum/anchor';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMTUwIiB2aWV3Qm94PSIwIDAgMzAwIDE1MCIgZmlsbD0iI2VlZWVlZSI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIxNTAiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzY2NiI+Tm8gSW1hZ2UgQXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';

interface BountyAccount {
  authority?: PublicKey;
  bountyId?: string;
  title?: string;
  description?: string;
  githubRepo?: string;
  imageUri?: string;
  likes?: number;
  createdAt?: number;
  bump?: number;
}

interface Bounty {
  publicKey: PublicKey;
  account: BountyAccount;
}

class BountyErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Bounty rendering error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-900 border border-red-700 rounded-lg font-mono text-sm">
          <p className="text-red-400">Error: Failed to render bounty component</p>
        </div>
      );
    }

    return this.props.children;
  }
}

const AllBountiesDisplay = () => {
  const { program, wallet } = useProgram();
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBounties = async () => {
      if (!program || !wallet.connected) {
        setError(!program ? 'Program not initialized' : 'Wallet not connected');
        setLoading(false);
        return;
      }
    
      try {
        setLoading(true);
        setError(null);
        
        const fetchedBounties = await (program as Program<Idl>).account.bounty.all();
        console.log('Fetched bounties:', fetchedBounties);
    
        const formattedBounties = fetchedBounties.map((item) => {
          try {
            return {
              publicKey: item.publicKey,
              account: {
                authority: item.account.authority || undefined,
                bountyId: item.account.bountyId?.toString() || 'N/A',
                title: item.account.title?.toString() || 'Untitled',
                description: item.account.description?.toString() || '',
                githubRepo: item.account.githubRepo?.toString() || '',
                imageUri: item.account.imageUri?.toString() || '',
                likes: Number(item.account.likes) || 0,
                createdAt: item.account.createdAt?.toNumber() || 0,
                bump: Number(item.account.bump) || 0,
              },
            };
          } catch (e) {
            console.error('Error formatting bounty:', e);
            return {
              publicKey: item.publicKey,
              account: {
                title: 'Invalid Bounty Data',
                description: 'Could not parse this bounty',
              },
            };
          }
        });
    
        setBounties(formattedBounties);
      } catch (err) {
        console.error('Error fetching bounties:', err);
        setError(`Failed to fetch bounties: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    };

    fetchBounties();
  }, [program, wallet.connected]);

  const formatDate = (timestamp?: number) => {
    if (!timestamp || isNaN(timestamp)) return 'N/A';
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const truncateAddress = (address?: PublicKey) => {
    if (!address) return 'Unknown';
    try {
      const addressStr = address.toBase58();
      return `${addressStr.slice(0, 4)}...${addressStr.slice(-4)}`;
    } catch {
      return 'Invalid address';
    }
  };

  const handleBountyClick = (bountyPublicKey: PublicKey) => {
    navigate(`/bounty/${bountyPublicKey.toBase58()}`);
  };

  if (loading) {
    return (
      <div className="mb-8 p-6 bg-gray-900 border border-gray-800 rounded-lg font-mono text-sm">
        <div className="flex items-center text-green-400 mb-4">
          <span className="inline-block mr-2">$</span>
          <span className="blink">loading bounties...</span>
        </div>
        <div className="text-gray-500 text-xs">
          <p>connecting to solana network...</p>
          <p>fetching bounty accounts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8 p-6 bg-gray-900 border border-gray-800 rounded-lg font-mono text-sm">
        <div className="text-red-400 mb-4">
          <p>Error: {error}</p>
        </div>
        <button 
          className="bg-gray-800 hover:bg-gray-700 text-green-400 font-mono text-sm py-1 px-3 border border-green-400 rounded transition-all"
          onClick={() => window.location.reload()}
        >
          $ retry
        </button>
      </div>
    );
  }

  if (bounties.length === 0) {
    return (
      <div className="mb-8 p-6 bg-gray-900 border border-gray-800 rounded-lg font-mono text-sm">
        <div className="text-green-400 mb-2">
          <p>$ bounty list --all</p>
        </div>
        <div className="text-gray-400">
          <p>No bounties found in program.</p>
          {wallet.connected && (
            <p className="mt-2">Run `create_bounty` to add the first one.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 bg-gray-900 border border-gray-800 rounded-lg p-6">
      <div className="mb-6 font-mono">
        <div className="text-green-400 mb-2">
          <p>$ bounty list --all</p>
        </div>
        <div className="text-gray-400 text-sm mb-4">
          <p>Found {bounties.length} active bounties:</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {bounties.map((bounty) => (
          <BountyErrorBoundary key={bounty.publicKey.toBase58()}>
            <div 
              className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden hover:border-green-400 transition-all cursor-pointer"
              onClick={() => handleBountyClick(bounty.publicKey)}
            >
              {/* Image area */}
              <div className="h-32 bg-gray-900 relative overflow-hidden border-b border-gray-700">
                <img
                  src={bounty.account.imageUri || FALLBACK_IMAGE}
                  alt={bounty.account.title || "Bounty"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                  }}
                />
              </div>
              
              {/* Content area */}
              <div className="p-4 font-mono">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-green-400 text-sm font-bold line-clamp-1 flex-1 mr-2">
                    {bounty.account.title || "Untitled Bounty"}
                  </h3>
                  <span className="bg-gray-900 text-gray-400 text-xs px-2 py-0.5 rounded border border-gray-700 whitespace-nowrap">
                    ID: {bounty.account.bountyId || 'N/A'}
                  </span>
                </div>
                
                <p className="text-gray-400 text-xs mb-3 line-clamp-2">
                  {bounty.account.description || "No description provided"}
                </p>
                
                <div className="flex justify-between items-center text-xs mb-3">
                  <span className="text-gray-500 truncate mr-2">
                    owner: {truncateAddress(bounty.account.authority)}
                  </span>
                  {bounty.account.githubRepo && (
                    <a
                      href={bounty.account.githubRepo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 hover:text-green-300 whitespace-nowrap border-b border-green-400 hover:border-green-300"
                      onClick={(e) => e.stopPropagation()} // Prevent navigation when clicking repo link
                    >
                      view_repo
                    </a>
                  )}
                </div>
                
                <div className="flex justify-between items-center pt-3 border-t border-gray-700 text-xs">
                  <div className="flex items-center text-gray-500">
                    <span className="text-green-400 mr-1">↑</span>
                    <span>{bounty.account.likes ?? 0}</span>
                  </div>
                  <div className="text-gray-500">
                    <span>created: </span>
                    <span className="text-gray-400">{formatDate(bounty.account.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </BountyErrorBoundary>
        ))}
      </div>
    </div>
  );
};

export default AllBountiesDisplay;