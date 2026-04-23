# React Admin Starter

## 项目定位

`react-admin-starter` 是一套基于 React 18 + TypeScript + Ant Design 5 的后台管理前端项目，面向中后台管理场景，当前已具备与 `spring-admin-starter` 联调运行的完整基础能力。项目重点解决登录鉴权、动态菜单、路由权限、按钮权限、后台基础布局、通用列表页和系统管理页面的落地问题，适合作为后续业务模块扩展的前端基座。

当前代码已从“脚手架初始化”阶段进入“可持续扩展”阶段，README 以项目现状为准描述技术架构、运行方式、部署方式和功能边界。

## 技术架构

### 技术栈

| 类别 | 方案 |
| --- | --- |
| 前端框架 | React 18 |
| 开发语言 | TypeScript 5 |
| 构建工具 | Vite 5 |
| UI 组件库 | Ant Design 5 |
| 路由 | React Router 6 |
| HTTP 请求 | Axios |
| 状态管理 | Zustand |
| 图表 | ECharts 5 |
| 时间处理 | dayjs |
| 单元测试 | Vitest + Testing Library |

### 前端分层

项目采用按职责拆分的前端分层结构，核心目录如下：

| 目录 | 说明 |
| --- | --- |
| `src/layouts` | 认证页与后台主布局 |
| `src/routes` | 路由注册、懒加载与守卫装配 |
| `src/pages` | 页面级业务模块 |
| `src/components` | 权限组件、错误边界、公告头部组件等通用组件 |
| `src/services` | 对后端 API 的请求封装 |
| `src/stores` | Zustand 全局状态，当前主要是认证与权限状态 |
| `src/config` | 菜单配置、路由映射等静态配置 |
| `src/access` | 路由权限码映射 |
| `src/types` | 接口类型定义 |
| `src/utils` | token、浏览器存储等工具 |
| `src/hooks` | 页面复用逻辑，如公告加载与权限判断 |
| `src/mocks` | 本地演示数据定义，便于开发阶段切换 |
| `src/theme` / `src/styles` | 主题与基础样式 |

### 关键架构说明

1. 路由采用 `createBrowserRouter`，页面通过 `lazy + Suspense` 做懒加载，避免所有业务页面一次进入首屏主包。
2. `BasicLayout` 负责后台主框架，基于权限 bootstrap 结果动态过滤左侧菜单和按钮能力。
3. `RouteGuard`、`AuthGuard`、`GuestGuard` 分别处理登录态保护、登录页保护和页面级权限控制。
4. `request.ts` 基于 Axios 统一处理鉴权头、业务错误提示、401 自动刷新 token 和串行 refresh token 续签。
5. 认证信息当前写入 `sessionStorage`，并兼容迁移旧的 `localStorage` 数据，降低长期落盘 token 被复用的风险。
6. 构建层通过 `manualChunks` 拆分 `react`、`echarts` 等依赖，降低首屏包体积并减少 chunk 警告。

## 模块能力

### 认证与账号

| 模块 | 说明 |
| --- | --- |
| 登录 | 调用 `/api/auth/login` 获取 access token 与 refresh token |
| 注册 | 调用 `/api/auth/register`，支持邮箱验证码链路 |
| 刷新令牌 | 401 后自动调用 `/api/auth/refresh-token` 续签 |
| 个人设置 | 支持读取与维护当前用户资料、头像、密码、通知设置 |

头像能力依赖后端对象存储状态：

1. 后端 `APP_OBJECT_STORAGE_ENABLED=false` 时，页面禁用头像上传，所有头像展示用户名首字。
2. 后端 `APP_OBJECT_STORAGE_ENABLED=true` 时，页面允许上传图片头像，并将后端返回的 `fileUrl` 随个人资料保存。

### 工作台与业务页

| 模块 | 说明 |
| --- | --- |
| 工作台 `Dashboard` | 展示概览指标、趋势图、状态分布、模块明细与系统公告的组合工作台 |
| 查询管理 `QueryList` | 通用分页检索、详情查看、新增编辑、状态切换 |
| 数据统计 `Statistics` | 统计分析视图，基于 ECharts 展示 |

### 系统管理

| 模块 | 说明 |
| --- | --- |
| 权限目录 | 角色权限分配，支持菜单、路由、按钮权限配置 |
| 用户管理 | 基于通用模块页驱动，支持列表、详情、编辑、状态切换 |
| 角色管理 | 支持角色列表和权限联动 |
| 菜单管理 | 维护多级菜单树、排序、状态和展示形态 |
| 字典管理 | 通过通用模块页维护字典数据 |
| 日志管理 | 查看登录、操作、接口日志 |
| 公告管理 | 公告分页、详情、编辑、发布状态控制 |
| 系统配置 | 查看和维护系统配置项 |

### 权限模型

项目已落地三层权限控制：

| 控制层 | 说明 |
| --- | --- |
| 菜单权限 | 根据 bootstrap 返回的菜单树过滤侧边栏 |
| 路由权限 | 页面访问前通过 `RouteGuard` 校验 |
| 按钮权限 | 通过 `Access` 组件细粒度控制操作按钮显示 |

## 对接后端与接口约定

默认按 `spring-admin-starter` 的接口规范对接，开发环境通过 Vite 代理把 `/api` 转发到 `http://localhost:8080`。

### 默认接口前缀

- 本地开发代理：`/api`
- 独立部署时可通过 `VITE_API_BASE_URL` 指定，例如 `https://api.example.com`

### 关键接口

| 能力 | 接口 |
| --- | --- |
| 登录 | `POST /api/auth/login` |
| 注册 | `POST /api/auth/register` |
| 注册验证码 | `GET /api/auth/register/verify-code` |
| 刷新令牌 | `POST /api/auth/refresh-token` |
| 当前用户资料 | `GET /api/auth/profile`、`PUT /api/auth/profile` |
| 头像上传 | `POST /api/file/avatar/upload` |
| 对象存储状态 | `GET /api/file/object-storage/status` |
| 权限初始化 | `GET /api/permission/bootstrap` |
| 工作台概览 | `GET /api/dashboard/overview` |
| 查询管理 | `GET /api/query/list`、`GET /api/query/detail`、`POST /api/query/save` |
| 通用系统模块 | `GET /api/system/{moduleKey}/list`、`GET /api/system/detail`、`POST /api/system/save`、`POST /api/system/status` |
| 菜单管理 | `GET /api/system/menus/tree`、`POST /api/system/menus/save`、`POST /api/system/menus/status` |
| 权限分配 | `GET /api/permission/assignment`、`POST /api/permission/assignment` |
| 公告管理 | `GET /api/system/notices/list`、`GET /api/system/notices/detail`、`POST /api/system/notices/save`、`POST /api/system/notices/status` |
| 系统配置 | `GET /api/system/configs`、`POST /api/system/configs/save` |

## 配套环境说明

### 本地开发环境

| 软件 | 要求 |
| --- | --- |
| Node.js | 18 及以上，建议使用 20 LTS |
| npm | 9 及以上 |
| 配套后端 | 建议同时启动 `spring-admin-starter` |
| 浏览器 | Chrome / Edge 最新稳定版 |

### 联调环境要求

若需要完整联调，后端需具备以下能力：

1. 提供 JWT 登录与 refresh token 续签接口。
2. 提供 `/api/permission/bootstrap` 返回菜单、路由码、按钮权限。
3. 提供工作台、查询管理、系统管理、公告、文件上传、对象存储状态和个人中心接口。
4. 若后端未开启对象存储，个人设置页禁用头像上传，头像统一使用用户名首字展示。
5. 正确放开前端域名的 CORS，或通过反向代理统一同域访问。

## 配置说明

### Vite 开发服务配置

当前 `vite.config.ts` 已内置以下默认行为：

| 配置项 | 当前值 | 说明 |
| --- | --- | --- |
| `server.host` | `0.0.0.0` | 支持本机与局域网访问 |
| `server.port` | `5173` | 前端开发端口 |
| `server.proxy['/api']` | `http://localhost:8080` | 本地联调后端代理 |
| `resolve.alias['@']` | `src` | 统一别名导入 |

### 环境变量

当前项目主要使用以下环境变量：

| 变量名 | 是否必需 | 说明 |
| --- | --- | --- |
| `VITE_API_BASE_URL` | 否 | 生产构建时指定后端 API 根地址；若前后端同域并通过 `/api` 反向代理，可不设置 |

示例：

```bash
export VITE_API_BASE_URL=https://api.example.com
```

## 启动、构建与验证

### 1. 安装依赖

```bash
cd /Users/salty/codeProject/ai/react-admin-starter
npm install
```

### 2. 启动开发环境

```bash
npm run dev
```

默认访问地址：

- 本机：`http://localhost:5173`
- 局域网：终端输出中的 `Network` 地址

### 3. 常用开发命令

```bash
npm run typecheck
npm run test:unit
npm run build
npm run preview
```

说明：

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 启动开发服务 |
| `npm run typecheck` | TypeScript 类型检查 |
| `npm run test:unit` | 执行单元测试 |
| `npm run build` | 生成生产构建产物 |
| `npm run preview` | 本地预览构建结果 |

### 4. 停止服务

前台运行时，在终端执行：

```bash
Ctrl + C
```

## 部署说明

### 部署方式

本项目是标准 Vite 静态站点，部署产物为 `dist/`。推荐通过以下任一方式部署：

1. Nginx 静态站点
2. 对象存储 + CDN
3. 容器内静态资源服务
4. 接入网关后的同域静态资源目录

### 部署前检查

1. 确认后端生产服务可用。
2. 确认前端访问域名已加入后端 CORS 白名单，或通过网关统一同域代理。
3. 确认生产环境的 `/api/auth/login`、`/api/permission/bootstrap`、`/api/dashboard/overview` 可访问。
4. 确认 `/api/file/object-storage/status` 返回预期状态，头像上传策略与后端配置一致。
5. 确认刷新二级路由时 Web 服务器会回退到 `index.html`。
6. 构建前确认 `VITE_API_BASE_URL` 是否需要写入构建产物。

### 构建发布

同域反向代理场景：

```bash
cd /Users/salty/codeProject/ai/react-admin-starter
npm ci
npm run build
```

前后端分域场景：

```bash
cd /Users/salty/codeProject/ai/react-admin-starter
npm ci
VITE_API_BASE_URL=https://api.example.com npm run build
```

随后将 `dist/` 下全部文件发布到目标静态目录。

### Nginx 示例

```nginx
server {
    listen 80;
    server_name admin.example.com;

    root /usr/share/nginx/html/react-admin-starter;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    location = /index.html {
        add_header Cache-Control "no-cache";
    }
}
```

## 推荐联调顺序

1. 先启动 `spring-admin-starter`，确认 `http://localhost:8080/actuator/health` 正常。
2. 再启动当前前端项目，访问 `http://localhost:5173`。
3. 使用后端初始化账号登录，例如 `admin / 123456`。
4. 登录后检查工作台、权限目录、查询管理、用户管理、公告管理等页面是否能正常拉取数据。
5. 进入个人设置，确认对象存储关闭时显示首字头像，开启时可上传头像并保存。

## 交接建议

1. 当前前端已经具备后台基础骨架与主干模块，后续新功能建议继续沿用 `pages + services + types` 的拆分方式。
2. 若新增后端菜单节点，需要同步确认是否属于当前前端已支持的路由；不支持的内部路径不会在菜单中展示。
3. 若引入新的系统模块，优先复用 `SystemModulePage` 的通用能力，减少重复列表页开发成本。
