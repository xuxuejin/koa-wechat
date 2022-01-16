const Sequelize = require('sequelize')
const {
    dbName,
    host,
    port,
    user,
    password,
} = require('../config/config').database

const sequelize = new Sequelize(dbName, user, password, {
    // 指定数据库类型，同时还要安装 mysql 驱动（yarn add mysql2）
    dialect: 'mysql',
    host,
    port,
    // logging -> 会在控制台显示 SQL 信息
    logging: true,
    timezone: '+08:00',
    define: {
        // timestamps: false 生成的表里边就不会生成 createdAt 和 updatedAt 字段
        // 在设计数据库和数据表的时候，create_time update_time delete_time 最好都加上
        timestamps: true,
        // 加上 paranoid 会生成 delete_time
        paranoid: true,
        // 重命名为更符合数据库设计规范的名字
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
        // 字段名更改为下划线命名法
        underscored: true,
        // 用来排除不许需要的字段
        scopes: {
            bh: {
                attributes: {
                    exclude: ['updated_at', 'deleted_at', 'created_at']
                }
            }
        }
    }
})
// 这一行代码一定要加，不然可能导致不执行
sequelize.sync({
    // 加上 force: true，新增字段会自动把原来的表删掉，重新创建一个新的表
    // 但是在生产环境或者数据库有数据的情况下，不要使用，非常危险
    force: false
});

module.exports = {
    sequelize
}