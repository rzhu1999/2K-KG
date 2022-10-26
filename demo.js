var express = require('express');
const graphqlHTTP = require('express-graphql').graphqlHTTP;
const staple = require('staple-api');

let ontology = {
    file: './docs/ontology.ttl',
};

let config = {
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

async function StapleDemo() {
    let stapleApi = await staple(ontology, config);

    var app = express();
    app.use(
        '/graphql',
        graphqlHTTP({
            schema: stapleApi.schema,
            graphiql: true,
        })
    );

    app.listen(4000);
    console.log('Running a GraphQL API server at localhost:4000/graphql');
}

StapleDemo();
