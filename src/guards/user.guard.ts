import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as Redis from "ioredis";
import { APP_CONFIG } from 'src/app.config';
const redis = new Redis(APP_CONFIG.REDIS);
const redis_session_key = 'user_session_token_hash'
const redis_access_key = 'user_access_token_hash'
// 这个Guard用来对调用接口的用户进行身份验证
@Injectable()
export class UserGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 获得方法级的角色
    let accesses = this.reflector.get<string[]>('accesses', context.getHandler());
    console.log('方法', context.getHandler(), '的角色：', accesses)
    if (!accesses) {
      // 如果没设置方法级的角色，则找控制器级别的角色
      accesses = this.reflector.get<string[]>('accesses', context.getClass());
      // console.log('控制器级的权限：', accesses)
    } else {
      // 如果当前方法的角色为"NONE",说明当前方法无需验证角色，应当放行
      if (accesses[0] == "NONE") {
        return true;
      }
    }
    if (!accesses) {
      // 如果都没有设置，则放行。
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const accessToken = request.headers.Authorization;
    if (!accessToken) {
      throw new HttpException('授权无效，请重新登录', HttpStatus.UNAUTHORIZED)
    }
    // 如果redis里没有对应的accessToken,则抛出认证错误
    const tokenInRedis=await redis.hget(redis_access_key,accessToken);
    if(!tokenInRedis||tokenInRedis==''){
      throw new HttpException('授权无效，请重新登录', HttpStatus.UNAUTHORIZED)
    }
    // 通过验证,放行
    return true;
  }
}