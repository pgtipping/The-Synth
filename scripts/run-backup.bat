@echo off
cd /d %~dp0\..
set /p DB_USER=<scripts\.env.backup
set /p DB_PASSWORD=<scripts\.env.backup
bash scripts/backup-db.sh 