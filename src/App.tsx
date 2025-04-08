import './wallet-button-override.css';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletProviderWrapper } from './component/WalletProvider';
import { ProgramProvider } from './context/ProgramContext';
import { Routes, Route, BrowserRouter, useLocation } from 'react-router-dom';
import Navbar from './component/Navbar/Navbar';
import Home from './pages/Home';
import { BountyForm } from './component/BountyForm';
import ViewBounty from './component/ViewBounty/page';
import Dashboard from './component/Dashboard/page';
import ProfileForm from './component/Profile/page';
import BugBountyLanding from './bugbounty-landingpage/page';

function AppContentWithProgram() {
  const wallet = useWallet();
  const location = useLocation(); // Get current route location

  return (
    <ProgramProvider wallet={wallet}>
      {location.pathname !== '/' && <Navbar />} {/* Render Navbar only if not on '/' */}
      <Routes>
        <Route path="/" element={<BugBountyLanding />} />
        <Route path="/bug-bounty" element={<Home />} />
        <Route path="/create-bounty" element={<BountyForm />} />
        <Route path="/bounty/:bountyId" element={<ViewBounty />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-profile" element={<ProfileForm />} />
      </Routes>
    </ProgramProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <WalletProviderWrapper>
        <AppContentWithProgram />
      </WalletProviderWrapper>
    </BrowserRouter>
  );
}

export default App;