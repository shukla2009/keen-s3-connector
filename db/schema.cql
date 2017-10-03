CREATE KEYSPACE IF NOT EXISTS checkpoint WITH replication = {'class': 'SimpleStrategy', 'replication_factor': '1'}  AND durable_writes = true;
CREATE TABLE IF NOT EXISTS keen (
    collection text,
    date timestamp,
    count int,
    PRIMARY KEY (collection, date)
);