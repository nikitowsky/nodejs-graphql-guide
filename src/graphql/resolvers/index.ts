import { users } from './users.query';
import { userCreate } from './userCreate.mutation';
import { articleCreate } from './articleCreate.mutation';

export const resolvers = {
  Query: {
    users,
  },
  Mutation: {
    articleCreate,
    userCreate,
  },
};
