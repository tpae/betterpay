import React, { useState, useEffect } from 'react';
import { Flex, Field, Card, Heading, Input, Table } from 'rimble-ui';
import { useParams } from 'react-router-dom';
import ProgressStep from './ProgressStep';

const BetterPayJSON = require('../../../contracts/BetterPay.sol');

const getSteps = (escrow) => [
  {
    label: 'Offer Created',
    completed: true,
  },
  {
    label: 'Payment Confirmed',
    completed: parseInt(escrow.balance) === parseInt(escrow.targetAmount),
  },
  {
    label: 'Seller Confirmed',
    completed: escrow.sellerConfirmed,
  },
  {
    label:'Buyer Confirmed',
    completed: escrow.buyerConfirmed,
  },
  {
    label: 'Offer Finalized',
    completed: escrow.finalized,
  }
];

export default function ViewForm(props) {
  const { ipfs, web3Context } = props;
  const { hash } = useParams();
  const [manifest, setManifest] = useState(null);
  const [escrow, setEscrow] = useState(null);
  const steps = escrow ? getSteps(escrow) : [];

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

  console.log(escrow);

  return (
    <Flex flexDirection="column" padding={25} marginTop={75} alignItems="center" width="100%">
      <ProgressStep steps={steps} />
      <Card width={800} marginTop={50}>
        <Heading>You are the Seller</Heading>
        <Flex height={25} />
        <Field label="Copy Offer Link for Buyer" width={1}>
          <Input type="text" value={window.location.href} required readOnly />
        </Field>
        <Flex height={25} />
        <Table>
          <thead>
            <tr>
              <th>Offer Terms</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><b>Title</b></td>
              <td>{manifest.title}</td>
            </tr>
            <tr>
              <td><b>Description</b></td>
              <td>{manifest.description}</td>
            </tr>
            <tr>
              <td><b>Price</b></td>
              <td>{manifest.price} ETH</td>
            </tr>
          </tbody>
        </Table>
      </Card>
    </Flex>
  );
}