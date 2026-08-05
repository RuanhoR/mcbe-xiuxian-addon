# 修仙模组 (XiuXian Mod)

Minecraft Bedrock Edition 修仙题材 Addon，基于 [mbler](https://www.npmjs.com/package/mbler) / `@mbler/mcx` 框架构建。

目标 MCBE 版本：`1.26.40`（见 `mbler.config.js`）。

## 内容

### 灵石

- **灵石矿**（`xian:spirit_stone_ore`）：自然生成于主世界地下（`y=-56 ~ 62`），每个区域最多 10 组、每组最多 8 个矿石。
- **未提纯的灵石**（`xian:raw_spirit_stone_ore`）：挖掘灵石矿获得，可在熔炉烧炼为劣质灵石。
- 灵石分 5 个品阶，通过工作台逐级合成（环形 5 个低阶合成 1 个高阶）：
  - 劣质灵石 → 下品灵石 → 中品灵石 → 上品灵石 → 仙品灵石
- 灵石必须在蒲团上修炼时使用（`sapi.message.spiritstone.mustuseinputuan`）。

### 蒲团（`xian:putuan`）

- 手持蒲团可放置生成 `xian:putuan` 实体，可骑乘。
- 拆除蒲团掉落蒲团物品。
- 坐上蒲团触发修炼状态，打开修炼表单。

### 修为系统

玩家拥有独立的 **境界 / 阶段 / 层次 / 灵力** 数据，通过动态属性（Dynamic Property）持久化：

- **境界**：凡人 → 练气 → 筑基 → 金丹 → 元婴 → 化神 → 练虚 → 合体 → 大乘 → 渡劫（10 个境界）
- **阶段**：初期 / 中期 / 后期 / 圆满（按层次进度计算）
- **层次**：每个境界有若干层（例如练气 13 层、筑基 9 层、渡劫 20 层）
- **灵力**：上限随境界与层次增长（`getSpiritMax`）
- 玩家屏幕 ActionBar 实时显示：`境界 + 层次 + 阶段 + 灵力/灵力上限`

## 开发

### 环境

- Node.js >= 18
- pnpm（`packageManager: pnpm@11.0.0`）

### 命令

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | `mbler watch` 监视模式，热更新到游戏目录（`outGameOnDev: true`） |
| `pnpm dev-build` | `mbler build`，手动构建并输出到游戏目录 |
| `pnpm build` | `BUILD_MODULE=release mbler build`，更新 `./dist` 并生成 `dist.mcaddon` |
| `pnpm type-check` | `mcx-tsc` TS 类型检查（改 TS 代码后必须运行） |

### 项目结构

```
behavior/
  blocks/         区块定义（灵石矿）
  entities/       实体定义（蒲团）
  features/       世界生成（矿石 feature）
  loot_tables/    战利品表
  recipes/        合成配方（熔炉 / 工作台）
  scripts/        TypeScript 脚本（含 .mcx 组件 / 事件）
resources/
  textures/       纹理
  texts/          zh_CN / en_US 语言文件
mbler.config.js   mbler 构建配置
```
