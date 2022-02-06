import { ApiProperty } from "@nestjs/swagger";


// 新增文章dto
export class ArticleCreateDto {
  @ApiProperty({ type: Number, required: true, description: '作者ID' })
  userId: number;
  @ApiProperty({ type: String, required: true, description: '文章标题' })
  title:string;
  @ApiProperty({type:String,required:true,description:'文章描述'})
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
}
// 获取分区名称列表dto
export class FieldNameItem{
  @ApiProperty({type:Number,required:true,description:'分区ID'})
  id:number;
  @ApiProperty({type:String,required:true,description:'分区名称'})
  field:string;
}