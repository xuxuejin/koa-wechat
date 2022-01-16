const Router = require('@koa/router');
const router = new Router({
    prefix: '/v1/book'
});
const { PositiveIntegerValidator } =require('@validator')

const { HotBook } = require('@models/hot-book')

const { Book } = require('@models/book')

router.get('/hot_list', async (ctx, next) => {

    const books = await HotBook.getAll()

    ctx.body = {books}
})

// 图书数据很多，把图书数据的处理放到业务中不太好
// 可以做成 服务 的形式

// 可以简单理解为，图书是另外一个项目，提供一套独立于业务的 api

// node 中间层
// 微服务


router.get('/:id/detail', async (ctx, next) => {
    const v = await new PositiveIntegerValidator().validate(ctx)

    const detail = await new Book().detail(v.get('path.id'))

    ctx.body = detail

})

module.exports = router