import * as fs from "fs"
import * as path from "path"
import { AppData } from "./AppData";
import { App } from "../App";
/**
 * 当个项目的配置字段
 */
export interface IProjectItemData{
    /**id */
    id:string;
    /**项目名字 */
    name:string;
    /**代码路径 */
    code:string;
    /**数据路径 */
    data:string;
    /**web路径 */
    web:string;
    /**可以发布的外网正式服信息 */
    pubVer:{[id:string]:IProjectVerInfo};
    /**发布的文件路径 */
    pubClient:string;
    /**发布的url */
    pubUrl:string;
    /**cdnUrl */
    cdnUrl:string;

}
/**
 * 项目发布的版本信息
 */
export interface IProjectVerInfo{
    name:string;
    type:string;
    ver:number;
}

export class ProjectData{

    private _data:{[id:number]:IProjectItemData} = {};

    constructor()
    {
        this.init();
    }


    private init()
    {
        let jsonPath = path.join(__dirname, "../../res/project.config.json");
        console.log("读取项目配置： "+jsonPath);
        let pjson = fs.readFileSync(jsonPath, "utf-8");
        this._data = JSON.parse(pjson);
    }

    public getProjectData(id:string):IProjectItemData
    {
        return this._data[id];
    }


    private _projectList:{[id:string]:{"id":string, "name":string, pubVer:{[id:string]:IProjectVerInfo}, pubUrl:string , pubClient:string, cdnUrl:string , httpUrl:string}};
    /**客户端链接成功后发送给客户端的信息 */
    public get allProjectInfo()
    {
        if(!this._projectList)
        {
            this._projectList = {};
            for(let key in this._data)
            {
                this._projectList[key] = {"id":key, name:this._data[key].name, 
                                            pubVer:this._data[key].pubVer, pubUrl:this._data[key].pubUrl, 
                                            cdnUrl:this._data[key].cdnUrl, pubClient:this._data[key].pubClient,
                                            httpUrl:"http://"+App.appData.localIp+":"+App.appData.httpPort,
                                        };
            }
        }
        return this._projectList;
    }
}