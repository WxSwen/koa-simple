// let http = require('http');

// let server = http.createServer((req, res)=>{
//   res.writeHead(200);
//   res.end('Hello world')
// })

// server.listen(3000, ()=>{
//   console.log('listenning on 3000');
// })


async function m1(next){
  console.log('m1');
  await next();
}
async function m2(next){
  console.log('m2');
  await next();
}
async function m3(next){
  console.log('m3');
  await next();
}




// let next1 = async function () {
//   await m3();
// }

// let next2 = async function () {
//   await m2(next1);
// }

// m1(next2);

// 事件传递1


function createNext(middleware, oldNext) {
  return async function() {
    try{
      await middleware(oldNext)
    }catch(err){
      console.log('fuck'+err);
    }
  }
}

// let next1 = createNext(m3, ()=>Promise.resolve());
// let next2 = createNext(m2, next1);
// let next3 = createNext(m1, next2);

// next3();

// 事件传递2


let middlewares = [m1, m2, m3];
let len = middlewares.length;

// 最后一个中间件的next设置为一个立即resolve的promise函数
let next = async function() {
  return Promise.resolve();
}

for(let i = len - 1; i >= 0; i--){
  next = createNext(middlewares[i], next);
}

next();
