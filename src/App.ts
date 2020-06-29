import {Socket} from "./utils/socket/Socket"
import { Oper } from "./oper/Oper";
import { AppData } from "./data/AppData";
import { ProjectData } from "./data/ProjectData";

export class App{
    public static data:AppData = new AppData();
    public static projectData:ProjectData = new ProjectData();
    
    public static oper = new Oper();
    public static sock = new Socket(22222, App.oper);
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

