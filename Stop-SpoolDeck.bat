@echo off
echo Stopping SpoolDeck Server gracefully...
curl -k -s -o NUL https://127.0.0.1:8080/__kill
ping 127.0.0.1 -n 3 > nul
powershell -Command "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*with-app-env.mjs*' -or $_.CommandLine -like '*vite*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }"
echo SpoolDeck has been completely stopped!
pause
