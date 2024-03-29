module.exports = {
  publicPath: './',
  outputDir: './utools/dist',
  productionSourceMap: false,
  devServer: {
    proxy: {
      '/itooi': {
        target: 'https://v1.itooi.cn/',
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          '^/itooi': ''
        }
      }
    }
  },
  configureWebpack: {
    // optimization: {
    //   minimizer: [
    //     new TerserPlugin({
    //       terserOptions: {
    //         ecma: undefined,
    //         warnings: false,
    //         parse: {},
    //         compress: {
    //           drop_console: true,
    //           drop_debugger: false,
    //           pure_funcs: ['console.log'] // 移除console
    //         }
    //       }
    //     })
    //   ]
    // }
  }

}
