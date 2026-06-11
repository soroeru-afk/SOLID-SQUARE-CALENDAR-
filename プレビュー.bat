@echo off
title SOLID SQUARE CALENDAR プレビュー
chcp 65001 > nul
cd /d "%~dp0"

echo ===================================================
echo   SOLID SQUARE CALENDAR - ビルドプレビュー起動
echo ===================================================
echo.
echo ビルドされたアセットをプレビュー起動しています...
echo.

cmd /c npm run preview

pause
