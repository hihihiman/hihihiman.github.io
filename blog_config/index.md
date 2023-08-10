# Hugo+FixIt 主题配置文件分享


### 分享我自己的核心配置类

主题采用 FixIt，将配置文件放在域名根目录下，例如我的文件路径就是 `leni.fun/hugo.yml`，我这里使用 yml 替换 toml 文件，可以通过以下网站进行文件转换，也可以直接复制我的配置文件进行更改

> [https://transform.tools/toml-to-yaml](https://transform.tools/toml-to-yaml)  

<!--more-->

```yaml
# 此处 yml 优先级更高
# 网址
baseURL: https://leni.fun
# 中文支持
languageCode: zh-CN
defaultContentLanguage: zh-cn
# 是否包括中日韩文字
hasCJKLanguage: true
# 主题
theme: FixIt

menu:
  main:
    - identifier: posts
      pre: ""
      post: ""
      name: 技术
      url: /posts/
      title: ""
      weight: 1
      params:
        class: ""
        draft: false
        icon: fa-solid fa-archive
        type: ""
    - identifier: categories
      parent: posts
      pre: ""
      post: ""
      name: 分类
      url: /categories/
      title: ""
      weight: 11
      params:
        icon: fa-solid fa-th
    - identifier: tags
      parent: posts
      pre: ""
      post: ""
      name: 标签
      url: /tags/
      title: ""
      weight: 12
      params:
        icon: fa-solid fa-tags
    - identifier: life
      name: 生活
      url: /life/
      weight: 2
      params:
        class: ""
        draft: false
        icon: fa-solid fa-camera-alt
        # 这样就不用创建 layouts/life/single.html，使用和 post 相同的样式
        type: post
    - identifier: friends
      name: 友链
      url: /friends/
      weight: 8
      params:
        icon: fa-solid fa-users
    - identifier: about
      name: 关于
      url: /about/
      weight: 9
      params:
        icon: fa-solid fa-info-circle
params:
  description: 思绪来去如风，但愿有所停留。
  # 用于 SEO
  keywords:
    - Hugo
    - FixIt
    - 都将会
    - 博客
    - Github
    - 技术沉淀
    - 后端
    - Java
    - MySQL
    - 微服务
    - 杭州
  defaultTheme: dark
  dateFormat: 2006-01-02
  images:
    - /images/avatar.jpg
  app:
    title: 都将会的 APP
  search:
    enable: true
    type: fuse
    contentLength: 9999000
    placeholder: "关键词搜索"
    maxResultLength: 10
    snippetLength: 50
    fuse:
      ignoreLocation: true
      useExtendedSearch: true
      ignoreFieldNorm: true
  header:
    title:
      logo: /images/icon.png
      name: 都将会
      typeit: false
    subtitle:
      name: 的博客
      typeit: true
  # 面包屑导航
  breadcrumb:
    enable: true
    sticky: true
    showHome: true
  footer:
    hugo: false
    since: 2023
    wordCount: true
    license: 后端开发工程师
    # 网站创立时间
    siteTime:
      enable: true
      icon: fa-solid fa-heartbeat
      value: 2023-08-06T23:31:00+08:00
    # 排序
    order:
      powered: 0
      copyright: 5
      statistics: 0
      visitor: 4
      beian: 0
  section:
    paginate: 20
    dateFormat: 01-02
    rss: 10
    # 最近更新
    recentlyUpdated:
      enable: false
      rss: false
      days: 30
      maxCount: 10
  # 词云
  tagcloud:
    enable: true
    min: 18
    max: 32
    peakCount: 5
    orderby: name
  home:
    rss: 10
    profile:
      enable: true
      gravatarEmail: ""
      avatarURL: images/avatar.jpg
      avatarMenu: ""
      title: Thoughts come and go like the breeze, seeking a haven to dwell.
      subtitle: 思绪来去如风，但愿有所停留。
      typeit: true
      social: true
      disclaimer: 博客仅用于技能备忘和知识沉淀，侵删:)
    posts:
      enable: true
      paginate: 12
  social:
    GitHub: hihihiman
    QQ: 2869314652
    QQGroup: ""
    Phone: ""
    Email: dujianghui_work@163.com
    RSS: false
  page:
    # 画廊
    lightgallery: force
    # 阅读原文
    linkToMarkdown: false
    # 保存阅读进度
    autoBookmark: true
    wordCount: true
    readingTime: true
    endFlag: ""
    # 开启即时页面
    instantPage: true
    repost:
      enable: false
      url: ""
    toc:
      keepStatic: true
      position: right
    expirationReminder:
      enable: true
      reminder: 365
      warning: 730
      closeComment: true
    code:
      copy: true
      edit: true
      maxShownLines: 1024
    reward:
      enable: true
      animation: true
      position: after
      mode: static
      ways:
        wechatpay: /images/wechatpay.jpg
        alipay: /images/alipay.png
      # paypal = "/images/paypal.png"
      # bitcoin = "/images/bitcoin.png"
    share:
      enable: true
      Twitter: false
      Facebook: false
      Weibo: true
    comment:
      # 国内暂时没找到能用的，都需要科学上网！
      enable: false
      giscus: # 配置教程链接放在该系列的上篇文章了
        enable: true
        repo: hihihiman/hihihiman.github.io
        repoId: *****
        category: Announcements
        categoryId: *****
        mapping: pathname
    # todo seo优化
    seo:
      images: []
      publisher:
        name: ""
        logoUrl: ""
  typeit:
    speed: 100
    cursorSpeed: 1000
    cursorChar: "_"
    duration: -1
    loop: true
    loopDelay: 6000
  mermaid:
    themes:
      - default
      - dark
  pangu:
    enable: true
    selector: article
  watermark:
    enable: false
    content: "都将会"
    opacity: 0.1
    appendTo: .wrapper>main
    width: 300
    height: 50
    rowSpacing: 300
    colSpacing: 100
    rotate: -30
    fontSize: 2
    fontFamily: inherit
  ibruce:
    enable: true
    enablePost: true
  githubCorner:
    enable: true
    permalink: https://github.com/hihihiman/hihihiman.github.io
    title: 博客源码
    position: left
  # FixIt 取决于作者邮箱，作者邮箱未设置则使用本地头像
  gravatar:
    enable: false
    host: www.gravatar.com
  backToTop:
    enable: true
    scrollpercent: true
  # 阅读进度条
  readingProgress:
    enable: true
    start: left
    position: bottom
    reversed: false
    height: 2px
  # 加载时动画
  pace:
    enable: true
    # 所有可用颜色：
    # ["black", "blue", "green", "orange", "pink", "purple", "red", "silver", "white", "yellow"]
    color: pink
    # 还不错的主题：
    # ["barber-shop", "bounce", "center-atom", "loading-bar", "mac-osx", "material", "minimal"]
    theme: center-atom
  # 自定义路径
  customFilePath: {}
  # aside = "custom/aside.html"
  # profile = "custom/profile.html"
  # footer = "custom/footer.html"
  dev:
    enable: false
    c4u: false
    githubToken: ""
    mDevtools:
      enable: false
      type: vConsole
markup:
  highlight:
    codeFences: true
    lineNos: true
    lineNumbersInTable: true
    noClasses: false
    guessSyntax: true
  goldmark:
    extensions:
      definitionList: true
      footnote: true
      linkify: true
      strikethrough: true
      table: true
      taskList: true
      typographer: true
    renderer:
      # 是否在文档中直接使用 HTML 标签
      unsafe: true
  tableOfContents:
    startLevel: 2
    endLevel: 6
author:
  name:  都将会
  email: dujianghui_work@163.com
  link: ""
  avatar: /images/avatar.jpg
# 网站地图配置
sitemap:
  changefreq: weekly
  filename: sitemap.xml
  priority: 0.5
Permalinks:
  posts: :filename
privacy:
  twitter:
    enableDNT: true
  youtube:
    privacyEnhanced: true
mediaTypes:
  text/markdown:
    suffixes:
      - md
  text/plain:
    suffixes:
      - txt
outputFormats:
  MarkDown:
    mediaType: text/markdown
    isPlainText: true
    isHTML: false
  BaiduUrls:
    baseName: baidu_urls
    mediaType: text/plain
    isPlainText: true
    isHTML: false
outputs:
  home:
    - HTML
    - RSS
    - JSON
    - BaiduUrls
  page:
    - HTML
    - MarkDown
  section:
    - HTML
    - RSS
  taxonomy:
    - HTML
    - RSS
  taxonomyTerm:
    - HTML
module:
  hugoVersion:
    extended: true
    min: 0.109.0
```

初来乍到，其实还有几个疑问：

1. 什么是 RSS ，看起来像一个源文件的格式，开启有什么作用？
2. 页脚的证书有什么规范吗，如果不写会不会有什么隐患？

这篇文章开个评论吧，欢迎与我交流讨论。


---

> 作者: 都将会  
> URL: https://leni.fun/blog_config/  

