import React, { useState, useEffect } from 'react';
import { Flex, Text, Button, Box } from 'rimble-ui';

export default function Home(props) {
  return (
    <Flex flexDirection="column" height="100%" justifyContent="center" alignItems="center">
      <h1>I want to securely</h1>
      <Flex flexDirection="row">
        <Flex flexDirection="column">
          <Button size="large" px={50} onClick={props.onBuyer}>Buy</Button>
          <Text textAlign="center" italic>Pay</Text>
        </Flex>
        <Box width={50} />
        <Flex flexDirection="column">
          <Button size="large" px={50} onClick={props.onSeller}>Sell</Button>
          <Text textAlign="center" italic>Request Payment</Text>
        </Flex>
      </Flex>
    </Flex>
  );
}