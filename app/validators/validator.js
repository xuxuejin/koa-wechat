const { LinValidator, Rule } = require('../../core/lin-validator');
const { User } = require('../models/user')
const { LoginType, ArtType } = require('../lib/enum')

class PositiveIntegerValidator extends LinValidator {
    constructor() {
        super()
        this.id = [
            new Rule('isInt', '需要正整数', {min: 1})
        ]
    }
}

class RegisterValidator extends LinValidator {
    constructor() {
        super()
        this.email = [
            new Rule('isEmail', '不符合 Email 规范')
        ]
        this.password1= [
            // 给用户密码指定范围，不希望有危险的字符
            // 加强用户密码强度，不希望使用简单密码
            new Rule('isLength', '密码至少6个字符，最多32个字符', {
                min: 6,
                max: 32
            }),
            new Rule('matches', '密码强度不符合规范', '^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]')
        ],
        this.password2= this.password1,
        this.nickname=[
            new Rule('isLength', '昵称不符合长度规范', {
                min: 4,
                max: 32
            })
        ]
        // 密码和确认密码要一致，直接通过这种校验规则没法实现
    }
    // 自定义校验规则，校验两次密码是否一致
    validatePassword(vals) {
        const psw1 = vals.body.password1
        const psw2 = vals.body.password2

        if(psw1 !== psw2) {
            throw new Error('两次输入的密码不一致')
        }
    }
    // 验证邮箱是否已经注册过（因为在设计数据模型的时候，邮箱有唯一性要求）
    // 验证邮箱需要先从数据库里查一下
    async validateEmail(vals) {
        const email = vals.body.email

        const user = await User.findOne({
            where: {
                email: email
            }
        })

        if(user) {
            throw new Error('该 email 已经注册过了')
        }
    }
}

class TokenValidator extends LinValidator {
    constructor() {
        super()
        this.account = [
            new Rule('isLength', '不符合账号规则', {
                min: 4,
                max: 32
            })
        ]
        this.secret = [
            // 必须要传入吗？
            // web 账号+密码
            // 登录多元化 小程序 oAuth 手机号登录 等等
            // 1. 可以为空，可以不传      比如翻页可以不传，取默认的
            // 2. 不为空，就要有规则限制   比如翻页页码不能是任意字符
            new Rule('isOptional'),
            new Rule('isLength', '至少6个字符', {
                min: 6,
                max: 128
            })
        ]
    }

    // type 登录的方式
    async validateLoginType(vals) {
        if(!vals.body.type) {
            throw new Error('type 不能为空')
        }
        if(!LoginType.isThisType(vals.body.type)) {
            throw new Error('type 参数非法')
        }
    }
}

class NotEmptyValidator extends LinValidator {
    constructor() {
        super()
        this.token = [
            new Rule('isLength', '不允许为空', {min: 1})
        ]
    }
}

const checkType = (vals) => {
    if(!vals.body.type) {
        throw new Error('type 不能为空')
    }
    if(!LoginType.isThisType(vals.body.type)) {
        throw new Error('type 参数非法')
    }
}

const checkArtType = (vals) => {
    if(!vals.path.type) {
        throw new Error('type 不能为空')
    }
    if(!ArtType.isThisType(Number(vals.path.type))) {
        throw new Error('type 参数非法')
    }
}

class LikeValidator extends LinValidator {
    constructor() {
        super()
        this.art_id = [
            new Rule('isInt', '需要正整数', {min: 1})
        ]
        this.validateType = checkType
    }
}

class ClassicValidator extends LikeValidator {
    
    constructor() {
        super()
        this.validateType = checkArtType
    }
}

module.exports = {
    PositiveIntegerValidator,
    RegisterValidator,
    TokenValidator,
    NotEmptyValidator,
    LikeValidator,
    ClassicValidator
}