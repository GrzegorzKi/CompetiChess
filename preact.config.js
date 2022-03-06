/*
 * Copyright (c) 2022  Grzegorz Kita
 *
 * This file is part of CompetiChess.
 *
 * CompetiChess is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * CompetiChess is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with CompetiChess.  If not, see <http://www.gnu.org/licenses/>.
 */

import path from 'path';

import purgeCssPlugin from '@fullhuman/postcss-purgecss';

function configSizePlugin(config, helpers, regex = /\.(\w{5})(\.esm)?\.(js|css)$/, toStrip = 1) {
  const sizePlugins = helpers.getPluginsByName(config, 'SizePlugin');
  sizePlugins.forEach(({ plugin }) => {
    plugin.stripHash = (fileName = '') => {
      const matchArray = fileName.match(regex);
      if (!matchArray) {
        return fileName;
      }

      const group = matchArray[toStrip];
      const mask = '*'.repeat(group.length);
      return fileName.replace(group, mask);
    };
  });
}

function includePurgeCss(config, env, helpers) {
  const purgeCss = purgeCssPlugin({
    // Specify the paths to all the template files in your project
    content: [
      './src/**/*.html',
      './src/**/*.ts',
      './src/**/*.tsx',
      './src/**/*.js',
      './src/**/*.jsx',
      'node_modules/react-toastify/dist/ReactToastify.min.css'
    ],

    defaultExtractor: (content = '') => content.match(/[\w-/:]+(?<!:)/g) || []
  });

  const postCssLoaders = helpers.getLoadersByName(config, 'postcss-loader');
  postCssLoaders.forEach(({ loader }) => {
    const plugins = loader.options.postcssOptions.plugins;

    if (env.production) {
      plugins.push(purgeCss);
    }
  });
}

function addToCopyPlugin(config, helpers, patterns) {
  const copyPlugins = helpers.getPluginsByName(config, 'CopyPlugin');
  copyPlugins.forEach(({ plugin }) => {
    plugin.patterns.push(...patterns);
  });
}

function disableSourceMapsOnProd(config, env) {
  if (env.production) {
    config.devtool = false; // Disable sourcemaps
  }
}

export default (config, env, helpers) => {
  // Makes absolute imports possible
  config.resolve.modules.push(env.src);

  config.resolve.alias = {
    '@': path.resolve(__dirname, 'src/components'),
    '#': path.resolve(__dirname, 'src/backend'),
    routes: path.resolve(__dirname, 'src/routes'),
    hooks: path.resolve(__dirname, 'src/hooks'),
    reducers: path.resolve(__dirname, 'src/reducers'),
    utils: path.resolve(__dirname, 'src/utils'),
    ...config.resolve.alias
  };

  // Necessary for loading Emscripten-generated scripts
  config.node.fs = 'empty';
  config.node.path = 'empty';
  config.node.crypto = 'empty';

  if (config.performance) {
    config.performance.assetFilter = (asset) => !asset.match('bbpPairingsWasm.wasm');
  }

  disableSourceMapsOnProd(config, env);

  configSizePlugin(config, helpers);
  addToCopyPlugin(config, helpers, [
    { from: 'public' },
    { from: 'backend/BbpPairings/bbpPairingsWasm.wasm' }
  ]);
  includePurgeCss(config, env, helpers);
};
