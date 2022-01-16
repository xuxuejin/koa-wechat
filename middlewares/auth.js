const basicAuth = require('basic-auth')
const jwt = require('jsonwebtoken')

class Auth {
    constructor(level) {
        // 定义一些角色
        Auth.USER = 8
        Auth.ADMIN = 16
        Auth.SUPER_ADMIN = 32
        this.level = level || 1
    }

    get m() {
        return async (ctx, next) => {
            // 检测 token
            // 访问者需要携带 token，那么 token 是通过 query，body 还是 header 传递？这个要跟后端约定
            // HTTP 协议规定了身份验证机制 HttpBasicAuth，天生适合通过 header 传递

            const userToken = basicAuth(ctx.req)
            let errMsg = 'token 不合法'
            let decode
            // 判断 token 的合法性
            if(!userToken || !userToken.name) {
                // 终端请求
                throw new global.errs.Forbbiden(errMsg)
            }
            try {
                decode = jwt.verify(userToken.name, global.config.security.secretKey)
            } catch (error) {
                // 1. token 不合法
                // 2. token 过期
                if(error.name == 'TokenExpiredError') {
                    errMsg = 'token 已过期'
                }
                throw new global.errs.Forbbiden(errMsg)
            }
            // 接口权限不足
            if(decode.scope < this.level) {
                errMsg = '权限不足'
                throw new global.errs.Forbbiden(errMsg)
            }
            // 之前 token 中保存有 uid 和 scope，这两个可以保存起来，存在 ctx 上，方便以后其他地方使用
            ctx.auth = {
                uid: decode.uid,
                scope: decode.scope
            }

            await next()
        }
    }

    // 校验token的
    static verifyToken(token) {
        try {
            jwt.verify(token, global.config.security.secretKey)

            return true
        } catch (error) {
            return false
        }
    }
}

module.exports = {
    Auth
}