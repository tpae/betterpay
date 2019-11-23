import React, { useEffect } from 'react';

import { useWeb3Injected } from '@openzeppelin/network/react';
import Web3Info from './components/Web3Info/index.js';
import getIPFS from './utils/ipfs';

import styles from './App.module.scss';

const BetterPayJSON = require('../../contracts/BetterPay.sol');

function App() {
  const injected = useWeb3Injected();
  const ipfs = getIPFS();

  console.log(BetterPayJSON);

  // useEffect(() => {
  //   (async function f() {
  //     const hash = await ipfs.add('foo');
  //     console.log('hash', hash);

  //     const data = await ipfs.get(hash);
  //     console.log('data', data);
  //   })();
  // }, []);

  return (
    <div className={styles.App}>
      <Web3Info title="Injected Web3" web3Context={injected} />
    </div>
  );
}

export default App;
