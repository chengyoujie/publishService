import { Observer } from "../../event/Observer";
import * as http from "http"
import * as express from "express"
import * as url from "url"
import * as fs from "fs";
import * as path from "path";
import * as mime from "mime";

export class HttpService extends Observer{
    
    private app;
    private _port:number;
    constructor(port:number)
    {
        super();
        this._port = port;
        this.initService();
    }

    private initService()
    {
        this.app = express();
        this.app.get("*", this.handleDelaGetRequest.bind(this));
        http.createServer(this.app).listen(this._port);
        console.log("http下载服务器启动成功")
    }


    private handleDelaGetRequest(req, res, next){
        let ip = req.ip;
        let ipReg = /\d+\.\d+\.\d+\.\d+/gi;
        let ipArr = ipReg.exec(ip);
        if(ipArr)ip = ipArr[0]
        if(req.path == "/down")//处理下载
        {
            let paramObj = url.parse(req.url, true).query;
            if(paramObj.url)
            {
                let fpath = path.join(paramObj.url+"");
                console.log("开始下载："+ip+" ->"+fpath)
                fs.lstat(fpath, function(err:NodeJS.ErrnoException, stat:fs.Stats){
                    if(err){
                        if(err.code == 'ENOENT')
                        {
                            res.writeHead(404);
                            res.end("404 Not Found");
                            return;
                        }
                        res.writeHead(500);
                        res.end(JSON.stringify(err));
                        return;
                    }
                    if(stat.isDirectory()) {
                      res.writeHead(403);
                      res.end("403 Forbidden file is directory");
                      return;
                    }
                    var f = fs.createReadStream(fpath);//TODO 最好验证下目录的权限
                    const row = {};
                    row['Content-Type'] = "application/octet-stream";//mime.getType(fpath);
                    row['Content-Disposition'] = 'attachment; filename=' + encodeURI(path.basename(fpath));
                    res.writeHead(200, row);
                    f.pipe(res);
                    console.log("ip:"+ip+" 下载成功"+fpath)
                })
            }else{
                res.writeHead(404);
                res.end("404 目前该服务器只支持下载功能 请使用 ");
            }
        }
    }


}


// var http = require('http');
// var express = require('express');
// var fs=require("fs");
// var path=require("path");
// var mime = require('mime');
// var app = express();
// var currDir = 'F:\\Users\\djyk\\74dj.mp3';
// app.get('*', function (req, res, next) {
//   var reqpath = decodeURI(req.path);
//   console.log(reqpath);
//   var filepath = path.join(currDir,reqpath);
//   fs.lstat(filepath, function(err, stat) {
//     if(err){
//       if (err.code === 'ENOENT') {
//         res.writeHead(404);
//         res.end("404 Not Found");
//         return;
//       }
//       res.writeHead(500);
//       res.end(JSON.stringify(err));
//       return;
//     }
//     if(stat.isDirectory()) {
//       res.writeHead(403);
//       res.end("403 Forbidden");
//       return;
//     }
//     if (path.extname(filepath) !== '.mp3') {
//       res.writeHead(400);
//       res.end("400 Bad Request");
//       return;
//     }
//     var f = fs.createReadStream(filepath);
//     const row = {};
//     row['Content-Type'] = mime.getType(reqpath);
//     row['Content-Disposition'] = 'attachment; filename=' + encodeURI(path.basename(reqpath));
//     res.writeHead(200, row);
//     f.pipe(res);
//   });
// });
// http.createServer(app).listen(50074);