import React, { useState, useEffect } from 'react';
import { Flex, Text, Form, Textarea, Button, Loader } from 'rimble-ui';
import { useParams } from 'react-router-dom';

const BetterPayJSON = require('../../../../contracts/BetterPay.sol');

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
    <Flex flexDirection="column" margin={25} marginTop={75} alignItems="center">
      <h1>{manifest.title}</h1>
    </Flex>
  );
}