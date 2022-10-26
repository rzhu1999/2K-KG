const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const staple = require('staple-api');

const ontology = {
    file: './docs/ontology.ttl',
};

const config = {
    dataSources: {
        default: 'defaultSource',
        defaultSource: {
            type: 'mongodb',
            url: 'mongodb+srv://rzhu1999:dsci558@cluster0.bb9jsfr.mongodb.net/?retryWrites=true&w=majority',
            dbName: '2k-kg-db',
            collectionName: 'dsci558',
            description: 'MongoDB Atlas instance',
        },
    },
};

async function Staple() {
    const stapleApi = await staple(ontology, config);
    const schema = stapleApi.schema;

    const server = new ApolloServer({
        schema,
    });

    const app = express();
    const path = '/graphql';

    server.applyMiddleware({ app, path });

    app.listen({ port: 3000 }, function () {
        console.log('🚀 Server ready');
    });
}

Staple();
