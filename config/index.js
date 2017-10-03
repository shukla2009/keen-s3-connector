'use strict';
var _ = require('lodash');

var all = {
    env: process.env.NODE_ENV || 'production',
    log: {
        level: process.env.LOG_LEVEL || 'info'
    },
    duration: {
        start: process.env.DURATION_START,
        end: process.env.DURATION_END,
    },
    stream: process.env.KEEN_STREAM
};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
    all,
    require(`./${all.env}.js`) || {});