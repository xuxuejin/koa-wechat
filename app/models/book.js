const { Sequelize, Model, Utils } = require('sequelize')
const cheerio = require('cheerio');
const { sequelize } = require('../../core/db')
const { default: axios } = require('axios')
const util = require('util')

const bookFields = {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    fav_nums: {
        type: Sequelize.INTEGER,
        default: 0
    },
}

// 书籍
class Book extends Model {
    // 模型不要使用 constructor 有坑
    // constructor(id) {
    //     super()
    //     this.id = id
    // }

    async detail(id) {
        const url = util.format(global.config.douban.detailUrl, id)
        const {data} = await axios.get(url)
        const $ = cheerio.load(data)
        
        return {
            title: $('h1 span').text(),
            info: $('#info').text()
        }
    }
}

Book.init(bookFields, {
    sequelize,
    // 指定表名
    tableName: 'book'
})

module.exports = {
    Book
}