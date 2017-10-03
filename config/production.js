'use strict';
module.exports = {
    aws: {
        access: {
            id: process.env.AWS_ACCESS_ID,
            key: process.env.AWS_ACCESS_KEY
        },
        s3: {
            bucket: process.env.AWS_S3_BUCKET
        }
    },
    keen: {
        projectId: process.env.KEEN_PROJECT_ID,
        readKey: process.env.KEEN_READ_KEY
    },
    cassandra: {
        keyspace: process.env.CASSANDRA_KEYSPACE,
        hosts: process.env.CASSANDRA_HOSTS
    },
    log: {
        level: process.env.LOG_LEVEL || 'info'
    }
};