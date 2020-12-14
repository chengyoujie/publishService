import * as fs from "fs"
import * as path from "path"
import * as os from "os"
import { App } from "../App";

export interface IAppData{
    sockPort:number,
    httpPort:number;
    userInfo:{[ip:string]:IUserInfo},
}
export interface IUserInfo{
    uname:string;
}


export class AppData{

    private _data:IAppData;
    private _localIp:string;

    constructor()
    {
        this.init();
    }


    private init()
    {
        let jsonPath = path.join(__dirname, "../../res/app.config.json");
        console.log("读取应用配置： "+jsonPath);
        let pjson = fs.readFileSync(jsonPath, "utf-8");
        this._data = JSON.parse(pjson);
        console.log("本机IP: "+this.localIp)
    }


    /**
     * 获取服务器本机ip
     */
    public get localIp(){
        if(this._localIp)return this._localIp;
        var interfaces = os.networkInterfaces();
        for(var devName in interfaces){
            var iface = interfaces[devName];
            for(var i=0;i<iface.length;i++){
                var alias = iface[i];
                if(alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal){
                    this._localIp = alias.address;
                    return this._localIp;
                }
            }
        }
        return "";
      }
    // public data():IAppData
    // {
    //     return this._data;
    // }
    /**
     * 获取服务器端口 号
     */
    public get sockPort():number
    {
        return this._data.sockPort;
    }

    /**
     * 获取http下载服务器port
     */
    public get httpPort():number
    {
        return this._data.httpPort;
    }

    /**
     * 根据ip获取用户信息
     * @param ip 用户ip
     */
    public getUserInfo(ip:string):IUserInfo
    {
        return this._data.userInfo[ip];
    }

    /**
     * 根据用户ip获取用户名字如果没有则使用ip
     * @param ip 
     */
    public getUserName(ip:string):string
    {
        if(this._data.userInfo[ip])
            return this._data.userInfo[ip].uname;
        return ip;
    }

    private _serviceInfoData:{httpUrl:string, serviceIp:string};
    public get serviceInfoData(){
        if(!this._serviceInfoData)
        {
            this._serviceInfoData = {
                    httpUrl:"http://"+App.appData.localIp+":"+App.appData.httpPort,
                    serviceIp:App.appData.localIp
                }
        }
        return  this._serviceInfoData;
    }

    // /**
    //  * 根据用户ip获取用户的名字
    //  * @param ip 用户的ip
    //  */
    // public getUserName(ip:string):string
    // {
    //     if(this._data.userInfo[ip])
    //         return this._data.userInfo[ip].uname;
    //     return ip;
    // }

}