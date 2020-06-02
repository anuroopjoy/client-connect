// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
    const createKarmaConfig = require('../../../../Tools/UI/karma-common.config');
    config.set(createKarmaConfig(config, 'taxflow-container', 'Container'));
};
