Photobooth Manager
==================

BETA release 7.02 (A work in progress)

Photobooth Manager is a complete photobooth software solution written for the IBM PC, using Adobe Photoshop Javascript, actions and Microsoft Visual Studio Visual Basic .NET 4.5, for XP, Win7 and Win 8.  This program requires Photoshop CS2 but runs for the most part on all subsequent versions.  Further testing/debugging will be done to guarrantee support of subsequent PS versions.  See below for updates on this issue.

Core to this repository, is "Pic2Print.exe", a VB.NET program that provides a user interface to an incoming stream of images.  Animated gifs are supported and images can be emailed, sent as MMS messages, and copied to another folder for dropbox or slideshows.  All this functionality works as of today (first release) with further enhancements forth coming.  The actual source code to Pic2Print will be located in its own repository, not in this package. 
 
Looking closer at Pic2Print, it operates on a set of folders for the entire workflow. See the list of folder below for more information. The main operations are Managed mode and Kiosk mode.

In Managed Mode, the technician has a control panel and is given a "Refresh" button that turns green when new  images arrive. Clicking "Refresh", the images are presented so the technician can select (i.e., click on) an image, an optional background (for greenscreen), then click a number between 1-10, for 1 to 10 prints.  If multiple images are needed (for photostrips or .GIFs), the technican clicks the first image, then the "L" button to load; repeating until the GIF/Number buttons are enabled. Once the buttons are enabled, the technician selects the last image, then clicks "GIF" or a numbered print button.

In Kiosk mode, the incoming images are processed according to selections made in the configuration panel.  That means the technician can specify foreground overlay, greenscreen, layout selection, # of prints per image, etc, and the kiosk mode will abide by these settings.  For example, selecting a three image photo strip layout with greenscreen and overlay, will be processed in Kiosk mode once three images land in the folder.

Additionally, six sets of predefined print layouts are supported in this base release, with further add-on packs to be added in the near future.  The default set can generate animated gifs, but the first add-on pack will show spectacular 3 layer animations.

To install this package -

Make sure you have Microsoft .NET framework 4.5 installed on your machine.  See the link below to download it.

Next, pull the PhotoboothMGR repository from github.  Once you pull it, copy/move the contents to a new folder. This folder must be named "OnSite" and must be located in the root of Drive C.  Sorry, but its hardcoded for now.  Here is a list of the required folders -

c:\OnSite                - Parent folder and Kiosk folder. Any jpg landing here gets processed.<br>
c:\OnSite\actions        - holds Photoshop's action sets and javascript.<br>
c:\OnSite\backgrounds    - holds the print layouts in subfolders, spec'd by the .CSV files.<br>
c:\OnSite\capture        - incoming .jpgs can land here, to be managed by the human operator/technician.<br>
c:\OnSite\cloud          - suggested output folder for the cloud/slideshow.  Not really necessary.<br>
c:\OnSite\orig           - after images are processed, the original files are moved here.<br>
c:\OnSite\printed        - the processed files are written here - .GIF, .PSD with layers, and a flattened .JPG.<br>
c:\OnSite\software       - windows runtime code and support files.<br>

Second step, Launch Pic2Print using the "launch.bat" found in the software folder, and for debugging purposes.  The batch file  creates any missing folders, and passes command line switches to Pic2Print, enabling some extra buttons, specifically, the Debug button, for a verbose listing of internal operations and to verify emails being sent. Also, Photoshop is launched with a sample JPG with printer setup instructions.

Photoshop should have fireup via the "Launch.bat". if not, fire up photoshop manually. Load the following action set: c:\OnSite\actions\onsite.printing.atn.  If you use Photoshop CS3 or later  and you encounter problems, you might have to rewrite the "psload.exe" droplet in the software folder. Select the first action named "Automatic Mode for Droplet" in the "Onsite.Printing" action set, then run "file->Automate->Create Droplet", overwriting psload.exe in the "c:\OnSite\software" folder.

When Pic2Print fires up, it opens the main control panel and a Configuration form. In the Configuration form, select your printer paper size, and the layout you wish to use.  Check the "File Output Only" box so you can process images without creating prints. I suggest selecting each layout, and generating test images to get to know the various layouts.  You can check/uncheck foreground, greenscreen, multiple backgrounds, to see the effects on the images and operations. Also, email setup works fine.  MMS text messages go out as email to the various phone carriers.  Check out the "c:\OnSite\printed" folder to see the final outputs.  

This system works by printing to the default printer, so make sure your photo printer is setup as the Windows default printer. Validate this setting via the Windows Control Panel applet. If you change default printers, you will have to restart photoshop. Once you've confirmed the default printer, load an image. This allows you to execute Photoshop's "File->Page Setup" for the proper print size and orientation.  The Launch batch file will pre-load an image into photoshop with some helps on the Sony and DNP printers.  You can rewrite this file with your own reminders. Once done, you're ready to print; uncheck the "File Output Only" checkbox and print away.  If prints do not come out, I recommend taking baby steps.  Load an image in photoshop and work out any problems printing it. Once that connection is established, use Pic2Print to print one image. 

All systems Go!  Please use GitHub Issues list on this repository to address problems and bugs. 

Doug Cody <br>
Bay Area Event Photography <br>
www.bayareaeventphotography.com <br>

Photoshop Version support -

07/28/14 Update - CS3, CS4, CS5 and CC have been tested. GIFs work, but printing is problematic. Use CS2!!!  CS3 and upwards hardcode printer configurations in the actions and will cause you nightmares because the action will have to be re-recorded everytime you setup and operate on a job. Hopefully, there will be a workaround. I might just add some VB code to do the actual printer output to avoid PS altogether..
 
References - 

The mail program is a github project - https://github.com/muquit/mailsend.  Please send kudos and cash..

Microsoft .NET framework 4.5 download page - http://www.microsoft.com/en-us/download/details.aspx?id=30653 

Inspiration -

My daughter, Michelle Palmer, who needed this program to get started in the business.



