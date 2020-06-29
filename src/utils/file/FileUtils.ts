import * as fs from "fs"
import * as path from "path"

export class FileUtils{

    /**
     * 删除文件或文件将爱
     * @param url 
     */
    public static removeDirSync(url:string) {
        var files = [];
        if (fs.existsSync(url)) {
            files = fs.readdirSync(url);
            files.forEach(function(file, index) {
                var subUrl = path.join(url, file);
                if (fs.statSync(subUrl).isDirectory()) { // recurse
                    FileUtils.removeDirSync(subUrl);
                } else { // delete file
                    fs.unlinkSync(subUrl);
                }
            });
            fs.rmdirSync(url);
        }
    }
    
    /**
     * 遍历文件或文件夹
     * @param url 
     * @param onFile 
     * @param onDir 
     * @param thisObj 
     */
    public static walkDir(url:string,onFile:(url:string)=>void,onDir:(url:string)=>void,thisObj:any) {
        url = path.normalize(url);
        var stats = fs.statSync(url);
        if (stats.isDirectory()) {
            if(onDir) onDir.call(thisObj,url);
            var files = fs.readdirSync(url);
            for (var i = 0, len = files.length; i < len; i++) {
                FileUtils.walkDir(path.join(url,files[i]),onFile,onDir,thisObj);
            }
            return true;
        } else {
            if(onFile) onFile.call(thisObj,url);
            return false;
        }
    }

    /**创建新的文件夹 */
    public static checkOrCreateDir(filePath:string)
    {
        filePath = path.normalize(filePath);
        let arr = path.parse(filePath).dir.split(path.sep);
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





}