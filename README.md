# React Admin Starter

React Admin Starter 是基于 Ant Design 的前端脚手架项目，提供 React 后台管理系统的基础工程模板。本项目只包含前端代码，不包含后端服务。

## 当前状态

- 已完成 Ant Design 基础工程、后台布局和权限体系。
- 已完成登录注册页面、表单校验、认证服务和 mock 数据。
- 已接入权限控制：动态菜单过滤、路由守卫、按钮权限组件（Access）。
- 已完成 Dashboard 与 ECharts 数据统计，数据通过 service/mock 链路获取。
- 已使用内存路由，页面切换不改变浏览器地址栏 URL。
- 下一阶段为查询管理模板，详见 [todolist.md](./todolist.md) 的“下一步任务”。

## 技术栈

- React 18
- TypeScript
- Vite
- Ant Design
- React Router
- Axios
- ECharts
- dayjs
- zustand

## 启动和终止前端服务

### 前置条件

- Node.js >= 18（推荐使用 nvm 管理版本）
- npm（随 Node.js 自带）

### 安装依赖

首次克隆项目或更新 `package.json` 后需要执行。在项目根目录执行：

```bash
cd /Users/salty/codeProject/ai/react-admin-starter
npm install
```

安装成功后会在当前目录生成 `node_modules` 文件夹。

### 启动开发服务

```bash
npm run dev
```

该命令会启动 Vite 开发服务器，默认监听 `http://localhost:5173/`。启动后终端会显示类似如下信息：

```
  VITE v5.4.21  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

- **Local 地址**：本机访问
- **Network 地址**：同一局域网内其他设备访问

启动后在浏览器中打开 `http://localhost:5173/` 即可看到项目页面。

#### 指定端口启动

默认端口为 `5173`，如需更换端口可通过环境变量：

```bash
npm run dev -- --port 3000
```

#### 允许局域网访问

如需让局域网内其他设备访问，指定 host 为 `0.0.0.0`：

```bash
npm run dev -- --host
```

### 终止开发服务

根据服务启动方式选择对应方法：

**当前终端前台运行**：
在运行 `npm run dev` 的终端窗口中按：

```
Ctrl + C
```

终端会提示 `Terminate batch job (Y/N)?`，输入 `Y` 确认。

**后台或其他终端运行**：
先查找 Vite 进程：

```bash
ps aux | grep "vite"
```

输出示例：

```
salty    12345   0.0  0.3 12345678  12345 s001  S+   10:00AM   0:00.12 node ./node_modules/.bin/vite
```

其中 `12345` 是进程 PID，终止该进程：

```bash
kill 12345
```

如果多个终端同时运行，可能有多个 vite 进程，逐一 kill 即可。

### 构建生产产物

开发完成后提交前建议执行构建验证：

```bash
npm run build
```

构建成功后会生成 `dist` 文件夹。如果构建失败或出现 chunk 超过 500kB 的警告，可通过路由懒加载或 chunk 拆分优化。

### 类型检查

提交前可执行类型检查：

```bash
npm run typecheck
```

该命令会执行 `tsc -b`，检查 TypeScript 类型错误但不会生成构建产物。

### 构建产物预览

如需预览构建后的生产环境产物，执行：

```bash
npm run build
npm run preview
```

启动后访问 `http://localhost:4173/`（默认端口 4173）。

## 认证说明

- 测试账号：`admin` / `123456`（全部权限），`viewer` / `123456`（仅 dashboard 查看权限）
- Token 存储在 localStorage，通过 axios 拦截器以 `Bearer` 方式携带到请求头。
- 未登录访问后台页面会重定向到 `/login`，已登录访问登录页会重定向到 `/dashboard`。

## 权限说明

项目实现了三层权限控制：

| 层级 | 控制范围 | 实现方式 |
|---|---|---|
| 菜单权限 | 侧边栏菜单显示 | `BasicLayout` 根据 `routeCodes` 过滤菜单项 |
| 路由权限 | 页面访问 | `RouteGuard` 包裹页面，无权限时跳转 `/403` |
| 按钮权限 | 按钮/操作列显示 | `<Access action="xxx">` 组件，无权限时不渲染 |

### 后端接口对接

登录后前端调用 `GET /api/permission/bootstrap` 获取权限数据：

```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "menus": [
      { "id": "1", "title": "工作台", "path": "/dashboard", "icon": "DashboardOutlined", "orderNo": 1, "permissionCode": "dashboard:view" }
    ],
    "routes": ["dashboard", "query", "statistics", "permission"],
    "actions": [
      { "code": "query:add", "name": "新增查询" },
      { "code": "query:edit", "name": "编辑查询" }
    ]
  }
}
```

对接真实接口时，只需修改 `src/services/permission.ts` 中的 `fetchPermissionBootstrap` 方法，将 mock 调用替换为 `request.get('/api/permission/bootstrap')`。

## Dashboard 数据说明

Dashboard 已接入统计卡片、访问与订单趋势图、模块使用柱状图和业务状态饼图。页面不直接维护业务假数据，统一通过 `src/services/dashboard.ts` 获取数据，mock 数据维护在 `src/mocks/dashboard.ts`。

对接真实接口时，将 `fetchDashboardOverview` 方法中的 mock 调用替换为真实请求即可：

```ts
return request.get('/api/dashboard/overview');
```

### 使用 Access 组件控制按钮权限

```tsx
import { Access } from '@/components/Access';

// 有权限时显示按钮，无权限时不显示
<Access action="query:add">
  <Button type="primary">新增</Button>
</Access>

// 无权限时显示 fallback
<Access action="query:delete" fallback={<Button disabled>删除</Button>}>
  <Button danger>删除</Button>
</Access>
```

### 使用 usePermission Hook

```tsx
import { usePermission } from '@/hooks/usePermission';

const { hasRoute, hasAction, hasAnyAction, hasAllAction } = usePermission();

hasRoute('dashboard');       // 是否有路由权限
hasAction('query:add');      // 是否有按钮权限
hasAnyAction(['a', 'b']);    // 是否有任意一个权限
hasAllAction(['a', 'b']);    // 是否全部权限
```

## 路由说明

- 项目使用内存路由，页面切换不改变浏览器地址栏 URL。
- 当前不会在地址栏暴露 `/dashboard`、`/query`、`/statistics`、`/permission`、`/login`、`/register` 等内部路径。

## 阶段进度

项目阶段计划和完成记录维护在 [todolist.md](./todolist.md)。

下次继续开发前建议执行：

```bash
cd /Users/salty/codeProject/ai/react-admin-starter
git status --short
sed -n '1,320p' todolist.md
npm run build
```
