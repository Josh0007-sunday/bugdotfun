import { createContext, useContext, useState, useEffect } from 'react';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { getProgram } from '../utils/anchor';

type ProgramContextType = {
  program: ReturnType<typeof getProgram> | null;
  wallet: WalletContextState;
};

const ProgramContext = createContext<ProgramContextType>(
  {} as ProgramContextType // We'll fix this type assertion with a default value if needed
);

export const ProgramProvider = ({
  children,
  wallet,
}: {
  children: React.ReactNode;
  wallet: WalletContextState;
}) => {
  const [program, setProgram] = useState<ReturnType<typeof getProgram> | null>(null);

  useEffect(() => {
    console.log('ProgramProvider useEffect - wallet.connected:', wallet.connected);
    if (wallet.connected && wallet.publicKey) {
      const initializedProgram = getProgram(wallet);
      console.log('ProgramProvider - setting program:', initializedProgram);
      setProgram(initializedProgram);
    } else {
      console.log('ProgramProvider - wallet not connected, clearing program');
      setProgram(null);
    }
  }, [wallet.connected, wallet.publicKey]); // Re-run when wallet state changes

  return (
    <ProgramContext.Provider value={{ program, wallet }}>
      {children}
    </ProgramContext.Provider>
  );
};

export const useProgram = () => useContext(ProgramContext);