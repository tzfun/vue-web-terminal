let path = require('path')
const {VueLoaderPlugin} = require("vue-loader");
const name = "vue-web-terminal"
const TerserPlugin = require("terser-webpack-plugin");

const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, './lib'),
        filename: `${name}.js`,
        library: `${name}`,
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    externals: {},
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'vue-style-loader',
                    'style-loader',
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
                type: 'asset',
                options: {
                    name: '[name].[ext]?[hash]'
                },
                include: path.resolve(__dirname, "node_modules/vue3-json-viewer"),
                exclude: path.resolve(__dirname, "node_modules")
            }
        ],
    },
    resolve: {
        alias: {
            'vue$': "vue/dist/vue.esm-bundler.js",
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
        new VueLoaderPlugin(),
        new TerserPlugin({
            terserOptions: {
                // https://github.com/terser/terser#minify-options
                compress: {
                    warnings: false, // 删除无用代码时是否给出警告
                    drop_debugger: true, // 删除所有的debugger
                    // drop_console: true, // 删除所有的console.*
                    pure_funcs: [''],
                    // pure_funcs: ['console.log'], // 删除所有的console.log
                },
            },
        }),
        new CssMinimizerPlugin()
    ]),
}