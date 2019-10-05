
// ref: https://umijs.org/config/
export default {
  treeShaking: true,
  plugins: [
    // ref: https://umijs.org/plugin/umi-plugin-react.html
    ['umi-plugin-react', {
      antd: true,
      dva: true,
      dynamicImport: false,
      title: 'syzoj-ng-app',
      dll: false,
      locale: {
        enable: true,
        default: 'zh-CN',
      },
      routes: {
        exclude: [
          /models\//,
          /services\//,
          /model\.(t|j)sx?$/,
          /service\.(t|j)sx?$/,
          /components\//,
        ],
      },
    }],
  ],
  urlLoaderExcludes: [/.svg$/i],
  chainWebpack(config) {
    config.module
      .rule('svg-loader')
      .test(/.svg$/i)
      .use('@svgr/webpack')
      .loader('@svgr/webpack')
  }
}
