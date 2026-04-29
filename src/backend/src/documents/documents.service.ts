import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: {
    title: string;
    content: string;
    type: string;
    language: string;
  }) {
    const document = await this.prisma.document.create({
      data: {
        ...data,
        userId,
        wordCount: this.countWords(data.content),
        charCount: data.content.length,
      },
    });

    return document;
  }

  async findAll(userId: string) {
    return this.prisma.document.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const document = await this.prisma.document.findFirst({
      where: { id, userId },
    });

    if (!document) {
      throw new NotFoundException('文档不存在');
    }

    return document;
  }

  async update(userId: string, id: string, data: {
    title?: string;
    content?: string;
    type?: string;
    language?: string;
    status?: string;
  }) {
    await this.findOne(userId, id);

    const updateData: any = { ...data };
    
    if (data.content) {
      updateData.wordCount = this.countWords(data.content);
      updateData.charCount = data.content.length;
    }

    return this.prisma.document.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    
    return this.prisma.document.delete({
      where: { id },
    });
  }

  private countWords(text: string): number {
    // 中文字符计数
    const chineseChars = text.match(/[\u4e00-\u9fa5]/g) || [];
    // 英文单词计数
    const englishWords = text.match(/[a-zA-Z]+/g) || [];
    
    return chineseChars.length + englishWords.length;
  }
}