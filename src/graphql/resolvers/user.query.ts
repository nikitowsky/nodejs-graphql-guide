import { Article, User } from '../../entities';

type UserID = string | number;

export const user = async (root: any, args: { id: UserID }) => {
  const user = await User.findOne(root?.author?.id ?? args.id);

  return {
    ...user,
    articles: Article.find({ where: { author: user }, relations: ['author'] }),
  };
};
