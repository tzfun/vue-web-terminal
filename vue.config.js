let isProduction = process.env.NODE_ENV === 'production'
module.exports = {
    publicPath: '/',
    productionSourceMap: !isProduction,
    chainWebpack: config =>{
        config.plugin('html')
            .tap(args => {
                args[0].title = 'vue-web-terminal在线体验'
                return args
            })
    },
    devServer: {
        port: 8888
    },
    configureWebpack: config => {
        if (isProduction) {
            config["performance"] = {
                "maxEntrypointSize" : 10_000_000,
                "maxAssetSize": 30_000_000
            }
        }
    },
    runtimeCompiler: true
}
