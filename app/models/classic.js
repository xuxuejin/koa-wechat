const { Sequelize, Model } = require('sequelize')
const { sequelize } = require('../../core/db')

const classicFields = {
    image: Sequelize.STRING,
    content: Sequelize.STRING,
    pubdate: Sequelize.DATEONLY,
    title: Sequelize.STRING,
    type: Sequelize.TINYINT
}

// 电影
class Movie extends Model {
}

Movie.init(classicFields, {
    sequelize,
    // 指定表名
    tableName: 'movie'
})
// 句子
class Sentence extends Model {
}

const sentenceFields = Object.assign({
    favNums: {
        type: Sequelize.INTEGER,
        default: 0
    },
}, classicFields)

Sentence.init(sentenceFields, {
    sequelize,
    // 指定表名
    tableName: 'sentence'
})
// 音乐
class Music extends Model {
}

const musicFields = Object.assign({
    url: Sequelize.STRING,
}, classicFields)

Music.init(musicFields, {
    sequelize,
    // 指定表名
    tableName: 'music'
})
module.exports = {
    Movie,
    Sentence,
    Music
}