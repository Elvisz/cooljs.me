'use strict';

// pakages
const path = require('path');
const webpack = require('webpack');

// buildin plugins
const { UglifyJsPlugin } = webpack.optimize;

// common plugins
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

// react-dev-utils plugins
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');

// variables
const ROOT = fs.realpathSync(process.cwd());
const SRC_PATH = path.resolve(ROOT, 'src');
const BUILD_PATH = path.resolve(ROOT, 'build');
const NODE_MODULES_PATH = path.resolve(ROOT, 'node_modules');
const PACKAGE_JSON_PATH = path.resolve(ROOT, 'package.json');
const TS_CONFIG_PATH = path.resolve(ROOT, 'config/tsconfig.json');
const NODE_ENV = process.env.NODE_ENV;
const PUBLIC_URL = process.env.PUBLIC_URL || '/';
const GENERATE_SOURCEMAP = process.env.GENERATE_SOURCEMAP !== 'false';

const isProd = NODE_ENV === 'production';
const isDev = NODE_ENV === 'development';

const mode = isDev ? 'development' : 'production';

const node = {
  dgram: 'empty',
  fs: 'empty',
  net: 'empty',
  tls: 'empty',
  child_process: 'empty',
};

const entry = {
  vendor: [
    'react',
    'react-dom',
    'react-router',
    'whatwg-fetch'
  ],
  app: [
    'src/index.tsx'
  ]
};

const output = {
  path: BUILD_PATH,
  pathinfo: isDev,
  filename: `static/js/[name]${isProd ? '.[chunkhash:8]' : ''}.js`,
  chunkFilename: `static/js/[name]${isProd ? '.[chunkhash:8]' : ''}.chunk.js`,
  publicPath: publicPath,
  devtoolModuleFilenameTemplate: ({ absoluteResourcePath }) => path.relative(SRC_PATH, absoluteResourcePath).replace(/\\/g, '/'),
};

const resolve = {
  extensions: [
    '.mjs',
    '.web.ts',
    '.ts',
    '.web.tsx',
    '.tsx',
    '.web.js',
    '.js',
    '.json',
    '.web.jsx',
    '.jsx',
  ],
  alias: {
    'react-native': 'react-native-web',
  },
  plugins: [
    new ModuleScopePlugin(SRC_PATH, [PACKAGE_JSON_PATH]),
    new TsconfigPathsPlugin({ configFile: TS_CONFIG_PATH }),
  ],
}

const module = {
  strictExportPresence: true,
  rules: [{
    test: /\.(js|jsx|mjs)$/,
    loader: require.resolve('source-map-loader'),
    enforce: 'pre',
    include: SRC_PATH,
  }, {
    oneOf: [
      {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
        loader: require.resolve('url-loader'),
        options: {
          limit: 10000,
          name: 'static/media/[name].[hash:8].[ext]',
        },
      },
      {
        test: /\.(js|jsx|mjs)$/,
        include: SRC_PATH,
        loader: require.resolve('babel-loader'),
        options: {
          compact: true,
        },
      },
      {
        test: /\.(ts|tsx)$/,
        include: SRC_PATH,
        use: [
          {
            loader: require.resolve('ts-loader'),
            options: {
              // disable type checker - we will use it in fork plugin
              transpileOnly: true,
            },
          },
        ],
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract(
          Object.assign(
            {
              fallback: {
                loader: require.resolve('style-loader'),
                options: {
                  hmr: false,
                },
              },
              use: [
                {
                  loader: require.resolve('css-loader'),
                  options: {
                    importLoaders: 1,
                    minimize: true,
                    sourceMap: shouldUseSourceMap,
                  },
                },
                {
                  loader: require.resolve('postcss-loader'),
                  options: {
                    // Necessary for external CSS imports to work
                    // https://github.com/facebookincubator/create-react-app/issues/2677
                    ident: 'postcss',
                    plugins: () => [
                      require('postcss-flexbugs-fixes'),
                      autoprefixer({
                        browsers: [
                          '>1%',
                          'last 4 versions',
                          'Firefox ESR',
                          'not ie < 9', // React doesn't support IE8 anyway
                        ],
                        flexbox: 'no-2009',
                      }),
                    ],
                  },
                },
              ],
            },
            extractTextPluginOptions
          )
        ),
      },
      {
        loader: require.resolve('file-loader'),
        exclude: [/\.js$/, /\.html$/, /\.json$/],
        options: {
          name: 'static/media/[name].[hash:8].[ext]',
        },
      },
    ],
  },
  ],
};

const minimizer = [
  new UglifyJsPlugin({
    cache: true,
    parallel: true,
    sourceMap: true,
    uglifyOptions: {
      warnings: false
    }
  }),
  new OptimizeCSSAssetsPlugin({})
];

const config = {
  mode,
  node,
  entry,
  output,
  resolve,
  module,
  minimizer,
  // Don't attempt to continue if there are any errors.
  bail: true,
  // on real production environment, will not provide any source-map
  devtool: false,
  plugins: []
}

if (isDev) {
  // add react hot module replacement
  app.unshift(require.resolve('react-dev-utils/webpackHotDevClient'));

  // A SourceMap without column-mappings that simplifies loader Source Maps to a single mapping per line.
  config.devtool = 'cheap-module-source-map';
} else {
  if (GENERATE_SOURCEMAP) {
    config.devtool = 'source-map';
  }
}

config.module.rules.push({
  test: /\.(js|jsx|mjs)$/,
  loader: require.resolve('source-map-loader'),
  enforce: 'pre',
  include: SRC_PATH,
});


module.exports = {

  plugins: [
    // Makes some environment variables available in index.html.
    // The public URL is available as %PUBLIC_URL% in index.html, e.g.:
    // <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
    // In production, it will be an empty string unless you specify "homepage"
    // in `package.json`, in which case it will be the pathname of that URL.
    new InterpolateHtmlPlugin(env.raw),
    // Generates an `index.html` file with the <script> injected.
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appHtml,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    }),
    // Makes some environment variables available to the JS code, for example:
    // if (process.env.NODE_ENV === 'production') { ... }. See `./env.js`.
    // It is absolutely essential that NODE_ENV was set to production here.
    // Otherwise React will be compiled in the very slow development mode.
    new webpack.DefinePlugin(env.stringified),
    // Minify the code.
    new UglifyJsPlugin({
      parallel: true,
      cache: true,
      uglifyOptions: {
        ecma: 8,
        compress: {
          warnings: false,
          // Disabled because of an issue with Uglify breaking seemingly valid code:
          // https://github.com/facebookincubator/create-react-app/issues/2376
          // Pending further investigation:
          // https://github.com/mishoo/UglifyJS2/issues/2011
          comparisons: false,
        },
        mangle: {
          safari10: true,
        },
        output: {
          comments: false,
          // Turned on because emoji and regex is not minified properly using default
          // https://github.com/facebookincubator/create-react-app/issues/2488
          ascii_only: true,
        },
      },
      sourceMap: shouldUseSourceMap,
    }),
    // Note: this won't work without ExtractTextPlugin.extract(..) in `loaders`.
    new ExtractTextPlugin({
      filename: cssFilename,
    }),
    // Generate a manifest file which contains a mapping of all asset filenames
    // to their corresponding output file so that tools can pick it up without
    // having to parse `index.html`.
    new ManifestPlugin({
      fileName: 'asset-manifest.json',
    }),
    // Generate a service worker script that will precache, and keep up to date,
    // the HTML & assets that are part of the Webpack build.
    new SWPrecacheWebpackPlugin({
      // By default, a cache-busting query parameter is appended to requests
      // used to populate the caches, to ensure the responses are fresh.
      // If a URL is already hashed by Webpack, then there is no concern
      // about it being stale, and the cache-busting can be skipped.
      dontCacheBustUrlsMatching: /\.\w{8}\./,
      filename: 'service-worker.js',
      logger(message) {
        if (message.indexOf('Total precache size is') === 0) {
          // This message occurs for every build and is a bit too noisy.
          return;
        }
        if (message.indexOf('Skipping static resource') === 0) {
          // This message obscures real errors so we ignore it.
          // https://github.com/facebookincubator/create-react-app/issues/2612
          return;
        }
        console.log(message);
      },
      minify: true,
      // For unknown URLs, fallback to the index page
      navigateFallback: publicUrl + '/index.html',
      // Ignores URLs starting from /__ (useful for Firebase):
      // https://github.com/facebookincubator/create-react-app/issues/2237#issuecomment-302693219
      navigateFallbackWhitelist: [/^(?!\/__).*/],
      // Don't precache sourcemaps (they're large) and build asset manifest:
      staticFileGlobsIgnorePatterns: [/\.map$/, /asset-manifest\.json$/],
    }),
    // Moment.js is an extremely popular library that bundles large locale files
    // by default due to how Webpack interprets its code. This is a practical
    // solution that requires the user to opt into importing specific locales.
    // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
    // You can remove this if you don't use Moment.js:
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    // Perform type checking and linting in a separate process to speed up compilation
    new ForkTsCheckerWebpackPlugin({
      async: false,
      tsconfig: paths.appTsConfig,
      tslint: paths.appTsLint,
    }),
  ],
  // Some libraries import Node modules but don't use them in the browser.
  // Tell Webpack to provide empty mocks for them so importing them works.
  node: {
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty',
  },
};
