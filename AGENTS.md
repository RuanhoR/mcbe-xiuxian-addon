# AGENTS.md

## Build / Dev Commands

- `pnpm dev` — `mbler watch` 监视模式，热更新到游戏目录（后台运行中，改文件会自动生效，勿自行启动）
- `pnpm dev-build` — `mbler build`，直接输出到游戏目录（需要手动构建时用这个）
- `pnpm build` — `BUILD_MODULE=release mbler build`，更新 `./dist` 并生成 `dist.mcaddon`
- `pnpm type-check` — `mcx-tsc`，TS 类型检查（改 TS 代码后必须跑）

## 说明

- `mbler.config.js` 中 `outGameOnDev: true`：dev 模式下构建直接进游戏
- 修改 behavior/resources 下的 JSON/资源时，由后台 `pnpm dev` 自动重新构建到游戏，无需手动构建
- 验证脚本改动 / 查看生成的物品等 JSON 产物时，直接跑 `pnpm build`（release 模式输出到 `./dist`），不要去翻游戏目录

## 提交规范（必须遵守）

- 提交信息格式：`<type>: <English summary>`，type 用 conventional commits 小写前缀：
  - `wip:` — 未完成的阶段性提交
  - `feat:` — 新功能；`fix:` — 修 bug；`refactor:` — 重构；`docs:` — 文档；`chore:` — 杂项
- summary 一律**英文**，不用中文；一行写完，多个要点用 ` / ` 或 `, ` 分隔
- 例：`wip: danyao type system (lore encoding, tier gate, persistent buff), gongfa event dispatch, putuan menu`

## 架构约定

分层（改代码时保持职责不越界）：

- `config/` — 数据定义（注册表 + 类型），不含行为：
  - `config/gongfa.ts` + `config/gongfa/*.ts` — 功法注册表 `GongFaEnum`（key = 功法 id），外层一处 `satisfies Record<string, GongFaEnumType>` 校验，内层条目不再重复 satisfies
  - `config/danyao.ts` + `config/danyao/types.ts` — 丹药注册表 `DanYaoEnum`，同上套路；`DanYaoColorItemMap` 把 20 色物品当"皮肤"，丹效定义与物品解耦
- `utils/` — 纯函数（parse/generator），不含行为逻辑：
  - `utils/message.ts` — `rawMessage`（模板字符串拼 RawMessage）/ `t`（lang key）/ `rawToText`（给 nameTag 等只收 string 的 API）
  - `utils/danyao.ts` — 丹药 lore 编解码：`getDanYaoIdFromItem`（lore `danyao:<id>` → 定义）、`createDanYaoItem`、`generateDanYaoLore`、`isDanYaoItem`
  - `utils/gongfa.ts` — 功法名/随机抽取 + 功法书 lore 编解码（`gongfa:<id>`）：`getGongFaIdFromItem`、`createGongFaItem`（lockMode = inventory）
- `core/` — 行为与运行时：
  - `core/levelCore.ts` — 玩家修为数据（动态属性 + zod schema 持久化）：灵力 `useSpirit`/`addSpirit`、功法增删 `addNewGongFa`/`removeGongFa`、buff 状态 `getBuffs`/`setBuffs`、灵根 `rerollSpiritualRoot`
  - `core/gongFaRuntime.ts` — 单个功法的生效（backend 每 RUN_TICK / onUse 四类事件，灵气消耗统一走 `_tryConsumeSpirit`）
  - `core/gongFaDispatch.ts` — 原版事件 → 玩家已学功法的分发器
  - `core/danYaoRuntime.ts` — 服用判定链（冷却 → 品阶门槛 → 灵气 → onUse → 持久化 buff）+ backend 推进
  - `core/putuanMenu.ts` — 蒲团 UI（功法列表/熟练度展示/弃功/唯一发放功法物品）
  - `core/gongFaItem.ts` — 功法物品背包管理（查找/删除/唯一发放）

## 核心机制约定

- **物品数据一律走 lore 编码**，不按种类注册物品：丹药 lore 尾行 `danyao:<id>`、功法书 `gongfa:<id>`，运行时由 utils 里的 parse/generator 还原
- **事件订阅统一在 `Event.mcx`**：`itemUse`（GongFaXidei 施法媒介 → 功法主动技能）、`itemCompleteUse`（丹药，吃完才生效，物品由游戏自动消耗，运行时不得再手动扣数量）、`entityHitEntity`/`entityHurt`/`playerInteractWithBlock` → 功法分发；tick 循环（RUN_TICK=10）跑功法/丹药 backend
- **丹药品阶门槛**：玩家境界 `lr > 品阶 + DANYAO_LEVEL_TOLERANCE(2)` 时服用无效
- **丹药 buff 持久化**：只有带 `backend + buffDuration` 的丹药写入玩家数据 `buff` 字段（key → 过期 tick），冷却为会话级内存 Map
- **玩家可见文本一律用 `rawMessage`** 构造（模板字符串形式），不走 lang key
- **schema 演进必须向后兼容**：`schemas.ts` 新字段用 `.optional()`，旧存档可直读
- `docs/GAMEPLAY_CHAIN.md` — 完整玩法链设计文档（境界/修炼/突破/功法/丹药/秘境/渡劫），新功能先对齐该文档再动手
