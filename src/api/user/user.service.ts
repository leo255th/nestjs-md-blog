import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/models/user.entity';
import { Repository } from 'typeorm';
import { pwdEncrypt } from 'src/utils/pwdEnc.func';
import { GetAccessDto, GetAccessResDto, GetTicketDto, GetTicketResDto, GetUserInfoDto, UserSignInDto, UserSignInResDto, UserSignUpDto, UserSignUpResDto } from './user.dto';
import { accessTokenGenerate, accessTokenVerify, sessionTokenGenerate, ticketTokenGenerate } from 'src/utils/jwt.func';
import * as Redis from "ioredis";
import { APP_CONFIG } from 'src/app.config';
const redis = new Redis(APP_CONFIG.REDIS);
const redis_session_key = 'user_session_token_hash'
const redis_access_key = 'user_access_token_hash'
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository:Repository<UserEntity>
  ){}

  // 用户注册
  async signUp(dto:UserSignUpDto):Promise<UserSignUpResDto>{
    // 查找用户
    const user=await this.userRepository.findOne({
      where:{
        userName:dto.username
      }
    });
    if(user){
      // 用户名已存在,注册失败
      throw new HttpException('用户名已存在',HttpStatus.BAD_REQUEST)
    }else {
      // 用户名不存在，使用用户提供的信息注册新账号
      let newUser=new UserEntity();
      newUser.userName=dto.username;
      newUser.passWord=pwdEncrypt(dto.password);
      newUser=await this.userRepository.save(newUser);
      return{
        res:true,
        userId:newUser.id
      }
    }
  }

  // 用户登录
  async signIn(dto:UserSignInDto):Promise<UserSignInResDto>{
    // 查找用户
    const user=await this.userRepository.findOne({
      where:{
        userName:dto.username
      }
    })
    if(!user){
      // 用户不存在
      throw new HttpException('用户名或密码错误',HttpStatus.BAD_REQUEST)
    }else {
      const pwd=pwdEncrypt(dto.password);
      if(pwd!==user.passWord){
        // 密码不对
        throw new HttpException('用户名或密码错误',HttpStatus.BAD_REQUEST)
      }else {
        // 登录成功，生成SSO网站的session_token
        const{sessionToken}=await sessionTokenGenerate({userId:user.id})
        return {
          res:true,
          userId:user.id,
          sessionToken
        }
      }
    }
  }
  
  // 用户登出
  async LogOut(accessToken:string):Promise<boolean>{
    // 通过accessToken找sessionToken
    console.log('accessToken:',accessToken);
    const sessionToken=await redis.hget(redis_access_key,accessToken);
    // 通过sessionToken找到所有的accessToken
    console.log('sessionToken:',accessToken);
    const accessTokenListStr=await redis.hget(redis_session_key,sessionToken);
    console.log('accessTokenListStr:',accessTokenListStr);
    const accessTokenList:string[]=JSON.parse(accessTokenListStr);

    for(let token of  accessTokenList){
      // 删除accessToken表里的对应信息
      await redis.hdel(redis_access_key,token);
    }
    // 删除sessionToken表里的对应信息
    await redis.hdel(redis_session_key,sessionToken);
    return true;
  }


  // 用户申请ticket
  async getTicket(
    dto:GetTicketDto
  ):Promise<GetTicketResDto>{
    return ticketTokenGenerate(dto)
  }

  // 用户申请accessToken
  async getAccessToken(
    dto:GetAccessDto  
  ):Promise<GetAccessResDto>{
    return accessTokenGenerate(dto)
  }

  // 用户获取基本信息
  async getUserInfo(
    access_token:string
  ):Promise<GetUserInfoDto>{
    const {res,userId}=await accessTokenVerify(access_token);
    if(res){
      // 验证token成功
      const user=await this.userRepository.findOne(userId);
      if(user){
        return {
          userId:user.id,
          userName:user.userName
        }
      }else{
        throw new HttpException('会话已过期,请重新登录', HttpStatus.UNAUTHORIZED)
      }
    }else{
      throw new HttpException('会话已过期,请重新登录', HttpStatus.UNAUTHORIZED)
    }
  }
}
