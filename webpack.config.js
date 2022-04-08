let path = require('path')
let webpack = require('webpack')
const {VueLoaderPlugin} = require("vue-loader");
const name = "vue-web-terminal"
const UglifyPlugin = require("uglifyjs-webpack-plugin");

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, './lib'),
        filename: `${name}.js`,
        library: `${name}`,
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    externals: {
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'vue-style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    loaders: {}
                    // other vue-loader options go here
                },
                exclude: path.resolve(__dirname, "node_modules")
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: path.resolve(__dirname, "node_modules"),
                include: path.resolve(__dirname, "src"),
            },
            {
                test: /\.(png|jpg|svg)$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]?[hash]'
                },
                exclude: path.resolve(__dirname, "node_modules")
            }
        ],
    },
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.esm.js',
            '@': './src/'
        },
        extensions: ['*', '.js', '.vue', '.json', '.css']
    },
    devServer: {
        historyApiFallback: true,
        noInfo: true,
        overlay: true
    },
    performance: {
        hints: false
    },
    devtool: 'nosources-source-map',
    plugins: (module.exports.plugins || []).concat([
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true
        }),
        new VueLoaderPlugin(),
        new UglifyPlugin()
    ])
}