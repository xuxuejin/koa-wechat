const { Sequelize, Model, Op } = require('sequelize')
const { sequelize } = require('../../core/db')
const { Favor } = require('./favor')

const hotBookFields = {
    // 用来做排序用的
    index: Sequelize.INTEGER,
    image: Sequelize.STRING,
    author: Sequelize.STRING,
    title: Sequelize.STRING,
    searchId: Sequelize.INTEGER,
}

// 电影
class HotBook extends Model {
    static async getAll() {
        const books = await HotBook.findAll({
            order: [
                'index'
            ]
        })

        const ids = []

        books.forEach((book) => {
            ids.push(book.id)
        })
        // [{id: xx, count: xx}]
        // 点赞信息
        const favors = await Favor.findAll({
            where: {
                art_id: {
                    [Op.in]: ids,
                    type: 400
                }
            },
            group: ['art_id'],
            attributes: ['art_id', [Sequelize.fn('COUNT', '*'), 'count']]
        })
        // 书籍信息
        books.forEach(book => {
            HotBook._getEachBookStatus(book, favors)
        })

        return books
    }

    static _getEachBookStatus(book, favors) {
        let count  = 0

        favors.forEach(favor => {
            if(book.id === favor.art_id) {
                count = favor.get('count')
            }
        })

        book.setDataValue('count', count)

        return book
    }

}

HotBook.init(hotBookFields, {
    sequelize,
    // 指定表名
    tableName: 'hot_book'
})

module.exports = {
    HotBook
}