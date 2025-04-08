import { useState } from 'react';
import { useProgram } from '../context/ProgramContext';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { v4 as uuidv4 } from 'uuid';

export const BountyForm = () => {
  const { program, wallet } = useProgram();
  const [loading, setLoading] = useState(false);
  const [bountyTitle, setBountyTitle] = useState('');
  const [bountyDescription, setBountyDescription] = useState('');
  const [githubRepo, setGithubRepo] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `> ${message}`]);
  };

  const createBounty = async () => {
    if (!wallet.publicKey || !wallet.connected || !program) {
      addLog('Error: Wallet not connected');
      alert('Please connect your wallet first!');
      return;
    }

    setLoading(true);
    addLog('Initializing bounty creation...');
    addLog(`Title: ${bountyTitle}`);
    addLog(`Description: ${bountyDescription.substring(0, 20)}...`);
    
    try {
      const bountyId = uuidv4().substring(0, 8);
      addLog(`Generated bounty ID: ${bountyId}`);
      const [bountyPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('bounty'), wallet.publicKey.toBuffer(), Buffer.from(bountyId)],
        program.programId
      );
      addLog(`Derived bounty PDA: ${bountyPDA.toString().substring(0, 16)}...`);
      addLog('Building transaction...');

      const tx = await program.methods
        .createBounty(bountyId, bountyTitle, bountyDescription, githubRepo, imageUri)
        .accounts({
          bounty: bountyPDA,
          authority: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      addLog(`Transaction signature: ${tx.substring(0, 16)}...`);
      addLog('Bounty created successfully!');
      setBountyTitle('');
      setBountyDescription('');
      setGithubRepo('');
      setImageUri('');
    } catch (error: unknown) {
      if (error instanceof Error) {
        addLog(`Error: ${error.message}`);
        if ('logs' in error) {
          addLog('Transaction logs: (see console)');
          console.log("Transaction logs:", (error as any).logs);
        }
      } else {
        addLog('Error: Unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-gray-800 border border-gray-700 rounded-lg shadow-lg font-mono overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gray-850 border-b border-gray-700">
          <h2 className="text-green-400 text-lg font-bold">$ create_bounty</h2>
          <p className="text-gray-500 text-sm">Submit a new bounty to the network</p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-gray-400 text-xs mb-1.5 uppercase tracking-wide">Title</label>
            <input
              className="w-full p-2.5 bg-gray-900 border border-gray-600 text-green-400 rounded-md focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none transition-all placeholder-gray-600"
              placeholder="Enter bounty title"
              value={bountyTitle}
              onChange={(e) => setBountyTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-gray-400 text-xs mb-1.5 uppercase tracking-wide">Description</label>
            <textarea
              className="w-full p-2.5 bg-gray-900 border border-gray-600 text-green-400 rounded-md focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none transition-all placeholder-gray-600"
              placeholder="Describe the bounty"
              value={bountyDescription}
              onChange={(e) => setBountyDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div>
            <label className="block text-gray-400 text-xs mb-1.5 uppercase tracking-wide">GitHub Repository</label>
            <input
              className="w-full p-2.5 bg-gray-900 border border-gray-600 text-green-400 rounded-md focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none transition-all placeholder-gray-600"
              placeholder="https://github.com/owner/repo"
              value={githubRepo}
              onChange={(e) => setGithubRepo(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-gray-400 text-xs mb-1.5 uppercase tracking-wide">Image URI</label>
            <input
              className="w-full p-2.5 bg-gray-900 border border-gray-600 text-green-400 rounded-md focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none transition-all placeholder-gray-600"
              placeholder="https://example.com/image.png"
              value={imageUri}
              onChange={(e) => setImageUri(e.target.value)}
            />
          </div>

          <button
            className={`w-full py-2.5 px-4 border rounded-md text-sm font-medium transition-all duration-200
              ${loading
                ? 'border-gray-600 text-gray-500 bg-gray-700 cursor-not-allowed'
                : 'border-green-500 text-green-400 bg-gray-900 hover:bg-gray-850 hover:border-green-400 hover:text-green-300 active:bg-gray-800'
              }`}
            onClick={createBounty}
            disabled={loading}
          >
            {loading ? 'Processing...' : '$ submit_bounty'}
          </button>
        </div>

        {/* Logs Section */}
        {logs.length > 0 && (
          <div className="p-4 bg-gray-850 border-t border-gray-700 text-xs">
            <div className="text-gray-400 mb-2 uppercase tracking-wide">Console Output</div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className={`${
                    log.includes('Error') ? 'text-red-400' : 'text-gray-300'
                  } truncate`}
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};