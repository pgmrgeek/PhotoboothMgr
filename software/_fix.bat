   @echo off 
rem
rem process the incoming file to fix CR/LFs
rem
    if not exist %1 goto skip1

    more <%1 >c:\onsite\software\x
    copy c:\onsite\software\x %1
    del c:\onsite\software\x

:skip1
