import React, { useEffect, useState } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useProgram } from '../../context/ProgramContext';
import { Idl, Program } from '@project-serum/anchor';
import { Link } from 'react-router-dom';

interface RecentActivity {
  creator: string;
  action: string;
  project: string;
}
const Navbar: React.FC = () => {
  const { program,  } = useProgram();
  const [totalBounties, setTotalBounties] = useState<number>(0);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for mobile dropdown

  useEffect(() => {
    if (!program) {
      console.log("Program not available yet, skipping fetch");
      setLoading(false);
      setTotalBounties(0);
      setRecentActivity([]);
      return;
    }
  
    const fetchBounties = async () => {
      try {
        setLoading(true);
        const fetchedBounties = await (program as Program<Idl>).account.bounty.all();
        setTotalBounties(fetchedBounties.length);
        const recentBounties = fetchedBounties
          .sort((a, b) => (b.account.createdAt?.toNumber() || 0) - (a.account.createdAt?.toNumber() || 0))
          .slice(0, 3);
        const activity = recentBounties.map(bounty => ({
          creator: bounty.account.authority?.toString() || 'Unknown',
          action: 'created',
          project: bounty.account.title?.toString() || 'Untitled Bounty'
        }));
        setRecentActivity(activity);
      } catch (err) {
        console.error('Error fetching bounties:', err);
      } finally {
        setLoading(false);
      }
    };
  
    console.log("Program available, fetching bounties");
    fetchBounties();
  }, [program]);

  const truncateAddress = (address: string) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 3)}...${address.slice(-3)}`;
  };

  const displayActivity = loading || recentActivity.length === 0 ? [
    {
      creator: '212...yw',
      action: 'forked',
      project: 'emojicher-class'
    },
    {
      creator: '8ta...apm',
      action: 'created',
      project: 'pingzilla'
    },
    {
      creator: '1tx...ush',
      action: 'committed to',
      project: 'mechslots'
    }
  ] : recentActivity;

  const displayCount = loading ? '...' : totalBounties.toLocaleString();

  return (
    <div className="sticky top-0 z-50 bg-gray-900 border-b border-gray-800 shadow-lg font-mono">
      {/* First Row - Activity Bar */}
      <div className="px-6 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex justify-between items-center">
          {/* Left side - App count */}
          <div className="text-sm text-green-400">
            <span className="text-gray-400">$</span> active_bounties: <span className="text-white">{displayCount}</span>
          </div>

          {/* Right side - Recent activity */}
          <div className="hidden md:flex space-x-6 text-xs overflow-x-auto">
            {displayActivity.map((item, index) => (
              <div key={index} className="flex items-center whitespace-nowrap">
                <span className="text-purple-400">{truncateAddress(item.creator)}</span>
                <span className="mx-1 text-gray-400">{item.action}</span>
                <span className="text-cyan-400">{item.project}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Row - Logo and Wallet */}
      <div className="px-6 py-3 bg-gray-900">
        <div className="flex justify-between items-center">
          {/* Left side - Logo and Hamburger */}
          <div className="flex items-center space-x-4">
            <Link to="/bug-bounty" className="text-xl font-bold text-green-400 hover:text-green-300 transition-colors">
              bug.fun
            </Link>
            {/* Hamburger Menu Button (visible on mobile) */}
            <button
              className="md:hidden text-gray-400 hover:text-green-400 focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                />
              </svg>
            </button>
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-4 text-sm">
              <Link to="/dashboard" className="text-gray-400 hover:text-green-400 transition-colors">/dashboard</Link>
              <Link to="/create-bounty" className="text-gray-400 hover:text-green-400 transition-colors">/Create-bounty</Link>
              <Link to="/create-profile" className="text-gray-400 hover:text-green-400 transition-colors">/Create-profile</Link>
            </div>
          </div>

          {/* Right side - Wallet and socials */}
          <div className="flex items-center space-x-4">
            <WalletMultiButton className="bg-gray-800 hover:bg-gray-700 text-green-400 text-xs py-1 px-3 border border-green-400 rounded-lg transition-all hover:shadow-glow hover:border-green-300" />
            <div className="hidden sm:flex space-x-3">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-400 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-gray-800 border-t border-gray-700 py-2">
            <div className="flex flex-col space-y-2 px-6">
              <Link
                to="/dashboard"
                className="text-gray-400 hover:text-green-400 transition-colors text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                /dashboard
              </Link>
              <Link
                to="/create-bounty"
                className="text-gray-400 hover:text-green-400 transition-colors text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                /Create-bounty
              </Link>
              <Link
                to="/create-profile"
                className="text-gray-400 hover:text-green-400 transition-colors text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                /Create-profile
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;