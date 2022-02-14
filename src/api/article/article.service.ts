import { HttpCode, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArticleEntity } from 'src/models/article.entity';
import { FieldEntity } from 'src/models/field.entity';
import { TagEntity } from 'src/models/tag.entity';
import { UserEntity } from 'src/models/user.entity';
import { arrCompare } from 'src/utils/arrCompare.fuc';
import { Repository } from 'typeorm';
import { ArticleCreateDto, ArticleDetail, ArticleEditDto, ArticleList, ArticleListItem, ArticleListSearchDto, FieldCreateDto, FieldEditDto, FieldNameItem } from './article.dto';

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
    article.isVisiable=dto.isVisiable;
    article = await this.articleRepository.save(article);
    if (!article) {
      throw new HttpException('文章创建失败', HttpStatus.INTERNAL_SERVER_ERROR)
    }
    // 保存标签
    for (let item of dto.tags) {
      let tag = new TagEntity();
      tag.articleId = article.id;
      tag.tag = item;
      await this.tagRepository.save(tag);
    }
    return article.id;
  }
  // 新增分区
  async fieldCreate(
    dto: FieldCreateDto
  ): Promise<number> {
    let field = new FieldEntity();
    field.field = dto.field;
    field.order = dto.order;
    field.isVisiable = dto.isVisiable;
    await this.fieldRepository.save(field);
    return field.id;
  }
  // 修改分区
  async fieldEdit(
    dto: FieldEditDto
  ): Promise<number> {
    let field = await this.fieldRepository.findOne(dto.id);
    field = {
      ...field,
      ...dto
    }
    const res = await this.fieldRepository.save(field);
    return res.id;
  }
  // 修改文章
  async articleEdit(
    dto: ArticleEditDto
  ): Promise<number> {
    // 如果要修改标签
    if (dto.tags) {
      const tags = await this.tagRepository.find({ articleId: dto.id, isDeleted: false });
      // 如果传来的tags和文章本来的tags不相同,则删除原来的tags,保存新的tags
      if (!arrCompare(tags.map(tag_entity => tag_entity.tag), dto.tags)) {
        for (const tag_entity of tags) {
          tag_entity.isDeleted = true;
          await this.tagRepository.save(tag_entity);
        }
        // 保存新标签
        for (let item of dto.tags) {
          let tag = new TagEntity();
          tag.articleId = dto.id;
          tag.tag = item;
          await this.tagRepository.save(tag);
        }
      }
      delete dto.tags;
    }
    let article = await this.articleRepository.findOne(dto.id);
    delete dto.id;
    article = {
      ...article,
      ...dto
    }
    const res = await this.articleRepository.save(article);
    return res.id;
  }
  // 获取可见分区列表
  async getFieldNameList(
    isVisiable = true
  ): Promise<FieldNameItem[]> {
    const res = await this.fieldRepository.find({ isDeleted: false, isVisiable });
    const field_name_list = await Promise.all(res.map(async field_entity => {
      return {
        id: field_entity.id,
        field: field_entity.field,
        order: field_entity.order,
        isVisiable: field_entity.isVisiable,
        count: await this.articleRepository.count({
          fieldId: field_entity.id
        })
      }
    }));
    field_name_list.sort((a, b) => a.order - b.order);
    return field_name_list;
  }
  // 获取全部分区
  async getAllFieldNameList(
  ): Promise<FieldNameItem[]> {
    const res = await this.fieldRepository.find({ isDeleted: false });
    const field_name_list = await Promise.all(res.map(async field_entity => {
      return {
        id: field_entity.id,
        field: field_entity.field,
        order: field_entity.order,
        isVisiable: field_entity.isVisiable,
        count: await this.articleRepository.count({
          fieldId: field_entity.id
        })
      }
    }));
    field_name_list.sort((a, b) => a.order - b.order);
    return field_name_list;
  }

  // 获取文章列表
  async getArticleList(
    dto: ArticleListSearchDto
  ): Promise<ArticleList> {
    let tags = [];
    let qb = this.articleRepository.createQueryBuilder('a');
    let res;
    if (dto.tags) {
      if (typeof dto.tags == 'string') {
        tags = [dto.tags];
      } else {
        tags = [...dto.tags];
      }
      qb = qb.leftJoinAndSelect(TagEntity, 't', 't.articleId=a.id and t.isDeleted <> 1')
    }
    res = await qb
      .where(dto.fieldId ? 'a.fieldId=:fieldId' : '1=1', { fieldId: dto.fieldId })
      .andWhere('a.userId=:userId', { userId: dto.userId })
      .andWhere(dto.tags ? `t.tag in ('${tags.join("','")}')` : '1=1')
      .andWhere('a.isDeleted <> 1')
      .andWhere('a.isVisiable=:isVisiable', { isVisiable: 1 })
      .orderBy({ 'a.updatedAt': 'DESC' })
      .skip(dto.offset)
      .take(dto.num)
      .getManyAndCount();
    const list: ArticleListItem[] = await Promise.all<ArticleListItem[]>(res[0].map(async item => {
      return {
        id: item.id,
        userId: item.userId,
        title: item.title,
        description: item.description,
        field: await (await this.fieldRepository.findOne(item.fieldId)).field,
        tags: (await (await this.tagRepository.find({ articleId: item.id, isDeleted: false })).map(tag_entity => tag_entity.tag)),
        time: item.updatedAt,
        isVisiable: item.isVisiable
      } as ArticleListItem
    }))
    return {
      list,
      total: res[1]
    }
  }

  // 获取全部文章列表
  async getAllArticleList(
    dto: ArticleListSearchDto
  ): Promise<ArticleList> {
    let tags = [];
    let qb = this.articleRepository.createQueryBuilder('a');
    let res;
    if (dto.tags) {
      if (typeof dto.tags == 'string') {
        tags = [dto.tags];
      } else {
        tags = [...dto.tags];
      }
      qb = qb.leftJoinAndSelect(TagEntity, 't', 't.articleId=a.id and t.isDeleted <> 1')
    }
    res = await qb
      .where(dto.fieldId ? 'a.fieldId=:fieldId' : '1=1', { fieldId: dto.fieldId })
      .andWhere('a.userId=:userId', { userId: dto.userId })
      .andWhere(dto.tags ? `t.tag in ('${tags.join("','")}')` : '1=1')
      .andWhere('a.isDeleted <> 1')
      .orderBy({ 'a.updatedAt': 'DESC' })
      .skip(dto.offset)
      .take(dto.num)
      .getManyAndCount();
    const list: ArticleListItem[] = await Promise.all<ArticleListItem[]>(res[0].map(async item => {
      return {
        id: item.id,
        userId: item.userId,
        title: item.title,
        description: item.description,
        field: await (await this.fieldRepository.findOne(item.fieldId)).field,
        tags: (await this.tagRepository.find({ articleId: item.id, isDeleted: false })).map(tag_entity => tag_entity.tag),
        time: item.updatedAt,
        isVisiable: item.isVisiable
      } as ArticleListItem
    }))
    return {
      list,
      total: res[1]
    }
  }

  // 通过ID获取文章详情
  // 获取仅可见文章
  async getArticleDetailVisiable(
    id: number
  ): Promise<ArticleDetail> {
    const article = await this.articleRepository.findOne(id);
    if (!article) {
      throw new HttpException('无效文章ID', 404)
    }
    if (article.isVisiable == false) {
      throw new HttpException('文章不存在', 404)
    }
    if (article.isDeleted == true) {
      throw new HttpException('文章不存在', 404)
    }
    return {
      id: article.id,
      userId: article.userId,
      title: article.title,
      description: article.description,
      content: article.content,
      field: await (await this.fieldRepository.findOne(article.fieldId)).field,
      fieldId: article.fieldId,
      tags: (await this.tagRepository.find({ articleId: article.id, isDeleted: false })).map(tag_entity => tag_entity.tag),
      time: article.updatedAt,
    }
  }
  // 通过ID获取文章详情
  async getArticleDetailAny(
    id: number
  ): Promise<ArticleDetail> {
    const article = await this.articleRepository.findOne(id);
    if (!article) {
      throw new HttpException('文章ID无效', 404)
    }
    if (article.isDeleted == true) {
      throw new HttpException('文章已删除', 404)
    }
    return {
      id: article.id,
      userId: article.userId,
      title: article.title,
      description: article.description,
      content: article.content,
      field: await (await this.fieldRepository.findOne(article.fieldId)).field,
      fieldId: article.fieldId,
      tags: (await this.tagRepository.find({ articleId: article.id, isDeleted: false })).map(tag_entity => tag_entity.tag),
      time: article.updatedAt,
    }
  }
}
