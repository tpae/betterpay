import React from 'react';
import { Flex, Field, Card, Heading, Input, Table } from 'rimble-ui';

export default function SellerView(props) {
  const { manifest, status } = props;
  console.log(status);
  return (
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
  );
}