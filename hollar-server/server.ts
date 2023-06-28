import http from 'http'

import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import mongoose from 'mongoose'
import { ApolloServer } from '@apollo/server'
import { typeDefs, resolvers } from './src/app.js';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet'
// import { makeExecutableSchema } from '@graphql-tools/schema'
// import app from './src/app.js'
import express from 'express'


import { config } from 'dotenv'

const app = express()

config()




const MONGO_URL = "mongodb://127.0.0.1:27017/hollar"
const port = process.env.PORT || 3000
mongoose.connect(MONGO_URL).then(() => console.log('DB Connected!'));
const httpServer = http.createServer(app);


function getScope(req) {
    const token = req.headers.authorization || '';

    // try to retrieve a user with the token
    // const user = getUser(token);
    const user = token;

    // add the user to the context
    return { user };

}


interface MyContext {
    authScope?: String;
}

const server = new ApolloServer<MyContext>({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],

});
await server.start();
app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    bodyParser.json(),
    expressMiddleware(server, {
        context: async ({ req }) => ({
            authScope: getScope(req),
        }),
    }),
);

await new Promise<void>((resolve) => httpServer.listen({ port }, resolve));
console.log(`🚀 Server ready at http://localhost:3000/graphql`);


// cors<cors.CorsRequest>({ origin: ['http://localhost:5143/', 'http://localhost:5143', 'https://studio.apollographql.com'] }),