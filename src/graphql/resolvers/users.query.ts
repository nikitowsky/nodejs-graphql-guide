import Dataloader from 'dataloader';

import { User } from '../../entities';

type UserID = string | number;

const usersWithArticles = async (ids: UserID[]) => {
  const users = await User.createQueryBuilder('user')
    .leftJoinAndSelect('user.articles', 'article')
    .where('user.id IN (:...ids)', { ids })
    .getMany();

  return users;
};

export const users = async (_root: any, args: { ids: UserID[] }) => {
  const articlesLoader = new Dataloader(usersWithArticles);

  const users = args.ids.map((id) => {
    return articlesLoader.load(id);
  });

  return users;
};
