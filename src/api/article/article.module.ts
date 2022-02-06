import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleEntity } from 'src/models/article.entity';
import { FieldEntity } from 'src/models/field.entity';
import { TagEntity } from 'src/models/tag.entity';
import { UserEntity } from 'src/models/user.entity';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ArticleEntity, TagEntity, FieldEntity, UserEntity
    ])
  ],
  controllers: [ArticleController],
  providers: [ArticleService]
})
export class ArticleModule { }
