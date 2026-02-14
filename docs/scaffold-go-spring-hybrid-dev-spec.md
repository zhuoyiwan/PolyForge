# 混合语言全栈脚手架详细开发文档（Go-Gin / Spring Boot）

## 1. 文档定位

本文档定义脚手架的详细开发规范，用于指导从 0 到 1 实现一个可发布的 CLI 工具。  
本版本明确约束：

1. 后端主栈仅支持：`go-gin`、`springboot`
2. 支持按需启用混合语言模块（如 Python）
3. 内置项目基础设施（标准响应格式、错误处理、日志、追踪等）
4. 数据模块可选且可组合，新增 `sqlite` 支持

## 2. 产品目标

### 2.1 核心目标

1. 用一条命令生成“可运行、可测试、可扩展”的企业级全栈项目骨架
2. 让不同后端主栈（Go/Java）共享一致的工程规范
3. 通过模块化拼装实现“主栈 + 任务语言”的混合开发模式

### 2.2 非目标（v1 不做）

1. 不支持 `go-fiber`（已明确移除）
2. 不做在线模板市场
3. 不做 GUI
4. 不做旧项目自动迁移

## 3. 用户与典型场景

### 3.1 目标用户

1. 以 Go 或 Java 作为主后端的全栈开发团队
2. 需要引入 Python 处理特定任务的项目
3. 希望统一项目规范、降低初始化成本的团队

### 3.2 使用场景

1. 新建业务系统：`React + Go-Gin + MySQL + Redis`
2. 新建平台系统：`Vue + Spring Boot + PostgreSQL + Redis`
3. AI/计算增强：`Go-Gin + Python Worker + SQLite`

## 4. 功能范围（v1）

### 4.1 必须功能

1. CLI 创建命令：`scaffold create <project-name>`
2. 交互式选择：
   - 前端：`react` / `vue` / `none`
   - 后端主栈：`go-gin` / `springboot`
   - 混合模块（多选）：`python-worker`
   - 数据模块（多选）：`mysql`、`postgresql`、`redis`、`sqlite`、`mongodb`、`none`
3. 组合规则校验（非法组合拦截、给出提示）
4. 生成统一基础能力：
   - 标准响应结构
   - 全局异常处理
   - 请求日志
   - 健康检查
   - 基础配置管理
5. 可选任务：
   - 依赖安装
   - Git 初始化
   - Docker 基础配置生成（可选）

### 4.2 次要功能（v1.1）

1. `scaffold doctor` 环境检查
2. `scaffold list` 展示模板与模块
3. `--yes` 非交互默认模式

## 5. 架构与目录设计

## 5.1 CLI 仓库目录

```text
scaffold-cli/
  src/
    commands/
      create.ts
      doctor.ts
    core/
      prompts.ts
      validator.ts
      renderer.ts
      installer.ts
      git.ts
    templates/
      base/
      frontend/
        react/
        vue/
      backend/
        go-gin/
        springboot/
      modules/
        python-worker/
      data/
        mysql/
        postgresql/
        redis/
        sqlite/
        mongodb/
    types/
      config.ts
  docs/
  package.json
  tsconfig.json
```

### 5.2 生成后项目目录（示例）

```text
my-app/
  apps/
    web/                 # react or vue
    api/                 # go-gin or springboot
    worker-python/       # optional
  infra/
    docker/              # optional
    scripts/
  docs/
  .env.example
  README.md
```

## 6. 初始化交互与参数设计

### 6.1 交互式问题清单

1. 项目名称 `projectName`
2. 前端框架 `frontend`（react/vue/none）
3. 后端主栈 `backendMain`（go-gin/springboot）
4. 混合模块 `extraModules`（多选，v1 仅 `python-worker`）
5. 数据模块 `dataModules`（多选）
6. 包管理器 `packageManager`（pnpm/npm/yarn）
7. 是否安装依赖 `installDeps`
8. 是否初始化 Git `initGit`
9. 是否生成 Docker 基础配置 `docker`

### 6.2 CLI 参数（覆盖交互）

1. `--frontend <react|vue|none>`
2. `--backend <go-gin|springboot>`
3. `--modules <python-worker>`
4. `--data <mysql,postgresql,redis,sqlite,mongodb,none>`
5. `--pm <pnpm|npm|yarn>`
6. `--install`
7. `--git`
8. `--docker`
9. `--yes`

## 7. 模块拼装规则（核心）

### 7.1 通用规则

1. `none` 与其他数据模块互斥
2. 多数据库允许组合（如 `mysql + redis`、`postgresql + redis`）
3. 选择 `sqlite` 时默认生成本地文件存储配置
4. 未选择前端时，仅生成后端与可选模块

### 7.2 建议提示规则

1. `springboot + sqlite`：提示适用于轻量场景，生产建议迁移 PostgreSQL/MySQL
2. 选择 `python-worker`：提示检查 Python 版本与虚拟环境工具
3. 选择 `python-worker`：提示检查 Python 版本与虚拟环境工具

### 7.3 非法组合（v1 直接禁止）

1. `data=none` 且同时出现任意其他数据库
2. 模块重复选择

## 8. 统一基础设施规范

### 8.1 标准响应格式（跨栈统一）

```json
{
  "code": 0,
  "message": "success",
  "data": {},
  "traceId": "f4f0b9...",
  "timestamp": "2026-02-14T12:34:56Z"
}
```

字段规范：

1. `code`：业务状态码，`0` 表示成功
2. `message`：可读信息
3. `data`：业务数据，允许 `null`
4. `traceId`：请求链路 ID
5. `timestamp`：ISO8601 UTC

### 8.2 错误响应规范

```json
{
  "code": 10001,
  "message": "validation error",
  "data": null,
  "traceId": "f4f0b9...",
  "timestamp": "2026-02-14T12:34:56Z"
}
```

### 8.3 基础能力清单（模板内置）

1. 全局异常捕获与统一响应
2. 请求日志（含 traceId）
3. 健康检查接口 `/health`
4. 配置分层（dev/test/prod）
5. 环境变量示例文件 `.env.example`

## 9. 数据模块详细规范（含 SQLite）

### 9.1 MySQL

1. 生成连接配置模板
2. 生成基础建表示例
3. README 提供本地启动建议（Docker）

### 9.2 PostgreSQL

1. 与 MySQL 同级能力
2. 默认连接池参数占位

### 9.3 Redis

1. 用于缓存/会话/限流基础能力占位
2. 提供基础 key 命名规范示例

### 9.4 SQLite（新增）

1. 默认本地文件 `./data/app.db`
2. 自动生成忽略规则，避免提交数据库文件（可配置）
3. 适合本地开发、轻量部署、PoC

### 9.5 MongoDB

1. 生成连接占位与示例 model
2. 文档化适配场景（非关系型业务）

## 10. Go-Gin 与 SpringBoot 模板最低要求

### 10.1 Go-Gin

1. 目录分层：`cmd`、`internal`、`pkg`
2. 路由 + handler + service + repository 分层样例
3. 中间件：traceId、recover、日志
4. 统一响应封装函数

### 10.2 Spring Boot

1. 分层：`controller`、`service`、`repository`、`config`
2. 全局异常处理器 `@ControllerAdvice`
3. 响应包装器（统一返回结构）
4. 配置文件分环境 `application-*.yml`

## 11. 混合语言模块规范

### 11.1 Python Worker

1. 目录：`apps/worker-python`
2. 基础内容：任务入口、示例任务、依赖清单
3. 与主后端通信方式：HTTP 或消息队列占位

### 11.2 Worker 异步任务模块（Go/Python）

1. 目标：跑定时任务、消息消费、批处理，与主 API 解耦
2. 目录建议：`apps/worker-go` 或 `apps/worker-python`
3. 默认能力：任务注册、重试策略、死信占位、任务状态跟踪
4. 集成方式：通过 MQ 或数据库任务表与主后端协同

### 11.3 Gateway/BFF 模块（Node/Go）

1. 目标：为前端做接口聚合、鉴权透传、限流与灰度控制
2. 目录建议：`apps/gateway-bff`
3. 默认能力：请求聚合、统一鉴权中间件、限流中间件、熔断占位
4. 集成方式：位于前端与主 API 之间，统一外部入口

### 11.4 Python-AI 模块（FastAPI + 推理脚本）

1. 目标：单独承载 AI/数据处理，避免模型依赖污染主后端
2. 目录建议：`apps/python-ai`
3. 默认能力：推理 API、模型加载占位、批量任务脚本、健康检查
4. 集成方式：主后端通过 HTTP/gRPC 调用，配合 traceId 透传

### 11.5 gRPC 内部服务模块

1. 目标：支持 Go/Java/Python 多语言稳定互调
2. 目录建议：`apps/grpc-service` + `contracts/proto`
3. 默认能力：proto 示例、代码生成脚本、错误码映射、健康检查
4. 集成方式：作为内部服务协议层，降低 HTTP 手写契约漂移风险

### 11.6 MQ 消息队列模块（Kafka/RabbitMQ/NATS）

1. 目标：让 Go、Java、Python 模块异步协作，提升系统扩展性
2. 目录建议：`infra/mq` + 各服务内 `messaging` 目录
3. 默认能力：生产/消费样例、重试与幂等策略、死信队列占位
4. 集成方式：与 worker、python-ai、主 API 形成异步链路

### 11.7 Cache 模块（Redis）

1. 目标：统一缓存能力，提升性能与抗压能力
2. 目录建议：`infra/cache` 或服务内 `cache` 包
3. 默认能力：缓存 key 规范、TTL 策略、热点 key 保护占位
4. 集成方式：与主后端、BFF、认证模块共享缓存约定

### 11.8 Observability 观测模块（OpenTelemetry + Prometheus + Grafana）

1. 目标：统一日志、指标、链路追踪，支持混合语言问题定位
2. 目录建议：`infra/observability`
3. 默认能力：otel SDK 接入模板、metrics 导出、Grafana 看板占位
4. 集成方式：主后端与扩展模块统一 traceId/span 规范

### 11.9 Auth 认证中心模块（JWT/OAuth2）

1. 目标：集中认证与授权，避免各服务重复实现安全逻辑
2. 目录建议：`apps/auth-center`
3. 默认能力：登录/刷新令牌、权限校验、客户端配置占位
4. 集成方式：主 API、BFF、worker 通过 token/服务凭证对接

### 11.10 模块分级（实施建议）

1. v1 交付：`python-worker`、`cache(redis)`、`auth` 基础占位
2. v1.1 扩展：`worker-go/python`、`gateway-bff`、`python-ai`、`grpc`
3. v1.2 扩展：`mq`、`observability` 完整模板化

## 12. 开发计划（6 周）

### 第 1 周：CLI 基础框架

1. 初始化 TypeScript CLI 工程
2. 实现命令入口与参数解析
3. 实现 create 主流程骨架

### 第 2 周：模板系统

1. 建立模板目录和元信息机制
2. 实现模板拷贝 + 变量渲染
3. 实现组合拼装（frontend/backend/modules/data）

### 第 3 周：后端主栈模板

1. 完成 `go-gin` 模板
2. 完成 `springboot` 模板
3. 接入统一响应与错误处理

### 第 4 周：数据与混合模块

1. 接入 `mysql/postgresql/redis/sqlite/mongodb`
2. 实现 `python-worker`，并加入 `auth/cache` 基础占位
3. 完善组合规则校验

### 第 5 周：工程化与测试

1. 单元测试（渲染、参数、校验）
2. 集成测试（多组合生成）
3. 文档与故障排查补齐

### 第 6 周：发布准备

1. 体验优化与错误文案打磨
2. beta 发布与反馈修复
3. 发布 v1.0.0

## 13. 测试与验收标准

### 13.1 单元测试

1. 参数覆盖优先级（CLI > 交互 > 默认值）
2. 组合规则校验
3. 渲染变量完整性

### 13.2 集成测试矩阵（最小）

1. `react + go-gin + mysql + redis`
2. `vue + springboot + postgresql + redis`
3. `none + go-gin + sqlite`
4. `react + springboot + sqlite + python-worker`
5. `vue + go-gin + mongodb + python-worker`

### 13.3 验收门槛

1. 上述组合均可生成成功
2. 生成项目可执行最小 `dev/build/test` 命令
3. 统一响应格式在 Go 与 Java 样例接口中一致

## 14. 风险与应对

1. 组合爆炸风险：
   - 通过“模块元数据 + 规则引擎”管理组合，而不是手写分支
2. 多语言环境差异：
   - `doctor` 命令给出环境缺失诊断
3. 模板维护成本：
   - 抽取公共片段，减少重复模板代码

## 15. 发布策略

1. `v0.1.0-beta`：先开放 `go-gin + react/vue + sqlite/mysql/redis`
2. `v0.2.0-beta`：加入 springboot 与 python 模块
3. `v1.0.0`：稳定发布，补齐文档与测试矩阵

## 16. v1 决策摘要（锁定）

1. 后端主栈仅：`go-gin`、`springboot`
2. 数据模块包含：`mysql`、`postgresql`、`redis`、`sqlite`、`mongodb`、`none`
3. 支持混合模块：`python-worker`
4. 必须内置统一响应与基础工程能力

---

本文件是开发实施依据。后续如要变更，请在文档末尾追加“决策变更记录（日期 + 变更项 + 原因）”。
