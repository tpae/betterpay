import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';
import { useWeb3Injected } from '@openzeppelin/network/react';
import HeaderNav from './components/HeaderNav';
import Home from './components/Home';
import CreateForm from './components/CreateForm';
import getIPFS from './utils/ipfs';

import styles from './App.module.scss';

const BetterPayJSON = require('../../contracts/BetterPay.sol');

function App() {
  const context = useWeb3Injected();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('buyer');
  const ipfs = getIPFS();

  useEffect(() => {
    const bootstrap = async () => {
      const deployedNetwork = BetterPayJSON.networks[context.networkId];
      setContract(new context.lib.eth.Contract(
        BetterPayJSON.abi,
        deployedNetwork && deployedNetwork.address,
      ));
    }
    bootstrap();
  }, [context]);

  const onSubmit = (data) => {
    console.log(data);
    setLoading(true);
  }

  const onCTAClick = (role) => () => {
    setRole(role);
    setShowCreateForm(true);
  }

  if (!context.lib) {
    return <div>Loading Web3, accounts, and contract...</div>;
  }

  return (
    <div className={styles.App}>
      <HeaderNav web3Context={context} />
      <CreateForm
        show={showCreateForm}
        role={role}
        loading={loading}
        onRoleChange={setRole}
        onClose={() => setShowCreateForm(false)}
        onSubmit={onSubmit}
      />
      <Router>
        <Switch>
          <Route exact path="/">
            <Home
              onBuyer={onCTAClick('buyer')}
              onSeller={onCTAClick('seller')}
            />
          </Route>
          <Route path="/view/:hash">
            <h3>View</h3>
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
