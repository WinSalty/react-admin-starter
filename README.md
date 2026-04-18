# React Admin Starter

React Admin Starter 是基于 Ant Design 的前端脚手架项目，提供 React 后台管理系统的基础工程模板。本项目只包含前端代码，不包含后端服务。

## 当前状态

- 已完成 Ant Design 基础工程、后台布局和权限体系。
- 已完成登录注册页面、表单校验、认证服务和 mock 数据。
- 已接入权限控制：动态菜单过滤、路由守卫、按钮权限组件（Access）。
- 已完成 Dashboard 与 ECharts 数据统计，数据通过 service/mock 链路获取。
- 已完成查询管理模板，支持筛选、分页、详情、新增和编辑。
- 已完成系统管理基础模块：用户、角色、菜单、字典、日志和系统配置页面均通过 service/mock 链路获取数据。
- 已完成角色维度权限分配 UI、动态路由映射表、React Error Boundary、Vitest 配置骨架和后端接入 checklist。
- 已统一认证页配色，登录和注册页视觉与后台主界面保持蓝白主色一致。
- 已完成路由懒加载和 vendor chunk 拆分，生产构建不再出现 chunk 超限警告。
- 已使用内存路由，页面切换不改变浏览器地址栏 URL。
- 当前阶段计划详见 [todolist.md](./todolist.md)。

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

当前工程已配置页面路由懒加载，并在 `vite.config.ts` 中拆分 `react`、`antd`、`echarts` vendor chunk，避免 Ant Design 和 ECharts 全部进入首屏主包。

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

### 多级菜单模型

侧边栏支持后端动态下发的多级菜单。菜单节点可作为目录、页面菜单、隐藏路由或外链使用，父级目录可以没有 `path`，只要存在可见子菜单就会展示。

推荐字段：

| 字段 | 说明 |
|---|---|
| `type` | `catalog`、`menu`、`hidden`、`external` |
| `path` | 页面路由路径，目录节点可为空 |
| `permissionCode` | 菜单或按钮权限编码 |
| `hiddenInMenu` | 是否隐藏在侧边栏 |
| `redirect` | 目录或页面默认跳转 |
| `keepAlive` | 是否预留缓存 |
| `externalLink` | 外链地址 |
| `badge` | 菜单徽标文案 |
| `disabled` | 是否禁用菜单 |
| `children` | 子菜单树，不限制层级 |

侧边栏会根据当前路径自动选中深层菜单，并展开父级目录；用户手动展开的目录会保存到 localStorage。

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
    "routes": ["dashboard", "query", "statistics", "permission", "users", "roles", "menus", "dicts", "logs"],
    "actions": [
      { "code": "query:add", "name": "新增查询" },
      { "code": "query:edit", "name": "编辑查询" }
    ]
  }
}
```

对接真实接口时，只需修改 `src/services/permission.ts` 中的 `fetchPermissionBootstrap` 方法，将 mock 调用替换为 `request.get('/api/permission/bootstrap')`。

### 权限字段映射示例

后端字段可以不完全等同于前端模型，但需要在 service 或 mapper 中统一转换为 `PermissionBootstrap`。推荐映射关系如下：

| 后端字段 | 前端字段 | 说明 |
|---|---|---|
| `menuId` | `id` | 菜单唯一标识 |
| `parentMenuId` | `parentId` | 父级菜单标识 |
| `menuName` | `title` | 菜单显示名称 |
| `routePath` | `path` | 前端路由路径 |
| `iconName` | `icon` | Ant Design Icon 名称 |
| `sort` | `orderNo` | 菜单排序 |
| `permCode` | `permissionCode` | 菜单权限编码 |
| `hidden` | `hiddenInMenu` | 是否隐藏菜单 |

转换示例：

```ts
function mapBackendMenu(item: BackendMenu): PermissionMenu {
  return {
    id: String(item.menuId),
    parentId: item.parentMenuId ? String(item.parentMenuId) : undefined,
    title: item.menuName,
    path: item.routePath,
    icon: item.iconName,
    orderNo: item.sort,
    permissionCode: item.permCode,
    hiddenInMenu: item.hidden,
  };
}
```

### 权限编码规范

权限编码统一使用小写英文、冒号分段，建议格式为：

```txt
{domain}:{resource}:{action}
```

命名约定：

| 权限类型 | 命名规则 | 示例 |
|---|---|---|
| 菜单权限 | `{domain}:{resource}:view` | `system:menu:view` |
| 路由权限 | 使用稳定 routeCode，不带冒号 | `menus`、`configs` |
| 按钮权限 | `{domain}:{resource}:{operation}` | `system:role:assign-permission` |
| 隐藏路由 | 仍归属具体资源动作 | `system:log:detail` |
| 外链菜单 | 按资源归属定义查看权限 | `docs:antd:view` |

编码要求：

- `domain` 表示业务域，如 `system`、`query`、`statistics`。
- `resource` 表示资源名，使用单数形式，如 `user`、`role`、`menu`。
- `action` 表示动作，常用 `view`、`add`、`edit`、`status`、`delete`、`export`。
- 路由守卫只判断 `routeCode`，不要直接复用按钮权限编码，避免路由和按钮权限耦合。
- 后端下发菜单权限、路由权限、按钮权限时应保持三类集合独立。

### 权限分配说明

权限目录页已扩展为角色维度权限分配 UI：

- 角色选项通过 `src/services/system.ts` 获取角色列表。
- 菜单权限树、路由权限、按钮权限通过 `src/services/permission.ts` 获取和保存。
- 当前使用 `src/mocks/permission.ts` 中的占位分配数据，后续替换真实接口即可。
- 页面保存的是 `RolePermissionAssignment`，包含 `roleCode`、`menuIds`、`routeCodes`、`actionCodes`。

### 动态路由映射

后端动态菜单到本地页面组件的白名单映射维护在 `src/access/routeMap.ts`。后端建议只下发 `routePath`、`routeCode`、`componentKey` 等稳定字段，前端通过映射表决定实际页面组件，避免任意组件路径加载。

## Dashboard 数据说明

Dashboard 已接入统计卡片、访问与订单趋势图、模块使用柱状图和业务状态饼图。页面不直接维护业务假数据，统一通过 `src/services/dashboard.ts` 获取数据，mock 数据维护在 `src/mocks/dashboard.ts`。

对接真实接口时，将 `fetchDashboardOverview` 方法中的 mock 调用替换为真实请求即可：

```ts
return request.get('/api/dashboard/overview');
```

## 查询管理说明

查询管理页已实现标准列表模板：

- 筛选区：关键字、状态筛选。
- 列表区：Ant Design Table、分页、loading、empty、error 状态。
- 操作区：详情 Drawer、新增/编辑 Modal。
- 数据链路：页面调用 `src/services/query.ts`，mock 数据维护在 `src/mocks/query.ts`。

对接真实接口时，可将查询管理 service 中的 mock 调用替换为：

```ts
request.get('/api/query/list', { params });
request.get('/api/query/detail', { params: { id } });
request.post('/api/query/save', params);
```

## 系统管理说明

系统管理已提供基础页面模板，适合作为真实后台的二次开发起点：

- 用户管理：用户列表、筛选、详情、新增/编辑、状态切换、重置密码占位、分配角色入口。
- 角色管理：角色列表、筛选、详情、新增/编辑、状态切换、权限分配入口。
- 菜单管理：菜单类型、路由路径、权限编码、排序和状态维护模板。
- 菜单管理：多级树形表格、目录/菜单/隐藏/外链类型、图标、父级菜单、排序、路由路径、权限编码、外链地址和状态维护。
- 字典管理：字典类型、字典项数量、状态、缓存键和缓存刷新入口。
- 日志管理：登录日志、操作日志、接口日志列表和类型筛选模板。
- 系统配置：基础参数、开关配置、前端缓存配置入口。

用户、角色、字典和日志复用 `src/pages/system/SystemModulePage.tsx`，菜单管理和系统配置按字段复杂度使用独立页面。数据链路统一为：

```txt
Page -> src/services/system.ts -> src/mocks/system.ts
```

对接真实接口时，可将系统管理 service 中的 mock 调用替换为：

```ts
request.get('/api/system/{moduleKey}/list', { params });
request.get('/api/system/detail', { params: { id } });
request.post('/api/system/save', params);
request.post('/api/system/status', { id, status });
request.get('/api/system/menus/tree', { params });
request.post('/api/system/menus/save', params);
request.post('/api/system/menus/status', { id, status });
request.get('/api/system/configs');
request.post('/api/system/configs/save', { id, value });
```

## 质量保障说明

项目已增加页面级错误边界 `src/components/ErrorBoundary.tsx`，所有懒加载路由会经过错误边界兜底，页面渲染异常时展示 500 结果页并提供重试入口。

### 单元测试方案

已新增 Vitest 配置骨架：

- `vitest.config.ts`：配置 React、路径别名、jsdom、setupFiles。
- `tests/setupTests.ts`：接入 `@testing-library/jest-dom/vitest`。
- `npm run test:unit`：执行单元测试。

建议优先补充以下单元测试：

- `src/utils/token.ts`：token、角色、权限本地存储读写。
- `src/config/menu.tsx`：后端菜单到 Ant Design 菜单模型的映射、排序和 key 生成。
- `src/hooks/usePermission.ts`：路由权限、按钮权限、任意权限和全部权限判断。
- `src/services/*`：mapper 和 mock service 返回结构。

### 端到端冒烟测试方案

建议后续引入 Playwright，覆盖以下最小链路：

- 登录成功后进入工作台，侧边栏按 admin 权限展示。
- viewer 登录后只能看到工作台，访问系统管理路由应进入 403。
- 查询管理完成筛选、打开详情、新增弹窗。
- 菜单管理展开树形表格，打开新增和编辑弹窗，切换状态。
- 权限目录切换角色并保存菜单、路由、按钮权限。

### 真实后端接入 Checklist

- 确认 `src/services/request.ts` 的 `baseURL`、超时、认证头和 401 处理符合后端网关规则。
- 将 `src/services/auth.ts`、`src/services/permission.ts`、`src/services/system.ts`、`src/services/query.ts`、`src/services/dashboard.ts` 中的 mock 调用替换为真实接口。
- 在 service 层完成字段 mapper，页面层只消费前端统一类型。
- 后端权限 bootstrap 必须一次性返回菜单树、路由 routeCodes、按钮 actions。
- 后端动态菜单必须能映射到 `src/access/routeMap.ts` 中的白名单 componentKey。
- 统一接口响应为 `ApiResponse<T>`，分页响应为 `PageResult<T>` 或在 service 中转换。
- 明确 token 过期、刷新、登出后的本地缓存清理策略。
- 建立菜单缓存版本或权限版本字段，配合系统配置中的缓存入口清理本地权限。
- 接入生产前执行 `npm run typecheck`、`npm run build`、单元测试和端到端冒烟测试。

## 主题定制说明

主题集中维护在 `src/theme/index.ts`，通过 Ant Design `ConfigProvider` token 生效。常用调整项：

- `token.colorPrimary`：主色。
- `token.borderRadius`：全局圆角。
- `token.fontFamily`：全局字体。
- `components.Layout`：后台布局背景。
- `components.Menu`：菜单项样式。
- `components.Card`：卡片圆角。

示例：

```ts
export const themeConfig = {
  token: {
    colorPrimary: '#1677ff',
    borderRadius: 6,
  },
};
```

局部样式统一写在 `src/styles/base.css`，不要在页面组件里散落大段样式覆盖。

## 服务层替换真实 API

项目页面不直接请求 mock 数据，统一通过 `src/services` 访问数据。替换真实接口时按以下步骤处理：

1. 在 `src/services/request.ts` 配置 `baseURL`、认证请求头和错误处理。
2. 将对应 service 中的 mock 调用替换为 `request.get` 或 `request.post`。
3. 保持 service 返回 `ApiResponse<T>` 或 `PageResult<T>` 结构，避免页面层跟着接口字段变动。
4. 如后端字段和前端模型不同，在 service 内增加 mapper，不在页面组件中做字段适配。

示例：

```ts
export async function fetchQueryPage(params: QueryListParams) {
  const response = await request.get<ApiResponse<PageResult<QueryRecord>>>('/query/list', {
    params,
  });
  return response.data;
}
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

- 项目使用浏览器路由，页面切换会同步浏览器地址栏 URL。
- 当前路由包含 `/dashboard`、`/query`、`/statistics`、`/permission`、`/system/users`、`/system/roles`、`/system/menus`、`/system/dicts`、`/system/logs`、`/system/configs`、`/login`、`/register` 等内部路径。

## 后端联调说明

- 默认通过 Vite dev server 将 `/api` 代理到 `http://localhost:8080`，前端 service 直接请求真实后端接口。
- 如需绕过 Vite 代理，可配置 `VITE_API_BASE_URL=http://localhost:8080`，请求路径仍保持 `/api/...`。
- 登录链路为 `POST /api/auth/login` -> 保存 Bearer Token 与角色编码 -> `GET /api/permission/bootstrap` 拉取菜单、路由和按钮权限。
- 当前已替换 `auth`、`dashboard`、`query`、`permission`、`system` service 中的 mock 调用。

## 页面体验规范

- 工作台保留概览式页面头部，用于展示指标和图表。
- 列表页、配置页和权限页使用 `PageHeader` 紧凑头部，减少顶部空白。
- 页面主操作优先放在内容卡片 `extra` 或 `PageHeader` 右侧，不在页面顶部堆叠说明文案。
- 右上角用户区使用头像下拉面板，展示登录账号、角色、当前时间，并在下拉操作中提供退出登录。
- 登录和注册页使用左右分栏认证布局，左侧展示品牌和能力摘要，右侧承载表单；配色与后台主界面蓝白主色一致，移动端自动切换为单列。

## 后续开发方向

当前已完成阶段 0-11 的脚手架建设，具备后台基础工程、系统管理、权限配置、系统配置和质量保障骨架。

### 阶段 8：框架体验升级

目标是让后台框架支持真实业务系统的菜单规模和操作习惯。

- 多级动态菜单：支持目录、菜单、隐藏路由和按钮权限分层，菜单不限制一级，父级目录可无 `path` 或只作为分组。
- 菜单配置扩展：补充 `type`、`redirect`、`keepAlive`、`externalLink`、`badge`、`disabled` 等字段预留。
- 菜单选中逻辑：支持深层菜单选中、父级目录展开、刷新后恢复展开状态。
- 顶部用户区：右上角头像改为可点击下拉面板，展示登录账号、角色、当前时间，将退出登录放入下拉操作。
- 页面头部规范：统一各页面顶部区域，减少冗余说明文字；工作台保留概览式标题，列表页和配置页使用紧凑标题 + 操作区。
- 登录注册美化：认证页升级为更完整的品牌化布局，保留表单效率，同时提升视觉层次和移动端体验。

### 阶段 9：系统管理基础模块

目标是补齐后台系统最常见的管理模块骨架，继续保持 service/mock 隔离。

- 用户管理：用户列表、状态筛选、详情、新增/编辑、重置密码、分配角色。
- 角色管理：角色列表、权限分配入口、角色状态管理。
- 菜单管理：多级菜单树、菜单类型、图标、排序、路由路径、权限编码维护。
- 字典管理：字典类型、字典项、状态、排序、缓存刷新入口。
- 日志管理：登录日志、操作日志、接口日志，支持账号、类型和结果筛选。

### 阶段 10：权限与配置深化

目标是把权限模型从展示控制推进到可维护配置。

- 权限码规范：统一菜单、路由、按钮权限编码命名规则。
- 权限分配 UI：角色维度维护菜单、路由和按钮权限。
- 动态路由映射：后端菜单和本地页面组件建立稳定映射表。
- 系统配置：基础参数、开关配置、前端缓存配置入口。

### 阶段 11：质量保障

目标是让脚手架更适合复制到生产项目。

- 补充核心工具函数单元测试。
- 补充登录、菜单权限、查询列表的端到端冒烟测试。
- 增加错误边界和页面级异常兜底。
- 梳理真实后端接入 checklist。

## 下一阶段建议

建议下一阶段接入真实后端接口，补齐真实业务单元测试和 Playwright 端到端冒烟测试，并按具体业务域扩展系统配置项。

## 阶段进度

项目阶段计划和完成记录维护在 [todolist.md](./todolist.md)。

下次继续开发前建议执行：

```bash
cd /Users/salty/codeProject/ai/react-admin-starter
git status --short
sed -n '1,320p' todolist.md
npm run build
```
