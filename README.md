# React Admin Starter

React Admin Starter 是基于 Ant Design 的 React 后台管理系统脚手架。

## 当前状态

- 已完成 Ant Design 基础工程。
- 已完成后台基础布局、认证布局、菜单配置和占位页面。
- 已使用内存路由隐藏内部页面路径，页面切换不会改变浏览器地址栏 URL。
- 下一阶段从登录注册与认证开始，详见 [todolist.md](./todolist.md) 的“下一步任务”。

## 技术栈

- React 18
- TypeScript
- Vite
- Ant Design
- React Router
- Axios
- ECharts
- dayjs

## 启动和终止前端服务

以下命令都需要在项目根目录执行：

```bash
cd /Users/salty/codeProject/codex/react-admin-starter
```

### 安装依赖

首次启动前执行：

```bash
npm install
```

### 启动开发服务

```bash
npm run dev
```

启动成功后访问：

```txt
http://localhost:5173/
```

页面切换说明：

项目使用内存路由，页面切换不会改变浏览器地址栏 URL。启动后访问 `http://localhost:5173/`，再通过页面内菜单或后续登录流程进入不同页面。

当前不会在地址栏暴露 `/dashboard`、`/query`、`/statistics`、`/permission`、`/login`、`/register` 等内部路径。

### 终止开发服务

如果服务在当前终端运行，按：

```txt
Ctrl + C
```

如果服务在后台或其他终端运行，先查找进程：

```bash
ps aux | grep "vite"
```

再终止对应 PID：

```bash
kill <PID>
```

### 构建验证

提交前建议执行：

```bash
npm run build
```

## 阶段进度

项目阶段计划和完成记录维护在 [todolist.md](./todolist.md)。

下次继续开发前建议执行：

```bash
cd /Users/salty/codeProject/codex/react-admin-starter
git status --short
sed -n '1,320p' todolist.md
npm run build
```
