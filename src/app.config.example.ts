import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';

const MARIADB:TypeOrmModuleOptions={
  type:'mariadb',
  host:'localhost',
  port:3306,
  username:'user',
  password:'123456',
  database:'database_name',
  entities: [__dirname + '/models/*.entity{.ts,.js}'],
  synchronize:true, // 开发环境每次运行同步数据库结构
  logging:true, 
}