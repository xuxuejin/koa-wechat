// 配置别名
require('module-alias/register');
const path = require('path')
const Koa = require('koa');
const parser = require('koa-bodyparser')
const InitManager = require('./core/init')
// 全局异常处理
const catchError = require('./middlewares/exception')
const static = require('koa-static')

// 通过 ORM 的方式创建表
// require('./app/models/user')

const app = new Koa()

app.use(catchError)
app.use(parser())
// 静态资源
app.use(static(path.join(__dirname, './static')))

InitManager.initCore(app)

app.listen(3000)