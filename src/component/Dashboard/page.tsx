import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PublicKey } from '@solana/web3.js';
import { useProgram } from '../../context/ProgramContext';
import { Idl, Program } from '@project-serum/anchor';

interface UserProfile {
  authority: PublicKey;
  displayName: string;
  description: string;
  bump: number;
}

interface BountyAccount {
  authority: PublicKey;
  bountyId: string;
  title: string;
  description: string;
  githubRepo: string;
  imageUri: string;
  likes: number;
  createdAt: number;
  bump: number;
}

interface Bounty {
  publicKey: PublicKey;
  account: BountyAccount;
}

interface Solution {
  publicKey: string;
  account: {
    bounty: string;
    authority: string;
    pullRequestUrl: string;
    submittedAt: number;
    status: { pending?: {}; verified?: {}; disqualified?: {} };
  };
}

interface SolutionAccount {
  bounty: PublicKey;
  authority: PublicKey;
  pullRequestUrl: string;
  submittedAt: number;
  status: { pending?: {}; verified?: {}; disqualified?: {} };
}

const Dashboard = () => {
  const { program, wallet } = useProgram();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [mySolutions, setMySolutions] = useState<Solution[]>([]);
  const [othersSolutions, setOthersSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!program || !wallet.connected || !wallet.publicKey) {
        setError('Please connect your wallet');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [profilePDA] = PublicKey.findProgramAddressSync(
          [Buffer.from('profile'), wallet.publicKey.toBuffer()],
          program.programId
        );
        try {
          const profileData = await (program as Program<Idl>).account.userProfile.fetch(profilePDA);
          setProfile({
            authority: profileData.authority,
            displayName: profileData.displayName,
            description: profileData.description,
            bump: profileData.bump,
          });
        } catch (err) {
          console.log('No profile found, user may need to create one');
        }

        const allBounties = await (program as Program<Idl>).account.bounty.all();
        const userBounties = allBounties
          .filter(b => b.account.authority.toBase58() === wallet.publicKey?.toBase58())
          .map(b => ({
            publicKey: b.publicKey,
            account: {
              authority: b.account.authority,
              bountyId: b.account.bountyId,
              title: b.account.title,
              description: b.account.description,
              githubRepo: b.account.githubRepo,
              imageUri: b.account.imageUri,
              likes: Number(b.account.likes),
              createdAt: Number(b.account.createdAt),
              bump: b.account.bump,
            }
          }));
        setBounties(userBounties);

        const allSolutions = await (program as Program<Idl>).account.solution.all();
        
        // Solutions submitted by others to my bounties
        const othersSolutionsData = allSolutions
          .filter(s => userBounties.some(b => s.account.bounty.toBase58() === b.publicKey.toBase58()))
          .map(s => ({
            publicKey: s.publicKey.toBase58(),
            account: {
              bounty: s.account.bounty.toBase58(),
              authority: s.account.authority.toBase58(),
              pullRequestUrl: s.account.pullRequestUrl,
              submittedAt: Number(s.account.submittedAt),
              status: s.account.status,
            },
          }));
        setOthersSolutions(othersSolutionsData);

        // My solutions to any bounties
        const mySolutionsData = allSolutions
          .filter(s => s.account.authority.toBase58() === wallet.publicKey?.toBase58())
          .map(s => ({
            publicKey: s.publicKey.toBase58(),
            account: {
              bounty: s.account.bounty.toBase58(),
              authority: s.account.authority.toBase58(),
              pullRequestUrl: s.account.pullRequestUrl,
              submittedAt: Number(s.account.submittedAt),
              status: s.account.status,
            },
          }));
        setMySolutions(mySolutionsData);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(`Failed to fetch dashboard data: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [program, wallet.connected, wallet.publicKey]);

  const verifySolution = async (solutionPubkey: string) => {
    if (!program || !wallet.publicKey) return;
    try {
      const solution = new PublicKey(solutionPubkey);
      const solutionData = await program.account.solution.fetch(solution) as SolutionAccount;
      const bounty = new PublicKey(solutionData.bounty);

      await program.methods
        .verifySolution()
        .accounts({
          solution,
          bounty,
          authority: wallet.publicKey,
        })
        .rpc();

      setOthersSolutions(prev => prev.map(s => 
        s.publicKey === solutionPubkey 
          ? { ...s, account: { ...s.account, status: { verified: {} } } }
          : s
      ));
    } catch (err) {
      console.error('Error verifying solution:', err);
      alert('Failed to verify solution');
    }
  };

  const disqualifySolution = async (solutionPubkey: string) => {
    if (!program || !wallet.publicKey) return;
    try {
      const solution = new PublicKey(solutionPubkey);
      const solutionData = await program.account.solution.fetch(solution) as SolutionAccount;
      const bounty = new PublicKey(solutionData.bounty);

      await program.methods
        .disqualifySolution()
        .accounts({
          solution,
          bounty,
          authority: wallet.publicKey,
        })
        .rpc();

      setOthersSolutions(prev => prev.map(s => 
        s.publicKey === solutionPubkey 
          ? { ...s, account: { ...s.account, status: { disqualified: {} } } }
          : s
      ));
    } catch (err) {
      console.error('Error disqualifying solution:', err);
      alert('Failed to disqualify solution');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const truncateAddress = (address: string | PublicKey) => {
    const addressStr = typeof address === 'string' ? address : address.toBase58();
    return `${addressStr.slice(0, 4)}...${addressStr.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 font-mono text-sm">
        <div className="max-w-6xl mx-auto bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="text-green-400 animate-pulse">[LOADING] Fetching dashboard data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 font-mono text-sm">
        <div className="max-w-6xl mx-auto bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="text-red-400">[ERROR] {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 font-mono text-sm">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gray-800 border border-gray-700 rounded-t-lg p-2 flex items-center gap-2">
          <div className="flex gap-1">
            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
            <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
          </div>
          <span className="text-gray-400 text-xs">dev@dashboard:~/bug-fun</span>
        </div>

        <div className="bg-gray-800 border border-t-0 border-gray-700 rounded-b-lg p-6 space-y-6">
          <div>
            <div className="text-green-400 mb-2"> user.profile</div>
            {profile ? (
              <pre className="bg-gray-900 p-4 rounded border border-gray-700 text-gray-300">
                {JSON.stringify({
                  displayName: profile.displayName,
                  description: profile.description,
                  authority: truncateAddress(profile.authority),
                  bump: profile.bump
                }, null, 2)}
              </pre>
            ) : (
              <div className="text-yellow-400"> No profile found [CREATE_PROFILE_REQUIRED]</div>
            )}
          </div>

          <div>
            <div className="text-green-400 mb-2"> bounties.list --user={truncateAddress(wallet.publicKey || '')} ({bounties.length})</div>
            {bounties.length > 0 ? (
              <div className="space-y-4">
                {bounties.map((bounty) => (
                  <div key={bounty.account.bountyId} className="bg-gray-900 p-4 rounded border border-gray-700">
                    <div className="flex justify-between items-start">
                      <div className="text-green-400">[{bounty.account.bountyId}] {bounty.account.title}</div>
                      <button
                        className="text-blue-400 hover:text-blue-300 text-xs"
                        onClick={() => navigate(`/bounty/${bounty.publicKey.toBase58()}`)}
                      >
                        [view]
                      </button>
                    </div>
                    <div className="text-gray-400 text-xs mt-1">
                      <span className="text-gray-500">desc:</span> {bounty.account.description.slice(0, 100)}{bounty.account.description.length > 100 ? '...' : ''}
                    </div>
                    <div className="text-gray-500 text-xs mt-1">
                      <span>likes: {bounty.account.likes}</span> | 
                      <span> created: {formatDate(bounty.account.createdAt)}</span> | 
                      <span> addr: {truncateAddress(bounty.publicKey)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400"> No active bounties</div>
            )}
          </div>

          <div>
            <div className="text-green-400 mb-2"> solutions.list --bounties=mine ({othersSolutions.length})</div>
            {othersSolutions.length > 0 ? (
              <div className="space-y-4">
                {othersSolutions.map((solution) => (
                  <div key={solution.publicKey} className="bg-gray-900 p-4 rounded border border-gray-700">
                    <div className="text-gray-400 text-xs">
                      <span className="text-gray-500">bounty:</span> {truncateAddress(solution.account.bounty)}
                    </div>
                    <div className="text-gray-400 text-xs mt-1">
                      <span className="text-gray-500">submitter:</span> {truncateAddress(solution.account.authority)}
                    </div>
                    <div className="mt-1">
                      <a 
                        href={solution.account.pullRequestUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-xs break-all"
                      >
                        {solution.account.pullRequestUrl}
                      </a>
                    </div>
                    <div className="text-gray-500 text-xs mt-1 flex items-center gap-2">
                      <span>submitted: {formatDate(solution.account.submittedAt)}</span> | 
                      <span>status: <span className={
                        Object.keys(solution.account.status)[0] === 'pending' ? 'text-yellow-400' :
                        Object.keys(solution.account.status)[0] === 'verified' ? 'text-green-400' :
                        'text-red-400'
                      }>{Object.keys(solution.account.status)[0]}</span></span>
                      {Object.keys(solution.account.status)[0] === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            className="text-green-400 hover:text-green-300 text-xs"
                            onClick={() => verifySolution(solution.publicKey)}
                          >
                            [verify]
                          </button>
                          <button
                            className="text-red-400 hover:text-red-300 text-xs"
                            onClick={() => disqualifySolution(solution.publicKey)}
                          >
                            [disqualify]
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400"> No submissions received</div>
            )}
          </div>

          <div>
            <div className="text-green-400 mb-2"> solutions.list --submitter={truncateAddress(wallet.publicKey || '')} ({mySolutions.length})</div>
            {mySolutions.length > 0 ? (
              <div className="space-y-4">
                {mySolutions.map((solution) => (
                  <div key={solution.publicKey} className="bg-gray-900 p-4 rounded border border-gray-700">
                    <div className="text-gray-400 text-xs">
                      <span className="text-gray-500">bounty:</span> {truncateAddress(solution.account.bounty)}
                    </div>
                    <div className="mt-1">
                      <a 
                        href={solution.account.pullRequestUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-xs break-all"
                      >
                        {solution.account.pullRequestUrl}
                      </a>
                    </div>
                    <div className="text-gray-500 text-xs mt-1">
                      <span>submitted: {formatDate(solution.account.submittedAt)}</span> | 
                      <span>status: <span className={
                        Object.keys(solution.account.status)[0] === 'pending' ? 'text-yellow-400' :
                        Object.keys(solution.account.status)[0] === 'verified' ? 'text-green-400' :
                        'text-red-400'
                      }>{Object.keys(solution.account.status)[0]}</span></span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400"> No solutions submitted</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;