const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',            // Точка входа
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  mode: 'production',                 // или 'development'
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',   // наш HTML-шаблон
      // Если хотите просто сгенерировать без шаблона:
      // title: "Ion-SFU gRPC Web Client"
    })
  ]
};
