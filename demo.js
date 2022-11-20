const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const staple = require('staple-api');

var secrets = require('./secret');

const ontology = {
    file: './docs/ontology.ttl',
};

const config = {
    dataSources: {
        default: 'defaultSource',
        defaultSource: {
            type: 'mongodb',
            url: `mongodb+srv://rzhu1999:${secrets.mongoDBPassword}@cluster0.bb9jsfr.mongodb.net/?retryWrites=true&w=majority`,
            dbName: '2k-kg-db',
            collectionName: 'dsci558',
            description: 'MongoDB Atlas instance',
        },
    },
};

async function Staple() {
    const stapleApi = await staple(ontology, config);
    const schema = stapleApi.schema;

    // creating the list of all people and their names for FE indexing

    let people = [];

    console.log("Fetching people's names...");
    await stapleApi.graphql('{ Person { _id label } }').then((response) => {
        response.data.Person.forEach((element) => {
            people.push({ id: element._id, text: element.label });
        });
        console.log('...all fetched!');
    });

    const app = express();
    app.use(express.static('docs'));

    app.get('/people', function (req, res) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.send(people);
    });

    const server = new ApolloServer({
        schema,
    });

    const path = '/graphql';
    server.applyMiddleware({ app, path });

    app.listen({ port: 3000 }, () => console.log('🚀 Server ready: http://localhost:3000/'));
}

Staple();
