
const requireDirectory = require('require-directory')
const Router = require('@koa/router');

// 初始化管理器
class InitManager {
    static initCore(app) {
        // 入口方法
        // 调用内部方法或者给类添加属性 使得内部可以使用 app 对象
        InitManager.app = app
        InitManager.initLoadRouters()
        InitManager.loadHttpException()
        InitManager.loadConfig()

    }

    static loadConfig(path='') {
        const configPath = path || process.cwd() + '/config/config.js';
        const config = require(configPath)
        // 配置项
        global.config = config;
    }

    static initLoadRouters() {
        // requireDirectory(module, '../app/api', {
        //     visit: whenLoadModule
        // })
        // 这种直接写死路径的方式 属于硬编码，解决方式：
        // 1. 配置文件
        // 2. 绝对路径
        const apiDirectory = `${process.cwd()}/app/api`;
        requireDirectory(module, apiDirectory, {
            visit: whenLoadModule
        })

        function whenLoadModule(obj) {
            if(obj instanceof Router) {
                InitManager.app.use(obj.routes())
            }
        }
    }
    static loadHttpException() {
        const error = require('./http-exception')
        global.errs = error;
    }
}

module.exports = InitManager