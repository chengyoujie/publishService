import { IRecvSocket } from "../utils/socket/Socket";
import { CMD } from "../utils/svn/CMD";
import * as path from "path"
import * as fs from "fs"
// import { stdout } from "process";
import {OperKey } from "../data/ScriptData";
import { ProjectData, IProjectItemData } from "../data/ProjectData";
import { App } from "../App";
import { SVN, ISvnStateInfo } from "../utils/svn/SVN";
import { FileUtils } from "../utils/file/FileUtils";
import { DateUtil } from "../utils/date/DateUtil";
import { stderr } from "process";
import { AppData } from "../data/AppData";

export class Oper implements IRecvSocket{

    private static TempDir = path.join(__dirname, "./../../temp/cmd")
    private _runInfo:{[projectId:string]:{ip:string, oper:string, operName:string, projectName:string, id:string}} = {};

    public async onRecv(ip:string, data:any)
    {
        let oper = data.oper;
        let operParams = data.param;
        let id = data.id;
        if(this._runInfo[id])
        {
            this.handleClientMsg("<font color='#ff0000'>"+App.appData.getUserName(this._runInfo[id].ip)+" 项目："+this._runInfo[id].projectName+" 正在执行中："+this._runInfo[id].operName+"</font>", id);
            return;
        }
        if(oper == OperKey.C2S_GetCdnStat)//特殊处理的命令
        {
            this.handlGetCdnSvnState(id, ip);
            return;
        }else if(oper == OperKey.C2S_GetWebStat){
            this.handlGetWebSvnState(id, ip);
            return;
        }else if(oper == OperKey.C2S_ReStart){//重启
            process.exit(0);
            return;
        }
        //配置中的命令
        let operData = App.scriptData.getOperData(oper);
        if(!operData)
        {
            this.handleClientMsg("没有找到"+oper+"对应的操作，请检查", id);
            return;
        }
        console.log(`${DateUtil.getDateString()} 接受到指令： ${App.appData.getUserName(ip)}  执行  ${operData.name}   ${id}`)
        this.handleClientMsg("<div style='background:#CEE1FF;float:left'><font color='#04419B'>["+DateUtil.getDateString()+"]</font></div> 接受到指令： "+App.appData.getUserName(ip)+"  执行  "+operData.name, id);
        
        FileUtils.removeDirSync(Oper.TempDir);
        let projectData = App.projectData.getProjectData(id);
        let params = operData["param_"+id]
        if(!params)
            params = operData.param;
        params = this.getParamString(params, projectData, operParams, ip);
        let workspace = this.getParamString(operData.workspace, projectData, operParams, ip);
        if(!workspace)
        {
            workspace = path.parse(operData.jspath).dir;
        }
        this._runInfo[id] = {ip:ip, id, operName:operData.name, oper:oper, projectName:projectData.name};
        let cmd = operData.exe+" "+operData.jspath+" "+params;
        this.handleClientMsg("执行命令： "+workspace+">"+cmd, id)
        
        CMD.run(cmd, this, this.handleCmdCallBack, this.handleCmdError, workspace, "utf-8", id, this.handleClientMsg, this);
    }

    /**发送当前项目的信息 */
    private handleClientMsg(message:string, projectId:string):void
    {
        App.sock.sendAll(OperKey.S2C_Project_Msg, JSON.stringify({id:projectId, msg:message}));
    }

    private handleClientAlert(message:string, projectId:string, ip:string)
    {
        App.sock.sendAll(OperKey.S2C_Alert, JSON.stringify({id:projectId, msg:message}));
        if(ip)
        {
            App.sock.sendByIp(ip, OperKey.S2C_Alert_Ip, message);
        }
    }

    private getParamString(str:string, projectData:IProjectItemData, operParams:any, ip:string)
    {
        let arr;
        let pReg = /(\$+)\{(.*?)\}/gi;
        while(arr = pReg.exec(str))
        {
            let $num = arr[1].length;
            let key:string = arr[2];
            if(projectData[key])
                key = projectData[key];
            else if(operParams && operParams[key])
                key = operParams[key];
            else if(key.trim() == "ip")
                key = ip;
            else if(key.trim() == "uname")
                key = App.appData.getUserName(ip);
            else
                key = " ";
            if(typeof key == "object")
            {
                if($num==1)
                {
                    key = JSON.stringify(key).replace(/"/gi, "\\\"");
                }
            }
            if($num>1)//多个$$的需要把参数放到一个临时文件中
            {
                key = this.createTempFile(key);
            }
            str = str.replace(arr[0], key);
            pReg.lastIndex = 0;
        }
        return str;
    }

    /**
     * 创建临时文件
     * @param fileContent 
     * @param fileName 
     */
    private createTempFile(fileContent:string|Object, fileName?:string):string
    {
        fileName = (fileName || Math.ceil(Math.random()*1000000000))+".cmd.temp";//new Date().format("yyyyMMdd_hhmmss")
        if(typeof fileContent == "object")
        {
            fileContent = JSON.stringify(fileContent);
        }
        let fpath = path.join(Oper.TempDir, fileName);
        FileUtils.checkOrCreateDir(fpath);
        fs.writeFileSync(fpath, fileContent +"", "utf8");
        return fpath;
    }

    private handleCmdCallBack(stdOut:string, projectId:string)
    {
        let str = "执行完毕";
        let runInfo = this._runInfo[projectId];
        let ip;
        if(runInfo)
        {
            ip = runInfo.ip;
            str  = App.appData.getUserName(runInfo.ip) +" 执行"+runInfo.projectName+" 的"+runInfo.operName+"完毕";
        }
        this._runInfo[projectId] = null;
        console.log("["+DateUtil.getDateString()+"]"+str);
        this.handleClientAlert("["+DateUtil.getDateString()+"]"+str, projectId, ip);
        if(runInfo)
        {
            if(runInfo.oper == OperKey.C2S_PublishRelease)//发送完成 获取cnd上svn文件状态
            {
                this.handlGetCdnSvnState(runInfo.id, runInfo.ip);
            }else if(runInfo.oper == OperKey.C2S_CommitCdn)//提交完cdn上的资源， 获取web上svn的状态
            {
                this.handlGetWebSvnState(runInfo.id, runInfo.ip);
            }
        }
        // console.log(stdOut);
    }

    private handlGetCdnSvnState(projectId:string, ip:string)
    {
        let projectData = App.projectData.getProjectData(projectId);
        if(projectData)
        {
            console.log("拉起svn信息");
            SVN.Stat(projectData.pubClient, this, (list:ISvnStateInfo)=>{
                let svnInfos = list.list;
                console.log("发送svn信息");
                App.sock.sendByIp(ip, OperKey.S2C_SendCdnSvnList, svnInfos);
            }, this.handleCmdError);
        }
    }

    
    private handlGetWebSvnState(projectId:string, ip:string)
    {
        let projectData = App.projectData.getProjectData(projectId);//拉起web的信息
        if(projectData)
        {
            console.log("拉起svn信息");
            SVN.Stat(projectData.pubClient+"/web/", this, (list:ISvnStateInfo)=>{
                let svnInfos = list.list;
                console.log("发送svn信息");
                App.sock.sendByIp(ip, OperKey.S2C_SendWebSvnList, svnInfos);
            }, this.handleCmdError);
        }
    }


    private handleCmdError(stdErr:string, projectId:string)
    {
        let str = "执行错误";
        let runInfo = this._runInfo[projectId];
        let ip;
        if(runInfo)
        {
            ip = runInfo.ip;
            str  = runInfo.ip +" 执行"+runInfo.projectName+" 的"+runInfo.operName+"错误"+stdErr;
        }
        this._runInfo[projectId] = null;
        this.handleClientAlert(str, projectId, ip);
        // console.log(stdErr);
    }

}