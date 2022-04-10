const name = "vue-web-terminal"
let path = require('path')

module.exports = {
    publicPath: './',
    css: {
        extract: false
    },
    runtimeCompiler:true,
    productionSourceMap: false,
    filenameHashing: false,
    configureWebpack: {
        output: {
            filename: `${name}.js`,
            chunkFilename: `${name}.chunk.js`,
            libraryTarget: 'umd',
            umdNamedDefine: true
        }
    },
    chainWebpack: (config) => {
        config.plugins.delete('preload')
        config.plugins.delete('prefetch')
        config.plugins.delete('html')

        config.module
            .rule("js")
            .include.add(path.resolve(__dirname, "packages"))
            .end()
            .use("babel")
            .loader("babel-loader")
            .tap((options) => {
                return options;
            });

        config.optimization
            .minimize(true)
            .minimizer('terser')
            .tap(args => {
                let {terserOptions} = args[0];
                terserOptions.compress.drop_console = false;
                terserOptions.compress.drop_debugger = true;
                return args
            });
    },
};