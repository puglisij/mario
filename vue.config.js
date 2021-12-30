
// process.env.NODE_ENV === "production"
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
    .BundleAnalyzerPlugin;
    
module.exports = {
  publicPath: "./",
  devServer: {
    port: 8898
  },
  configureWebpack: {
    target: "node-webkit", // Set the target to node-webkit (https://webpack.js.org/configuration/target/)
    node: false, // Don't set certain Node globals/modules to empty objects (https://webpack.js.org/configuration/node/)
    //devtool: "source-map",
    devServer: {
        watchOptions: {
            ignored: ["**/*.json", "**/*.logs"]
        }
    },
    plugins: [
        //new BundleAnalyzerPlugin({ analyzerPort: 8890 })
    ],
    optimization: {
        usedExports: true,
        sideEffects: false 
        //[
            //"./src/some-side-effectful-file.js"
        //]
    }
  },
  css: {
    loaderOptions: {
      sass: {
        additionalData: `
        @import "@/styles/_variables.scss";
        @import "@/styles/_mixins.scss";
        `
      }
    }
  },
  chainWebpack: config => {
    config.module
    .rule('node')
    .test(/.node$/)
    .use('node-loader')
    .loader('node-loader')
    .end()
  }
//   ,chainWebpack: config => {
//       config.devtool("source-map")
//   }
//   ,chainWebpack: config => {
//     // Also see .env file for environment variables https://cli.vuejs.org/guide/mode-and-env.html#environment-variables
//     config
//         .plugin("define")
//         .tap(args => {
//             args[0]["process.env"]["HOST_DIR"] = process.env.NODE_ENV == "production" ? "'/dist'" : "'/public'";
//             return args;
//         })
//   }
};
