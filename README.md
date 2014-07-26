PhotoboothMgr
=============

BETA release 7.02 (A work in progress)

Photobooth management software is written for the IBM PC, using Adobe Photoshop Javascript, actions and Microsoft Visual Studio Express 2010, VB.NET 4.5 for XP, Win7 and Win 8.  This program requires Photoshop CS2 but runs for the most part on all subsequent versions.  Further testing/debugging will be done to guarrantee support of subsequent PS versions.

Core to this repository, is "Pic2Print.exe", a VB.NET program, that provides a user interface to the incoming stream
of images.  It also runs in a kiosk mode, printing all incoming images.  Animated gifs are supported and images can be emailed, sent as MMS messages, and copied to another folder for dropbox or slideshows.  All this functionality works as of today (first release) with further enhancements forth coming.  The actual source code to Pic2Print will be located in its own repository, not in this package.  

The PhotoboothMgr repository is the complete solution for managing incoming images from photographers, and in turn, processes the images for print/email/mms and cloud.  Depending on the folder which incoming images are stored, the images are processed either in kiosk mode or by a technician.  See the list of folder below for more information. The technician is given a "Refresh" button that turns green when new images arrive for his/her review.  The images are presented to the Technician who can select (click on) the image, a background (for greenscreen), then click a number between 1-10, for 1 to 10 prints.  If multiple images are needed (for photostrips or .GIFs), the technican clicks the first image, then "L" button to load. Repeat until the GIF/Number buttons are enabled, then select the last image, then click "GIF" or a numbered print button.

In Kiosk mode, the incoming images are processed according to selections made in the configuration panel.  That means the technician can specify foreground overlay, greenscreen, layout selection, and the kiosk mode will abide by these settings.  For example, selecting a three image photo strip layout with greenscreen and overlay, will be processed in Kiosk mode once three images land in the folder.

Six sets of predefined print layouts are supported in this base release, with further add-on packs to be added in the near future.  The default set can generate animated gifs, but the first add-on pack will show spectacular 3 layer animations.

To install this package, pull from github, maintaining the folder structure.  The parent folder is called "OnSite" and must be located in the root of Drive C.  Sorry, but its hardcoded for now.  Here is the folder structure required -

c:\OnSite                - Parent folder and Kiosk folder. Any jpg landing here gets processed.<br>
c:\OnSite\actions        - holds Photoshop's action sets and javascript.<br>
c:\OnSite\backgrounds    - holds the print layouts in subfolders, spec'd by the .CSV files.<br>
c:\OnSite\capture        - incoming .jpgs can land here, to be managed by the human operator/technician.<br>
c:\OnSite\cloud          - suggested output folder for the cloud/slideshow.  Not really necessary.<br>
c:\OnSite\orig           - after images are processed, the original files are moved here.<br>
c:\OnSite\printed        - the processed files are written here - .GIF, .PSD with layers, and a flattened .JPG.<br>
c:\OnSite\software       - windows runtime code and support files.<br>

Second step, fire up photoshop and load the action set called "Onsite.Printing" located in the actions folder. If you
use Photoshop CS3 or later, and encounter problems, you might have to rewrite the "psload.exe" droplet in the software folder. Select "Automatic Mode for Droplet" in the "Onsite.Printing" action set, then "file->Automate->Create Droplet",
overwriting psload.exe

Third step, Launch Pic2Print using the "launch.bat" found in the software folder, for debugging purposes.  The batch file  creates any missing folders, and passes command line switches to Pic2Print enabling some extra buttons, specifically, the Debug button, for a verbose listing of internal operations and to verify emails being sent.

When Pic2Print fires up, it opens the main form and a Configuration form.  Select your printer paper size, and then
the layout you wish to use.  I suggest just using the first layout till more documentation is provided. Try it out
to this point; more documenation coming..  You can check/uncheck foreground, greenscreen, multiple backgrounds, etc. Also, email setup works fine.  MMS text messages go out as email to the various phone carriers.  

The technician is given a "Refresh" button that turns green when new images arrive for his/her review.  The images are presented to the Technician who can select (click on) the image, a background (for greenscreen), then click a number between 1-10, for 1 to 10 prints.  If multiple images are needed (for photostrips or .GIFs), the technican clicks the first image, then "L" button to load. Repeat until the GIF/Number buttons are enabled, then select the last image, then click "GIF" or a numbered print button.

Doug Cody
Bay Area Event Photography
www.bayareaeventphotography.com

References - 

The mail program is a github project - https://github.com/muquit/mailsend.  Please send kudos and cash..




