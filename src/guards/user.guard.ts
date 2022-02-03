import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
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
    console.log('请求头是：',request.headers)
    return true;
  }
}