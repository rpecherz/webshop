const { Client } = require('pg');

const client = new Client({
    user: 'helenazabska', 
    host: 'localhost',
    database: 'postgres',
    password: '',
    port: 5432,
});

client.connect()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch(err => console.error('Connection error', err.stack));

module.exports = client;