import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PublicKey } from '@solana/web3.js';
import { useProgram } from '../../context/ProgramContext';
import { Idl, Program } from '@project-serum/anchor';

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

const ViewBounty = () => {
    const { bountyId } = useParams<{ bountyId: string }>();
    const navigate = useNavigate();
    const { program, wallet } = useProgram();
    const [bounty, setBounty] = useState<BountyAccount | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isLiked, setIsLiked] = useState(false);
    const [loadingLike, setLoadingLike] = useState(false);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [prUrl, setPrUrl] = useState('');
    const [loadingSubmit, setLoadingSubmit] = useState(false);

    useEffect(() => {
        const fetchBounty = async () => {
            if (!program || !wallet.connected || !bountyId) {
                setError(!program ? 'Program not initialized' : !wallet.connected ? 'Wallet not connected' : 'No bounty ID provided');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const fetchedBounty = await (program as Program<Idl>).account.bounty.fetch(new PublicKey(bountyId));

                setBounty({
                    authority: fetchedBounty.authority || undefined,
                    bountyId: fetchedBounty.bountyId?.toString() || 'N/A',
                    title: fetchedBounty.title?.toString() || 'Untitled',
                    description: fetchedBounty.description?.toString() || '',
                    githubRepo: fetchedBounty.githubRepo?.toString() || '',
                    imageUri: fetchedBounty.imageUri?.toString() || '',
                    likes: Number(fetchedBounty.likes) || 0,
                    createdAt: fetchedBounty.createdAt?.toNumber() || 0,
                    bump: Number(fetchedBounty.bump) || 0,
                });
            } catch (err) {
                console.error('Error fetching bounty:', err);
                setError(`Failed to fetch bounty: ${err instanceof Error ? err.message : String(err)}`);
            } finally {
                setLoading(false);
            }
        };

        fetchBounty();
    }, [program, wallet.connected, bountyId]);

    const likeBounty = async () => {
        if (!wallet.publicKey || !program || !bountyId) return;
        setLoadingLike(true);
        try {
            const bountyPubkey = new PublicKey(bountyId);
            await program.methods
                .likeBounty()
                .accounts({
                    bounty: bountyPubkey,
                    authority: wallet.publicKey,
                })
                .rpc();
            setIsLiked(true);
            setBounty(prev => prev ? { ...prev, likes: (prev.likes || 0) + 1 } : prev);
        } catch (error) {
            console.error('Error liking bounty:', error);
            alert('Error liking bounty');
        } finally {
            setLoadingLike(false);
        }
    };

    const submitSolution = async () => {
        if (!wallet.publicKey || !program || !bountyId) return;
        setLoadingSubmit(true);
        try {
            const bountyPubkey = new PublicKey(bountyId);
            const [solutionPDA] = PublicKey.findProgramAddressSync(
                [
                    Buffer.from('solution'),
                    bountyPubkey.toBuffer(),
                    wallet.publicKey.toBuffer(),
                ],
                program.programId
            );

            await program.methods
                .submitSolution(prUrl)
                .accounts({
                    solution: solutionPDA,
                    bounty: bountyPubkey,
                    authority: wallet.publicKey,
                })
                .rpc();
            alert('Solution submitted!');
            setPrUrl('');
            setIsSubmitModalOpen(false);
        } catch (error) {
            console.error(error);
            alert('Error submitting solution');
        } finally {
            setLoadingSubmit(false);
        }
    };

    const formatDate = (timestamp?: number) => {
        if (!timestamp || isNaN(timestamp)) return 'N/A';
        return new Date(timestamp * 1000).toLocaleString();
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

    if (loading) {
        return <div className="min-h-screen bg-gray-900 p-4 md:p-6">Loading...</div>;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 p-4 md:p-6">
                <div className="max-w-6xl mx-auto p-4 md:p-6 bg-gray-900 border border-gray-800 rounded-lg font-mono text-sm">
                    <div className="text-red-400 mb-4">
                        <p>Error: {error}</p>
                    </div>
                    <button
                        className="bg-gray-800 hover:bg-gray-700 text-green-400 font-mono text-sm py-1 px-3 border border-green-400 rounded transition-all"
                        onClick={() => navigate('/')}
                    >
                        $ back to bounties
                    </button>
                </div>
            </div>
        );
    }

    if (!bounty) {
        return (
            <div className="min-h-screen bg-gray-900 p-4 md:p-6">
                <div className="max-w-6xl mx-auto p-4 md:p-6 bg-gray-900 border border-gray-800 rounded-lg font-mono text-sm">
                    <div className="text-green-400 mb-2">
                        <p>$ bounty view {bountyId}</p>
                    </div>
                    <div className="text-gray-400">
                        <p>Bounty not found.</p>
                        <button
                            className="mt-4 bg-gray-800 hover:bg-gray-700 text-green-400 font-mono text-sm py-1 px-3 border border-green-400 rounded transition-all"
                            onClick={() => navigate('/')}
                        >
                            $ back to bounties
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                <div className="p-4 md:p-6 bg-gray-900 border border-gray-800 rounded-lg font-mono text-sm mb-6">
                    <div className="text-green-400 mb-4">
                        <p>$ bounty view {bounty.bountyId}</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-1">
                            <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                                <div className="h-48 bg-gray-900 relative overflow-hidden">
                                    <img
                                        src={bounty.imageUri || FALLBACK_IMAGE}
                                        alt={bounty.title || "Bounty"}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                                        }}
                                    />
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h2 className="text-green-400 text-base font-bold truncate">{bounty.title}</h2>
                                        <span className="bg-gray-900 text-gray-400 text-xs px-2 py-1 rounded border border-gray-700 whitespace-nowrap">
                                            ID: {bounty.bountyId}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4 mb-3">
                                        <button
                                            onClick={likeBounty}
                                            disabled={loadingLike || !wallet.connected}
                                            className="flex items-center gap-1 text-gray-400 hover:text-red-400"
                                        >
                                            <span className={`text-xl ${isLiked ? 'text-red-400' : ''}`}>
                                                {loadingLike ? '⏳' : '❤️'}
                                            </span>
                                            <span className="text-sm">{bounty.likes} likes</span>
                                        </button>
                                    </div>

                                    <div className="text-gray-500 text-xs">
                                        <p>Created: {formatDate(bounty.createdAt)}</p>
                                        <p>Owner: {truncateAddress(bounty.authority)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2 space-y-4">
                            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                                <h3 className="text-green-400 text-sm font-bold mb-2">DESCRIPTION</h3>
                                <p className="text-gray-400 text-sm whitespace-pre-line">
                                    {bounty.description || "No description provided"}
                                </p>
                            </div>

                            {bounty.githubRepo && (
                                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                                    <h3 className="text-green-400 text-sm font-bold mb-2">GITHUB REPOSITORY</h3>
                                    <a
                                        href={bounty.githubRepo}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-green-400 hover:text-green-300 text-sm border-b border-green-400 hover:border-green-300 break-all"
                                    >
                                        {bounty.githubRepo}
                                    </a>
                                </div>
                            )}

                            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                                <h3 className="text-green-400 text-sm font-bold mb-2">BOUNTY DETAILS</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Bounty ID:</p>
                                        <p className="text-gray-400 break-all">{bounty.bountyId}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Created:</p>
                                        <p className="text-gray-400">{formatDate(bounty.createdAt)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Owner:</p>
                                        <p className="text-gray-400">{truncateAddress(bounty.authority)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Program Bump:</p>
                                        <p className="text-gray-400">{bounty.bump}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col sm:flex-row justify-between gap-2">
                        <button
                            className="bg-gray-800 hover:bg-gray-700 text-green-400 font-mono text-sm py-1 px-3 border border-green-400 rounded transition-all"
                            onClick={() => navigate('/')}
                        >
                            $ back to bounties
                        </button>

                        {wallet.connected && (
                            <button
                                className="bg-green-900 hover:bg-green-800 text-green-400 font-mono text-sm py-1 px-3 border border-green-400 rounded transition-all"
                                onClick={() => setIsSubmitModalOpen(true)}
                            >
                                $ Submit solution
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Submit Solution Modal */}
            {isSubmitModalOpen && (
                <div className="fixed inset-0  bg-opacity-100 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md border border-gray-700">
                        <h3 className="text-green-400 text-lg font-mono mb-4">$ Submit Solution</h3>
                        <input
                            className="w-full p-2 mb-4 bg-gray-900 border border-gray-600 rounded text-gray-400 font-mono"
                            placeholder="Pull Request URL"
                            value={prUrl}
                            onChange={(e) => setPrUrl(e.target.value)}
                        />
                        <div className="flex gap-2">
                            <button
                                className="flex-1 bg-green-900 hover:bg-green-800 text-green-400 font-mono py-2 px-4 border border-green-400 rounded"
                                onClick={submitSolution}
                                disabled={loadingSubmit || !prUrl}
                            >
                                {loadingSubmit ? '$ Submitting...' : '$ Submit'}
                            </button>
                            <button
                                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-400 font-mono py-2 px-4 border border-gray-600 rounded"
                                onClick={() => setIsSubmitModalOpen(false)}
                            >
                                $ Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewBounty;