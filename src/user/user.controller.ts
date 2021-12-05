import { Body, Controller, Header, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiHeader, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { UserSignInDto, UserSignInResDto, UserSignUpDto, UserSignUpResDto } from './user.dto';
@Controller('user')
@ApiBearerAuth()
export class UserController {


  @Post('sign-up')
  @ApiResponse({status:201,description:'注册成功',type:UserSignUpResDto})
  @ApiResponse({status:403,description:'注册失败'})
  @ApiTags('用户注册')
  async userSignUp(
    @Body()dto:UserSignUpDto,
    @Req()req:Request
  ):Promise<UserSignUpResDto>{
    console.log(req.headers);
    console.log('dto:',dto);
    return {
      res:true,
      accessToken:'at',
      refreshToken:'rt'
    }
  }

  @Post('sign-in')
  @ApiResponse({status:201,description:'登陆成功',type:UserSignInResDto})
  @ApiResponse({status:403,description:'登陆失败'})
  @ApiTags('用户登录')
  async userSignIn(
    @Body()dto:UserSignInDto,
    @Req()req:Request
  ):Promise<UserSignInResDto>{
    console.log(req.headers);
    console.log('dto:',dto);
    return {
      res:true,
      accessToken:'at',
      refreshToken:'rt'
    }
  }
}
