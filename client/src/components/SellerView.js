import React from 'react';
import { Flex, Field, Card, Heading, Input, Table, Button, Loader } from 'rimble-ui';

export default function SellerView(props) {
  const { manifest, status, loading, onSellerConfirm, onDisburse } = props;
  console.log(status);
  return (
    <Card width={800} marginTop={50}>
      <Heading>You are the Seller</Heading>
      <Flex height={25} />
      <Field label="Copy Offer Link for Buyer" width={1}>
        <Input type="text" value={window.location.href} required readOnly />
      </Field>
      {status === 'PaymentConfirmed' && (
        <Button disabled={loading} type="submit" width={1} onClick={onSellerConfirm}>
          {!loading ? "Confirm Fulfillment" : (
            <Loader color="white" />
          )}
        </Button>
      )}
      {status === 'BuyerConfirmed' && (
        <Button disabled={loading} type="submit" width={1} onClick={onDisburse}>
          {!loading ? "Disburse Payment" : (
            <Loader color="white" />
          )}
        </Button>
      )}
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
  );
}