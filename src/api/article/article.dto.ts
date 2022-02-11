import { ApiProperty } from "@nestjs/swagger";


// 新增文章dto
export class ArticleCreateDto {
  @ApiProperty({ type: Number, required: true, description: '作者ID' })
  userId: number;
  @ApiProperty({ type: String, required: true, description: '文章标题' })
  title:string;
  @ApiProperty({type:String,required:true,description:'文章摘要'})
  description:string;
  @ApiProperty({type:String,required:true,description:'文章内容(markdown文本)'})
  content:string;
  @ApiProperty({type:Number,required:true,description:'文章分区Id'})
  fieldId:number;
  @ApiProperty({type:[String],required:true,description:'文章标签'})
  tags:string[];
  
}

// 新增分区dto
export class  FieldCreateDto{
  @ApiProperty({type:String,required:true,description:'分区'})
  field:string;
  @ApiProperty({type:Boolean,required:true,description:'是否在首页可见'})
  isVisiable?: boolean;
  @ApiProperty({type:Number,required:true,description:'顺序号,顺序号越小的分区排序在前'})
  order?: number;
}
export class  FieldEditDto{
  @ApiProperty({type:Number,required:true,description:'分区id'})
  id:number
  @ApiProperty({type:String,required:true,description:'分区'})
  field:string;
  @ApiProperty({type:Boolean,required:true,description:'是否在首页可见'})
  isVisiable?: boolean;
  @ApiProperty({type:Number,required:true,description:'顺序号,顺序号越小的分区排序在前'})
  order?: number;
  @ApiProperty({type:Boolean,default:false,description:'是否删除'})
  isDeleted?: boolean;
}
// 获取分区名称列表dto
export class FieldNameItem{
  @ApiProperty({type:Number,required:true,description:'分区ID'})
  id:number;
  @ApiProperty({type:String,required:true,description:'分区名称'})
  field:string;
  @ApiProperty({type:Boolean,required:true,description:'是否在首页可见'})
  isVisiable: boolean;
  @ApiProperty({type:Number,required:true,description:'顺序号,顺序号越小的分区排序在前'})
  order: number;
  @ApiProperty({type:Number,required:true,description:'文章数'})
  count: number;
}
// 文章列表查询dto
export class ArticleListSearchDto{
  @ApiProperty({type:Number,required:true,description:'作者ID'})
  userId: number;
  @ApiProperty({type:Number,required:false,description:'文章分区ID'})
  fieldId?: number;
  @ApiProperty({type:[String],required:false,description:'文章标签'})
  tags?:string[];
  @ApiProperty({type:Number,default:0,description:'偏移量'})
  offset:number;
  @ApiProperty({type:Number,default:10,description:'获取量'})
  num:number;
}

// 获取文章列表
export class ArticleListItem{
  @ApiProperty({type:Number,required:true,description:'文章ID'})
  id: number;
  @ApiProperty({type:Number,required:true,description:'作者ID'})
  userId: number;
  @ApiProperty({type:String,required:true,description:'文章标题'})
  title: string;
  @ApiProperty({type:String,required:true,description:'文章摘要'})
  description: string;
  @ApiProperty({type:String,required:true,description:'文章分区'})
  field: string;
  @ApiProperty({type:[String],required:true,description:'文章标签'})
  tags:string[];
  @ApiProperty({type:Date,required:true,description:'文章的更新时间'})
  time?: Date;
}

export class ArticleList{
  @ApiProperty({type:[ArticleListItem],required:true,description:'文章列表'})
  list:ArticleListItem[];
  @ApiProperty({type:Number,required:true,description:'文章总数'})
  total:number;
}

// 文章修改dto
export class ArticleEditDto{
  @ApiProperty({type:Number,required:true,description:'文章ID'})
  id: number;
  @ApiProperty({ type: String, required: false, description: '文章标题' })
  title?:string;
  @ApiProperty({type:String,required:false,description:'文章摘要'})
  description?:string;
  @ApiProperty({type:String,required:false,description:'文章内容(markdown文本)'})
  content?:string;
  @ApiProperty({type:Number,required:false,description:'文章分区Id'})
  fieldId?:number;
  @ApiProperty({type:[String],required:false,description:'文章标签'})
  tags?:string[];
  @ApiProperty({type:Boolean,required:false,description:'是否在首页可见'})
  isVisiable?: boolean;
}

// 文章详情
export class ArticleDetail{
  @ApiProperty({type:Number,required:true,description:'文章ID'})
  id: number;
  @ApiProperty({type:Number,required:true,description:'作者ID'})
  userId: number;
  @ApiProperty({type:String,required:true,description:'文章标题'})
  title: string;
  @ApiProperty({type:String,required:true,description:'文章摘要'})
  description: string;
  @ApiProperty({type:String,required:true,description:'文章内容'})
  content: string;
  @ApiProperty({type:String,required:true,description:'文章分区'})
  field: string;
  @ApiProperty({type:[String],required:true,description:'文章标签'})
  tags:string[];
  @ApiProperty({type:Date,required:true,description:'文章的更新时间'})
  time?: Date;
}