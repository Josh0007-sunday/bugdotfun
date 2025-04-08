const CTA = () => {
  return (
    <div className="mb-12 text-center px-4 py-12 bg-gray-900 border border-gray-800 rounded-lg shadow-lg">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-green-400 font-mono mb-2">bug.fun</h1>
        <p className="text-gray-400 font-mono">/solana/bug/bounty/platform</p>
      </header>

      <div className="flex justify-center mb-6">
        <div className="flex flex-col items-center">
          <p className="text-green-400 mb-4 font-mono text-sm"> DEPLOYING BOUNTY CONTRACT </p>
          
          <div className="flex flex-wrap justify-center gap-3 max-w-md">
            {['init_solana_dev', 'scan_bugs', 'deploy_bounty'].map((item) => (
              <button
                key={item}
                className="bg-gray-800 hover:bg-gray-700 text-green-400 font-mono text-sm py-2 px-4 border border-green-400 rounded-lg transition-all hover:shadow-glow hover:border-green-300"
              >
                {item}
              </button>
            ))}
          </div>
          
          <div className="mt-6 text-gray-500 text-xs font-mono flex items-center">
            <span className="inline-block mr-2">$</span>
            <span className="blink">npm run start-bounty</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CTA;