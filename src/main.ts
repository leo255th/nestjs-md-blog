import { NestFactory, Reflector } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder, OmitType } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { UserGuard } from './guards/user.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule,{
  });
  const config = new DocumentBuilder()
    .setTitle('leoyi-blog')
    .setDescription('个人博客后端API文档')
    .setVersion('1.0')
    .addBearerAuth({
      description: '添加access_token认证',
      type: 'http',
      in: 'header',
      scheme: 'bearer',
      name: 'Authorization'
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  // 设置全局守卫UserGuard
  app.enableCors({
    origin:[
      "http://leoyiblog.cn",
      "http://www.leoyiblog.cn",
      "http://sso.leoyiblog.cn"

    ],
    credentials:true
  })
  app.useGlobalGuards(new UserGuard(new Reflector()))
  await app.listen(3000);
}
bootstrap();
