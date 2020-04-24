import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

import Transaction from '../models/Transaction';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}
class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError(
        'not be able to create outcome transaction without a valid balance',
        400,
      );
    }

    const categoryRepository = getRepository(Category);

    let categoryExist = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!categoryExist) {
      categoryExist = categoryRepository.create({ title: category });

      await categoryRepository.save(categoryExist);
    }

    const transaction = transactionsRepository.create({
      title,
      type,
      value,
      category: categoryExist,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
