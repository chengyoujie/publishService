import { Observer } from "../../event/Observer";
import { EventType } from "../../event/EventType";
import { OperKey } from "../../data/AppData";

export class SocketConnection extends Observer{
    private _con:any;
    private _ip:string;

    constructor(con:any)
    {
        super();
        let s = this;
        let ipReg = /\d+\.\d+\.\d+\.\d+/gi;
        s._con = con;
        let ip = con.socket.remoteAddress;
        let ipArr = ipReg.exec(ip);
        if(ipArr)ip = ipArr[0]
        s._ip = ip;
        // let conins = con;
        console.log("客户端链接成功: "+ip);
        con.on("text", s.handleSocketData.bind(s))
        con.on("close", s.handleClose.bind(s))
        con.on("error", s.handleError.bind(s));
    }

    /**获取到数据 */
    private handleSocketData(str:string){
        let s = this;
        let data;
        console.log("接受操作指令： "+str);
        try{
            data = JSON.parse(str);
            s.post(EventType.SOCKET_RECV_MSG, data);
        }catch(e){
            console.log("json解析错误： "+str);
        }
    }

    public get ip()
    {
        return this._ip;
    }
    

    private handleClose(code:any, reason:any){
        console.log(this._ip+"关闭链接  code:", +code)
        let s = this;
        s.post(EventType.SOCKET_CLIENT_REMOVE);
    }

    private handleError(err:any)
    {
        let s = this;
        s.post(EventType.SOCKET_CLIENT_REMOVE);
        if(err.code == "ECONNRESET")
        {
            console.log("客户端主动断开");
        }else{
            console.log("error ", err.message)
        }
    }

    public send(sendType:OperKey, msg:any)
    {
        let s= this;
        if(s._con )
        {
            let str = JSON.stringify({type:sendType, data:JSON.stringify(msg)});
            s._con.sendText(str);
        }
    }

}