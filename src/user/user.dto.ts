import { ApiProperty } from "@nestjs/swagger";

export class UserSignUpDto{
  @ApiProperty({type:String,required:true,description:'用户名'})
  username:string;
  @ApiProperty({type:String,required:true,description:'密码'})
  password:string;
} 

export class UserSignInDto{
  @ApiProperty({type:String,required:true,description:'用户名'})
  username:string;
  @ApiProperty({type:String,required:true,description:'密码'})
  password:string;
} 
export class UserSignInResDto{
  @ApiProperty({type:Boolean,required:true,description:'结果，登陆成功返回true'})
  res:boolean;
  @ApiProperty({type:String,required:true,description:'accessToken'})
  accessToken:string;
  @ApiProperty({type:String,required:true,description:'freshToken'})
  refreshToken:string;
}