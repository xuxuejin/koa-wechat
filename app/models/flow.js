const { Sequelize, Model } = require('sequelize')
const { sequelize } = require('../../core/db')

const flowFields = {
    index: Sequelize.INTEGER,
    // 因为这是一个业务表，不记录具体实体的信息
    // art_id 是用来获取某实体的信息：电影 句子 音乐等等
    artId: Sequelize.INTEGER,
    // 因为 Flow 对应三个表： Movie Music Sentence
    // type 是用来区分类型的，比如 100 Movie 200 Music 300 Sentence
    type: Sequelize.INTEGER
    // type + art_id 就可以查到某个表里某条记录了
}

// 电影
class Flow extends Model {
}

Flow.init(flowFields, {
    sequelize,
    // 指定表名
    tableName: 'flow'
})

module.exports = {
    Flow
}