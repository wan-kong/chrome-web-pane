# NetWanter

> 一个基于 Vite + Vue 3 + TypeScript 构建的强大Chrome DevTools扩展，专门用于高级网络请求分析和监控（Manifest v3）

## 功能特性

- 🌐 **高级网络监控** - 实时捕获和分析所有网络请求
- 🔍 **智能搜索过滤** - 支持按URL、方法、状态码等多种条件筛选请求
- 📊 **详细请求分析** - 查看请求/响应头、请求体、Cookies等详细信息
- 🎨 **现代化界面** - 基于Tailwind CSS的美观响应式界面
- ⚡ **实时监控** - 支持开始/停止网络活动录制
- 📋 **多格式支持** - 支持JSON、原始文本等多种数据格式查看
- 🛠️ **开发者友好** - 专为Web开发者优化的工具

## 技术栈

- **前端框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **UI框架**: Tailwind CSS
- **Chrome扩展**: Manifest v3
- **开发工具**: ESLint + Prettier

## 环境要求

1. 确保您的 `Node.js` 版本 >= **16.0.0**
2. 推荐使用 `pnpm` 作为包管理器

## 安装和开发

### 克隆项目

```shell
git clone <repository-url>
cd chrome-web-pane
```

### 安装依赖

```shell
pnpm install
# 或者
npm install
```

### 开发模式

```shell
pnpm dev
# 或者
npm run dev
```

### Chrome扩展开发者模式配置

1. 打开Chrome浏览器，进入扩展管理页面 `chrome://extensions/`
2. 开启右上角的"开发者模式"
3. 点击"加载已解压的扩展程序"，选择项目的 `build` 文件夹
4. 打开任意网页，在开发者工具中找到"Chrome Web Network Analyzer"选项卡

## 构建和打包

### 生产构建

```shell
pnpm build
# 或者
npm run build
```

### 打包为ZIP

```shell
pnpm zip
# 或者
npm run zip
```

构建完成后，`build` 文件夹将包含可以提交到Chrome Web Store的扩展文件。

## 使用说明

1. 在Chrome开发者工具中打开"Chrome Web Network Analyzer"面板
2. 点击"开始"按钮开始监听网络活动
3. 在页面中进行操作触发网络请求
4. 在列表中点击任意请求查看详细信息
5. 使用搜索框和方法过滤器来快速找到特定请求

## 发布

要将扩展发布到Chrome Web Store，请参考[官方指南](https://developer.chrome.com/webstore/publish)获取更多发布信息。


## 许可证

MIT License

---

由 [create-chrome-ext](https://github.com/guocaoyi/create-chrome-ext) 生成的项目模板
