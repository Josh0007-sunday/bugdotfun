import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BugBountyLanding = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleParticipate = () => {
    navigate('/bug-bounty');
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6 font-mono text-sm">
      <div className="max-w-4xl mx-auto">
        {/* Terminal Header */}
        <div className="bg-gray-800 border border-gray-700 rounded-t-lg p-2 flex items-center gap-2">
          <div className="flex gap-1">
            <span className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></span>
            <span className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></span>
            <span className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></span>
          </div>
          <span className="text-gray-400 text-xs">dev@solana:~/bug-bounty</span>
        </div>

        {/* Main Content */}
        <div className="bg-gray-800 border border-t-0 border-gray-700 rounded-b-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Header Section */}
          <div>
            <h1 className="text-green-400 text-lg sm:text-xl">[SOLANA BUG BOUNTY]</h1>
            <p className="text-gray-300 mt-2 text-xs sm:text-sm">
              Hack the Solana network. Find bugs. Fix bugs. Be a terminal hero.
            </p>
          </div>

          {/* Program Details */}
          <div className="space-y-2 sm:space-y-4">
            <div className="text-gray-500 text-xs sm:text-sm">
              <span className="text-green-400"> </span>
              STATUS: <span className="text-yellow-400">[ACTIVE]</span>
            </div>
            <div className="text-gray-500 text-xs sm:text-sm">
              <span className="text-green-400"> </span>
              PROPOSED REWARDS: Up to{' '}
              <span className="text-green-400">earn USDC</span> for hacking critical vulnerabilities
            </div>
            <div className="text-gray-500 text-xs sm:text-sm">
              <span className="text-green-400"> </span>
              TARGET: Solana developers and hackers
            </div>
            <div className="text-gray-500 text-xs sm:text-sm">
              <span className="text-green-400"> </span>
              DURATION: becoming the top bug bounty on Solana
            </div>
            <div className="text-gray-500 text-xs sm:text-sm">
              <span className="text-green-400"> </span>
              HOSTED BY: bug.fun
            </div>
          </div>

          {/* Mission Brief */}
          <div>
            <h2 className="text-green-400 mb-2 text-sm sm:text-base">[MISSION BRIEF]</h2>
            <p className="text-gray-300 text-xs sm:text-sm">
              Join the Solana Bug Bounty Program and hunt for vulnerabilities from big projects across the ecosystem.
              Your mission: secure the network, boost performance, and be eligible for tips from creators.
              Use your dev skills to uncover critical bugs in this high-performance. The clock’s ticking—get in the terminal and start hacking.
            </p>
          </div>

          {/* Rewards Table */}
          <div>
            <h2 className="text-green-400 mb-2 text-sm sm:text-base">[PROPOSED REWARD TIERS]</h2>
            <div className="bg-gray-900 p-3 sm:p-4 rounded border border-gray-700 text-gray-300 text-xs sm:text-sm">
              <pre className="whitespace-pre-wrap">
                {'critical_vuln    => EARN USDC FROM CREATORS\n' +
                  'high_vuln       => EARN USDC FROM CREATORS\n' +
                  'medium_vuln     => EARN USDC FROM CREATORS\n' +
                  'low_vuln        => EARN USDC FROM CREATORS'}
              </pre>
            </div>
          </div>

          {/* Call to Action */}
          <div>
            <button
              className={`w-full py-2 px-4 rounded text-xs sm:text-sm transition-colors ${
                isHovered ? 'bg-green-500 text-black' : 'bg-green-600 text-black'
              }`}
              onClick={handleParticipate}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              [EXECUTE] Participate Now
            </button>
          </div>

          {/* Footer Links */}
          <div className="text-gray-400 text-xs sm:text-sm flex flex-col sm:flex-row gap-2 sm:gap-4">
            <a
              href="https://github.com/solana-labs"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-green-400"
            >
              [GITHUB]
            </a>
            <a
              href="https://solana.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-green-400"
            >
              [SOLANA]
            </a>
            <a
              href="https://bug.fun"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-green-400"
            >
              [BUG.FUN]
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BugBountyLanding;