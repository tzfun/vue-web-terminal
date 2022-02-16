const path = require("path");
const name = "vue-web-terminal"
module.exports = {
    pages: {
        index: {
            entry: "src/index.js"
        },
    },
    configureWebpack: {
        output: {
            filename: `${name}.js`,
            chunkFilename: `${name}.chunk.js`,
            libraryTarget: 'umd',
            umdNamedDefine: true
        }
    },
    css: {
        extract: {
            filename: `${name}.css`,
            chunkFilename: `${name}.chunk.css`
        }
    },
    chainWebpack: (config) => {
        config.module
            .rule("js")
            .include.add(path.resolve(__dirname, "packages"))
            .end()
            .use("babel")
            .loader("babel-loader")
            .tap((options) => {
                return options;
            });
    }
};