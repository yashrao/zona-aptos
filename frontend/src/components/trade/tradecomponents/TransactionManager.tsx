import React from 'react';
import { Transaction, TransactionStatus } from '@/types/transaction';

interface TransactionManagerProps {
  transactions: Transaction[];
  updateTransaction: (id: string, status: TransactionStatus) => void;
}

const TransactionManager: React.FC<TransactionManagerProps> = ({ transactions, updateTransaction }) => {
  return (
    <div className="transaction-manager">
      <h3>Active Transactions</h3>
      {transactions.map((transaction) => (
        <div key={transaction.id} className="transaction-item">
          <span>{transaction.market} - {transaction.type} - ${transaction.amount}</span>
          <span>{transaction.status}</span>
          {transaction.status === 'pending' && (
            <>
              <button onClick={() => updateTransaction(transaction.id, 'active')}>Complete</button>
              <button onClick={() => updateTransaction(transaction.id, 'closed')}>Close</button>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default TransactionManager;
