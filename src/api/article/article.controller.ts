import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ArticleCreateDto, ArticleDetail, ArticleEditDto, ArticleList, ArticleListSearchDto, FieldCreateDto, FieldEditDto, FieldNameItem } from './article.dto';
import { ArticleService } from './article.service';
import { Request } from 'express';
import { Accesses } from 'src/decorators/accesses.decorator';

@Controller('article')
@ApiBearerAuth()
export class ArticleController {
  constructor(
    private readonly articleService:ArticleService
  ){}

  @Accesses('ADMIN')
  @Post('create-article')
  @ApiResponse({ status: 201, description: '文章创建成功,返回文章的ID', type: Number })
  @ApiTags('文章-创建')
  async articleCreate(
    @Body() dto: ArticleCreateDto,
  ): Promise<number> {
    return this.articleService.articleCreate(dto);
  }
  @Accesses('ADMIN')
  @Post('create-field')
  @ApiResponse({ status: 201, description: '分区创建成功,返回分区的ID', type: Number })
  @ApiTags('分区-创建')
  async fieldCreate(
    @Body() dto: FieldCreateDto,
  ): Promise<number> {
    return this.articleService.fieldCreate(dto);
  }
  @Accesses('ADMIN')
  @Post('edit-field')
  @ApiResponse({ status: 201, description: '分区修改成功,返回分区的ID', type: Number })
  @ApiTags('分区-修改')
  async fieldEdit(
    @Body() dto: FieldEditDto,
  ): Promise<number> {
    return this.articleService.fieldEdit(dto);
  }
  @Get('get-field-list')
  @ApiResponse({status:200,description:'分区名称列表',type:[FieldNameItem]})
  @ApiTags('分区-获取-列表-仅可见')
  async getFieldNameList(
  ):Promise<FieldNameItem[]>{
    return this.articleService.getFieldNameList()
  }
  @Accesses('ADMIN')
  @Get('get-all-field-list')
  @ApiResponse({status:200,description:'分区名称列表',type:[FieldNameItem]})
  @ApiTags('分区-获取-列表-全部')
  async getAllFieldNameList(
  ):Promise<FieldNameItem[]>{
    return this.articleService.getAllFieldNameList()
  }

  @Get('get-tag-list')
  @ApiResponse({status:200,description:'标签名称列表',type:[String]})
  @ApiTags('标签-获取-列表')
  async getTagList(
  ):Promise<string[]>{
    return this.articleService.getTagList()
  }
  
  @Get('get-visiable-article')
  @ApiResponse({status:200,description:'文章详情',type:ArticleDetail})
  @ApiResponse({status:404,description:'文章不存在'})
  @ApiQuery({
    name:'articleId',
    type:Number,
    description:'文章ID'
  })
  @ApiTags('文章-获取-详情-仅可见')
  async getArticleDetailVisiable(
    @Query('articleId')articleId:number
  ):Promise<ArticleDetail>{
    return this.articleService.getArticleDetailVisiable(articleId);
  }
  @Accesses('ADMIN')
  @Get('get-any-article')
  @ApiResponse({status:200,description:'文章详情',type:ArticleDetail})
  @ApiResponse({status:404,description:'文章不存在'})
  @ApiQuery({
    name:'articleId',
    type:Number,
    description:'文章ID'
  })
  @ApiTags('文章-获取-详情-全部可见度')
  async getArticleDetailAny(
    @Query('articleId')articleId:number
  ):Promise<ArticleDetail>{
    return this.articleService.getArticleDetailAny(articleId);
  }

  @Get('get-article-list')
  @ApiResponse({status:200,description:'文章列表',type:ArticleList})
  @ApiTags('文章-获取-列表-仅可见')
  @ApiQuery({
    name:'searchDto',
    type:ArticleListSearchDto,
    description:'文章列表搜索选项'
  })
  async getArticleList(
    @Req() req: Request
  ):Promise<ArticleList>{
    return this.articleService.getArticleList(req.query as any);
  }
  @Accesses('ADMIN')
  @Get('get-all-article-list')
  @ApiResponse({status:200,description:'文章列表',type:ArticleList})
  @ApiTags('文章-获取-列表-全部')
  @ApiQuery({
    name:'searchDto',
    type:ArticleListSearchDto,
    description:'文章列表搜索选项'
  })
  async getAllArticleList(
    @Req() req: Request
  ):Promise<ArticleList>{
    return this.articleService.getAllArticleList(req.query as any);
  }
  @Accesses('ADMIN')
  @Post('edit-article')
  @ApiResponse({ status: 201, description: '文章修改成功,返回文章的ID', type: Number })
  @ApiTags('文章-修改')
  async articleEdit(
    @Body() dto: ArticleEditDto,
  ): Promise<number> {
    return this.articleService.articleEdit(dto);
  }
}
