import { Body, Controller, Get, Headers, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiHeader, ApiQuery, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Accesses } from 'src/decorators/accesses.decorator';
import { GetAccessDto, GetAccessResDto, GetTicketDto, GetTicketResDto, GetUserInfoDto, UserSignInDto, UserSignInResDto, UserSignUpDto, UserSignUpResDto } from './user.dto';
import { UserService } from './user.service';
@Controller('user')
@ApiBearerAuth()
export class UserController {
  constructor(
    private userService: UserService
  ) { }

  // @Post('sign-up')
  // @ApiResponse({ status: 201, description: '注册成功', type: UserSignUpResDto })
  // @ApiResponse({ status: 400, description: '注册失败' })
  // @ApiTags('用户注册')
  // async userSignUp(
  //   @Body() dto: UserSignUpDto,
  //   @Req() req: Request
  // ): Promise<UserSignUpResDto> {
  //   return this.userService.signUp(dto)
  // }

  @Post('sign-in')
  @ApiResponse({ status: 201, description: '登陆成功', type: UserSignInResDto })
  @ApiResponse({ status: 400, description: '登陆失败' })
  @ApiTags('用户登录')
  async userSignIn(
    @Body() dto: UserSignInDto,
    @Req() req: Request
  ): Promise<UserSignInResDto> {
    return this.userService.signIn(dto)
  }

  @Post('log-out')
  @ApiResponse({ status: 201, description: '登出成功', type: Boolean })
  @ApiTags('用户登出')
  async userLogOut(
    @Headers('Authorization') access_token:string,
  ): Promise<boolean> {
    return this.userService.LogOut(access_token);
  }

  @Post('get-ticket-token')
  @ApiResponse({status:201,description:'token获取成功',type:GetTicketResDto})
  @ApiResponse({status:401,description:'认证失败'})
  @ApiTags('获取ticket_token')
  async getTicket(
    @Body()dto:GetTicketDto
  ):Promise<GetTicketResDto>{
    return this.userService.getTicket(dto);
  }
  
  @Post('get-access-token')
  @ApiResponse({status:201,description:'token获取成功',type:GetAccessResDto})
  @ApiResponse({status:401,description:'认证失败'})
  @ApiTags('获取access_token')
  async getAccess(
    @Body()dto:GetAccessDto
  ):Promise<GetAccessResDto>{
    return this.userService.getAccessToken(dto);
  }

  @Get('get-user-info')
  @ApiResponse({status:200,description:'获取成功',type:GetUserInfoDto})
  @ApiTags('获取用户基本信息')
  @Accesses('USER')
  async getUserInfo(
    @Headers('Authorization') access_token:string,
  ):Promise<GetUserInfoDto>{
    // 要在SWAGGER文档里测试API,则需要把token前面的Bearer标识头移除。
    // 目前博客前端是直接将token放在Authorization字段里的。
    const tmp=access_token.split('Bearer ');
    let token=tmp.length==1?tmp[0]:tmp[1];
    return this.userService.getUserInfo(token)
  }

}
