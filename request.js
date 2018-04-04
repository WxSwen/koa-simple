let url = require('url');

// url.parse(urlString,boolean,boolean) 返回一个url解析对象，
// 第二个参数为true时，query属性返回对象，否则字符串

module.exports = {
  get query() {
    return url.parse(this.req.url, true).query;
  }
}