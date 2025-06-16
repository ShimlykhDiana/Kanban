const path = require("path");
const HTMLPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  entry: "./src/app.js", // your entry point
  output: {
    filename: "bundle.[chunkhash].js",
    path: path.resolve(__dirname, "public"), // note: output to /public folder
    publicPath: "/", // ensures correct asset URLs
  },
  resolve: {
    extensions: [".js", ".css", ".html", ".scss"],
    modules: [path.resolve(__dirname, "node_modules"), "node_modules"],
  },
  devServer: {
    port: 3000,
    historyApiFallback: true,
  },
  devtool: "source-map",
  plugins: [
    new HTMLPlugin({
      template: "./src/index.html",
      inject: "body",
    }),
    new CleanWebpackPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.s[ac]ss$/i,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader",
            options: { minimize: true },
          },
        ],
      },
    ],
  },
};