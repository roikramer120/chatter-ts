"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var env = process.env;
exports.default = {
    PORT: env.PORT || 3000,
    HOST: env.PORT || '0.0.0.0',
    DB_CONN_STR: 'mongodb://root:wonder100@ds115553.mlab.com:15553/heroku_994wtpk0',
    DB_NAME: 'heroku_994wtpk0',
    get endpoint() {
        return "http://" + this.HOST + ":" + this.PORT;
    }
};
