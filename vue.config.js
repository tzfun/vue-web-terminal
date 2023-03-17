const name = "vue-web-terminal"
// let path = require('path')

module.exports = {
    publicPath: './',
    css: {
        extract: false
    },
    runtimeCompiler: true,
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
    // chainWebpack: (config) => {
    //     const dir = path.resolve(__dirname, 'public/svg')
    //     config.module
    //         .rule('svg-sprite')
    //         .test(/\.svg$/)
    //         .include.add(dir)
    //         .end()
    //         .use('svg-sprite-loader')
    //         .loader('svg-sprite-loader')
    //         .options({extract: false})
    //         .end()
    //
    //     config.plugin('svg-sprite').use(require('svg-sprite-loader/plugin'), [{plainSprite: true}])
    //     config.module.rule('svg').exclude.add(dir)

        //     config.plugins.delete('preload')
        //     config.plugins.delete('prefetch')
        //     config.plugins.delete('html')

        //     config.module
        //         .rule("js")
        //         .include.add(path.resolve(__dirname, "packages"))
        //         .end()
        //         .use("babel")
        //         .loader("babel-loader")
        //         .tap((options) => {
        //             return options;
        //         });

        //     config.optimization
        //         .minimize(false)
        //         .minimizer('terser')
        //         .tap(args => {
        //             let {terserOptions} = args[0];
        //             terserOptions.compress.drop_console = false;
        //             terserOptions.compress.drop_debugger = true;
        //             return args
        //         });
    // },
};