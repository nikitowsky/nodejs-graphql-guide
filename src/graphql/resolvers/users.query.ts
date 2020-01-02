import Dataloader from 'dataloader';

import { User } from '../../entities';

type UserID = string | number;

const getArticlesOfUsers = async (ids: UserID[]) => {
  const users = await User.createQueryBuilder('user')
    .leftJoinAndSelect('user.articles', 'article')
    .where('user.id IN (:...ids)', { ids })
    .getMany();

  return users.map((user) => user.articles);
};

export const users = async (root: any) => {
  const users = await User.find();

  const articlesLoader = new Dataloader((keys: UserID[]) =>
    getArticlesOfUsers(keys),
  );

  const usersWithArticles = users.map((user) => {
    return {
      ...user,
      articles: articlesLoader.load(user.id),
    };
  });

  return usersWithArticles;
};
