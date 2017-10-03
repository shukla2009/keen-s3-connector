Keen-S3-Connector in Docker
===

This repository provides a connector to pull record from keen and push to s3.

Run
---

```bash
docker run --name keen-s3-connector \
--env AWS_ACCESS_ID=<AWS-ID> \
--env AWS_ACCESS_KEY="<AWS-KEY>" \
--env CASSANDRA_KEYSPACE="<KEYSPACE>" \
--env CASSANDRA_HOSTS="<HOST>" \
--env KEEN_STREAM="<KEEN STREAM NAME>" \
--env DURATION_START=<START DATE> \
--env DURATION_END=<END DATE> \
--env KEEN_PROJECT_ID= "<KEEN PROJECT ID>" \
--env KEEN_READ_KEY= "<KEEN READ KEY>" \
-d shukla2009/keen-s3-connector
```
