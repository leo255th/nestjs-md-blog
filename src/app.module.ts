import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './api/user/user.module';
import { ArticleModule } from './api/article/article.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_CONFIG } from './app.config';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forRoot(
      APP_CONFIG.MARIADB
    )
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
