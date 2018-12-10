const { ApolloServer, gql, UserInputError, AuthenticationError, ApolloError } = require('apollo-server');

const tuShareTypes = require('./tuShare').tuShareApiType;
const typeDefs = gql`
  ${tuShareTypes}
  directive @auth(requires: Role = ADMIN) on OBJECT | FIELD_DEFINITION
  enum Role {
    ADMIN
    REVIEWER
    USER
  }
  # Comments in GraphQL are defined with the hash (#) symbol.

  # This "Book" type can be used in other type declarations.
  type Book {
    title: String
    author: String
  }
  
  type Viewer {
    id: String
    userName: String
  }

  type Movie {
    id: String
  } 
  
  # The "Query" type is the root of all GraphQL queries.
  # (A "Mutation" type will be covered later on.)
  type Query {
    books: [Book],
    viewer: Viewer,
    movie(id: String!): Movie,
    tuShare: tuShareApiType
  }
  
  type LoginMutationResult {
    token: String,
    viewer: Viewer
  }
  type Mutation {
    # 账户登陆
    login(userName: String!, password: String!): LoginMutationResult,
    logout: Boolean!
  }
`;


module.exports = {
    typeDefs
};