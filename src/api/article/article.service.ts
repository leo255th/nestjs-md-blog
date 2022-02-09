import { HttpCode, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArticleEntity } from 'src/models/article.entity';
import { FieldEntity } from 'src/models/field.entity';
import { TagEntity } from 'src/models/tag.entity';
import { UserEntity } from 'src/models/user.entity';
import { Repository } from 'typeorm';
import { ArticleCreateDto, FieldCreateDto, FieldEditDto, FieldNameItem } from './article.dto';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(TagEntity)
    private readonly tagRepository: Repository<TagEntity>,
    @InjectRepository(FieldEntity)
    private readonly fieldRepository: Repository<FieldEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) { }

  // 新增文章
  async articleCreate(
    dto: ArticleCreateDto
  ): Promise<number> {
      // 保存文章
      let article = new ArticleEntity();
      article.title = dto.title;
      article.description = dto.description;
      article.content = dto.content;
      article.fieldId = dto.fieldId;
      article.userId = dto.userId;
      article = await this.articleRepository.save(article);
      if(!article){
        throw new HttpException('文章创建失败',HttpStatus.INTERNAL_SERVER_ERROR)
      }
      // 保存标签
      for(let item of dto.tags){
        let tag=new TagEntity();
        tag.articleId=article.id;
        tag.tag=item;
        await this.tagRepository.save(tag);
      }
    return article.id;
  }
  // 新增分区
  async fieldCreate(
    dto:FieldCreateDto
  ):Promise<number>{
    let field=new FieldEntity();
    field.field=dto.field;
    field.order=dto.order;
    field.isVisiable=dto.isVisiable;
    await this.fieldRepository.save(field);
    return field.id;
  }
  // 修改分区
  async fieldEdit(
    dto:FieldEditDto
  ):Promise<number>{
    let field=await this.fieldRepository.findOne(dto.id);
    field={
      ...field,
      ...dto
    }
    const res=await this.fieldRepository.save(field);
    return res.id;
  }
  // 获取分区名称列表
  async getFieldNameList():Promise<FieldNameItem[]>{
    const res=await this.fieldRepository.find({isDeleted:false});
    const field_name_list=res.map(field_entity=>{
      return {
        id:field_entity.id,
        field:field_entity.field,
        order:field_entity.order,
        isVisiable:field_entity.isVisiable
      }
    });
    field_name_list.sort((a,b)=>a.order-b.order);
    return field_name_list;
  }
  
}
