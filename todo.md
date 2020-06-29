1. 正式版发布 只有链接本地才显示， 不显示version的提交
2. 正式版发布 增加version下载功能， 
更新前先清除
svn revert D:/workspace/trunk/tool/小脚本/ -R
svn cleanup D:/workspace/trunk/tool/小脚本/ --remove-unversioned
//3. 断线后重连
//4. start.js 重启脚本需要先更新tools目录