# HCView-H5
一套类似word或wps用于文字排版相关功能的代码件，有Delphi、C#、Html5、C++(暂未完成)四个版本，可用在电子病历或其他文书系统里。
[http://hcview.cn/](http://hcview.cn/)是一个在线的示例，你也可以加入QQ群 649023932 来获取更多的技术交流。
![图片说明](https://github.com/59079096/hcview-H5/blob/master/page.png)

## 开发
### 说明
本项目使用纯JavaScript开发，不依赖任何一款JavaScript插件、框架。 你可以不需要安装后续文档中的`nodejs`工具，以及配置中依赖的插件。后续这些操作，都是为了打包项目的需要。 

### 开发要求
- [Node 10+](https://npm.taobao.org/mirrors/node/v10.18.1/)

### 准备开始
```bash
# 因默认npm registry访问缓慢，请替换为国内的镜像
npm config set registry https://registry.npm.taobao.org 
# 或者安装cnpm(强烈建议)
npm install -g cnpm --registry=https://registry.npm.taobao.org


# 还原依赖
cnpm install

# 运行项目, 访问http://localhost:8080
cnpm run dev

# 编译项目, 所有输出在dist目录
cnpm run build

```
