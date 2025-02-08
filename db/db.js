const { Client } = require('pg');

const client = new Client({
    user: 'ameliajochna', //put yours
    host: 'localhost',
    database: 'shop_db',
    password: '',
    port: 5432,
});

client.connect()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch(err => console.error('Connection error', err.stack));

module.exports = client;