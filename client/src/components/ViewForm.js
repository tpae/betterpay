import React, { useState, useEffect } from 'react';
import { Flex, Text, Form, Textarea, Button, Loader } from 'rimble-ui';
import { useParams } from 'react-router-dom';
import ProgressStep from './ProgressStep';

const BetterPayJSON = require('../../../contracts/BetterPay.sol');

const steps = [
  {
    label: 'Offer Created',
    completed: true,
  },
  {
    label: 'Payment Confirmed',
    completed: true
  },
  {
    label: 'Seller Confirmed',
    completed: false
  },
  {
    label:'Buyer Confirmed',
    completed: false
  },
  {
    label: 'Offer Finalized',
    completed: false
  }
]

export default function ViewForm(props) {
  const { ipfs, web3Context } = props;
  const { hash } = useParams();
  const [manifest, setManifest] = useState(null);
  const [escrow, setEscrow] = useState(null);

  useEffect(() => {
    const getManifest = async () => {
      setManifest(await ipfs.get(hash));
      const deployedNetwork = BetterPayJSON.networks[web3Context.networkId];
      const contract = new web3Context.lib.eth.Contract(
        BetterPayJSON.abi,
        deployedNetwork && deployedNetwork.address,
      );
      setEscrow(await contract.methods.getEscrow(hash).call());
    }
    getManifest();
  }, []);

  if (!manifest || !escrow) {
    return <div>Loading...</div>;
  }

  console.log(manifest, escrow);

  return (
    <Flex flexDirection="column" padding={25} marginTop={75} alignItems="center" width="100%">
      <h1>{manifest.title}</h1>
      <ProgressStep steps={steps} />
    </Flex>
  );
}