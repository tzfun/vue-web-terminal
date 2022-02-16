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
            filename: `js/${name}.js`,
            chunkFilename: `js/${name}.chunk.js`,
            libraryTarget: 'umd',
            umdNamedDefine: true
        }
    },
    css: {
        extract: {
            filename: `css/${name}.css`,
            chunkFilename: `css/${name}.chunk.css`
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