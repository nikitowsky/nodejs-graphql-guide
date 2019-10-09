import { gql } from 'apollo-server';

export const typeDefs = gql`
  type Query {
    user: User!
  }

  type Mutation {
    userCreate(input: UserCreateInput!): User!
  }

  type User {
    id: ID!
    email: String!
    username: String!
    bio: String
    image: String
  }

  input UserCreateInput {
    email: String!
    password: String!
    username: String!
  }
`;
