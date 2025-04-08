import { useState } from 'react';
import { useProgram } from '../../context/ProgramContext';
import { PublicKey } from '@solana/web3.js';

export const ProfileForm = () => {
  const { program, wallet } = useProgram();
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [profileDescription, setProfileDescription] = useState('');

  const createProfile = async () => {
    if (!wallet.publicKey || !program) return;
    setLoading(true);
    try {
      const [profilePDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('profile'), wallet.publicKey.toBuffer()],
        program.programId
      );

      await program.methods
        .createProfile(displayName, profileDescription)
        .accounts({
          profile: profilePDA,
          authority: wallet.publicKey,
        })
        .rpc();
      alert('Profile created successfully!');
      setDisplayName('');
      setProfileDescription('');
    } catch (error) {
      console.error(error);
      alert('Error creating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 font-mono text-sm">
      <div className="max-w-md mx-auto">
        <div className="bg-gray-800 border border-gray-700 rounded-t-lg p-2 flex items-center gap-2">
          <div className="flex gap-1">
            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
            <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
          </div>
          <span className="text-gray-400 text-xs">dev@profile:~/create</span>
        </div>

        <div className="bg-gray-800 border border-t-0 border-gray-700 rounded-b-lg p-6">
          <div className="text-green-400 mb-4"> profile.create</div>
          
          <div className="space-y-4">
            <div>
              <label className="text-gray-500 text-xs">display_name:</label>
              <input
                className="w-full mt-1 bg-gray-900 border border-gray-700 rounded p-2 text-gray-300 focus:outline-none focus:border-green-400"
                placeholder="Enter display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-gray-500 text-xs">description:</label>
              <textarea
                className="w-full mt-1 bg-gray-900 border border-gray-700 rounded p-2 text-gray-300 focus:outline-none focus:border-green-400"
                placeholder="Enter profile description"
                value={profileDescription}
                onChange={(e) => setProfileDescription(e.target.value)}
                rows={3}
              />
            </div>

            <button
              className={`w-full py-2 px-4 rounded text-xs ${
                loading 
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-500 text-black'
              }`}
              onClick={createProfile}
              disabled={loading}
            >
              {loading ? '[PROCESSING] Creating profile...' : '[EXECUTE] Create Profile'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;