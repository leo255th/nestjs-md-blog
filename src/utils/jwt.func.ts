import * as fs from 'fs'
import * as path from 'path'
import * as jwt from 'jsonwebtoken'
import { join } from 'path';
import * as Redis from "ioredis";
import { APP_CONFIG } from 'src/app.config';
import e, { json } from 'express';
import { HttpException, HttpStatus } from '@nestjs/common';
const PRIVATE_KEY = fs.readFileSync(path.resolve(join(__dirname, '../../resources/ecc-private-key.pem')));
const PUBLIC_KEY = fs.readFileSync(path.resolve(join(__dirname, '../../resources/ecc-public-key.pem')));
const redis = new Redis(APP_CONFIG.REDIS);
const redis_session_key = 'user_session_token_hash'
const redis_access_key = 'user_access_token_hash'
const redis_ticket_key = 'user_ticket_token_hash'

/**
 * 用户在SSO系统登录成功后，返回sessionToken，浏览器保存这个token，用于维护用户和SSO系统的会话状态
 * @param payload 包含用户id
 * @returns 返回用于代表用户在同一浏览器上和SSO系统的会话的sessionToken
 */
export async function sessionTokenGenerate(payload: {
  userId: number,
}): Promise<{
  sessionToken: string
}> {
  const sessionToken = jwt.sign({
    data: JSON.stringify(payload),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30),  // 在这里设置过期的时间，单位：秒
  }, PRIVATE_KEY, { algorithm: 'ES256' });
  // 在user_session_hash表中记录对应的会话
  await redis.hmset(
    redis_session_key,
    {
      [sessionToken]: JSON.stringify([])
    }
  )
  return {
    sessionToken
  }
}

/**
 * 用户使用SSO系统前端的sessionToken来请求具体业务系统的ticketToken
 * @param payload SSO前端传来，包含用户和SSO系统的sessionToken,一个sessionToken相当于用户在一台设备同一个浏览器上和SSO系统的会话
 * @returns 传回ticketToken，用于SSO前端重定向传回给业务系统，如果sessionToken过期，且refreshToken，就会生成新的sessionToken和refreshToken
 */
export async function ticketTokenGenerate(payload: {
  userId: number,
  url: string,
  sessionToken: string,
}): Promise<{
  ticketToken: string,
}> {
  // 验证sessionToken
  const verify = await new Promise<{
    res: boolean,
  }>((resolve, reject) => {
    jwt.verify(payload.sessionToken, PUBLIC_KEY, { algorithms: ['ES256'] }, async (err, decoded) => {
      if (!err) {
        // 验证通过
        resolve({
          res: true,
        })
      } else if (err.name = 'TokenExpiredError') {
        // token过期
        resolve({
          res: false
        })
      } else {
        // token验证不通过
        resolve({
          res: false
        })
      }
    });
  })

  if (verify.res == true) {
    // 如果验证token本身通过
    // 验证redis是否有对应的session_token
    const access_token_list_str = await redis.hget(redis_session_key, payload.sessionToken);
    if (!access_token_list_str) {
      // 会话已注销
      throw new HttpException('会话已过期,请重新登录', HttpStatus.UNAUTHORIZED)
    } else {
      // 会话存在，验证redis通过
      // 生成ticketToken
      const ticketToken = jwt.sign({
        data: JSON.stringify({
          userId: payload.userId,
          url: payload.url,
        }),
        exp: Math.floor(Date.now() / 1000) + 60,  // 在这里设置过期的时间，单位：秒
      }, PRIVATE_KEY, { algorithm: 'ES256' });
      // 在redis中留下对应的记录
      await redis.hmset(
        redis_ticket_key,
        {
          [ticketToken]: payload.sessionToken
        }
      )
      return {
        ticketToken
      }
    }
  } else {
    // 验证token本身不通过
    throw new HttpException('授权无效,请重新登录', HttpStatus.UNAUTHORIZED)
  }
}

/**
 * 具体业务系统收到SSO前端传递过来的ticketToken，使用短期有效的ticketToken申请长期有效的accessToken
 * @param payload SSO前端传递过来的tikcetToken
 * @returns 生成的accessToken
 */
export async function accessTokenGenerate(payload: {
  ticketToken: string
}): Promise<{
  accessToken: string,
}> {
  // 验证ticketToken
  let decode;
  const verify = await new Promise<{ res: boolean }>((resolve, reject) => {
    jwt.verify(payload.ticketToken, PUBLIC_KEY, { algorithms: ['ES256'] }, (err, dec) => {
      if (!err) {
        // 验证通过
        decode = dec;
        resolve({
          res: true,
        })
      } else {
        resolve({
          res: false
        })
      }
    })
  })

  if (verify.res == true) {
    // ticketToken验证通过
    const { userId, url } = JSON.parse(decode.data);
    const accessToken = jwt.sign({
      data: JSON.stringify({
        userId,
        url
      }),
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30),  // 在这里设置过期的时间，单位：秒
    }, PRIVATE_KEY, { algorithm: 'ES256' });
    // 在redis中留下记录
    // 获取session_token
    const session_token = await redis.hget(redis_ticket_key, payload.ticketToken);
    const access_token_list_str = await redis.hget(redis_session_key, session_token);
    if (!access_token_list_str) {
      // 如果session_hash表里不存在对应的session_token，判断会话注销
      throw new HttpException('会话已过期,请重新登录', HttpStatus.UNAUTHORIZED)
    } else {
      const access_token_list: string[] = JSON.parse(access_token_list_str);
      access_token_list.push(accessToken);
      await redis.hmset(
        redis_session_key,
        {
          [session_token]: JSON.stringify(access_token_list)
        }
      );
      await redis.hmset(
        redis_access_key,
        {
          [accessToken]: session_token
        }
      )
      await redis.hdel(
        redis_ticket_key,
        payload.ticketToken
      )
      return {
        accessToken,
      }
    }
  } else {
    // tikcetToken验证不通过
    throw new HttpException('授权无效，请重新登录', HttpStatus.UNAUTHORIZED)
  }
}


export async function accessTokenVerify(
  accessToken: string
): Promise<{ res: boolean ,userId:number}> {

  // 验证redis
  const session_token = await redis.hget(redis_access_key, accessToken);
  if (!session_token) {
    // accessToken已被设置无效
    throw new HttpException('授权无效,请重新登录', HttpStatus.UNAUTHORIZED)
  }

  let decode;
  // 验证accessToken本身
  const verify = await new Promise<{ res: boolean }>((resolve, reject) => {
    jwt.verify(accessToken, PUBLIC_KEY, { algorithms: ['ES256'] }, async (err, dec) => {
      if (!err) {
        // 验证通过
        decode = dec;
        resolve({
          res: true,
        })
      } else if (err.name = 'TokenExpiredError') {
        resolve({
          res: false
        })
      } else {
        resolve({
          res: false
        })
      }

    });

  });
  if (verify.res == true) {
    // 验证token本身通过
    const { userId, url } = JSON.parse(decode.data);
    return {
      res: true,
      userId
    }
  } else {
    throw new HttpException('授权无效,请重新登录', HttpStatus.UNAUTHORIZED)
  }
}


