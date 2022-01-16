
const { HttpException } = require('../core/http-exception')

const catchError = async (ctx, next) => {
    try {
        await next()
    } catch (error) {
        // error 里边有堆栈调用的信息
        // 给到调用方的应该是 简化 清晰明了的消息
        // HTTP Status Code 2xx，4xx，5xx
        // 开发者通常需要自己设定一些错误信息：
        // message      错误信息文字描述
        // error_code   更详细的错误码，开发者自定义 10001 20003
        // request_url  当前请求的 url
        // 已知错误：
        // 未知错误：程序潜在错误

        // 如果有自定义错误字段，就认为是已知异常
        // if(error.errorCode) {
        //     ctx.body = {
        //         msg:error.message,
        //         error_code: error.errorCode,
        //         request:error.requestUrl
        //     }
        //     ctx.status = error.status
        // } else {
        //     ctx.body = '服务器有点问题'
        // }


        // 由于全局处理异常，导致一些报错信息不回在控制台输出，这在开发的时候不是很友好
        // 因此，需要根据环境进行配置

        // 开发环境，需要 throw error
        const isHttpException = error instanceof HttpException

        const isDev = global.config.environment === 'dev'
        if(isDev && !isHttpException) {
            throw error;
        }
        // 生产环境
        // 如果一个错误类型是 HttpException 那么就认定为一个已知错误
        if(isHttpException) {
            ctx.body = {
                msg:error.msg,
                error_code: error.errorCode,
                request: `${ctx.method} ${ctx.path}`
            }
            ctx.status = error.code
        } else {
            // 未知错误处理
            ctx.body = {
                msg: '发生了不可描述的错误',
                error_code: 999,
                request: `${ctx.method} ${ctx.path}`
            }
            ctx.status = 500
        }
        
    }
}

module.exports = catchError