import  * as ws from "nodejs-websocket";
import { SocketConnection } from "./SocketConnection";
import { Observer, IEventData } from "../../event/Observer";
import { EventType } from "../../event/EventType";
import { App } from "../../App";
import { OperKey } from "../../data/ScriptData";

export interface IRecvSocket{
    onRecv(ip:string, data:any)
}



/**简单的socket */
export class Socket extends Observer{
    //服务器
    private _service:any;

    private _conClients:SocketConnection[] = [];

    private _recv:IRecvSocket;

    constructor(prot:number, recv?:IRecvSocket)
    {
        super();
        let s = this;
        s._recv = recv;
        s._service = ws.createServer(s.clientConnection.bind(s));
        s._service.listen(prot,undefined, s.handleSocketStart.bind(s));
        s._service.addListener("error", function (e:any) {
            console.log("socket服务器启动失败");
            console.log(e.message)
        });
    }

    private clientConnection(con)
    {
        let s= this;
        let client = new SocketConnection(con);
        s._conClients.push(client);
        client.send(OperKey.S2C_ProjectList, App.projectData.allProjectInfo);
        client.on(EventType.SOCKET_CLIENT_REMOVE, s.handleSocketRemove, s, client)
        client.on(EventType.SOCKET_RECV_MSG, s.handleSocketRecvMsg, s, client)
        console.log("当前链接客户端数目："+s._conClients.length);
    }

    private handleSocketRemove(e:IEventData)
    {
        let s= this;
        let client:SocketConnection = e.target;
        let index = s._conClients.indexOf(client);
        if(index != -1)
        {
            s._conClients.splice(index, 1);
        }
        console.log("当前链接客户端数目："+s._conClients.length);
    }

    private handleSocketRecvMsg(e:IEventData)
    {
        let s= this;
        let client:SocketConnection = e.target;
        if(s._recv)
        {
            s._recv.onRecv(client.ip, e.data);
        }
    }
    
    private handleSocketStart()
    {
        let s = this;
        console.log("socket服务器启动成功");
        s.post(EventType.SOCKET_CREATE)
    }


    public get size()
    {
        let s= this;
        return s._conClients.length;
    }
    

    public sendAll(sendType:OperKey, msg:any)
    {
        let s = this;
        for(let i=0; i<s._conClients.length; i++)
        {
            s._conClients[i].send(sendType, msg);
        }
    }

    public sendByIp(ip:string,sendType:OperKey, msg:any)
    {
        let s = this;
        for(let i=0; i<s._conClients.length; i++)
        {
            if(s._conClients[i].ip == ip)
                s._conClients[i].send(sendType, msg);
        }
    }

}