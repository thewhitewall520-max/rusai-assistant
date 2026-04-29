import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private ollamaUrl: string;
  private model: string;

  constructor(private configService: ConfigService) {
    this.ollamaUrl = this.configService.get<string>('OLLAMA_URL', 'http://localhost:11434');
    this.model = this.configService.get<string>('LOCAL_MODEL', 'qwen2.5:7b');
  }

  /**
   * 调用本地 Ollama 模型
   */
  private async callOllama(prompt: string, system?: string) {
    try {
      const response = await axios.post(
        `${this.ollamaUrl}/api/generate`,
        {
          model: this.model,
          prompt: system ? `${system}\n\n${prompt}` : prompt,
          stream: false,
          options: {
            temperature: 0.7,
            num_predict: 4000,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.response || '';
    } catch (error) {
      this.logger.error('Ollama API error:', error.message);
      throw new Error('AI 生成失败，请检查 Ollama 服务是否运行');
    }
  }

  /**
   * 生成邮件内容
   */
  async generateEmail(options: {
    type: string;
    recipient: string;
    purpose: string;
    tone: 'formal' | 'informal' | 'friendly';
    language: string;
    keyPoints?: string[];
  }): Promise<string> {
    const prompt = this.buildEmailPrompt(options);
    return this.callOllama(prompt, '你是一个专业的写作助手，擅长多语言写作。');
  }

  /**
   * 生成论文内容
   */
  async generateEssay(options: {
    topic: string;
    type: string;
    length: string;
    language: string;
    citations?: string;
  }): Promise<string> {
    const prompt = this.buildEssayPrompt(options);
    return this.callOllama(prompt, '你是一个专业的学术写作助手。');
  }

  /**
   * 改写/润色
   */
  async rewrite(text: string, options: {
    tone?: string;
    style?: string;
    language: string;
  }): Promise<string> {
    const prompt = `请改写以下文本，使其${options.tone || '更专业'}：

原文：
${text}

要求：
1. 保持原意不变
2. 使用${options.language}语言
3. ${options.style ? `采用${options.style}风格` : ''}

改写后：`;

    return this.callOllama(prompt, '你是一个专业的文本润色专家。');
  }

  /**
   * 翻译
   */
  async translate(text: string, sourceLang: string, targetLang: string): Promise<string> {
    const prompt = `请将以下${sourceLang}文本翻译成${targetLang}：

原文：
${text}

要求：
1. 保持原文的语气和风格
2. 确保翻译准确、自然
3. 专业术语保持一致

翻译：`;

    return this.callOllama(prompt, '你是一个专业的翻译专家，精通多种语言。');
  }

  /**
   * 构建邮件提示词
   */
  private buildEmailPrompt(options: any): string {
    return `请撰写一封${options.type}邮件：

收件人：${options.recipient}
目的：${options.purpose}
语气：${options.tone === 'formal' ? '正式' : options.tone === 'friendly' ? '友好' : '随意'}
语言：${options.language}
${options.keyPoints?.length ? `要点：\n${options.keyPoints.map((p: string) => `- ${p}`).join('\n')}` : ''}

要求：
1. 使用${options.language}语言撰写
2. 包含合适的称呼和结尾
3. 内容清晰、简洁
4. 符合${options.type}邮件的格式规范

邮件内容：`;
  }

  /**
   * 构建论文提示词
   */
  private buildEssayPrompt(options: any): string {
    return `请撰写一篇${options.type}：

主题：${options.topic}
长度：${options.length}
语言：${options.language}
${options.citations ? `引用格式：${options.citations}` : ''}

要求：
1. 使用${options.language}语言撰写
2. 结构完整（引言、正文、结论）
3. 论点清晰，论据充分
4. 语言学术化、专业化
5. ${options.citations ? '包含适当的引用和参考文献' : ''}

论文内容：`;
  }
}