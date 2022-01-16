const Router = require('@koa/router');
const router = new Router({
    prefix:'/v1/classic'
});
// const {HttpException, ParameterException} = require('../../../core/http-exception')
// const { PositiveIntegerValidator } =require('../../validators/validator')
const { Auth } = require('../../../middlewares/auth')
const { Flow } = require('../../models/flow')
const { Art } = require('../../models/art')
const { Favor } = require('../../models/favor')
// 别名写法
const { PositiveIntegerValidator, ClassicValidator } =require('@validator')

// router.get('/latest', new Auth(7).m, async (ctx, next) => {
// new Auth(7).m 里边的数字是用来控制接口权限的
router.get('/latest', new Auth().m, async (ctx, next) => {

    // 获取参数
    // 路径参数
    // const path = ctx.params;
    // // 查询参数
    // const query = ctx.request.query;
    // // header 参数
    // const header = ctx.request.header;
    // // body 参数
    // const body = ctx.request.body;

    // 注册 登录
    // sequelize 连接数据库，配置

    // if(true) {
    //     const error = new Error('为什么错误')
    //     error.errorCode = 10001
    //     error.status = 400
    //     error.requestUrl = `${ctx.method} ${ctx.path}`
    //     throw error;
    // }
    // 换成面向对象的写法
    // if(true) {
    //     const error = new HttpException('cuowu',10001,400);
    //     throw error;
    // }
    // if(true) {
    //     const error = new ParameterException();
    //     throw error;
    // }
    // 如果觉得上面每次导入异常类比较麻烦，也可以挂载到全局对象 global 上
    // if(true) {
    //     const error = new global.errs.ParameterException('新写法');
    //     throw error;
    // }

    // 使用库来校验参数
    // const v = await new PositiveIntegerValidator().validate(ctx)
    // const id = v.get('path.id')
    // ctx.body = {key: 'classic'}

    // 接口除了校验 token 合法性，还有可能校验接口的权限
    // 普通用户 管理员  -> 分级 scope
    // 思路：给接口定义一个权限，然后与 Auth 的权限比较
    // ctx.body = ctx.auth.uid


    // 查找最新的数据
    // 先排序 找到最后一条数据
    // 正序: 1, 2, 3, ...max
    // 倒序: max...3, 2, 1
    // 倒序更简单，只要取第一个就行
    const flow = await Flow.findOne({
        order: [
            // 根据 index 字段，倒叙
            ['index', 'DESC']
        ]
    })
    
    const art = await Art.getData(flow.artId, flow.type)
    // art 返回的对象 key 很多，index 是要加到 dataValues 上面的
    // 因为最终返回的是 dataValues 的值
    // art.dataValues.index = flow.index
    // 上面的写法不是很友好，也不是很严谨
    // 其实 sequelize 提供了方法来添加数据
    art.setDataValue('index', flow.index)
    const likeLatest = await Favor.userLikeIt(flow.artId, flow.type, ctx.auth.uid)
    art.setDataValue('link_status', likeLatest)
    ctx.body = art

})

// 获取当前一期的下一期
router.get('/:index/next', new Auth().m, async (ctx, next) => {
    const v = await new PositiveIntegerValidator().validate(ctx, {id: "index"})

    const index = v.get('path.index')

    const flow = await Flow.findOne({
        where: {
            index: index + 1
        }
    })

    if(!flow) {
        throw new global.errs.Notfound()
    }

    const art = await Art.getData(flow.artId, flow.type)
    art.setDataValue('index', flow.index)
    const likeNext = await Favor.userLikeIt(flow.artId, flow.type, ctx.auth.uid)
    art.setDataValue('link_status', likeNext)
    ctx.body = art

})

// 获取当前一期的上一期
router.get('/:index/previous', new Auth().m, async (ctx, next) => {
    const v = await new PositiveIntegerValidator().validate(ctx, {id: "index"})

    const index = v.get('path.index')

    const flow = await Flow.findOne({
        where: {
            index: index - 1
        }
    })

    if(!flow) {
        throw new global.errs.Notfound()
    }

    const art = await Art.getData(flow.artId, flow.type)
    art.setDataValue('index', flow.index)
    const likePrevious = await Favor.userLikeIt(flow.artId, flow.type, ctx.auth.uid)
    art.setDataValue('link_status', likePrevious)
    ctx.body = art

})

// 获取用户喜欢的期刊列表
router.get('/favor', new Auth().m, async (ctx, next) => {
    const uid = ctx.auth.uid;

    ctx.body = await Favor.getMyClassicFavors(uid)

})

// 获取期刊详情
router.get('/:type/:id', new Auth().m, async (ctx, next) => {
    
    const v = await new ClassicValidator().validate(ctx, {art_id: 'id'})

    const id = v.get('path.id')
    const type = Number(v.get('path.type'))

    const artDetait = await new Art().getDetail(id, type, ctx.auth.uid)

    artDetait.art.setDataValue('like_status', artDetait.like_status)

    // ctx.body = {
    //     art: artDetait.art,
    //     like_status: artDetait.like_status
    // }

    ctx.body = artDetait.art

})

module.exports = router