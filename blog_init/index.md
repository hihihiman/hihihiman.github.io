# 初始化 Hogo 博客


<!--more-->

###  选型
- Jekyll：基于 Ruby，需要前端技能
- Hexo：基于 Node.js ，主题好看，渲染慢
- Hugo：基于 Go，速度快（一秒渲染 5000 篇文章） ☑️
- JPress：商用比较多，付费
- WordPress：基于 PHP，社区活跃，界面过于简约
- Nest.js：技术较新，但生态不够完善
### 安装
```bash
# 下载
brew update
brew install hugo
# 验证
hugo version
# 创建网页
hugo new site leni.fun
# 主题
cd leni.fun
git init -b main
git submodule add https://github.com/hugo-fixit/FixIt.git themes/FixIt
# 新建文章，注意要放在 posts 目录下（这是FixIt默认的，或配置其他目录名称）
hugo new posts/xxx.md
# 修改markdown 文件的 draft=false 和内容后，部署到本地
# --disableFastRender 即时渲染
# -D 草稿（draft=true）也部署
hugo server --disableFastRender


```
### 关联 github page
创建 `<username>.github.io` 仓库
```bash
# cd 到站点根目录,生成 public 文件夹
alias hugogo='hugo -F --cleanDestinationDir'
# 以后每次就用它了
hugogo
git remote add gitee git@gitee.com:dujianghui/blog.git
git remote add github git@github.com:hihihiman/blog.git
# 校验
git remote -v
# push
git commit -am "init"
git push -u gitee master
git push -u github main
```
### 参考配置
```yaml
baseURL: https://hihihiman.github.io
languageCode: zh-CN
title: 都将会的博客
theme: FixIt
author:
  name: 都将会
params:
  author: 都将会
  subtitle: 专注于 Java、MySQL、微服务等后端技术
  keywords: Java,MySQL,微服务,都将会
  description: 思绪来去如风，但愿有所停留。
```
### tips

1. [https://transform.tools/toml-to-yaml](https://transform.tools/toml-to-yaml) 可以将 tomb 文件转换为 yml 文件，方便阅读和修改。
2. 发文章：`hugo new posts/xxx.md` + 编辑
3. 本地测试： `hugogo` +`hugo serve -D`，查看 localhost:1313
4. 部署到Page：`cd public` + `git commit -am "message"`+`git push`
5. gitee 默认主分支是 master，而 github 默认主分支是 main，需要注意

### 进阶指南
https://www.wingoftime.cn/p/setup-blog-second/
帮助你实现上传分支源码后自动部署到 Github Page ！


---

> 作者: 都将会  
> URL: https://leni.fun/blog_init/  

