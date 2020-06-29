export interface IObserverListener{
    fun:Function;
    thisObj:any;
    params?:any[];
    once:boolean;
}

export interface IEventData{
    target:any;
    data:any;
    params?:any[];
}

export class Observer{
    private _eventList:{[eventName:string]:IObserverListener[]} = {};

    private doListener(eventName:string|number, handleFun:Function, thisObj:any, params?:any[], once:boolean=false)
    {
        let s = this;
        if(!s._eventList[eventName])
        {
            s._eventList[eventName] = [];
        }
        let list = s._eventList[eventName];
        let isFind = false;
        for(let i=0; i<list.length; i++)
        {
            if(list[i].fun == handleFun && list[i].thisObj == thisObj)
            {
                list[i].params = params;
                isFind = true;
                break;
            }
        }
        if(!isFind)
        {
            list.push({fun:handleFun, thisObj:thisObj, params:params, once:once});
        }
    }

    once(eventName:string|number, handleFun:Function, thisObj:any, ...params:any)
    {
        let s = this;
        s.doListener(eventName, handleFun, thisObj, params, true);
    }
    on(eventName:string|number, handleFun:Function, thisObj:any, ...params:any)
    {
        let s = this;
        s.doListener(eventName, handleFun, thisObj, params, false);
    }


    post(eventName:string|number, data?:any)
    {
        let s = this;
        if(!s._eventList[eventName])return;
        let list = s._eventList[eventName];
        
        for(let i=0; i<list.length; i++)
        {
            let event:IEventData = {target:s, data:data, params:list[i].params};
            list[i].fun.call(list[i].thisObj, event);
            if(list[i].once)
            {
                list.splice(i, 1);
                i--;
            }
        }
    }


    off(eventName:string|number, handleFun:Function, thisObj:any)
    {
        let s = this;
        if(!s._eventList[eventName])return;
        let list = s._eventList[eventName];
        let isFind = false;
        for(let i=0; i<list.length; i++)
        {
            if(list[i].fun == handleFun && list[i].thisObj == thisObj)
            {
                list.splice(i, 1);
                return true;
            }
        }
        return false;
    }
}