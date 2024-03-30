const _ = require('lodash');

module.exports = function(env, mode, _paths) {
  // extra environment content for both environments
  const commonEnvOverride = {};
  // extra webpack plugins for both lists
  const commonPlugins = [];
  // webpack config overrides for both environments
  const commonWebpack = {};
  // extra loaders to add to the start of the list for both environments
  const commonExtraLoaders = [];
  // extra options for the HtmlWebpackPlugin for both environments
  const commonHtmlWebpackPluginOptions = {};
  // override options for postcss for both environments
  const commonPostCssOptions = {
    // plugins: ['postcss-preset-env']
  };
  if(mode === 'production') {
    // extra environment content
    const envOverride = {};
    // extra webpack plugins
    const plugins = [];
    // webpack config overrides
    const webpack = {};
    // moment.js locales to keep: use null to not trim, use '' for default locale only, or a comma-separated list of locales to keep in addition to the default
    const momentLocales = null;
    // the severity of the size hints warning: use false for disabling, 'warning' for warning (default; used with null), or 'error' for failing the build
    const sizeHints = null;
    // the max size of the entrypoint above which webpack will warn: use null to keep the default, or specify a size with the suffix b, k, m, or g
    const maxEntrypointSize = '1m';
    // the max size of assets above which webpack will warn: use null to keep the default, or specify a size with the suffix b, k, m, or g
    const maxAssetSize = '4m';
    // extra loaders to add to the start of the list
    const extraLoaders = [];
    // extra options for the HtmlWebpackPlugin
    const htmlWebpackPluginOptions = {};
    // override options for postcss
    const postcssOptions = {
      // plugins: ['postcss-preset-env']
    };
    return {
      env: _.extend({}, env, commonEnvOverride, envOverride),
      plugins: _.concat([], commonPlugins, plugins),
      webpack: _.defaultsDeep({}, commonWebpack, webpack),
      momentLocales,
      sizeHints,
      maxEntrypointSize,
      maxAssetSize,
      extraLoaders: _.concat([], commonExtraLoaders, extraLoaders),
      htmlWebpackPluginOptions: _.defaultsDeep({}, commonHtmlWebpackPluginOptions, htmlWebpackPluginOptions),
      postcssOptions: _.defaultsDeep({}, commonPostCssOptions, postcssOptions),
    };
  } else {
    // extra environment content
    const envOverride = {};
    // extra webpack plugins
    const plugins = [];
    // webpack config overrides
    const webpack = {};
    // extra loaders to add to the start of the list
    const extraLoaders = [];
    // extra options for the HtmlWebpackPlugin
    const htmlWebpackPluginOptions = {};
    // override options for postcss
    const postcssOptions = {
      // plugins: ['postcss-preset-env']
    };
    return {
      env: _.extend({}, env, commonEnvOverride, envOverride),
      plugins: _.concat([], commonPlugins, plugins),
      webpack: _.defaultsDeep({}, commonWebpack, webpack),
      extraLoaders: _.concat([], commonExtraLoaders, extraLoaders),
      htmlWebpackPluginOptions: _.defaultsDeep({}, commonHtmlWebpackPluginOptions, htmlWebpackPluginOptions),
      postcssOptions: _.defaultsDeep({}, commonPostCssOptions, postcssOptions),
    };
  }
};
