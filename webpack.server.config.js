var webpack = require("webpack"),
  path = require("path"),
  CopyWebpackPlugin = require("copy-webpack-plugin"),
  HtmlWebpackPlugin = require("html-webpack-plugin"),
  TerserPlugin = require("terser-webpack-plugin");
var { CleanWebpackPlugin } = require("clean-webpack-plugin");

const ASSET_PATH = process.env.ASSET_PATH || "/";

const isDevelopment = process.env.NODE_ENV !== "production";

const options = {
  target: "node",
  mode: process.env.NODE_ENV || "development",
  entry: {
    index: path.join(__dirname, "server", "index.tsx"),
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.css', '.scss', '.png', '.svg'],
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "build", "server"),
    clean: true,
    publicPath: ASSET_PATH,
  },
  module: {
    rules: [
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        use: [
          'file-loader',
          {
            loader: 'image-webpack-loader',
            options: {
              publicPath: 'assets',
              bypassOnDebug: true, // webpack@1.x
              disable: true, // webpack@2.x and newer
            },
          },
        ],
      },
      {
        // look for .css or .scss files
        test: /\.(css|scss)$/,
        // in the `web` directory
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
            options: { importLoaders: 1 },
          },
          {
            loader: "postcss-loader",
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.node$/,
        use: 'node-loader',
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules\/(?!(tlsn-js|tlsn-js-v5)\/).*/,
        use: [
          {
            loader: require.resolve("ts-loader"),
            options: {
              transpileOnly: isDevelopment,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin({ verbose: false }),
    new webpack.ProgressPlugin(),
    new webpack.EnvironmentPlugin(["NODE_ENV"]),
  ].filter(Boolean),
  infrastructureLogging: {
    level: "info",
  },
};

if (process.env.NODE_ENV === "development") {
  options.devtool = "cheap-module-source-map";
} else {
  options.optimization = {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
      }),
    ],
  };
}

module.exports = options;
