$curPath = Get-Location
Start-Process "C:\Program Files (x86)\IIS Express\iisexpress.exe" -ArgumentList "/path:""$curPath""  /port:8890"
Start-Sleep 2
Start-Process -FilePath http://localhost:8890/index.html
