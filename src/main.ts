import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('leoyi-blog')    
    .setDescription('个人博客后端API文档')    
    .setVersion('1.0')
    .addBearerAuth({
      description:'添加access_token认证',
      type:'http',
      in:'header',
      scheme:'bearer',
      name:'Authorization'
    })
    .build();  
  const document = SwaggerModule.createDocument(app, config);  
  SwaggerModule.setup('api', app, document);
  app.enableCors({});
  await app.listen(3002);
}
bootstrap();
