import {Socket} from "./utils/socket/Socket"
import { App } from "./App";
import { OperKey } from "./data/AppData";


//代理console.log
let standLog = console.log;
console.log = function(message?: any, ...optionalParams: any[])
{
    standLog(message, ...optionalParams);
    // let msg = JSON.stringify({type:"msg", data:message})
    App.sock.sendAll(OperKey.S2C_Msg, message);
}
//代理console.warn
let standWarn = console.warn;//客户端弹出alert提示框
console.warn = function(message?: any, ...optionalParams: any[])
{
    standWarn(message, ...optionalParams)
    App.sock.sendAll(OperKey.S2C_Alert, message);
}



