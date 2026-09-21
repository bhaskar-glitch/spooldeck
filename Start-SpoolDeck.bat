@echo off
cd /d "%~dp0"
echo Starting SpoolDeck Server... > server.log
call npm run dev >> server.log 2>&1
