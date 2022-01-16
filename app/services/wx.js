// 专门用来处理微信相关 抽象出来的 services 层
const { default: axios } = require('axios')
const util = require('util')
const { User } = require('../models/user')
const { generateToken } = require('../../core/util')
const { Auth } = require('../../middlewares/auth')
class WXManager {
    static async codeToToken(code) {
        // 小程序登录流程

        // 小程序 -> code -> 微信 
        //                   👇  
        //                  openid

        // code  动态生成
        // appid appsecret

        const url = util.format(global.config.wx.loginUrl, global.config.wx.appId, global.config.wx.appSecret, code)

        const result = await axios.get(url)

        if(result.status !== 200) {
            throw new global.errs.AuthFailed('openid获取失败')
        }
        const errcode = result.data.errcode
        const errmag = result.data.errmsg
        if(errcode) {
            throw new global.errs.AuthFailed('openid获取失败:' + errmag)
        }
        // code 合法 得到 openid
        // 把用户档案写到用户信息 user 表中，并生成 uid
        // 为什么不直接使用 openid 作为用户 uid
        // 1. openid 比较长，使用不方便
        // 2. openid 比较机密，在服务端和客户端传输不安全

        let user = await User.getUserByOpenid(result.data.openid)

        if(!user) {
            user = await User.registerByOpenid(result.data.openid)
        }
        // 返回用户 token
        return generateToken(user.id, Auth.USER)

    }
}

module.exports = {
    WXManager
}