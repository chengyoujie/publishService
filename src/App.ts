import {Socket} from "./utils/socket/Socket"
import { Oper } from "./oper/Oper";
import { ScriptData } from "./data/ScriptData";
import { ProjectData } from "./data/ProjectData";
import { AppData } from "./data/AppData";
import { HttpService } from "./utils/http/HttpService";

export class App{
    public static appData:AppData = new AppData();
    public static scriptData:ScriptData = new ScriptData();
    public static projectData:ProjectData = new ProjectData();
    
    
    public static oper = new Oper();
    public static sock = new Socket(App.appData.sockPort, App.oper);
    public static http = new HttpService(App.appData.httpPort);
}

// export class App2 extends App{
//     public test(){

//     }
// }
// Pick
// let _pool:any = {};
// export function getview<T extends keyof App>(name:T):InstanceType<App[T]>
// {
//     return _pool[name];
// }
// export function setview(cls:any){
//     const name = cls.name;
//     _pool[name] = new cls();
// }

