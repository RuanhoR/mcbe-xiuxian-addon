# AGENTS.md

## Build / Dev Commands

- `pnpm dev` — `mbler watch` 监视模式，热更新到游戏目录（后台运行中，改文件会自动生效，勿自行启动）
- `pnpm dev-build` — `mbler build`，直接输出到游戏目录（需要手动构建时用这个）
- `pnpm build` — `BUILD_MODULE=release mbler build`，更新 `./dist` 并生成 `dist.mcaddon`
- `pnpm type-check` — `mcx-tsc`，TS 类型检查（改 TS 代码后必须跑）

## 说明

- `mbler.config.js` 中 `outGameOnDev: true`：dev 模式下构建直接进游戏
- 修改 behavior/resources 下的 JSON/资源时，由后台 `pnpm dev` 自动重新构建到游戏，无需手动构建
