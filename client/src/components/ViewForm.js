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
  return latest > -1 ? steps[latest-1].status : 'OfferFinalized';
};

export default function ViewForm(props) {
  const { ipfs, web3Context } = props;
  const { hash } = useParams();
  const [manifest, setManifest] = useState(null);
  const [escrow, setEscrow] = useState(null);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
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
      setContract(contract);
      setEscrow(await contract.methods.getEscrow(hash).call());
    }
    getManifest();
  }, []);

  if (!manifest || !escrow) {
    return <div>Loading...</div>;
  }

  const onSellerConfirm = async () => {
    setLoading(true);
    const digestData = {
      ...manifest,
      timestamp: Math.round((new Date()).getTime() / 1000)
    };
    const digest = await ipfs.add(digestData);
    await contract.methods.confirmSeller(hash, digest).send(
      { from: web3Context.accounts[0] }
    );
    alert('Success!');
    setLoading(false);
  };

  const onBuyerConfirm = async () => {
    setLoading(true);
    const digestData = {
      ...manifest,
      timestamp: Math.round((new Date()).getTime() / 1000)
    };
    const digest = await ipfs.add(digestData);
    await contract.methods.confirmBuyer(hash, digest).send(
      { from: web3Context.accounts[0] }
    );
    alert('Success!');
    setLoading(false);
  };

  const onSendPayment = async () => {
    setLoading(true);
    const digestData = {
      ...manifest,
      timestamp: Math.round((new Date()).getTime() / 1000)
    };
    const digest = await ipfs.add(digestData);
    await contract.methods.makePayment(hash, digest).send(
      { from: web3Context.accounts[0], value: web3Context.lib.utils.toWei(manifest.price, "ether") }
    );
    alert('Success!');
    setLoading(false);
  };

  const onDisburse = async () => {
    setLoading(true);
    const digestData = {
      ...manifest,
      timestamp: Math.round((new Date()).getTime() / 1000)
    };
    const digest = await ipfs.add(digestData);
    await contract.methods.disbursePayment(hash, digest).send(
      { from: web3Context.accounts[0] }
    );
    alert('Success!');
    setLoading(false);
  };

  return (
    <Flex
      flexDirection="column"
      padding={25}
      marginTop={75}
      alignItems="center"
      width="100%"
    >
      <ProgressStep steps={steps} />
      {isSeller && (
        <SellerView
          status={status}
          manifest={manifest}
          onSellerConfirm={onSellerConfirm}
          onDisburse={onDisburse}
          loading={loading}
        />
      )}
      {isBuyer && (
        <BuyerView 
          status={status} 
          manifest={manifest}
          onBuyerConfirm={onBuyerConfirm}
          onSendPayment={onSendPayment}
          loading={loading}
        />
      )}
    </Flex>
  );
}