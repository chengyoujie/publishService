    import * as fs from "fs"
    import * as path from "path"
    /**
     * 当个项目的配置字段
     */
    export interface IAppOperData{
        name:string;
        exe:string;
        jspath:string;
        param:string;
        workspace:string;
    }
    /**
     * 应用配置数据
     */
    export interface IAppData{
        toolpath:string, 
        oper:{[id:number]:IAppOperData}
    }
    /**
     * 操作key的常量
     */
    export const enum OperKey{
        /**发送日志 */
        S2C_Msg = "S2C_Msg",
        /**发送日志 */
        S2C_Alert = "S2C_Alert",
        /**发送所有项目的基础信息 */
        S2C_ProjectList = "S2C_ProjectList",
        /**发布内网 */
        C2S_PublishInner = "C2S_PublishInner",
        /**发布资源 */
        C2S_PublishRes = "C2S_PublishRes",
        /**发布外网 仅发布不提交 */
        C2S_PublishRelease = "C2S_PublishRelease",
        /**发送给客户端cdn需要提交的内容 */
        S2C_SendCdnSvnList = "S2C_SendCdnSvnList",
        /**提交cdn上的资源 */
        C2S_CommitCdn = "C2S_CommitCdn",
        /**发送给客户端 web下需要提交的东西 */
        S2C_SendWebSvnList = "S2C_SendWebSvnList",
        /**提交web上的资源 */
        C2S_CommitWeb = "C2S_CommitWeb",
        /**获取cdn目录中文件的svn状态 */
        C2S_GetCdnStat = "C2S_GetCdnStat",
        /**获取web目录中文件的svn状态 */
        C2S_GetWebStat = "C2S_GetWebStat",
        /**重启服务器 */
        C2S_ReStart = "C2S_ReStart",
        /**翻译 */
        C2S_Translate = "C2S_Translate"

    }
    
// export const enum SendType{
//     Msg = "msg",
//     Alert = "alert",
//     ProjectList = "projectList",
//     svnStateList = "svnStateList"
// }
    
    export class AppData{
    
        private _data:IAppData;
        
        constructor()
        {
            this.init();
        }

        private init()
        {
            let jsonPath = path.join(__dirname, "../../res/script.config.json");
            console.log(jsonPath);
            let pjson = fs.readFileSync(jsonPath, "utf-8");
            this._data = JSON.parse(pjson);
            for(let key in this._data.oper)
            {
                let operData = this._data.oper[key];
                if(!operData)continue;
                operData.jspath = this.parseVarStr(operData.jspath);
            }
        }

        private parseVarStr(str:string)
        {
            let pReg = /\$\{(.*?)\}/gi;
            let arr ;
            while(arr = pReg.exec(str))
            {
                let key = arr[1];
                if(this._data[key])
                {
                    key = this._data[key];
                }else{
                    key = "";
                }
                str = str.replace(arr[0], key);
                pReg.lastIndex = 0;
            }
            return str;
        }
    
        public getOperData(operId:string):IAppOperData
        {
            return this._data.oper[operId]
        }
    }