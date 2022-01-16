const Router = require('@koa/router');
// const bcrypt = require('bcryptjs')
// const router = new Router();
// 加上统一的前缀
const router = new Router({
    prefix:'/v1/user'
});
const { RegisterValidator } =require('../../validators/validator')
const { User } = require('../../models/user')
const { success } = require('../../lib/helper')

// 注册 新增数据
// 用户相关的接口，如果都写 /v1/user/ 显得有点累赘，可以在实例化路由的时候，加上前缀
// router.post('/v1/user/register', async (ctx, next) => {
router.post('/register', async (ctx, next) => {
    // 编写一个接口的思维路径
    // 1. 接受的参数
    // 2. validator 校验

    // 校验账号 密码 确认密码 昵称
    const v = await new RegisterValidator().validate(ctx)
    // 数据校验通过，怎么把用户数据保存到数据库里
    // 1. SQL 插入数据
    // 2. 利用 Sequelize 的数据模型插入数据

    // const user = {
    //     email: v.get('body.email'),
    //     password: v.get('body.password1'),
    //     nickname: v.get('body.nickname')
    // }

    // 上面的密码是以明文的形式存储的
    // 无论是出于安全的考虑还是对用户负责的态度，密码都不能以明文的形式直接保存
    // 使用 bcryptjs 对密码加密
    // 密码的加密都需要生成一个盐
    // const salt = bcrypt.genSaltSync(10)
    // // 有了盐之后，就可以生成密码
    // const psw = bcrypt.hashSync(v.get('body.password1'), salt)
    // // 即使明文相同，加密后的密为也是不同的，可以防止 彩虹攻击
    // const user = {
    //     email: v.get('body.email'),
    //     password: psw,
    //     nickname: v.get('body.nickname')
    // }

    // 上面👆这种直接在接口里加密的写法不是很好，其实可以放到数据模型里，使用 sequelize 来处理

    const user = {
        email: v.get('body.email'),
        password: v.get('body.password1'),
        nickname: v.get('body.nickname')
    }

    // 数据提交成功，需要给用户返回数据
    await User.create(user)
    // 以抛出异常的形式，给用户一个提示
    // throw new global.errs.Success()
    // 或
    success()

})

module.exports = router