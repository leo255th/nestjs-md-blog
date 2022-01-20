import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/models/user.entity';
import { Repository } from 'typeorm';
import { pwdEncrypt } from 'src/utils/pwdEnc.func';
import { GetAccessDto, GetAccessResDto, GetTicketDto, GetTicketResDto, UserSignInDto, UserSignInResDto, UserSignUpDto, UserSignUpResDto } from './user.dto';
import { accessTokenGenerate, sessionTokenGenerate, ticketTokenGenerate } from 'src/utils/jwt.func';

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

}
