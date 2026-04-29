# Writing Assistant - AI 多语言写作平台

## 项目概述

一个支持中俄英及小语种的 AI 写作辅助平台，涵盖邮件写作、论文写作、普通翻译等功能。

## 核心功能

- **邮件写作**: 商务邮件、正式邮件、日常邮件等模板与 AI 辅助
- **论文写作**: 学术写作辅助、引用格式、查重提示
- **翻译服务**: 多语言互译，支持小语种
- **多语言支持**: 中文、俄语、英语及 50+ 小语种

## 技术栈

### 前端
- React 18 + TypeScript
- Tailwind CSS
- i18next 国际化
- Monaco Editor (富文本编辑)

### 后端
- Node.js + Express / NestJS
- PostgreSQL (主数据库)
- Redis (缓存)
- OpenAI API / Claude API (AI 能力)

### 基础设施
- Docker + Docker Compose
- GitHub Actions CI/CD
- Nginx 反向代理

## 项目结构

```
writing-assistant/
├── docs/                  # 文档
│   ├── api/              # API 文档
│   ├── architecture/     # 架构设计
│   └── requirements/     # 需求文档
├── src/
│   ├── frontend/         # 前端应用
│   ├── backend/          # 后端服务
│   └── shared/           # 共享类型和工具
├── infra/                # 基础设施配置
├── tests/                # 测试
└── README.md
```

## 开发阶段

1. **Phase 1**: 基础架构搭建 (Week 1-2)
2. **Phase 2**: 核心功能开发 (Week 3-6)
3. **Phase 3**: 多语言支持 (Week 7-8)
4. **Phase 4**: 测试与优化 (Week 9-10)
5. **Phase 5**: 部署与上线 (Week 11-12)

## 快速开始

```bash
# 克隆项目
git clone <repo-url>
cd writing-assistant

# 启动开发环境
docker-compose up -d

# 安装依赖
npm install

# 启动前端
cd src/frontend && npm run dev

# 启动后端
cd src/backend && npm run dev
```

## 许可证

MIT
# Deployed
