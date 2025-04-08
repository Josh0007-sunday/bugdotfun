import { useWallet } from '@solana/wallet-adapter-react';
import { ProgramProvider } from '../context/ProgramContext';
import { Home } from '../pages/Home';

function AppContent() {
  const wallet = useWallet(); // Now this hook is called within the WalletProvider context
  
  return (
    <ProgramProvider wallet={wallet}>
      <Home />
    </ProgramProvider>
  );
}

export default AppContent;