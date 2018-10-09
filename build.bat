del /S /Q dist
rmdir /S /Q dist
cmd /C min build
copy /Y src\images dist\images