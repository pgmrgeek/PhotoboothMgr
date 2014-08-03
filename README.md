Photobooth Manager - [![PayPayl donate button](http://img.shields.io/paypal/donate.png?color=yellow)](https://www.paypal.com/js/external/paypal-button.min.js?merchant=clikphoto@yahoo.com "Donate to this project using Paypal")
===========================================

BETA release 7.03 (A work in progress)

Photobooth Manager is a complete photobooth software solution written for the IBM PC, using Adobe Photoshop Javascript, actions and Microsoft Visual Studio Visual Basic .NET 4.5, for XP, Win7 and Win 8.  This program requires Photoshop CS2 but runs for the most part on all subsequent versions.  Further testing/debugging will be done to guarrantee support of subsequent PS versions.  See below for updates on this issue.

Core to this repository, is "Pic2Print.exe", a VB.NET program that provides a user interface to an incoming stream of images.  Animated gifs are supported and images can be emailed, sent as MMS messages, and copied to another folder for dropbox or slideshows.  All this functionality works as of today (first release) with further enhancements forth coming.  The actual source code to Pic2Print will be located in its own repository, not in this package. 
 
Looking closer at Pic2Print, it operates on a set of folders for the entire workflow. See the list of folder below for more information. The main operations are Managed mode and Kiosk mode.

In Managed Mode, the technician has a control panel and is given a "Refresh" button that turns green when new  images arrive. Clicking "Refresh", the images are presented so the technician can select (i.e., click on) an image, an optional background (for greenscreen), then click a number between 1-10, for 1 to 10 prints.  If multiple images are needed (for photostrips or .GIFs), the technican clicks the first image, then the "L" button to load; repeating until the GIF/Number buttons are enabled. Once the buttons are enabled, the technician selects the last image, then clicks "GIF" or a numbered print button.

In Kiosk mode, the incoming images are processed according to selections made in the configuration panel.  That means the technician can specify foreground overlay, greenscreen, layout selection, # of prints per image, etc, and the kiosk mode will abide by these settings.  For example, selecting a three image photo strip layout with greenscreen and overlay, will be processed in Kiosk mode once three images land in the folder.

Additionally, six sets of predefined print layouts are supported in this base release, with further add-on packs to be added in the near future.  The default set supports animated gifs, but the first add-on pack will show spectacular three layer animations.

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

Second step, Launch Pic2Print using "launch.bat" found in the software folder.  The batch file creates any missing folders, and passes command line switches to Pic2Print, enabling some extra buttons, specifically, the Debug button. The debug button displays a form with a verbose listing of internal operations with helpful messages to verify email operations. Lastly, "launch.bat" fires off Photoshop with a sample JPG listing some printer setup instructions.

Photoshop should have fired-up via the "Launch.bat". if not, fire up photoshop manually. Remove any prior versions of "Onsite.Printing.atn" that might be loaded in photshop.  Now, load the new "Onsite.Printing.atn" file found in "c:\OnSite\actions\" by dragging & dropping the file into photoshop.  

If you are using Photoshop CS3 or later and encounter problems loading JPGs, you might have to rewrite the "psload.exe" droplet found in the software folder. Click "Window->Actions" to open the action palette.  Looking in the "Onsite.Printing" action set, click on the first action named "Automatic Mode for Droplet", then run "file->Automate->Create Droplet", overwriting psload.exe in the "c:\OnSite\software" folder.   

When Pic2Print fires up, it opens the main control panel and a configuration form. In the configuration form, select your printer paper size, and the layout you wish to use.  Check the "File Output Only" box so you can process images without creating prints. I suggest selecting each layout, and generating test images to get to know the various layouts.  You can check/uncheck the foreground, greenscreen, multiple backgrounds, checkboxes, to see their effects on the images and operations. Also, email setup works fine.  MMS text messages go out as email to the various phone carriers.  See the "README.Email-Setup.txt" file for more information on setting up the email & cloud form.  Once you do some test runs, look in the "c:\OnSite\printed" folder to see the final outputs.  

Printing Issues - 

For CS2, this system works by printing to the default printer, so make sure your photo printer is setup as the Windows default printer. Validate this setting via the Windows Control Panel applet. If you change default printers, you will have to restart photoshop. Once you've confirmed the default printer, load an image. This allows you to execute Photoshop's "File->Page Setup" for the proper print size and orientation.  The "launch.bat" file will pre-load 'pssetup.jpg' into photoshop showing some helps on the Sony and DNP printers.  (You can rewrite this file with your own instructions for your specific printer setup). 

For CS5 and CC, configure the 'File->Print' dialog for the attached printer, paper size, and check 'Scale to Media'  checkbox.  Once done, you're ready to print. Execute 'File->Print One Copy' to print 'pssetup.jpg'.  It might look ugly due to the uprezing, but if it prints, you're good to go. Uncheck the "File Output Only" checkbox in Pic2Print configuration panel and print away!  If prints do not come out, I recommend taking baby steps.  Load an image in photoshop and work out any problems printing it. Once that connection is established, use Pic2Print to print one image. 

All systems Go!  Please use GitHub Issues list on this repository to address problems and bugs. 

Doug Cody <br>
Bay Area Event Photography <br>
www.bayareaeventphotography.com <br>

Photoshop Version support -

08/02/14 Update - Printing in CC and CS5 now works!. The disappointment is CS3 and CS4 might never work correctly.  In the rewrite of the CS3->CC print engine, two print options are presented now.  First is the 'File->Print' form, and secondly, the 'File->Print One Copy'.  CS3 and CS4 do not record all the printer settings in actions, and do not recognize the "Print One Copy" function in an action, so it looks like these versions are permanently disabled. CS5 and CC (and assuming CS6) DO record and save the state of both dialogs, thus work correctly in executing "Print One Copy" from under direction of the pre-recorded action.

Setting up the printer is a two step process.  "launch.bat" will start Photoshop loading the .JPG called "pssetup.jpg". This enables the first printer menu option in the "File" pull-down menu. This option is called "Print Setup" in CS2, and called  "Print" in CS3 - CC.  As the first step, the operator must execute the'File->Print' dialog, to select the printer, paper size, orientation, etc. The options in this dialog are dynamic and may need to be setup everytime photoshop is fired up.  Fortunately, Photoshop CC will save these settings between sessions.  The second step is executed via Pic2Print, using the Javacript and photoshop actions. These actions execute the 'File->Print One Copy' option for each print, using the settings in the first step. 

07/28/14 Update - CS3, CS4, CS5 and CC have been tested. GIFs work, but printing is problematic. Use CS2!!!  CS3 and upwards hardcode printer configurations in the actions and will cause you nightmares because the action will have to be re-recorded everytime you setup and operate on a job. Hopefully, there will be a workaround. I might just add some VB code to do the actual printer output to avoid PS altogether..
 
References - 

The mail program is a github project - https://github.com/muquit/mailsend.  Please send kudos and cash..

Microsoft .NET framework 4.5 download page - http://www.microsoft.com/en-us/download/details.aspx?id=30653 

Inspiration -

My daughter, Michelle Palmer, who needed this program to get started in the business.



