import { gql } from 'apollo-server';

export const typeDefs = gql`
  type Query {
    users: [User!]!
  }

  type Mutation {
    articleCreate(input: ArticleCreateInput): Article!
    userCreate(input: UserCreateInput!): User!
  }

  type User {
    id: ID!
    email: String!
    username: String!
    bio: String
    image: String
    articles: [Article!]!
  }

  type Article {
    id: ID!
    title: String!
    slug: String!
    content: String
    author: User!
  }

  input ArticleCreateInput {
    title: String!
    content: String
    authorId: ID!
  }

  input UserCreateInput {
    email: String!
    password: String!
    username: String!
  }
`;
