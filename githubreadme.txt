git init # 建立git仓库
git add . # 将项目的所有文件添加到仓库中
git commit -m "descriptions" # 将add的文件commit到仓库
git remote add origin https://github.com/liuliyan1994/Visualization.git #将本地的仓库关联到github上
git pull origin master # 上传github之前，要先pull一下
git push -u origin master #上传代码到github远程仓库