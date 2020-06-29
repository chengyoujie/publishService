
import * as path from "path"
import { CMD, CmdCallBack } from "./CMD";

export const enum SVN_FILE_STATE{
    /**新增项 */
    ADD = "add",
    /**已新增，还未提交 */
    PREADD = "preadd",
    /**删除 */
    REMOVE= "remove",
    /**修改 */
    MODIFY = "modify",
    /**冲突 */
    COFILT = "coflit",
}

/**svn状态信息 */
export interface ISvnState{
    state:SVN_FILE_STATE,
    path:string;
}

/**svn的状态信息列表 */
export interface ISvnStateInfo{
    list:ISvnState[];
    dic:{[state:number]:ISvnState[]};
}

export type SvnStateCallBack = (list:ISvnStateInfo)=>void;

export class SVN{

    private static Encoding = 'cp936';
    private static  _svnPath = path.join(__dirname, "./../../../bin/svn");
    
    constructor()
    {
        console.log("  svn path: "+SVN._svnPath);
    }

    public static async Update(workspace:string, thisObj?:any, onSuccess?:SvnStateCallBack, onError?:CmdCallBack)
    {
        await CMD.run("svn update "+workspace, thisObj, SVN.onSvnStatSuccess(thisObj, onSuccess), onError, SVN._svnPath, SVN.Encoding);
    }

    /**
     * 获取svn的状态
     * @param workspace 
     * @param thisObj 
     * @param onSuccess 
     * @param onError 
     */
    public static async Stat(workspace:string, thisObj?:any, onSuccess?:SvnStateCallBack, onError?:CmdCallBack)
    {
        await CMD.run("svn stat "+workspace, thisObj, SVN.onSvnStatSuccess(thisObj, onSuccess), onError, SVN._svnPath, SVN.Encoding);
    }

    public static async Delete(deleteFiles:string[], thisObj?:any, onSuccess?:SvnStateCallBack, onError?:CmdCallBack){
        await CMD.run("svn delete "+deleteFiles.join(" "), thisObj, SVN.onSvnStatSuccess(thisObj, onSuccess), onError, SVN._svnPath, SVN.Encoding);
    }

    public static async Commit(comminFiles:string[], msg:string, thisObj?:any, onSuccess?:SvnStateCallBack, onError?:CmdCallBack){
        await CMD.run("svn commit "+comminFiles.join(" ")+" -m "+msg, thisObj, SVN.onSvnStatSuccess(thisObj, onSuccess), onError, SVN._svnPath, SVN.Encoding);
    }

    public static async CommitAll(workspace:string, msg:string, thisObj?:any, onSuccess?:SvnStateCallBack, onError?:CmdCallBack){
        await SVN.Stat(workspace, thisObj, SVN.handleWaitCommitAll, onError);
        
    }

    private static async handleWaitCommitAll(info:ISvnStateInfo){
        let list = info.list;
        let paths:string[] = [];
        for(let i=0; i<list.length; i++)
        {
            paths.push(list[i].path);
        }
        // await SVN.Commit(paths, msg, )
    }


    private static onSvnStatSuccess(thisObj:any, onSuccess:SvnStateCallBack):CmdCallBack{
        return function(stdout:string){
            let list = SVN.checkSvnFileState(stdout);
            onSuccess.call(thisObj, list);
            return list;
        }
    }


    private static checkSvnFileState(stdout:string):ISvnStateInfo
    {
        let list:ISvnState[] = [];
        let dic:{[state:number]:ISvnState[]} = {};
        let changeReg = /([\S])\s+(.*?)\s*[\r\n]/g;
        let allFilesDic = {};
        let tempArr;
        while(tempArr = changeReg.exec(stdout))
        {
            let finfo = path.parse(tempArr[2]);
            let fname = finfo.name + finfo.ext;
            allFilesDic[tempArr[2]] = {key:tempArr[1].trim(), path:tempArr[2]}
        }
        for(let key in allFilesDic)
        {
            let info = allFilesDic[key];
            let state:SVN_FILE_STATE;
            if(info.key == "?")
                state = SVN_FILE_STATE.ADD;
            else if(info.key == "A")
                state = SVN_FILE_STATE.PREADD;
            else if(info.key == "M" )//|| info.key == "A"
                state = SVN_FILE_STATE.MODIFY;
            else if(info.key == "!" || info.key == "D")    
                state = SVN_FILE_STATE.REMOVE;
            else if(info.key == "C")
                state = SVN_FILE_STATE.COFILT;
            else
                console.log("没有找到对应的处理方法： "+info.key + "  "+info.path);
            if(!dic[state])dic[state] = [];
            let svnInfo:ISvnState = {state, path:info.path.replace(/\\/gi, "/")}; 
            dic[state].push(svnInfo)
            list.push(svnInfo);
        }
        return {list, dic};
    }
}