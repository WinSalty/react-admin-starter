# React Admin Starter Todolist

## 项目重启说明

2026-04-16：项目方向已重置。原先基于自研 UI 风格的代码、依赖、构建产物和 `.git` 仓库已按要求删除，不再延续旧设计。后续重新基于 Ant Design 搭建生产级 React 后台管理系统脚手架。

当前目录仍为：

```txt
/Users/salty/codeProject/ai/react-admin-starter
```

当前只保留本 `todolist.md`。下一步将重新初始化项目工程和 git 仓库。

## 新项目定位

本项目是基于 Ant Design 的前端脚手架项目，提供 React 后台管理系统的基础工程模板。项目只包含前端代码，后端接口由其他业务项目提供。

核心目标：

- 使用 Ant Design 作为主要 UI 框架。
- 使用 Ant Design Pro 风格的后台布局思路，但不引入过重模板代码。
- 支持登录、注册、Dashboard、查询管理、数据统计、权限目录、403/404 等基础页面。
- 支持后端动态菜单、路由权限、按钮权限和权限数据映射。
- 支持 ECharts 数据统计。
- 支持 mock 数据隔离，页面组件不得直接写死业务假数据。
- 保持清晰工程分层，便于复制到其他项目二次开发。

## 每次开发前流程

1. 阅读本文件的“当前进度”和“下一步任务”。
2. 只接着未完成任务继续开发，不重复实现已完成内容。
3. 开始编码前检查当前目录状态，确认是否存在 git 仓库。
4. 如需调整阶段计划，先更新本文件对应条目。
5. 完成任务后更新“当前进度”“下一步任务”和“完成记录”。
6. 重新初始化 git 后，每次代码或文档修改完成都需要提交 git commit。
7. commit message 应清晰描述本次修改内容，并在末尾追加模型后缀，例如：`初始化Ant Design项目规划 gpt-5.4`。

## 技术选型

- React 18
- TypeScript
- Vite
- Ant Design
- Ant Design Icons
- React Router
- Axios
- ECharts
- dayjs

可选但需谨慎引入：

- zustand：用于轻量状态管理。
- ahooks：仅在确实提升可维护性时引入。

## 工程规范

- 页面级组件放在 `src/pages`。
- 布局组件放在 `src/layouts`。
- 通用业务组件放在 `src/components`。
- API 请求封装放在 `src/services`。
- mock 数据放在 `src/mocks` 或 `src/fixtures`。
- 类型定义放在 `src/types`。
- 工具函数放在 `src/utils`。
- 主题配置放在 `src/theme`。
- 路由配置放在 `src/routes`。
- 权限相关逻辑放在 `src/access`、`src/services/permission.ts` 或 `src/hooks`。
- 默认使用内存路由隐藏内部页面路径，页面切换不改变浏览器地址栏 URL。
- 页面不得直接写入大段假数据，必须通过 service 或 mock adapter 获取。
- 不允许在主体代码中写 demo 代码或测试代码。
- 不允许使用来源不清晰的非官方依赖包。

## Ant Design 使用规范

- 优先使用 Ant Design 官方组件，不重复自造基础组件。
- Layout 使用 `Layout`、`Sider`、`Header`、`Content`。
- 菜单使用 `Menu`，菜单数据必须支持后端动态下发。
- 表单使用 `Form`、`Input`、`Select`、`DatePicker`、`Button`。
- 表格使用 `Table`，统一封装分页、loading、empty、操作列。
- 弹窗使用 `Modal` 或 `Drawer`。
- 状态展示使用 `Tag`、`Badge`、`Result`。
- 反馈使用 `message`、`notification`、`Spin`、`Skeleton`。
- 图表容器可用 Ant Design `Card` 承载，ECharts 负责可视化。
- 主题色通过 Ant Design `ConfigProvider` token 管理。
- 不大面积覆盖 Ant Design 默认样式，确需覆盖时集中放在主题或局部样式文件。

## 权限与菜单规范

后端会提供权限接口，前端需要预留对接空间。

权限至少分三类：

- 菜单权限：控制侧边栏目录显示。
- 路由权限：控制页面访问。
- 按钮权限：控制页面按钮、表格操作列、批量操作显示或禁用。

前端统一权限模型草案：

```ts
interface PermissionMenu {
  id: string;
  parentId?: string;
  title: string;
  path: string;
  icon?: string;
  orderNo: number;
  permissionCode?: string;
  hiddenInMenu?: boolean;
  children?: PermissionMenu[];
}

interface PermissionAction {
  code: string;
  name: string;
}

interface PermissionBootstrap {
  menus: PermissionMenu[];
  routes: string[];
  actions: PermissionAction[];
}
```

预留接口草案：

```txt
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/profile
GET  /api/permission/menus
GET  /api/permission/routes
GET  /api/permission/actions
GET  /api/permission/bootstrap
```

实现要求：

- 侧边栏菜单必须支持后端动态下发。
- 前端保留静态兜底菜单，便于无后端时开发。
- 后端字段通过 mapper 转换为前端统一模型。
- 路由守卫统一处理未登录、无权限、未知路由。
- 页面按钮通过 `Access`、`PermissionGuard` 或 `usePermission` 控制。
- 权限 mock 数据不得写入页面组件。

## Mock 数据规范

- 假数据只能放在 `src/mocks` 或 `src/fixtures`。
- 页面必须通过 `services` 层获取数据。
- mock service 返回结构应贴近真实 API。
- API 响应类型统一使用 `ApiResponse<T>`、`PageResult<T>`。
- mock 数据命名要表达业务含义，禁止 `demoData`、`testData` 这类模糊名称。

## 阶段计划

### 阶段 0：重启与规划

- [x] 删除旧源码、依赖、构建产物和 `.git` 仓库。
- [x] 保留并重写 `todolist.md`。
- [x] 重新初始化 git 仓库。
- [x] 提交重启规划 commit。

### 阶段 1：Ant Design 基础工程

- [x] 初始化 Vite + React + TypeScript 工程。
- [x] 安装 Ant Design、Ant Design Icons、React Router、Axios、ECharts、dayjs。
- [x] 配置 `package.json`、`tsconfig.json`、`vite.config.ts`。
- [x] 创建 `src/main.tsx`、`src/App.tsx`。
- [x] 接入 Ant Design `ConfigProvider` 和主题 token。
- [x] 创建 README 第一版，写清启动、停止、构建命令。
- [x] 运行构建验证。

### 阶段 2：布局与路由

- [x] 实现 `BasicLayout`。
- [x] 实现 `AuthLayout`。
- [x] 使用 Ant Design `Layout`、`Menu`。
- [x] 创建路由配置。
- [x] 创建静态菜单配置，字段按权限模型设计。
- [x] 创建 Dashboard、查询管理、数据统计、权限目录、403、404 占位页面。
- [x] 实现响应式侧边栏折叠。

### 阶段 3：登录注册与认证

- [x] 实现登录页面。
- [x] 实现注册页面。
- [x] 实现 token 存储和清理。
- [x] 实现登录态 store。
- [x] 实现路由守卫。
- [x] 创建 `services/auth.ts`。
- [x] 创建认证 mock 数据。

### 阶段 4：权限目录与访问控制

- [x] 定义权限类型。
- [x] 创建 `services/permission.ts`。
- [x] 创建权限 mock 数据。
- [x] 实现权限 mapper。
- [x] 实现动态菜单过滤和排序。
- [x] 实现路由权限守卫。
- [x] 实现按钮权限控制工具。
- [x] README 补充后端权限接口对接说明。

### 阶段 5：Dashboard 与 ECharts

- [ ] 实现统计卡片。
- [ ] 接入 ECharts。
- [ ] 实现趋势图、柱状图、饼图组件。
- [ ] 首页统计数据通过 service 获取。
- [ ] mock 数据放入 `src/mocks`。

### 阶段 6：查询管理模板

- [ ] 使用 Ant Design `Form` 实现查询筛选区。
- [ ] 使用 Ant Design `Table` 实现列表。
- [ ] 实现分页。
- [ ] 实现详情 `Drawer` 或 `Modal`。
- [ ] 实现新增/编辑弹窗占位。
- [ ] 实现 loading、empty、error 状态。
- [ ] 查询数据通过 service 获取。

### 阶段 7：工程完善

- [ ] 完善 README。
- [ ] 补充主题定制说明。
- [ ] 补充服务层替换真实 API 的说明。
- [ ] 补充权限接口字段映射示例。
- [ ] 运行构建验证。
- [ ] 整理最终提交。

## 当前进度

阶段 4 已完成。已实现权限类型定义、mock 数据（admin/viewer 角色）、permission service、usePermission hook、Access 按钮权限组件、动态菜单过滤、路由权限守卫。已通过 `npm run build` 验证。

当前额外约定：

- 使用内存路由，页面切换不改变浏览器地址栏 URL。
- 顶部栏显示当前用户角色（管理员/访客）。
- 登录测试账号：admin / 123456（全部权限），viewer / 123456（仅 dashboard 查看权限）。
- 下次继续开发前先执行 `git status --short`，确认工作区干净。
- 如需预览页面，执行 `npm run dev` 后访问 `http://localhost:5173/`。

## 下一步任务

1. 进入阶段 5，实现 Dashboard 与 ECharts 数据统计。
2. 实现统计卡片、趋势图、柱状图、饼图组件。
3. 首页统计数据通过 service 获取，mock 数据放入 `src/mocks`。

## 完成记录

- 2026-04-16：按要求删除原 React 自研 UI 版本代码、依赖、构建产物和 `.git` 仓库。
- 2026-04-16：重写 `todolist.md`，项目方向切换为 Ant Design 后台管理系统脚手架。
- 2026-04-16：重新初始化 `react-admin-starter` git 仓库，完成项目重启规划。
- 2026-04-16：完成阶段 1，新增 Ant Design 版 React + TypeScript + Vite 基础工程、主题配置、路由骨架、README、request 封装、公共类型和 storage 工具。
- 2026-04-16：执行 `npm run build` 通过；构建提示首包超过 500 kB，后续阶段可通过路由懒加载和 chunk 拆分优化。`npm install` 报告 2 个 moderate 漏洞，未执行 `npm audit fix --force`。
- 2026-04-16：完成阶段 2，新增 `BasicLayout`、`AuthLayout`、静态菜单配置、后台路由、Dashboard、查询管理、数据统计、权限目录、403、登录和注册占位页面。
- 2026-04-16：执行 `npm run build` 通过，README 已补充常用页面地址。
- 2026-04-16：根据要求将浏览器路由改为内存路由，页面切换不再改变浏览器地址栏 URL，README 已同步说明。
- 2026-04-16：优化顶部栏显示，移除面包屑和脚手架说明文案，改为当前页面标题与管理员占位。
- 2026-04-16：维护 README 和 todolist，补充当前状态、下次继续入口和开发前检查命令。
- 2026-04-16：代码审查，将未实现的 `Breadcrumb` 从阶段 2 移除，清理 `vite.config.d.ts` 编译产物。claude
- 2026-04-16：完成阶段 3，新增登录注册表单校验、zustand 登录态 store、token 工具、auth service、mock 数据、路由守卫和 axios 拦截器。默认测试账号 admin/123456。claude
- 2026-04-16：完成阶段 4，新增权限类型定义、权限 mock 数据（admin/viewer）、permission service、usePermission hook、Access 按钮权限组件、动态菜单过滤、路由权限守卫。QueryList 页面已接入 Access 控制「新增」按钮。claude
