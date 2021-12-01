set cur_dir=%~dp0
set cur_dir=%cur_dir:~0,-1%
start "" "C:\Program Files (x86)\IIS Express\iisexpress.exe" /path:"%cur_dir%" /port:8890
choice /t 1 /n /d y>nul
start "" explorer.exe http://localhost:8890/index.html