import path from 'path'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
// TODO fix bundle.js output !

const articleStyleConfig = {
  context: path.join(__dirname, 'app/style/'),
  entry: './read-mode-article.scss',
  output: {
    path: path.join(__dirname, '/dist/'),
    publicPath: '/public/'
  },
  resolveLoader: {
    modulesDirectories: [
      path.join(__dirname, './node_modules')
    ]
  },
  module: {
    loaders: [
      {
        test: /\.s?css$/,
        loader: ExtractTextPlugin.extract('style', 'css!sass')
      }, {
        test: /.(png|woff(2)?|eot|ttf|svg)(\?[a-z0-9=\.]+)?$/,
        loader: 'file?name=fonts/[name].[ext]'
      },
    ]
  },
  plugins: [
    // Output extracted CSS to a file
    new ExtractTextPlugin('read-mode-article.css')
  ]
}

export default articleStyleConfig
