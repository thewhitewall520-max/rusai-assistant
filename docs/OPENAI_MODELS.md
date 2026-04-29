# OpenAI 模型选择

## 可用模型

| 模型 | 价格(输入) | 价格(输出) | 特点 | 推荐 |
|------|-----------|-----------|------|------|
| **gpt-4o** | $5/1M tokens | $15/1M tokens | 最新，最快，性价比高 | ⭐⭐⭐⭐⭐ |
| **gpt-4o-mini** | $0.15/1M tokens | $0.60/1M tokens | 便宜，速度快 | ⭐⭐⭐⭐⭐ |
| **gpt-4-turbo** | $10/1M tokens | $30/1M tokens | 能力强，贵 | ⭐⭐⭐⭐ |
| **gpt-4** | $30/1M tokens | $60/1M tokens | 最强，最贵 | ⭐⭐⭐ |
| **gpt-3.5-turbo** | $0.50/1M tokens | $1.50/1M tokens | 便宜，基础能力 | ⭐⭐⭐ |

## 推荐方案

### 方案 1: gpt-4o-mini (最省钱)
- 价格只有 gpt-4 的 1/100
- 速度最快
- 适合翻译、邮件等基础任务

### 方案 2: gpt-4o (平衡)
- 性价比高
- 能力强于 mini
- 适合论文写作等复杂任务

### 方案 3: 混合使用
- 简单任务: gpt-4o-mini
- 复杂任务: gpt-4o

## 配置方法

在代码中修改模型名称：

```python
# backend/main.py 或相关文件
import openai

openai.api_key = "your-api-key"

# 选择模型
MODEL = "gpt-4o-mini"  # 或 "gpt-4o", "gpt-4-turbo"

response = openai.ChatCompletion.create(
    model=MODEL,
    messages=[...]
)
```

## 获取 API Key

1. 访问 https://platform.openai.com
2. 注册账号
3. 绑定信用卡 (需要国外信用卡)
4. 创建 API Key
5. 充值使用

## 替代方案 (无信用卡)

如果没有国外信用卡，可以考虑：

| 方案 | 说明 |
|------|------|
| **Azure OpenAI** | 国内可用，需申请 |
| **API 代理服务** | 第三方提供的中转服务 |
| **其他模型** | Claude, Gemini, 文心一言等 |

需要我帮你配置具体的模型切换吗？