import logo from './logo.svg';
import './App.css';
import {Routes, Route} from "react-router-dom";
import HomePage from './pages/HomePage';
import WalletConnect from './components/WalletConnect';
import { useState } from 'react';
import CreateProposal from './pages/CreateProposal/CreateProposal';



function App() {

  const [userAccount, setUserAccount] = useState('');

  return (
    <div className="App">
      <WalletConnect userAccount={userAccount} setUserAccount={setUserAccount} />
      <p>here</p>
      <Routes>
        <Route path={"/proposals"} element={<CreateProposal userAccount={userAccount} setUserAccount={setUserAccount}/>}/>
        <Route path={"/"} element={<HomePage/>}/>
      </Routes>
    </div>
  );
}

export default App;
