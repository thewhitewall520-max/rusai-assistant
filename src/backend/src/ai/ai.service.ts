import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI;
  private anthropic: Anthropic;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
    this.anthropic = new Anthropic({
      apiKey: this.configService.get<string>('ANTHROPIC_API_KEY'),
    });
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
    return this.generateWithOpenAI(prompt);
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
    return this.generateWithOpenAI(prompt);
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

    return this.generateWithOpenAI(prompt);
  }

  /**
   * 续写
   */
  async continue(text: string, language: string): Promise<string> {
    const prompt = `请续写以下内容，保持连贯性和一致性：

${text}

续写（使用${language}语言）：`;

    return this.generateWithOpenAI(prompt);
  }

  /**
   * 生成大纲
   */
  async generateOutline(topic: string, language: string): Promise<string> {
    const prompt = `请为以下主题生成详细的大纲：

主题：${topic}

要求：
1. 使用${language}语言
2. 包含主要章节和子章节
3. 每个章节简要说明内容要点

大纲：`;

    return this.generateWithOpenAI(prompt);
  }

  /**
   * 使用 OpenAI 生成
   */
  private async generateWithOpenAI(prompt: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: this.configService.get('OPENAI_MODEL', 'gpt-4'),
        messages: [
          {
            role: 'system',
            content: '你是一个专业的写作助手，擅长多语言写作、翻译和文本优化。',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: parseInt(this.configService.get('OPENAI_MAX_TOKENS', '4000')),
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      this.logger.error('OpenAI API error:', error);
      throw new Error('AI 生成失败，请稍后重试');
    }
  }

  /**
   * 使用 Claude 生成 (备用)
   */
  private async generateWithClaude(prompt: string): Promise<string> {
    try {
      const response = await this.anthropic.messages.create({
        model: this.configService.get('ANTHROPIC_MODEL', 'claude-3-opus-20240229'),
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      return response.content[0]?.text || '';
    } catch (error) {
      this.logger.error('Claude API error:', error);
      throw new Error('AI 生成失败，请稍后重试');
    }
  }

  /**
   * 构建邮件提示词
   */
  private buildEmailPrompt(options: {
    type: string;
    recipient: string;
    purpose: string;
    tone: string;
    language: string;
    keyPoints?: string[];
  }): string {
    return `请撰写一封${options.type}邮件：

收件人：${options.recipient}
目的：${options.purpose}
语气：${options.tone === 'formal' ? '正式' : options.tone === 'friendly' ? '友好' : '随意'}
语言：${options.language}
${options.keyPoints?.length ? `要点：\n${options.keyPoints.map(p => `- ${p}`).join('\n')}` : ''}

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
  private buildEssayPrompt(options: {
    topic: string;
    type: string;
    length: string;
    language: string;
    citations?: string;
  }): string {
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