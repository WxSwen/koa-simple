let http = require('http');
let context = require('./context');
let request = require('./request');
let response = require('./response');
let EventEmitter = require('events');

// let http = require('http');

// let server = http.createServer((req, res)=>{
//   res.writeHead(200);
//   res.end('Hello world')
// })

// server.listen(3000, ()=>{
//   console.log('listenning on 3000');
// })

//正常情况下，listen的实例是createServer创建出来的，所以这两者不能分开

// class Application{
//   constructor(){
//     this.http,
//     this.callbackFunc
//   }

//   use(fn){
//     return this.http = http.createServer(fn);
//   }

//   // listen(...args){
//   //   let server = http.createServer
//   // }
//   listen(...args){
//     return this.http.listen(...args)
//   }
// }

// let app = new Application();


// app.use((req, res) => {
//   res.writeHead(200);
//   res.end('hello world!');
// });

// app.listen(3000, () => {
//   console.log('listening on 3000');
// });


// 所以你可以像上述方法，创建一个内部共享的http

// class Application{
//   constructor(){
//     this.callbackFunc;
//     this.context = context;
//     this.request = request;
//     this.response = response;
//   }

//   use(fn){
//     this.callbackFunc = fn;
//   }

//   listen(...args){
//     let server = http.createServer(this.callback());
//     server.listen(...args);
//   }

//   callback() {
//     return (req, res)=>{
//       let ctx = this.createContext(req, res);
//       let respond = () => this.responseBody(ctx);

//       this.callbackFunc(ctx).then(respond);
      
//     }
//   }

//   createContext(req, res) {
//     // 构造context
//     // context 包含 request, response两个对象
//     // 使用getter/setter让对象自动生成
//     // 在request/response各自构建对象方法
//     let ctx = Object.create(this.context);
//     ctx.request = Object.create(this.request);
//     ctx.response = Object.create(this.response);

//     // console.log(ctx.request.__proto__, ctx.response.__proto__);
//     // { query: [Getter] } 
//     // { body: [Getter/Setter], status: [Getter/Setter] }

//     ctx.req = ctx.request.req = req;
//     ctx.res = ctx.response.res = res;
//     return ctx;
//   }

//   responseBody(ctx) {
//     let content = ctx.body;
//     if(typeof content === 'string') {
//       ctx.res.end(content);
//     } else if(typeof content === 'object'){
//       ctx.res.end(JSON.stringify(content));
//     }
//   }
// }

// let app = new Application();

// 也可以像以上方法，保存一个回调方法

// app.use(async ctx => {
//   ctx.body = 'hello' + ctx.query.name
// });

// app.listen(3000, () => {
//   console.log('listening on 3000');
// });

// app.context.echoData = function (errno = 0, data = null, errmsg = '') {
//   this.res.setHeader('Content-Type', 'application/json;charset=utf-8');

//   this.body = {
//     errno: errno,
//     data: data,
//     errmsg: errmsg
//   };
// }

// app.use(async ctx=>{
//   let data = {
//     name: 'tom',
//     age: 16,
//     sex: 'male'
//   }
//   ctx.echoData(0, data, 'success');
// })

// app.listen(3000, () => {
//     console.log('listenning on 3000');
// });


// next 实现中间件模式
// 在use middleware 的时候，将所有fn收集，
// next使用async和await 将状态传递
// 当一个中间件调用 next() 则该函数暂停并将控制传递给定义的下一个中间件。
// 当在下游没有更多的中间件执行后，堆栈将展开并且每个中间件恢复执行其上游行为。

class Application extends EventEmitter{
  constructor(){
    super();
    this.middlewares = [];
    this.context = context;
    this.request = request;
    this.response = response;
  }

  use(middleware) {
    this.middlewares.push(middleware);
  }
  listen(...args){
    let server = http.createServer(this.callback());
    server.listen(...args);
  }
  compose() {
    return async ctx => {

      function createNext(middleware, oldNext){
        return async ()=> {
          await middleware(ctx, oldNext);
        }
      }

      let len = this.middlewares.length;

      let next = async ()=> {
        return Promise.resolve();
      }

      for(let i = len - 1; i >= 0; i--){
        next = createNext(this.middlewares[i], next);
      }

      await next();
    }
  };

  callback() {
    return (req, res) => {
      let ctx = this.createContext(req, res);
      let respond = () => this.responseBody(ctx);
      let onerror = (err) => this.onerror(err, ctx);
      let fn = this.compose();
      
      return fn(ctx).then(respond).catch(onerror);
    }
  }

  createContext(req, res) {
    let ctx = Object.create(this.context);
    ctx.request = Object.create(this.request);
    ctx.response = Object.create(this.response);

    ctx.req = ctx.request.req = req;
    ctx.res = ctx.response.res = res;

    return ctx;
  }

  responseBody(ctx) {
    let content = ctx.body;
    if(typeof content === 'string') {
      ctx.res.end(content);
    } else if(typeof content === 'object'){
      ctx.res.end(JSON.stringify(content));
    }
  }

  onerror(err, ctx) {
    if(err.code === 'ENOENT') {
      ctx.status = 404;
    } else {
      ctx.status = 500;
    }

    let msg = err.message || 'Internal error';
    ctx.res.end(msg);
    // 触发error事件
    this.emit('error', err);
  }
}

let app = new Application();
let responseData = {};
app.use(async (ctx, next) => {
  responseData.name = 'tom';
  ctx.body = responseData;
  await next();
});

app.use(async (ctx, next) => {
  responseData.age = 16;
  await next();
});

app.use(async ctx => {
  // responseData.sex = 'male';
  throw new Error('ooops');
});

app.on('error',(err)=>{
  
})

app.listen(3000, () => {
  console.log('listening on 3000');
});