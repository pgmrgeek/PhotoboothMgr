Checklist - Software Installation
=================================

BETA release 8.01 (A work in progress) 

Photobooth Manager is a complete photobooth software solution written for the IBM PC, using Adobe Photoshop Javascript, actions and Microsoft Visual Studio Visual Basic .NET 4.5, for XP, Win7 and Win 8.  This program requires Photoshop CS2 but runs for the most part on all subsequent versions.  Further testing/debugging will be done to guarrantee support of subsequent PS versions.  Additional print layout sets are available on Github as well.

Step #1 - Download the software

To install the software, go to the github repository and click "Download ZIP".  The zip is about 125 mb in size, so might take a while downloading. Once done, 
unzip the contents in a temporary folder.  You will see the folder, "PhotoboothMgr-master".  Copy the entire contents, intact, to "c:\Onsite".  It is 
critical to copy everything as-is to maintain the folder structure.

Step #2 - Install Photoshop Actions.

Fire up the version of photoshop you wish to use for onsite printing.  Versions CS2, CS3, CS4, CS5 and CC are supported. (I don't have CS6 to test. :P). Once 
the program is ready, drag and drop the actio set into the program.  The main action set is "c:\OnSite\actions\onsite.printing.atn".  There will be one
additional action set per print layout sets. 

Step #3 - Rewrite the droplets.

Photoshop supports actions written as executable programs.  This software makes use of two droplets, one to process all files, one to reset photoshop to a 
clean state.  In Photoshop, Once you have loaded the "Onsite.Printing.atn" action set, open the actions palette.  You should see the action set 
"Onsite.Printing". Locate the action named "Automatic Mode for Droplet".  Click once on this to highlight the action, then execute 
"File->Automate->Create Droplet".  A dialog box will open.  Click the "Choose" button and navigate to "c:\Onsite\software\psload.exe". Click okay,
then again to overwrite the existing file.  Now, in the action palette, click once on "Close all for psclose.exe droplet" then execute "File->Automate->Create Droplet" again.  This time, click "Choose" and navigate to "c:\Onsite\software\psclose.exe".  Click okay, then again to overwrite the existing file.

Step #4 - Start the system.

Doubleclick on My Computer and navigate to c:\Onsite\software".  There is a shortcut in the software folder you can drag/drop to your desktop for future
use. Now, double click on the "Launch.bat" file.  This will create missing folders and fire up the core program, "Pic2Print".  

At this point, I'm going to direct you to the "c:\Onsite\Readme.md" file for more setup instructions.

