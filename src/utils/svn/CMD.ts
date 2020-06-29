
import * as process from "child_process"
import * as iconv from "iconv-lite"

export type CmdCallBack = (str:string)=>void;

export class  CMD{
    
    /**
     * 执行CMD命令行
     * @param cmd           命令行
     * @param onSuccess     成功时处理
     * @param onError       错误时处理
     * @param workspace  工作空间
     */
    public static async run(cmd:string, thisObj?:any, onSuccess?:CmdCallBack, onError?:CmdCallBack, workspace:string=undefined, charset:string="utf8")
    {
        // let p = process.exec(cmd, {cwd:workspace}, function(err:process.ExecException, stdout:string, stderr:string){
        let needConverEncode = charset!='utf8' && charset!='utf-8';
        let p = process.exec(cmd, {encoding:needConverEncode?"binary":"utf8", cwd:workspace}, function(err:process.ExecException, stdout:any, stderr:any){
            if(needConverEncode)
            {
                stdout = iconv.decode(new Buffer(stdout, "binary"), charset);
                stderr = iconv.decode(new Buffer(stderr, "binary"), charset);
            }
            if(err)
            {
                if(onError)
                {
                    return onError.call(thisObj, err.message);
                }
            }else if(stderr){
                if(onError)
                {
                    return onError.call(thisObj, stderr);
                }
            }else{
                if(onSuccess)
                {
                    // let binaryEncoding = "binary";
                    // console.log(iconv.decode(new Buffer(stdout, "binary"), encoding), iconv.decode(new Buffer(stderr, "binary"), encoding));
                    // stdout = iconv.decode(new Buffer(stdout, "binary"), encoding);
                    // iconv.decode(new Buffer(stdout, 'binary')
                    // var arr=[];
                    // stdout.each(2,function(data){
                    //     arr.push(parseInt(data,16));
                    // });
                    // console.log(iconv.decode(new Buffer(arr), 'GBK'))
                    return onSuccess.call(thisObj, stdout);
                }
            }
        })
        p.stdout.on('data', function(data) {
            if(needConverEncode)
                data = iconv.decode(new Buffer(data, "binary"), charset);
            console.log(data);
        });
        p.stderr.on('data', function(data) {
            if(needConverEncode)
                data = iconv.decode(new Buffer(data, "binary"), charset);
            console.log("<font color='#ff0000'> ERROR:"+data+"</font>");
        });
    }

}