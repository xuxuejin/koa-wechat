const { Sequelize, Model, Op } = require('sequelize')
const { sequelize } = require('../../core/db')
const { Art } = require('./art')

class Favor extends Model {
    static async like(art_id, type, uid) {
        // 1. 往 favor 表里添加一条点赞的数据
        // 2. 更新对应的实体表里某条记录的点赞数

        // 但是，这边有个非常重要的点：那就是要执行，两个操作要么都成功，要么都失败
        // 不然一个成功，一个失败，数据就不一致了
        // 这就是数据库的一种机制：数据库事务
        // 数据库事务总能保证对数据库的多个操作，要么同时成功，如果有一个执行失败，那么所有的操作都会被撤销
        // 因此，数据库事务可以保证数据的一致性

        // 一个设计比较严谨的数据库，一般都有4个特性：ACID
        // A：原子性(Atomicity) -> 原子性意味着数据库中的事务执行是作为原子。即不可再分，整个语句要么执行，要么不执行
        // C：一致性(Consistency) -> 即在事务开始之前和事务结束以后，数据库的完整性约束没有被破坏
        // I：隔离性(Isolation) -> 事务的执行是互不干扰的，一个事务不可能看到其他事务运行时中间某一时刻的数据。
        // D：持久性(Durability) -> 意味着在事务完成以后，该事务所对数据库所作的更改便持久的保存在数据库之中，并不会被回滚。即使出现了任何事故比如断电等，事务一旦提交，则持久化保存在数据库中.

        const favor = await Favor.findOne({
            where: {
                art_id,
                type,
                uid
            }
        })
        // 已经点过赞了
        if(favor) {
            throw new global.errs.LikeError()
        }
        // 没有点赞，执行两步操作
        // 执行事务
        try {

            const result = await sequelize.transaction(async (t) => {
          
                // 第一步操作
                await Favor.create({
                    art_id,
                    type,
                    uid
                }, {transaction: t})
          
                // 第二步操作

                const art = await Art.getData(art_id, type)
                // 加1
                await art.increment('fav_nums', {by: 1, transaction: t})
          
            });

            // 如果执行到此行,则表示事务已成功提交,`result`是事务返回的结果
            // 一定要 return
            return result
          
          } catch (error) {
          
            // 如果执行到此,则发生错误.
            // 该事务已由 Sequelize 自动回滚！
          
          }

    }

    static async dislike(art_id, type, uid) {
        const favor = await Favor.findOne({
            where: {
                art_id,
                type,
                uid
            }
        })
        // 已经点过赞了
        if(!favor) {
            throw new global.errs.DislikeError()
        }
        // 没有点赞，执行两步操作
        // 执行事务
        try {

            const result = await sequelize.transaction(async (t) => {
          
                // 第一步操作 用查询出来的 favor 删除记录
                // Favor 可以理解为是 表 favor 可以理解为是记录
                await favor.destroy({
                    // 物理删除或软删除
                    force: true,
                    // false 软删除，并不会把数据从数据库里删除，只是在这条记录的 deleted_at 字段插入时间戳标记
                    // true 物理删除，这条记录直接从表里删除
                    transaction: t
                })
          
                // 第二步操作

                const art = await Art.getData(art_id, type)
                // 加1
                await art.decrement('fav_nums', {by: 1, transaction: t})
          
            });

            // 如果执行到此行,则表示事务已成功提交,`result`是事务返回的结果
            // 一定要 return
            return result
          
          } catch (error) {
          
            // 如果执行到此,则发生错误.
            // 该事务已由 Sequelize 自动回滚！
          
          }

    }

    // 用户是否点赞
    static async userLikeIt(art_id, type, uid) {
        const favor = await Favor.findOne({
            art_id,
            type,
            uid
        })

        return favor?true:false
    }

    static async getMyClassicFavors(uid) {
        // type !== 400 不包括书籍
        const arts = await Favor.findAll({
            where: {
                uid,
                type: {
                    [Op.not]: 400
                }
            }
        })

        if(!arts) {
            throw new global.errs.NotFound()
        }

        // arts 100 循环查询数据库是个非常危险的行为
        // 查询数据库的次数 不可控
        // 这时候需要使用 SQL 里的 in 查询

        // [ids]

        // for(let art of arts) {
        //     Art.getData()
        // }

        return await Art.getList(arts)

    }
}

Favor.init({
    uid: Sequelize.INTEGER,
    art_id: Sequelize.INTEGER,
    type: Sequelize.INTEGER,
},{
    sequelize,
    // 指定表名
    tableName: 'favor'
})

module.exports = {
    Favor
}