import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DocumentsModule } from './documents/documents.module';
import { AiModule } from './ai/ai.module';
import { TranslationModule } from './translation/translation.module';
import { TemplatesModule } from './templates/templates.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    // 配置
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    
    // 限流
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000, // 1分钟
          limit: 10,  // 10次请求
        },
      ],
    }),
    
    // 数据库
    PrismaModule,
    RedisModule,
    
    // 业务模块
    AuthModule,
    UsersModule,
    DocumentsModule,
    AiModule,
    TranslationModule,
    TemplatesModule,
  ],
})
export class AppModule {}