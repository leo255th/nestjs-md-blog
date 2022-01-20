import { ApiProperty } from "@nestjs/swagger";

// 用户注册
export class UserSignUpDto {
  @ApiProperty({ type: String, required: true, description: '用户名' })
  username: string;
  @ApiProperty({ type: String, required: true, description: '密码' })
  password: string;
}
export class UserSignUpResDto {
  @ApiProperty({ type: Boolean, required: true, description: '结果，注册成功返回true' })
  res: boolean;
  @ApiProperty({ type: Number, required: false, description: '注册成功，返回用户账号ID' })
  userId?: number;
}

// 用户登录
export class UserSignInDto {
  @ApiProperty({ type: String, required: true, description: '用户名' })
  username: string;
  @ApiProperty({ type: String, required: true, description: '密码' })
  password: string;
  // @ApiProperty({type:String,required:true,description:'用户需要登录的网站'})
  // url:string;
}
export class UserSignInResDto {
  @ApiProperty({ type: Boolean, required: true, description: '结果，登陆成功返回true' })
  res: boolean;
  @ApiProperty({ type: Number, required: false, description: '用户Id' })
  userId: number;
  @ApiProperty({ type: String, required: false, description: 'sessionToken' })
  sessionToken?: string;
}

// 申请ticket_token
export class GetTicketDto {
  @ApiProperty({ type: String, required: true, description: 'sessionToken' })
  sessionToken: string;
  @ApiProperty({ type: String, required: true, description: '要申请ticket的系统的url' })
  url: string;
  @ApiProperty({ type: Number, required: true, description: '用户ID' })
  userId: number;
}
export class GetTicketResDto {
  @ApiProperty({ type: String, required: false, description: 'ticketToken' })
  ticketToken?: string;
}


// 申请access_token
export class GetAccessDto {
  @ApiProperty({ type: String, required: true, description: 'ticketToken' })
  ticketToken: string;
}
export class GetAccessResDto {
  @ApiProperty({ type: String, required: false, description: 'accessToken' })
  accessToken?: string;
}

