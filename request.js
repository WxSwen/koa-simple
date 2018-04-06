const URL = require('url').URL;
const net = require('net');
const contentType = require('content-type');
const stringify = require('url').format;
const parse = require('parseurl')
const qs = require('querystring');
const typeis = require('type-is');
const fresh = require('fresh');
const only = require('only');

// url.parse(urlString,boolean,boolean) 返回一个url解析对象，
// 第二个参数为true时，query属性返回对象，否则字符串

module.exports = {
  get query() {
    return url.parse(this.req.url, true).query;
  },

  // header
  get header() {
    return this.req.headers;
  },

  set header(val) {
    this.req.headers = val;
  },

  // headers关联header
  get headers() {
    return this.req.headers;
  },

  set headers(val) {
    this.req.headers = val;
  },



  // url
  get url() {
    return this.req.url;
  },

  set url(val){
    this.req.url = val;
  },

  // orgin
  get origin(){
    return `${this.protocol}://${this.host}`
  },

  // href
  get href(){

  }
}