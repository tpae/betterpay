import React, { useState, useEffect } from 'react';
import { Flex } from 'rimble-ui';
import { useParams } from 'react-router-dom';
import ProgressStep from './ProgressStep';
import SellerView from './SellerView';
import BuyerView from './BuyerView';

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

const BetterPayJSON = require('../../../contracts/BetterPay.sol');

const getSteps = (escrow) => [
  {
    label: 'Offer Created',
    status: 'OfferCreated',
    completed: true,
  },
  {
    label: 'Payment Confirmed',
    status: 'PaymentConfirmed',
    completed: parseInt(escrow.balance) === parseInt(escrow.targetAmount),
  },
  {
    label: 'Seller Confirmed',
    status: 'SellerConfirmed',
    completed: escrow.sellerConfirmed,
  },
  {
    label:'Buyer Confirmed',
    status: 'BuyerConfirmed',
    completed: escrow.buyerConfirmed,
  },
  {
    label: 'Offer Finalized',
    status: 'OfferFinalized',
    completed: escrow.finalized,
  }
];

const getStatus = (steps) => {
  const latest = steps.findIndex(step => !step.completed);
  return steps[latest-1].status;
};

export default function ViewForm(props) {
  const { ipfs, web3Context } = props;
  const { hash } = useParams();
  const [manifest, setManifest] = useState(null);
  const [escrow, setEscrow] = useState(null);
  const steps = escrow ? getSteps(escrow) : [];
  const status = escrow ? getStatus(steps) : null;
  const isSeller = escrow ? escrow.seller === web3Context.accounts[0] : false;
  const isBuyer = escrow
    ? (escrow.buyer === web3Context.accounts[0] || !isSeller && escrow.buyer === NULL_ADDRESS)
    : false;

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
    <Flex
      flexDirection="column"
      padding={25}
      marginTop={75}
      alignItems="center"
      width="100%"
    >
      <ProgressStep steps={steps} />
      {isSeller && <SellerView status={status} manifest={manifest} />}
      {isBuyer && <BuyerView status={status} manifest={manifest} />}
    </Flex>
  );
}