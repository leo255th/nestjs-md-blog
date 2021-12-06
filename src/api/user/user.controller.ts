import { Body, Controller, Header, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiHeader, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AccessRefreshDto, AccessRefreshResDto, GetAccessDto, GetAccessResDto, GetTicketDto, GetTicketResDto, UserSignInDto, UserSignInResDto, UserSignUpDto, UserSignUpResDto } from './user.dto';
import { UserService } from './user.service';
@Controller('user')
@ApiBearerAuth()
export class UserController {
  constructor(
    private userService: UserService
  ) { }

  @Post('sign-up')
  @ApiResponse({ status: 201, description: '注册成功', type: UserSignUpResDto })
  @ApiResponse({ status: 400, description: '注册失败' })
  @ApiTags('用户注册')
  async userSignUp(
    @Body() dto: UserSignUpDto,
    @Req() req: Request
  ): Promise<UserSignUpResDto> {
    return this.userService.signUp(dto)
  }

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


  @Post('access-token-refresh')
  @ApiResponse({status:201,description:'token刷新成功',type:AccessRefreshResDto})
  @ApiResponse({status:401,description:'refreshToken验证失败'})
  @ApiTags('刷新access_token')
  async tokenRefresh(
    @Body()dto:AccessRefreshDto
  ):Promise<AccessRefreshResDto>{
    return this.userService.tokenRefresh(dto);
  }
}
