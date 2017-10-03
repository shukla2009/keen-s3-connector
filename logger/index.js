'use strict';
var winston = require('winston');
var config = require('../config');

module.exports = function (callingModule) {

    var getLabel = function () {
        var parts = callingModule.filename.split('/');
        return parts[parts.length - 2] + '/' + parts.pop();
    };

    return new winston.Logger({
        transports: [new winston.transports.Console({
            label: getLabel(),
            timestamp: true,
            colorize: true,
            level: config.log.level
        })]
    });
};