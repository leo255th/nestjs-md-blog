import { ApiProperty } from "@nestjs/swagger";

// 用户注册
export class UserSignUpDto{
  @ApiProperty({type:String,required:true,description:'用户名'})
  username:string;
  @ApiProperty({type:String,required:true,description:'密码'})
  password:string;
} 
export class UserSignUpResDto{
  @ApiProperty({type:Boolean,required:true,description:'结果，注册成功返回true'})
  res:boolean;
  @ApiProperty({type:String,required:false,description:'accessToken'})
  accessToken?:string;
  @ApiProperty({type:String,required:false,description:'freshToken'})
  refreshToken?:string;
} 

// 用户登录
export class UserSignInDto{
  @ApiProperty({type:String,required:true,description:'用户名'})
  username:string;
  @ApiProperty({type:String,required:true,description:'密码'})
  password:string;
} 
export class UserSignInResDto{
  @ApiProperty({type:Boolean,required:true,description:'结果，登陆成功返回true'})
  res:boolean;
  @ApiProperty({type:String,required:false,description:'accessToken'})
  accessToken?:string;
  @ApiProperty({type:String,required:false,description:'freshToken'})
  refreshToken?:string;
}