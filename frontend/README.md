# frontend (Vue 3 + Vite)

这是项目的前端目录，目标是让新入门 Vue 3 的同学可以快速开始开发。

## 1. 你需要先安装什么

- Node.js 20+
- npm（或 pnpm）

检查版本：

```bash
node -v
npm -v
```

## 2. 本地启动

在 `frontend` 目录执行：

```bash
npm install
npm run dev
```

打开终端输出的地址（默认通常是 `http://localhost:5173`）。

## 3. 打包发布

```bash
npm run build
```

构建后会生成 `dist`（本项目已配置输出到仓库根目录 `../dist`），可交给 Nginx 托管。

## 4. 当前代码结构（最小可用）

```text
frontend/
├─ src/
│  ├─ App.vue                # 应用壳子（顶部栏 + RouterView）
│  ├─ main.ts                # Vue 入口，挂载 Pinia + Router
│  ├─ router/
│  │  └─ index.ts            # 路由配置（当前只有首页）
│  ├─ views/
│  │  └─ HomeView.vue        # 首页，演示如何调用后端 API
│  └─ api/
│     ├─ http.ts             # fetch 实例（统一 baseURL/超时）
│     └─ home.ts             # 首页相关 API 函数
└─ vite.config.ts            # Vite 配置
```

## 5. 前端如何调用后端 API

本项目采用前后端分离：

- 前端不直接操作数据库
- 前端只调用后端接口（HTTP）

示例：

- `src/api/http.ts` 统一创建 fetch：`baseURL: '/api'`
- `src/api/home.ts` 定义 `getHealth()` 调用 `/api/health`
- `src/views/HomeView.vue` 在页面加载时请求数据并展示

这样做的好处：

- 页面代码简洁
- API 统一管理
- 后续接 Nginx 反向代理更容易

## 6. 什么是 HTML5 History 模式

Vue Router 的 HTML5 History 模式，指的是使用浏览器原生 History API（`pushState` / `replaceState`）来切换路由。

它的特点：

- URL 更干净：`/user/list`（没有 `#`）
- 更像传统网站路径，用户体验更自然

对比 Hash 模式：

- Hash 模式 URL 通常是：`/#/user/list`
- History 模式 URL 通常是：`/user/list`

注意事项（部署时很重要）：

- 当用户直接访问 `http://your-domain.com/user/list` 时，服务器要返回 `index.html`
- 所以 Nginx 需要配置：`try_files $uri $uri/ /index.html;`

本项目 `src/router/index.ts` 的这行就是在启用它：

```ts
history: createWebHistory(import.meta.env.BASE_URL)
```

## 7. 新手最常改的地方

1. 改页面样式和内容：`src/views/HomeView.vue`
2. 新增接口函数：`src/api/*.ts`
3. 新增页面并配置路由：`src/views/*.vue` + `src/router/index.ts`

## 8. 新增一个页面（模板步骤）

1. 在 `src/views` 新建 `DemoView.vue`
2. 在 `src/router/index.ts` 里加路由
3. 在 `App.vue` 或导航组件里加入口按钮

## 9. 常见问题

1. `找不到 @tsconfig/node24`：通常是依赖未安装或 IDE 解析目录不对，先执行 `npm install`。
2. `调用 /api/health 失败`：后端没启动，或者 Nginx/Vite 代理没配好。
3. `build 失败提示 fetch 找不到`：执行 `npm install fetch`。

## 10. 推荐开发习惯

1. 每新增一个接口，都在 `src/api` 单独建文件，不要把请求直接写死在页面里。
2. 页面里统一处理 `loading`、`error`、`empty` 三种状态。
3. 先做最小可用页面，确认接口通了，再逐步加复杂功能。
