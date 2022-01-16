const jwt = require('jsonwebtoken')
const axios = require('axios')
const path = require('path')
const fs = require('fs')
    /***
     * 
     */
const findMembers = function(instance, {
    prefix,
    specifiedType,
    filter
}) {
    // 递归函数
    function _find(instance) {
        //基线条件（跳出递归）
        if (instance.__proto__ === null)
            return []

        let names = Reflect.ownKeys(instance)
        names = names.filter((name) => {
            // 过滤掉不满足条件的属性或方法名
            return _shouldKeep(name)
        })

        return [...names, ..._find(instance.__proto__)]
    }

    function _shouldKeep(value) {
        if (filter) {
            if (filter(value)) {
                return true
            }
        }
        if (prefix)
            if (value.startsWith(prefix))
                return true
        if (specifiedType)
            if (instance[value] instanceof specifiedType)
                return true
    }

    return _find(instance)
}

const generateToken = function(uid, scope) {
    // scope 是用来做权限分级的（普通用户， 管理员）
    const secretKey = global.config.security.secretKey
    const expiresIn = global.config.security.expiresIn
    const token = jwt.sign({
        uid,
        scope
    }, secretKey, {
        expiresIn
    })
    return token
}

const request = axios.create({
    baseURL: "http://localhost:3001/v1/",
    timeout: 3000,
    headers: { 'Content-Type': "application/json" }

});

//上传文件的一部分
function getUploadDirName(){
    const date = new Date();
    let month = Number.parseInt(date.getMonth()) + 1;
    month = month.toString().length > 1 ? month : `0${month}`;
    const dir = `${date.getFullYear()}${month}${date.getDate()}`;
    return dir;
  }
  
function checkDirExist(p) {
    if (!fs.existsSync(p)) {
      fs.mkdirSync(p);
    }
}
function getUploadFileName(ext){
    return `${Date.now()}${Number.parseInt(Math.random() * 10000)}.${ext}`;
}

function getUploadFileExt(name) {
    let ext = name.split('.');
    return ext[ext.length - 1];
}
   
  
module.exports = {
    findMembers,
    generateToken,
    request,
    getUploadDirName,
    checkDirExist,
    getUploadFileExt,
    getUploadFileName
}
