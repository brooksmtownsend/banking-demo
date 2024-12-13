import * as React from 'react';
import {DummyCardMoney} from './DummyCardMoney';
import {DummyCardGraph} from './DummyCardGraph';
import {DummyCardTransactions} from './DummyCardTransactions';
import {AccountStatusCard} from './AccountStatusCard';

function Dashboard(): React.ReactElement {
  return (
    <div className="grid grid-cols-12 gap-6 pt-6 pb-20">
      <AccountStatusCard />
      <DummyCardGraph />
      <DummyCardMoney direction="in" />
      <DummyCardMoney direction="out" />
      <DummyCardTransactions />
    </div>
  );
}

export {Dashboard};
