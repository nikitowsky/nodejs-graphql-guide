import Dataloader from 'dataloader';

import { User } from '../../entities';

const getArticlesOfUsers = async (ids: any[]) => {
  const users = await User.createQueryBuilder('user')
    .leftJoinAndSelect('user.articles', 'article')
    .where('user.id IN (:...ids)', { ids })
    .getMany();

  return users.map((user) => user.articles);
};

export const users = async (root: any) => {
  const users = await User.find();

  const articlesLoader = new Dataloader((keys) => getArticlesOfUsers(keys));

  const usersWithArticles = users.map((user) => {
    return {
      ...user,
      articles: articlesLoader.load(user.id),
    };
  });

  return usersWithArticles;
};
