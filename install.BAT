@echo off
echo close the prompt after everything get executed
start cmd.exe /k "npm install"
timeout 10
  attrib +h /s /d
  attrib -h barcode.svg
  attrib -h whatsapp.BAT
  pause
