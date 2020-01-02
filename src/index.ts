import 'reflect-metadata';
import { ApolloServer } from 'apollo-server';
import { createConnection } from 'typeorm';

import ormconfig from './ormconfig';

import { typeDefs, resolvers } from './graphql';

const main = async () => {
  try {
    await createConnection(ormconfig);
  } catch (e) {
    console.log('⚡ Cannot connect to the database:', e.message);
  }

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    cacheControl: false,
  });

  return server.listen();
};

main()
  .then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
  })
  .catch((e) => {
    console.log('⚡ Cannot launch server:', e.message);
  });
