const path = require("path");
const HTMLPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  entry: "./src/app.js", //собирает все приложение отсюда 
  output: {
    filename: "bundle.[chunkhash].js",  //работает без чистки кэша, вместо чанка будет подставляться уникальный хэш чтобы не обновлять страницу браузера
    path: path.resolve(__dirname, "public"), //npm run build запустит public
  },
  devServer: {
    port: 3000, //порт на котором стартует сервер
    historyApiFallback: true,
  },
  devtool: 'source-map',
  plugins: [
    new HTMLPlugin({
      template: "./src/index.html", //делать шаблоны html
    }),
    new CleanWebpackPlugin(), // очищать папку build при повторном перестроении
  ],
  module: {
    rules: [ //как обрабатывать файлы с заданнми разрешениями - пакеты
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          "style-loader",
          // Translates CSS into CommonJS
          "css-loader",
          // Compiles Sass to CSS
          "sass-loader",
        ],
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader",
            options: {
              minimize: true, //формирует в одну строку
            },
          },
        ],
      },
    ],
  },
};


