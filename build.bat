tskill wechatdevtools
cmd /C min build
copy /Y src\images dist\images
cmd /C "C:\Program Files (x86)\Tencent\微信web开发者工具\cli.bat" -o %~dp0