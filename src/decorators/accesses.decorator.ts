import { SetMetadata } from '@nestjs/common';
// 这个自定义装饰器用来给接口绑定角色这一metadata,每个接口都应该有对应的Roles
export const Accesses = (...accesses: string[]) => SetMetadata('accesses', accesses);