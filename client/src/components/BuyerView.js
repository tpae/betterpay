import React from 'react';
import { Flex, Field, Card, Heading, Input, Table, Button, Loader } from 'rimble-ui';

export default function BuyerView(props) {
  const { manifest, status, loading, onSendPayment } = props;
  console.log(status);
  return (
    <Card width={800} marginTop={50}>
      <Heading>You are the Buyer</Heading>
      <Flex height={25} />
      <Field label="Pay Amount (ETH)" width={1}>
        <Input type="text" value={manifest.price} required readOnly />
      </Field>
      {status === 'OfferCreated' && (
        <Button disabled={loading} type="submit" width={1} onClick={onSendPayment}>
          {!loading ? "Send Payment" : (
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