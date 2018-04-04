let http = require('http');
let context = require('./context');
let request = require('./request');
let response = require('./response');


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

class Application{
  constructor(){
    this.callbackFunc;
    this.context = context;
    this.request = request;
    this.response = response;
  }

  use(fn){
    this.callbackFunc = fn;
  }

  listen(...args){
    let server = http.createServer(this.callback());
    server.listen(...args);
  }

  callback() {
    return (req, res)=>{
      let ctx = this.createContext(req, res);
      let respond = () => this.responseBody(ctx);

      this.callbackFunc(ctx).then(respond);
      
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
}

let app = new Application();

// 也可以像以上方法，保存一个回调方法

app.use(async ctx => {
  ctx.body = 'hello' + ctx.query.name
});

app.listen(3000, () => {
  console.log('listening on 3000');
});