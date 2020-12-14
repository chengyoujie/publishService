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

let appJson = fs.readFileSync("./res/app.config.json", "utf-8");
let appObj = JSON.parse(appJson);

function run()
{
    runNodeJs(indexPath);
}

async function runNodeJs(indexPath)
{
    if(scriptObj.toolpath)//先更新本地的tool目录
    {
        await svncmd("svn update "+scriptObj.toolpath);
        await svncmd("svn update "+path.join(__dirname, "./.."));
    }
    if(appObj.webPath)
    {
        copy(path.join(__dirname, "web"), appObj.webPath)
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

/**
 * 拷贝文件
 * @param url 
 * @param toUrl 
 * @param override 
 */
function copy(url, toUrl)
{
    if(!fs.existsSync(url))
    {
        Log.error("拷贝失败：没有找到"+url);
        return;
    }
    checkOrCreateDir(toUrl);
    var stats = fs.statSync(url);
    if (stats.isDirectory()) {
        url = path.normalize(url); 
        walkDir(url, (walkUrl)=>{
            let walkToUrl = walkUrl.replace(url, toUrl);
            fs.copyFileSync(walkUrl, walkToUrl);
        });
    }else{
        fs.copyFileSync(url, toUrl, override);
    }
}

function walkDir(url,onFile,onDir,thisObj) {
    url = path.normalize(url);
    var stats = fs.statSync(url);
    if (stats.isDirectory()) {
        if(onDir) onDir.call(thisObj,url);
        var files = fs.readdirSync(url);
        for (var i = 0, len = files.length; i < len; i++) {
            walkDir(path.join(url,files[i]),onFile,onDir,thisObj);
        }
        return true;
    } else {
        if(onFile) onFile.call(thisObj,url);
        return false;
    }
}
function checkOrCreateDir(filePath)
{
    filePath = path.normalize(filePath);
    let pinfo = path.parse(filePath);
    let arr = pinfo.dir.split(path.sep);
    if(pinfo.base.indexOf(".") == -1)//名字中没有.的按照文件夹处理
    {
        arr.push(pinfo.base);
    }
    if(!arr || arr.length == 0)return;
    let dirpath = arr[0];
    for(let i=1; i<arr.length; i++)
    {
        dirpath = dirpath + path.sep+arr[i];
        if(!fs.existsSync(dirpath))
        {
            fs.mkdirSync(dirpath);
        }
    }
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