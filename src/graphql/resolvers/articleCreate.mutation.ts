import slugify from 'slugify';
import { validate } from 'class-validator';

import { Article, User } from '../../entities';
import { UserInputError } from 'apollo-server';

export interface ArticleCreateArguments {
  input: {
    title: string;
    content: string;
    authorId: string;
  };
}

export const articleCreate = async (
  _root: any,
  args: ArticleCreateArguments,
) => {
  const article = Article.create({
    title: args.input.title,
    slug: slugify(args.input.title),
    content: args.input.content,
    author: await User.findOne(args.input.authorId),
  });

  const errors = await validate(article);

  if (errors.length > 0) {
    // Not best error message :D
    throw new UserInputError(
      "Cannot create article, didn't you missed something?",
    );
  }

  return article.save();
};
