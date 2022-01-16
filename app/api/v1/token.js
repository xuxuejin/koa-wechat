const Router = require('@koa/router');
const { LoginType } = require('../../lib/enum');
const { TokenValidator, NotEmptyValidator } =require('../../validators/validator')
const { User } = require('../../models/user')
const { generateToken } = require('../../../core/util')
const { Auth } = require('../../../middlewares/auth');
const { WXManager } = require('../../services/wx');
const router = new Router({
    prefix:'/v1/token'
});

// API 权限 
// 公开API
// 非公开API：token 过期 不合法
router.post('/', async (ctx) => {
    const v = await new TokenValidator().validate(ctx)
    let token;
    // 处理用户登录
    switch (v.get('body.type')) {
        case LoginType.USER_EMAIL:
            token = await emailLogin(v.get('body.account'), v.get('body.secret'))
            break;
        case LoginType.USER_MINI_PROGRAM:
            // 小程序登录
            token = await WXManager.codeToToken(v.get('body.account'))
            break;
        case LoginType.ADMIN_EMAIL:
            
            break;
        default:
            throw new global.errs.ParameterException('没有相应的处理函数')
    }

    ctx.body = {
        token
    }
})

router.post('/verify', async (ctx) => {
    const v = await new NotEmptyValidator().validate(ctx)
    const result = Auth.verifyToken(v.get('body.token'))
    ctx.body = {
        is_valid: result
    }
})

// 判断账号密码是否和库里一致， 这个可以放到 model 里边做
async function emailLogin(account, secret) {
    const user = await User.verifyEmailPassword(account, secret)
    // 生成token
    return generateToken(user.id, Auth.USER)
}

module.exports = router