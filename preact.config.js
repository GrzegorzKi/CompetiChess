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

import purgeCssPlugin from '@fullhuman/postcss-purgecss';

function includePurgeCss(config, env, helpers) {
  const purgeCss = purgeCssPlugin({
    // Specify the paths to all the template files in your project
    content: [
      './src/**/*.html',
      './src/**/*.ts',
      './src/**/*.tsx',
      './src/**/*.js',
      './src/**/*.jsx',
    ],

    defaultExtractor: (content = '') => content.match(/[\w-/:]+(?<!:)/g) || []
  });

  const postCssLoaders = helpers.getLoadersByName(config, 'postcss-loader') || [];
  postCssLoaders.forEach(({ loader }) => {
    const plugins = loader.options.postcssOptions.plugins;

    if (env.production) {
      plugins.push(purgeCss);
    }
  });
}

export default (config, env, helpers) => {
  // Makes absolute imports possible
  config.resolve.modules.push(env.src);

  // Necessary for loading Emscripten-generated scripts
  config.node.fs = 'empty';
  config.node.path = 'empty';
  config.node.crypto = 'empty';

  includePurgeCss(config, env, helpers);
};
