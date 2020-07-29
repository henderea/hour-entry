const _ = require('lodash');

module.exports = function(env, mode, paths) {
  if(mode === 'production') {
    // extra environment content
    const envOverride = {};
    return {
      env: _.extend({}, env, envOverride),
      // extra webpack plugins
      plugins: [],
      // webpack config overrides
      webpack: {},
      // moment.js locales to keep: use null to not trim, use '' for default locale only, or a comma-separated list of locales to keep in addition to the default
      momentLocales: '',
      // the severity of the size hints warning: use false for disabling, 'warning' for warning (default; used with null), or 'error' for failing the build
      sizeHints: null,
      // the max size of the entrypoint above which webpack will warn: use null to keep the default, or specify a size with the suffix b, k, m, or g
      maxEntryPointSize: '512k',
      // the max size of assets above which webpack will warn: use null to keep the default, or specify a size with the suffix b, k, m, or g
      maxAssetSize: '2m',
      // extra loaders to add to the start of the list
      extraLoaders: [],
      // extra options for the HtmlWebpackPlugin
      htmlWebpackPluginOptions: {},
    };
  } else {
    // extra environment content
    const envOverride = {};
    return {
      env: _.extend({}, env, envOverride),
      // extra webpack plugins
      plugins: [],
      // webpack config overrides
      webpack: {},
      // extra loaders to add to the start of the list
      extraLoaders: [],
      // extra options for the HtmlWebpackPlugin
      htmlWebpackPluginOptions: {},
    };
  }
};