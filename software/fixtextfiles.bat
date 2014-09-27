rem   if (%debug%)==() @echo off 
rem
rem fix installation issues
rem
    call _fix c:\onsite\backgrounds\bkfglayouts.000.csv
    call _fix c:\onsite\backgrounds\bkfglayouts.100.csv
    call _fix c:\onsite\backgrounds\README.folder-structure.txt
    call _fix c:\onsite\backgrounds\REAME.bkfg-csv-format.txt

    call _fix c:\onsite\actions\automaticmode.js
    call _fix c:\onsite\actions\closeall.js

    call _fix c:\onsite\software\carriers.csv
    call _fix c:\onsite\software\printers.csv
    call _fix c:\onsite\software\README.Email-Setup.txt
    call _fix c:\onsite\software\launch.bat


