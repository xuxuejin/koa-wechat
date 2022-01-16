async function func1() {
    try {
        await func2()
    } catch (error) {
        console.log('调用func2', error)
    }
}

function func2() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const r = Math.random()
            if(r<0.5) {
                reject(`error${ r }`)
            }
        }, 1000)
    })
}

func1();

// function func3() {
//     try {
//         func4()
//     } catch (error) {
//         console.log('调用4异常', error)
//     }
// }

// // 定时器模拟异步调用
// function func4(cb) {
//     // 因为是异步的 调用 func4 异步还没执行
//     setTimeout(() => {
//         throw new Error('异步调用报错');
//     }, 1000)
// }

// func3();

// 使用第三方库或者别人写的代码，不能保证，此时最好使用 try catch 捕获异常
// 理论上每次函数调用都要 try catch，但是 try catch 只对同步代码有效，异步的调用的异常处理比较麻烦
// 在没有 Promise Async 的时候，只能通过回调实现
// 全局异常处理