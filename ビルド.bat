@echo off
title SOLID SQUARE CALENDAR ビルド
chcp 65001 > nul
cd /d "%~dp0"

echo ===================================================
echo   SOLID SQUARE CALENDAR - 本番用ビルド実行
echo ===================================================
echo.
echo アプリケーションをビルドしています...
echo.

cmd /c npm run build

pause
