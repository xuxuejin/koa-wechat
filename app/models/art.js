const { Op } = require('sequelize')
const {Movie, Music, Sentence} = require('./classic') 
// 循环引用 Favor 里边引用了 Art，Art里边引用了 Favor，这样写有问题，导致返回的不完整，只能放到下面使用的时候再引用了
// const { Favor } = require('./favor')
// 查询逻辑
class Art {

    // 实例方法 在实例化的时候传入一系列参数
    // constructor(art_id, type) {
    //     // 通常会把决定对象特征的特征的相关参数保存在到属性里
    //     this.art_id = art_id
    //     this.type = type
    // }
    // 模型内部不要使用 constructor 有坑

    // 实例方法
    // 1. 
    get detail() {}

    // 2.
    async getDetail(art_id, type, uid) {

        const { Favor } = require('./favor')

        const art = await Art.getData(art_id, type)

        if(!art) {
            throw new global.errs.NotFound()
        }

        const like = await Favor.userLikeIt(art_id, type, uid)

        // 合并结果
        return {
            art,
            like_status: like
        }
    }

    // 这两种写法都可以，但是调用方式不一样 get detail 通过 art.detail 就可以， getDetail 需要 art.getDetail() 加括号调用
    // 1 更加符合面向对象的写法

    // 静态方法 通常通过方法来传递参数
    static async getList(artInfoList) {
        // in 查询
        // 有三种类型的 art
        // 3次 in 查询，数据分别在三个表里
        const artInfoObj = {
            100: [],
            200: [],
            300: []
        }

        for(let artInfo of artInfoList) {
            artInfoObj[artInfo.type].push(artInfo.art_id)
        }
        const arts = [];
        for( let key in artInfoObj) {
            // for 循环中有复杂逻辑，建议封装成一个方法，以便调用
            // Art._getListByType(artInfoObj[key], key)
            const ids = artInfoObj[key];

            if(!ids.length) {
                continue
            }
            const rest = await Art._getListByType(ids, Number(key));

            arts.push(rest)
        }
        // 因为上面的 arts 是一个二维数组 所以需要扁平化处理
        return arts.flat(2);
    }

    static async _getListByType(ids, type) {
        let arts = []
        // in 查询
        const finder = {
            where: {
                id: {
                    [Op.in]: ids
                }
            }
        }
        switch(type) {
            case 100:
                arts = await Movie.scope('bh').findAll(finder)
                break;
            case 200:
                arts = await Music.scope('bh').findAll(finder)
                break;
            case 300:
                arts = await Sentence.scope('bh').findAll(finder)
                break;
            case 400:
                // book
                break;
            default:
                break;
        }
        return arts
    }

    static async getData(art_id, type) {
        let art = null
        const finder = {
            where: {
                id: art_id
            }
        }
        switch(type) {
            case 100:
                // scope 用来排除不需要的字段
                art = await Movie.scope('bh').findOne(finder)
                break;
            case 200:
                art = await Music.scope('bh').findOne(finder)
                break;
            case 300:
                art = await Sentence.scope('bh').findOne(finder)
                break;
            case 400:
                // book
                break;
            default:
                break;
        }
        return art
    }
}

module.exports = {
    Art
}