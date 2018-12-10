const { ApolloServer, gql, UserInputError, AuthenticationError, ApolloError } = require('apollo-server');

const {MoviesAPI} = require('./api/tushare/index');
const {typeDefs} = require('./types');

function getUser(token) {
    if (!token) return null;
    const userName = new Buffer(token, 'base64').toString('ascii');
    if (userName === 'admin') {
        return { user: { id: 12345, userName, roles: ['user', 'admin'] } }
    }
    return { user: { id: 34567, userName, roles: ['user'] } }
};
// This is a (sample) collection of books we'll be able to query
// the GraphQL server for.  A more complete example might fetch
// from an existing data source like a REST API or database.
const books = [
    {
        title: 'Harry Potter and the Chamber of Secrets',
        author: 'J.K. Rowling',
    },
    {
        title: 'Jurassic Park',
        author: 'Michael Crichton',
    },
];

// Type definitions define the "shape" of your data and specify
// which ways the data can be fetched from the GraphQL server.

function delay(t) {
    return new Promise((resolve, reject) => {
       setTimeout(() => {
           resolve();
       }, t);
    });
}
// Resolvers define the technique for fetching the types in the
// schema.  We'll retrieve books from the "books" array above.
const resolvers = {
    Query: {
        books: (parent, args, context) => {
            // In this case, we'll pretend there is no data when
            // we're not logged in. Another option would be to
            // throw an error.
            if (!context.user || !context.user.roles.includes('admin')) return null;
            return [...books];
        },
        viewer: (parent, args, {user}, info) => {
            if (!user) return null;
            return {
                id: user.id,
                userName: user.userName
            };
        },
        movie: async (_source, { id }, { dataSources }) => {
            return dataSources.moviesAPI.getMovie(id);
        },
        tuShare: async (_source, args, { dataSources }) => {
            return {
                trade_cal: async () => {
                    return dataSources.moviesAPI.trade_cal();
                },
                stock_basic: async () => {
                    return await dataSources.moviesAPI.stock_basic();
                },
                weekly: async (args, { dataSources }) => {
                    const result = await dataSources.moviesAPI.fetchApi('weekly', args, 'ts_code, trade_date, close, open, high, low, pre_close, change, pct_chg, vol, amount');
                    return result.items.map(([ts_code, trade_date, close, open, high, low, pre_close, change, pct_chg, vol, amount]) => ({
                        id: `weekly-${trade_date}-${ts_code}`,
                        ts_code, trade_date, close, open, high, low, pre_close, change, pct_chg, vol, amount
                    }));
                }
            }
        }
    },
    Mutation: {
        login: (parent, args, context, info) => {
            const {userName, password} = args;
            let user;
            if (userName === 'admin' && password === '12345678') {
                user = {
                    userName
                };
            } else if (userName === 'tangyun' && password === '12345678') {
                user = {
                    userName
                };
            }
            if (user) {
                const token = new Buffer(user.userName).toString('base64');
                return {
                    token,
                    isLogin: true,
                    viewer: {
                        id: userName === 'admin' ? '12345' : '34567',
                        userName
                    }
                };
            }
            throw new AuthenticationError('登陆失败');
            // new ApolloError('登陆失败', 500, {});
        },
        logout: (parent, args, context, info) => {
            return true;
        },
    }
};

// In the most basic sense, the ApolloServer can be started
// by passing type definitions (typeDefs) and the resolvers
// responsible for fetching the data for those types.
const server = new ApolloServer({
    typeDefs,
    resolvers,
    // playground: false,
    context: ({ req }) => {
        // get the user token from the headers
        const token = req.headers.authorization || '';
        // try to retrieve a user with the token
        const user = getUser(token);
        if (user) {
            return { ...user };
        }
        return {user: null};
    },
    // formatError: error => {
    //     console.log(error);
    //     return new Error('Internal server error');
    //     // Or, you can delete the exception information
    //     // delete error.extensions.exception;
    //     // return error;
    // },
    dataSources: () => ({
        moviesAPI: new MoviesAPI(),
    }),
});

// This `listen` method launches a web-server.  Existing apps
// can utilize middleware options, which we'll discuss later.
server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});