import { Article, User } from '../../entities';

type ArticleID = string | number;

export const article = async (_root: any, args: { id: ArticleID }) => {
  const article = await Article.findOne(args.id, { relations: ['author'] });

  return {
    ...article,
    author: User.findOne(article.author.id),
  };
};
