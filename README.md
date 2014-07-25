PhotoboothMgr
=============

Photobooth management software is written for the IBM PC, using Adobe Photoshop Javascript, actions and Microsoft Visual Studio Express 2010, .NET 4.5 for XP, Win7 and Win 8.  This program requires Photoshop CS2 but runs for the most part on all subsequent versions.  Further testing/debugging will be done to guarrantee support of subsequent PS versions.

This package manages images for onsite printing. Incoming images are processed either in kiosk mode or by a technician.  Five sets of predefined print layouts are supported in this base release, with further add-on packs to be added in the future.

Core to this package, is "Pic2Print.exe", a visual basic program, that provides a user interface to the incoming stream
of images.  It also runs in a kiosk mode, printing all incoming images.  Animated gifs are supported and images can be emailed, sent as MMS messages, and copied to another folder for dropbox or slideshows.  All this functionality works as of today (first release) with further enhancements forth coming.  The actual source code to Pic2Print will be located in its own repository, not in this package.  

To install this package, download it from github maintaining the folder structure.  The parent folder is called "OnSite" and must be located in the root of Drive C.  Sorry, but its hardcoded for now.  Here is the folder structure required -

c:\OnSite                - parent folder and automatic kiosk folder. Any jpg landing here gets printed automatically.<br>
c:\OnSite\actions        - holds actions sets and javascript.<br>
c:\OnSite\backgrounds    - holds the print layouts in subfolders, spec'd by the .CSV files.<br>
c:\OnSite\capture        - incoming .jpgs to land here, to be managed by the human operator.<br>
c:\OnSite\cloud          - suggested output folder for the cloud/slideshow.  Not really necessary.<br>
c:\OnSite\orig           - after images are processed, the files are moved here<br>
c:\OnSite\printed        - the processed files - .GIF, .PSD with layers, and a flattened .JPG.<br>
c:\OnSite\software       - windows runtime code and support files.<br>

Second step, fire up photoshop and load the action set called "Onsite.Printing" located in the actions folder.  

Third step, Launch Pic2Print using the "launch.bat" found in the software folder, for debugging purposes.  The batch
file passes in switches to Pic2Print enabling some extra buttons, specifically, the Debug button, for a verbose listing of internal operations and to verify emails being sent.

When Pic2Print fires up, it opens the main form and a Configuration form.  Select your printer paper size, and then
the layout you wish to use.  I suggest just using the first layout till more documentation is provided. Try it out
to this point; more documenation coming..

Doug Cody
Bay Area Event Photography
www.bayareaeventphotography.com

References - 

The mail program is a github project - https://github.com/muquit/mailsend.  Please send kudos and cash..




