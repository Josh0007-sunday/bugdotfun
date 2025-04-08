// import { useProgram } from '../context/ProgramContext';
// import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
// import { ProfileForm } from '../component/ProfileForm';
// import { BountyForm } from '../component/BountyForm';
// import { BountyInteractions } from '../component/BountyInteraction';
// import { SolutionForm } from '../component/SolutionForm';
// import AllBountiesDisplay from '../component/fetchallbounties';

// export const Home = () => {
//   const { wallet } = useProgram();

//   return (
//     <div className="p-4 max-w-4xl mx-auto">
//       <div className="flex flex-col space-y-4">
//         <h1 className="text-2xl font-bold">BugFun Program</h1>
//         <div className="flex justify-center">
//           <WalletMultiButton className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" />
//         </div>
        
//         {!wallet.connected ? (
//           <p className="text-center">Please connect your wallet to interact with the program</p>
//         ) : (
//           <>
//             <ProfileForm />
//             <BountyForm />
//             <BountyInteractions />
//             <SolutionForm />
//             <AllBountiesDisplay/>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

import { useProgram } from '../context/ProgramContext';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import AllBountiesDisplay from '../component/fetchallbounties';
import CTA from '../component/CTA/page';

export const Home = () => {
  const { wallet } = useProgram();


  return (
    <div className="min-h-screen bg-gray-900">
      <div className="p-6">
        <CTA />
        {!wallet.connected ? (
          <div className="flex justify-center mb-8">
            <WalletMultiButton className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg" />
          </div>
        ) : (
          <div>
            <AllBountiesDisplay />
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;