import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ArticleCreateDto, ArticleList, ArticleListSearchDto, FieldCreateDto, FieldEditDto, FieldNameItem } from './article.dto';
import { ArticleService } from './article.service';

@Controller('article')
@ApiBearerAuth()
export class ArticleController {
  constructor(
    private readonly articleService:ArticleService
  ){}
  @Post('create-article')
  @ApiResponse({ status: 201, description: '文章创建成功,返回文章的ID', type: Number })
  @ApiTags('文章-创建')
  async articleCreate(
    @Body() dto: ArticleCreateDto,
  ): Promise<number> {
    return this.articleService.articleCreate(dto);
  }
  @Post('create-field')
  @ApiResponse({ status: 201, description: '分区创建成功,返回分区的ID', type: Number })
  @ApiTags('分区-创建')
  async fieldCreate(
    @Body() dto: FieldCreateDto,
  ): Promise<number> {
    return this.articleService.fieldCreate(dto);
  }
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
  @ApiTags('分区-获取-名称列表')
  async getFieldNameList(
  ):Promise<FieldNameItem[]>{
    return this.articleService.getFieldNameList()
  }
  @Get('get-article-list')
  @ApiResponse({status:200,description:'文章列表',type:ArticleList})
  @ApiTags('文章-获取-列表')
  @ApiQuery({
    name:'searchDto',
    type:ArticleListSearchDto,
    description:'文章列表搜索选项'
  })
  async getArticleList(
    @Req() req: Request
  ):Promise<ArticleList>{
    console.log(req)
    console.log(req['query']);
    return;
  }
}
