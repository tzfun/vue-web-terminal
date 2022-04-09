let path = require('path')
const name = "vue-web-terminal"

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
            .rule('svg')
            .test(/\.svg$/)
            .exclude.add(path.resolve(__dirname, "node_modules/vue3-json-viewer/dist"))
            .end()

        const svgRule = config.module.rule('svg')
        svgRule.uses.clear()

        svgRule.use('file-loader').loader('file-loader')

        config.module
            .rule('vue')
            .use('vue-loader')
            .tap(options => {
                options.compilerOptions= {
                    isCustomElement: (tag) => tag === 'highlightjs' || tag === 'codemirror'
                }
                return options
            })

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