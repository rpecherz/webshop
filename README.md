# WebShop

## Running locally

### Create local database

Make sure you have postgresql installed.

Run these commands:

psql -d posgres

Now inside psql command line:

\i /your/path/create_db.sql

Remember to change database credentials (especially user) in db/db.js lines 3-9.