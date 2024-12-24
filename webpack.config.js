const path = require('path');

module.exports = {
  entry: './src/index.js',          // Точка входа (наш основной JS)
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'           // Выходной бандл
  },
  mode: 'production',               // Или 'development'
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',   // Если хотите использовать Babel
          options: {
            // Настройки Babel (опционально)
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
};
