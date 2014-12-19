    if (%debug%)==()  @echo off



rem validate the environment


    c:

    cd c:\onsite


    if not exist capture mkdir capture

    if not exist cloud mkdir cloud

    if not exist orig mkdir orig

    if not exist printed mkdir printed



rem start the programs


    if exist software\pic2print.exe cmd /c start software\pic2print.exe /d
 
   if exist software\justload.exe  cmd /c start software\justload c:\onsite\software\pssetup.jpg

