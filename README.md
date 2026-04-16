# React Admin Starter

React Admin Starter 是基于 Ant Design 的 React 后台管理系统脚手架。

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

常用页面：

```txt
http://localhost:5173/dashboard
http://localhost:5173/query
http://localhost:5173/statistics
http://localhost:5173/permission
http://localhost:5173/login
http://localhost:5173/register
```

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
