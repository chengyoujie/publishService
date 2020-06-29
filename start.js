/**
 * 重启脚本
 * 方便其他人直接修改代码后直接重启更新， 不需要在服务器上处理
 */

let child_process = require("child_process")
let fs = require("fs")

let path = require("path")
let indexPath = "./dist/index.js"
let scriptJson = fs.readFileSync("./res/script.config.json", "utf-8");
let scriptObj = JSON.parse(scriptJson);

function run()
{
    runNodeJs(indexPath);
}

async function runNodeJs(indexPath)
{
    if(scriptObj.toolpath)//先更新本地的tool目录
    {
        await svncmd("svn update "+scriptObj.toolpath);
        await svncmd("svn update "+path.join(__dirname));
    }
    let childProcess  = child_process.fork(indexPath);
    childProcess.on('exit',function (code) {
        console.log('process exits + '+code);
        if(code == 0){
            runNodeJs(indexPath);
            console.log("重新启动中")
        }else{
            console.log('Restart failed');
        } 
    });
}

function svncmd(cmd)
{
	return new Promise((resolve, reject)=>{
		child_process.exec(cmd,/* {cwd:SVNPATH},**/ (err, stdout, stderr)=>{
			let errstr = err || stderr;
			if(errstr)
			{
				console.log("<font color='#ff0000'>执行失败："+cmd+"</font>");
				console.log("<font color='#ff0000'>"+errstr+"</font>");
				reject(errstr)
			}else{
				console.log("执行成功"+cmd);
				resolve(stdout);
			}	
		})
	})
}
//执行程序
run();