'use strict';
const config = require('./config');
const logger = require('./logger')(module);
const async = require('async');
let _ = require('lodash');
const Keen = require('keen-js');
const AWS = require('aws-sdk');
const cassandra = require('cassandra-driver');
const moment = require('moment');
let cp = _.map(config.cassandra.hosts.split(','), function (c) {
    return c.trim();
});
const cassClient = new cassandra.Client({contactPoints: cp, keyspace: config.cassandra.keyspace});

AWS.config.update({
    accessKeyId: config.aws.access.id,
    secretAccessKey: config.aws.access.key,
    sslEnabled: true
});

const s3 = new AWS.S3();

const keen = new Keen({
    projectId: config.keen.projectId,
    readKey: config.keen.readKey
});

function upload(date, collection) {
    let start = moment(date).startOf('day');
    //let end = moment(start).add(1, 'minutes');
    let end = moment(start).endOf('day');
    let fileName = moment(start).format('YYYY_MM_DD');
    let s3Bucket = config.aws.s3.bucket;
    let folder = collection.toLowerCase().replace('-', '_');
    async.waterfall([
        // Download from Keen
        function (cb) {
            keen.query('extraction', {
                'event_collection': collection,
                'timeframe': {start: start, end: end},
                'timezone': 0
            }).then(res => {
                logger.debug(`Success: Downloading ${collection} for date ${start} from keem`);
                cb(null, res.result);
            }).catch(err => {
                logger.error(`FAILED : Keen download of ${collection} for date ${start} with error ${err}`);

                cb(err);
            });

        },
        // Upload to S3
        function (result, cb) {
            let length = result.length;
            var s = '';
            result.forEach(function (r) {
                s = s + JSON.stringify(r) + '\n';
            });
            s3.putObject({
                Bucket: `${s3Bucket}/${folder}`,
                Key: fileName,
                Body: s
            }, function (err) {
                if (err) {
                    logger.error(`FAILED : S3 upload of ${collection} for date ${start} with error ${err}`);
                    cb(err);
                } else {
                    logger.debug(`SUCCESS : Upload ${collection} for date ${start} to S3`);
                    cb(null, length);
                }
            });
        },
        // check point in cassandra
        function (result, cb) {
            let query = 'INSERT INTO keen_backup (collection, date, count) VALUES (?, ?, ?)';
            const params = [collection, moment(start).format('YYYY-MM-DD HH:MM:SS'), result];
            cassClient.execute(query, params, {prepare: true}, function (err) {
                if (err) {
                    logger.error(`FAILED : Cassandra checkpoint of ${collection} for date ${start} with error ${err}`);
                    cb(err);
                } else {
                    logger.debug(`SUCCESS : Cassandra checkpoint for ${collection} for date ${start}`);
                    cb(null, result);
                }
            });
        }
    ], function (err, result) {
        if (err) {
            logger.error(`FAILED : Sync of ${collection} for date ${start} with error ${err}`);
        }
        else {
            logger.info(`SUCCESS : ${result} records saved of ${collection} for date ${start} to S3`);
            start = moment(start).subtract(1, 'days');
            if (moment(config.duration.end) < start) {
                logger.info(`Start sync of  ${collection} for date ${start}`);
                upload(moment(start).format('YYYY-MM-DD'), collection);
            }
            else {
                logger.info(`Job Finished  ${collection} for date ${config.duration.start} - ${config.duration.end}`);
                process.exit();
            }
        }
    });
}

function start() {
    let query = `SELECT date from keen_backup WHERE collection = ? LIMIT 1`;
    let params = [config.stream];
    cassClient.execute(query, params, {prepare: true}, function (err, result) {
        if (err) {
            logger.error(`Failed Cassandra error ${err}`);
        } else {
            if (!!result && !!result.rows) {
                let lastSavedDate = moment(result.rows[0].date);
                if (lastSavedDate > moment(config.duration.end)) {
                    upload(moment(lastSavedDate).format('YYYY-MM-DD'), config.stream);
                }
            }
            else {
                upload(config.duration.start, config.stream);
            }
        }
    });
}
start();
