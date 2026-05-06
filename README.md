# service-data-gateway-dtu

数据枢纽的核心功能。

## 项目背景理解

当前开发环境是 **WSL**，目标部署环境是单片机侧（或其配套系统）使用 **Nginx** 托管 Web 页面。

由于项目采用前后端分离架构，当前阶段先在 WSL 中安装并配置 Nginx 进行本地模拟验证：

- 前端使用 **Vue 3** 进行设计与开发，构建后的静态资源由 Nginx 托管（如 `html/js/css`）。
- 后端服务独立运行，前端通过接口访问后端。
- 先在 WSL 完成可用性验证，再迁移到单片机目标环境，降低联调与部署风险。

## 环境搭建软件

建议安装以下软件用于本地开发与模拟：

- `WSL2`：Windows 下的 Linux 开发环境。
- `Ubuntu 22.04 LTS`（WSL 发行版）：作为主要开发系统。
- `Node.js 18+`：运行 Vue 3 / Vite 开发环境。
- `npm` 或 `pnpm`：前端依赖管理工具。
- `Nginx`：托管前端构建产物并模拟部署环境。
- `Git`：代码版本管理。
- `VS Code` + `Remote - WSL` 插件：跨 Windows/WSL 开发。
- `curl`：接口连通性与本地调试。

## Vue 3 推荐项目结构

下面是参考常见 Vue 3（Vite）项目的目录结构，适合前后端分离场景：

```text
service-data-gateway-dtu/
├─ README.md
├─ package.json
├─ vite.config.ts
├─ tsconfig.json
├─ .env.development
├─ .env.production
├─ public/
│  ├─ favicon.ico
│  └─ logo.png
├─ src/
│  ├─ main.ts
│  ├─ App.vue
│  ├─ assets/
│  │  ├─ images/
│  │  └─ styles/
│  ├─ components/
│  │  ├─ common/
│  │  └─ business/
│  ├─ views/
│  │  ├─ home/
│  │  ├─ monitor/
│  │  └─ settings/
│  ├─ router/
│  │  └─ index.ts
│  ├─ stores/
│  │  ├─ index.ts
│  │  └─ modules/
│  ├─ api/
│  │  ├─ http.ts
│  │  └─ modules/
│  ├─ utils/
│  │  ├─ auth.ts
│  │  ├─ format.ts
│  │  └─ validate.ts
│  ├─ types/
│  ├─ hooks/
│  ├─ directives/
│  ├─ layouts/
│  └─ constants/
├─ nginx/
│  └─ default.conf
└─ dist/
```

目录说明（核心）：

- `src/views`：页面级组件，一个页面一个目录，便于维护。
- `src/components`：可复用组件，建议按通用组件和业务组件拆分。
- `src/api`：接口请求层，`http.ts` 放 axios 实例与拦截器，`modules` 按业务拆分接口。
- `src/stores`：Pinia 状态管理，`modules` 按功能划分。
- `src/router`：Vue Router 路由配置与路由守卫。
- `src/assets/styles`：全局样式、变量、主题。
- `nginx/default.conf`：本地模拟与后续部署可复用的 Nginx 配置。
- `dist`：Vue 3 构建产物目录，部署时由 Nginx 托管。
