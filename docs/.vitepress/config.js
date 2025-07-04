export default {
  // 关键修复：输出到根目录的 /dist
  outDir: '../dist',

  // 基础配置（如果部署到非根路径需设置）
  base: '/',  // 如果是子路径仓库如 '/repo-name/'

  title: '晨曦学习笔记',
  description: '一个vue3组件库',

  themeConfig: {
    siteTitle: "Chenxi",
    logo: "/logo.svg",
    nav: [
      { text: "博客", link: "https://www.huchenxi.fun" },
      // 修复：链接使用全小写英文（避免中文路径问题）
      { text: "文章中心", link: "/articles/" },
    ],
    sidebar: {
      "/articles/": [
        {
          text: "组件库源码实现",
          items: [
            // 统一使用英文文件名
            { text: "组件库环境搭建", link: "/articles/setup-guide" },
            { text: "gulp的使用", link: "/articles/gulp-usage" },
            { text: "pina和vuex", link: "/articles/pina-vuex" },

          ]
        }
      ]
    }
  }
}