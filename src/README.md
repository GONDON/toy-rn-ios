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
