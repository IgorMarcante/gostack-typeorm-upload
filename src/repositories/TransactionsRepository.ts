import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const income = await transactions.reduce((total, transaction) => {
      return transaction.type === 'income'
        ? total + Number(transaction.value)
        : total;
    }, 0);

    const outcome = await transactions.reduce((total, transaction) => {
      return transaction.type === 'outcome'
        ? total + Number(transaction.value)
        : total;
    }, 0);

    const balance = {
      income,
      outcome,
      total: income - outcome,
    };

    return balance;
  }
}

export default TransactionsRepository;
