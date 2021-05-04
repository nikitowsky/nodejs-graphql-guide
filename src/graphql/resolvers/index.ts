import { article } from './article.query';
import { users } from './users.query';
import { user } from './user.query';

import { articleCreate } from './articleCreate.mutation';
import { userCreate } from './userCreate.mutation';

export const resolvers = {
  Query: {
    users,
    article,
    user,
  },
  Article: {
    author: user,
  },
  Mutation: {
    articleCreate,
    userCreate,
  },
};
