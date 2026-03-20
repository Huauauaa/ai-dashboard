# React + Tailwind + GitHub Pages

该项目已基于 **React + Vite** 初始化，并接入 **Tailwind CSS**。

## 本地开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

## GitHub Pages 配置说明

- 已新增工作流：`.github/workflows/deploy-pages.yml`
- 当 `main` 分支有新提交时，会自动构建并发布到 GitHub Pages
- `vite.config.js` 已配置：
  - 本地开发时使用 `base: /`
  - GitHub Actions 构建时根据仓库名自动生成 `base`（如 `/repo-name/`）

## 首次启用 Pages（仓库设置）

在 GitHub 仓库的 **Settings -> Pages** 中，将 `Build and deployment` 设为 **GitHub Actions**。
