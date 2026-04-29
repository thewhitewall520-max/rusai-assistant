# Kimi (Moonshot AI) API 集成

## 优势

| 特点 | 说明 |
|------|------|
| **中文能力强** | 适合中俄翻译、中文写作 |
| **国内可用** | 无需国外信用卡 |
| **价格优惠** | 比 OpenAI 便宜 |
| **长文本** | 支持 200k 上下文 |

## 获取 API Key

1. 访问 https://platform.moonshot.cn
2. 注册账号
3. 实名认证
4. 创建 API Key
5. 充值使用

## 模型选择

| 模型 | 上下文 | 特点 |
|------|--------|------|
| **moonshot-v1-8k** | 8k | 快速，便宜 |
| **moonshot-v1-32k** | 32k | 平衡 |
| **moonshot-v1-128k** | 128k | 长文本 |

## 代码集成

### Python (FastAPI)

```python
import requests

KIMI_API_KEY = "your-kimi-api-key"
KIMI_API_URL = "https://api.moonshot.cn/v1/chat/completions"

def generate_with_kimi(prompt, model="moonshot-v1-8k"):
    headers = {
        "Authorization": f"Bearer {KIMI_API_KEY}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": model,
        "messages": [
            {"role": "system", "content": "你是专业的写作助手"},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7
    }
    
    response = requests.post(KIMI_API_URL, headers=headers, json=data)
    return response.json()["choices"][0]["message"]["content"]

# 使用示例
text = generate_with_kimi("将这段中文翻译成俄语: 你好")
print(text)
```

### Node.js

```javascript
const axios = require('axios');

const KIMI_API_KEY = 'your-kimi-api-key';
const KIMI_API_URL = 'https://api.moonshot.cn/v1/chat/completions';

async function generateWithKimi(prompt, model = 'moonshot-v1-8k') {
    const response = await axios.post(KIMI_API_URL, {
        model: model,
        messages: [
            { role: 'system', content: '你是专业的写作助手' },
            { role: 'user', content: prompt }
        ],
        temperature: 0.7
    }, {
        headers: {
            'Authorization': `Bearer ${KIMI_API_KEY}`,
            'Content-Type': 'application/json'
        }
    });
    
    return response.data.choices[0].message.content;
}
```

## 与 OpenAI API 对比

| 特性 | Kimi | OpenAI |
|------|------|--------|
| 国内访问 | ✅ 快 | ❌ 慢/需代理 |
| 中文能力 | ✅ 强 | ⚠️ 一般 |
| 价格 | ✅ 便宜 | ❌ 贵 |
| 俄语能力 | ⚠️ 一般 | ✅ 强 |

## 建议

对于 **中俄写作工具**，建议：
- **中文→俄文翻译**: 用 OpenAI (gpt-4) 或 DeepL
- **中文写作**: 用 Kimi (中文更强)
- **邮件/论文**: 混合使用

## 配置环境变量

```bash
# .env 文件
KIMI_API_KEY=your-kimi-api-key
OPENAI_API_KEY=your-openai-api-key

# 使用哪个模型
AI_PROVIDER=kimi  # 或 openai
```

## 完整示例

```python
import os

AI_PROVIDER = os.getenv("AI_PROVIDER", "kimi")

def generate_text(prompt):
    if AI_PROVIDER == "kimi":
        return generate_with_kimi(prompt)
    else:
        return generate_with_openai(prompt)
```

需要我帮你集成到现有代码中吗？