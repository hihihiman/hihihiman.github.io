# FixIt主题美化


### 方案

#### 省流版

- 主题：Hugo + FixIt
- 部署：Git + GitHub Workflows
- 图床：Picgo + Aliyun OSS
- 域名：GitHub Pages + Netlify + Aliyun
- 评论：Giscus

#### 完整版

1. 使用 Git 进行版本控制，并结合 GitHub Workflows 实现了自动化部署和贪食蛇效果。
2. 使用了 Picgo 作为图床工具，并将图片上传至阿里云 OSS（对象存储服务）。
3. 起初使用 GitHub Pages 作为博客的托管平台，并将自定义域名绑定到 GitHub Pages；后来使用 Netlify 作为 CDN，博客页面的平均加载时间缩短了约 50%，提高了用户的访问速度。
4. 集成了 Giscus 评论系统，基于GitHub Issues，提供了一个简洁且易于使用的评论功能。

### 分享几个链接吧

<!--more-->

- 针对 LoveIt 主题（FixIt 的前身）：https://lewky.cn/posts/hugo-3.html/

- 基于 Hexos Fluid 的很好看的博客：https://nyimac.gitee.io/

- 我的 FixIt 主题博客很多地方都借鉴了毕少侠：http://geekswg.js.cool/

- Github 贪食蛇制作指南：https://cloud.tencent.com/developer/article/1935739

- markdown 写作中的emoji表情包：https://hugoloveit.com/zh-cn/emoji-support/

- 通过Netlify配置阿里云域名：https://blog.csdn.net/mqdxiaoxiao/article/details/96365253

- 通过 giscus 配置评论区：https://www.jianshu.com/p/a8a4dc99c0c7

  - 最终还是取消了，为什么评论系统都需要科学上网？！
  
  ![](https://publicpictures.oss-cn-hangzhou.aliyuncs.com/img/github-contribution-grid-snake.svg)
  

我肯定不是没怎么写代码，而是被贪食蛇吃掉了!



---

> 作者: 都将会  
> URL: https://leni.fun/blog_beautify/  

