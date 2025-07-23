# Toy RN Src

这是从 toy-rn 项目中提取的 src 文件夹，现在作为独立的 Git subtree 进行管理。

## 目录结构

- `api/` - API 相关代码
- `components/` - React Native 组件
- `contexts/` - React Context 相关代码
- `examples/` - 示例代码
- `i18n/` - 国际化相关文件
- `img/` - 图片资源
- `pages/` - 页面组件
- `services/` - 服务层代码
- `types/` - TypeScript 类型定义
- `utils/` - 工具函数

## Subtree 管理

这个目录通过 Git subtree 与独立仓库 `toy-rn-src` 进行同步。

### 推送更改到独立仓库

```bash
git subtree push --prefix=src toy-rn-src main
```

### 从独立仓库拉取更改

```bash
git subtree pull --prefix=src toy-rn-src main --squash
```

## 🔄 其他项目使用此 Subtree

### 方式一：作为 Subtree 引入（推荐）

```bash
# 1. 添加远程仓库
git remote add toy-rn-src https://github.com/GONDON/toy-rn-src.git

# 2. 添加 subtree 到指定目录
git subtree add --prefix=shared-src toy-rn-src main --squash

# 3. 后续同步操作
git subtree pull --prefix=shared-src toy-rn-src main --squash
git subtree push --prefix=shared-src toy-rn-src main
```

### 方式二：作为 Submodule 引入

```bash
# 1. 添加 submodule
git submodule add https://github.com/GONDON/toy-rn-src.git shared-src

# 2. 初始化和更新
git submodule init && git submodule update

# 3. 更新到最新版本
git submodule update --remote shared-src
```

### 方式三：直接使用

```bash
# 克隆并作为普通代码使用
git clone https://github.com/GONDON/toy-rn-src.git shared-src
rm -rf shared-src/.git
```
