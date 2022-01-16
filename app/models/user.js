const { Sequelize, Model } = require('sequelize')
const bcrypt = require('bcryptjs')
const { sequelize } = require('../../core/db')

// 定义一个模型
class User extends Model {
    // 校验账号密码
    static async verifyEmailPassword(email, plainPassword) {
        const user = await User.findOne({
            where: {
                email
            }
        })

        if(!user) {
            throw new global.errs.AuthFailed('账号不存在')
        }
        // 账号存在，开始比对密码 注意：数据库存的是加密的密码
        const correct = bcrypt.compareSync(plainPassword, user.password)

        if(!correct) {
            throw new global.errs.AuthFailed('密码错误')
        }

        return user

    }

    // 查询用户
    static async getUserByOpenid(openid) {
        const user = await User.findOne({
            where: {
                openid
            }
        })

        return user
    }

    // 微信注册用户
    // static async registerByOpenid(openid) {
    //     const user = await User.create({
    //         openid
    //     })
    // }

    static async registerByOpenid(openid) {
        await User.create({openid})
    }
}

User.init({
    // 跟 mysql 的数据类型对应
    // 主键：不能重复 不能为空
    id: {
        type: Sequelize.INTEGER,
        // 设为主键
        primaryKey: true,
        // 自增
        autoIncrement: true
    },
    nickname: Sequelize.STRING,
    // email: Sequelize.STRING,
    email: {
        type: Sequelize.STRING(128),
        unique: true
    },
    // password: Sequelize.STRING,
    // 给明文密码加密
    password: {
        // 设计模式 观察者模式
        type: Sequelize.STRING,
        set(val) {
            const salt = bcrypt.genSaltSync(10)
            const psw = bcrypt.hashSync(val, salt)
            // 保存加密数据
            this.setDataValue('password', psw)
        }
    },
    openid: {
        type: Sequelize.STRING(64),
        unique: true
    }
}, {
    sequelize,
    // 指定表名
    tableName: 'user'
})

module.exports = {
    User
}