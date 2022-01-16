module.exports = {
    // prod
    environment: 'dev',
    database: {
        dbName: '7yue',
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: 'xxj123456'
    },
    security: {
        // secretKey 要设置得复杂一点，可以借助第三方工具生成
        secretKey: "abcdefg",
        // 设置过期时间 1个月
        expiresIn: 60*60*24*30
    },
    wx: {
        appId: 'wx54cbd6e63448aeae',
        appSecret: '62186223028409a920fd4876bc724662',
        loginUrl: 'https://api.weixin.qq.com/sns/jscode2session?appid=%s&secret=%s&js_code=%s&grant_type=authorization_code'
    },
    // 这里选择从豆瓣读书获取书籍数据
    douban: {
        detailUrl: 'https://book.douban.com/subject/%d/',
        keywordUrl: 'https://search.douban.com/book/subject_search?search_text=%s&cat=1001'
    }
}