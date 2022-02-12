import * as fs from 'fs'
import * as path from 'path'
import * as jwt from 'jsonwebtoken'
import { join } from 'path';
import * as Redis from "ioredis";
import { APP_CONFIG } from 'src/app.config';
import e from 'express';
import { HttpCode, HttpException, HttpStatus } from '@nestjs/common';
const PRIVATE_KEY = fs.readFileSync(path.resolve(join(__dirname, '../../resources/ecc-private-key.pem')));
const PUBLIC_KEY = fs.readFileSync(path.resolve(join(__dirname, '../../resources/ecc-public-key.pem')));
const redis = new Redis(APP_CONFIG.REDIS);
const redis_session_key = 'user_session_token_hash'
const redis_access_key = 'user_access_token_hash'
const redis_ticket_key = 'user_ticket_token_hash'
/**
 * 用户在SSO系统登录成功后，返回sessionToken，浏览器保存这个token，用于维护用户和SSO系统的会话状态
 * @param payload 包含用户id
 * @returns 返回用于代表用户在同一浏览器上和SSO系统的会话的sessionToken和对应的refreshToken
 */
export async function sessionTokenGenerate(payload: {
  userId: number,
}): Promise<{
  sessionToken: string,
  refreshToken: string
}> {
  const sessionToken = jwt.sign({
    data: JSON.stringify(payload),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30),  // 在这里设置过期的时间，单位：秒
  }, PRIVATE_KEY, { algorithm: 'ES256' });
  const refreshToken = jwt.sign({
    data: sessionToken,
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30 * 12),  // 在这里设置过期的时间，要远远大于accessToken
  }, PRIVATE_KEY, { algorithm: 'ES256' });

  // 在user_session_hash表中记录对应的会话
  const sessionMapStr = await redis.hget(redis_session_key, '' + payload.userId);
  if (!sessionMapStr || sessionMapStr.length == 0) {
    // 如果会话列表不存在，创造对应的field
    await redis.hmset(
      redis_session_key,
      {
        [payload.userId]: JSON.stringify({
          [sessionToken]: []
        })
      }
    )
  } else {
    // 如果会话列表存在，加入新的会话
    const sessionMap = JSON.parse(sessionMapStr);
    sessionMap[sessionToken] = [];
    await redis.hmset(
      redis_session_key,
      {
        [payload.userId]: JSON.stringify(sessionMap)
      }
    )
  }
  return {
    sessionToken,
    refreshToken
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
  refreshToken: string
}): Promise<{
  ticketToken: string,
  sessionToken?: string,
  refreshToken?: string
}> {
  // 验证sessionToken
  const verify = await new Promise<{
    res: boolean,
    sessionToken?: string,
    refreshToken?: string
  }>((resolve, reject) => {
    jwt.verify(payload.sessionToken, PUBLIC_KEY, { algorithms: ['ES256'] }, async (err, decoded) => {
      if (!err) {
        // 验证通过
        resolve({
          res: true,
        })
      } else if (err.name = 'TokenExpiredError') {
        // token过期，验证refreshToken
        try {
          const decode = jwt.verify(payload.refreshToken, PUBLIC_KEY, { algorithms: ['ES256'] });
          // token验证通过
          // 验证payload
          if (decode.data != payload.sessionToken) {
            // 如果refreshToken里的payload部分不是用户传来的sessionToken,则验证不通过
            resolve({
              res: false
            })
          } else {

            const data = jwt.decode(payload.sessionToken, PUBLIC_KEY, { algorithms: ['ES256'] }).data;
            const { sessionToken, refreshToken } = await sessionTokenGenerate({ userId: JSON.parse(data).userId });
            resolve({
              res: true,
              sessionToken,
              refreshToken
            })
          }
        }
        catch (err) {
          // refreshToken验证不通过
          resolve({
            res: false
          })
        }
      }
    });
  })

  if (verify.res == true) {
    // 如果验证token本身通过
    // 验证redis是否有对应的session_token
    const sessionMapStr = await redis.hget(redis_session_key, payload.userId + '');
    if (!sessionMapStr || sessionMapStr.length == 0) {
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

      // 在redis中记录ticketToken和对应的session_token
      await redis.hmset(redis_ticket_key, ticketToken, payload.sessionToken)

      // 如果生成了新的session_token和refreshToken，需一并返回\
      if (verify.sessionToken != null && verify.sessionToken.length != 0) {
        return {
          ticketToken,
          sessionToken: verify.sessionToken,
          refreshToken: verify.refreshToken
        }
      } else {
        return {
          ticketToken
        }
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
  refreshToken: string
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
    const userId = JSON.parse(decode.data).userId;
    const accessToken = jwt.sign({
      data: JSON.stringify({
        userId,
      }),
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30),  // 在这里设置过期的时间，单位：秒
    }, PRIVATE_KEY, { algorithm: 'ES256' });
    // 使用accessToken作为payload生成refreshToken
    const refreshToken = jwt.sign({
      data: accessToken,
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30 * 12),  // 在这里设置过期的时间，要远远大于accessToken
    }, PRIVATE_KEY, { algorithm: 'ES256' });
    // 在redis中留下记录
    const session_token = await redis.hget(redis_ticket_key, payload.ticketToken);
    const sessionMapStr = await redis.hget(redis_session_key, userId + '');
    const sessionMap = JSON.parse(sessionMapStr);
    if (!sessionMap[session_token]) {
      // 如果不存在对应的session_token，判断会话注销
      throw new HttpException('会话已过期,请重新登录', HttpStatus.UNAUTHORIZED)
    } else {
      sessionMap[session_token].push(accessToken);
      await redis.hmset(redis_session_key, userId + '', JSON.stringify(sessionMap))
      await redis.hmset(redis_access_key, accessToken, session_token);
      return {
        accessToken,
        refreshToken
      }
    }
  } else {
    // tikcetToken验证不通过
    throw new HttpException('授权无效，请重新登录', HttpStatus.UNAUTHORIZED)
  }
}


export async function accessTokenVerify(token: {
  accessToken: string,
  refreshToken: string
}): Promise<{ res: boolean, accessToken?: string, refreshToken?: string }> {

  // 验证redis
  const token_state = await redis.hget(redis_access_key, token.accessToken);
  if (!token_state || token_state.length == 0) {
    // accessToken已被设置无效
    return {
      res: false
    }
  }
  // 验证accessToken本身
  const verify = await new Promise<{ res: boolean, accessToken?: string, refreshToken?: string }>((resolve, reject) => {
    jwt.verify(token.accessToken, PUBLIC_KEY, { algorithms: ['ES256'] }, async (err, dec) => {
      if (!err) {
        // 验证通过
        resolve({
          res: true,
        })
      } else if (err.name = 'TokenExpiredError') {
        throw new HttpException('token无效，请刷新token', HttpStatus.UNAUTHORIZED)
      } else {
        resolve({
          res: false
        })
      }

    });

  });
  if (verify.res == true) {
    // 验证token本身通过
    return {
      res: true,
    }
  } else {
    throw new HttpException('授权无效,请重新登录', HttpStatus.UNAUTHORIZED)
  }
}

export async function accessTokenRefresh(token: {
  accessToken: string,
  refreshToken: string,
}): Promise<{
  res: boolean,
  accessToken?: string,
  refreshToken?: string,
}> {

  try {
    jwt.verify(token.refreshToken, PUBLIC_KEY, { algorithms: ['ES256'] });
    // 验证通过
    const data = jwt.decode(token.accessToken, PUBLIC_KEY, { algorithms: ['ES256'] }).data;
    const userId = JSON.parse(data).userId;
    // 重新生成accessToken和refreshToken
    const accessToken = jwt.sign({
      data: JSON.stringify({
        userId
      }),
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30),  // 在这里设置过期的时间，单位：秒
    }, PRIVATE_KEY, { algorithm: 'ES256' });
    // 使用accessToken作为payload生成refreshToken
    const refreshToken = jwt.sign({
      data: accessToken,
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30 * 12),  // 在这里设置过期的时间，要远远大于accessToken
    }, PRIVATE_KEY, { algorithm: 'ES256' });
    // 在redis中留下记录
    const session_token = await redis.hget(redis_access_key, token.accessToken);
    const sessionMapStr = await redis.hget(redis_session_key, userId + '');
    const sessionMap = JSON.parse(sessionMapStr);
    if (!sessionMap[session_token]) {
      // 如果不存在对应的session_token，判断会话注销
      return {
        res: false
      }
    } else {
      sessionMap[session_token].push(accessToken);
      await redis.hmset(redis_session_key, userId + '', JSON.stringify(sessionMap))
      await redis.hmset(redis_access_key, accessToken, session_token);
    }
    return {
      res: true,
      accessToken,
      refreshToken
    }
  }
  catch (err) {
    // refreshToken验证不通过
    throw new HttpException('授权无效，请重新登录', HttpStatus.UNAUTHORIZED)
  }
}
