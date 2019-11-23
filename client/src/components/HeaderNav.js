import React from 'react';
import {
  Alignment,
  Button,
  Classes,
  Menu,
  Position,
  Popover,
  Navbar,
  NavbarGroup,
  NavbarHeading,
} from '@blueprintjs/core';

export default function HeaderNav(props) {
  const { web3Context } = props;

  const requestAuth = async web3Context => {
    try {
      await web3Context.requestAuth();
    } catch (e) {
      console.error(e);
    }
  };

  const { networkId, accounts, providerName } = web3Context;

  const UserMenu = (
    <Menu>
      <Menu.Divider title={`Connected to ${providerName}!`} />
    </Menu>
  );

  return (
    <Navbar fixedToTop className="bp3-dark">
      <NavbarGroup align={Alignment.LEFT}>
        <NavbarHeading>BetterPay</NavbarHeading>
      </NavbarGroup>
      <NavbarGroup align={Alignment.RIGHT}>
        {accounts && accounts.length ? (
          <Popover content={UserMenu} position={Position.BOTTOM_RIGHT} minimal>
            <Button className={Classes.MINIMAL} text={accounts[0]} />
          </Popover>
        ) : !!networkId && (
          <Button onClick={() => requestAuth(web3Context)}>Connect with MetaMask</Button>
        )}
      </NavbarGroup>
    </Navbar>
  );
}
