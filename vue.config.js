const name = "vue-web-terminal"
const env = process.env.NODE_ENV

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
            filename: env === 'test' ? `[name].js` : `${name}.js`,
            chunkFilename: `${name}.chunk.js`,
            libraryTarget: 'umd',
            umdNamedDefine: true
        }
    },
    chainWebpack: (config) => {
        config.module
            .rule('vue')
            .use('vue-loader')
            .tap(options => {
                options.compilerOptions= {
                    isCustomElement: (tag) => tag === 'highlightjs' || tag === 'codemirror'
                }
                return options
            })
    },
};