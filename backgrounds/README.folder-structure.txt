============================================ 
background folder descriptions and contents: 
============================================

Copyright (c) 2014. Bay Area Event Photography.  All Rights Reserved 

All backgrounds/foregrounds are located in the following subfolder structure - folders are 
named with a three digit number sequence. Here's the default list shipped in the baseline 
package -

     c:\OnSite\backgrounds\000
     c:\OnSite\backgrounds\001
     c:\OnSite\backgrounds\002
     c:\OnSite\backgrounds\003
     c:\OnSite\backgrounds\004
     c:\OnSite\backgrounds\005

Each subfolder is considered a "layout".  The first, "000" is a full bleed single image
layout for all print sizes.  The second, "001" is a three image photostrip. The third,
"002" is a four image photo strip.  The forth, "003" is a three image layout with images 
in quadrant layout.  The fifth, "004" is a four image layout with images in qudarant
layout.  Finally, "005" is a four image bk/fg combination set to give your guests a 
choice of backgrounds.

Getting back to the folder names, These three digit number folders constitute a collection. 
The most significant digit indicates the set, so 000 - 005 is the default set shipped with 
the package. The first add-on pack will be numbered 100 - 10x. The second add-on pack will 
be 200 - 20x, etc. That gives a possible 99 layouts per collection, more than you'd ever want. 

Within each of these folders, will exist, a minimum of one horizontal and/or one vertical
background/foreground file saved as a photoshop .PSD. These files are identical in 
contruction, having two layers; the 'background' layer used as the greenscreen background 
replacement, and a 'foreground' layer, as you might guess, used as the foreground 
overlay/watermarking on placed on top of the attendee image.  Please read 
"REAME.bkfg-csv-format.txt" for more information on editing these files.

Next up, as mentioned above, Pic2Print supports up to four horizontal and four vertical images
per layout.  Again, this is to give your attendees up to four options on backgrounds.

Now, here is where the challenge begins.  Given each layout folder can have a total of
8 .PSD files, each one might need special handling because of various print size cropping
issues.  A 4x6 aspect ratio gets cut down to a 4x5 aspect ratio when printing an 8x10.  This 
center crop might not work for the layout, so this system incorporates two levels of features
to specially handle the images before printing. The first is enabling a custom action. The
second is enabling an entire set of 'ratio' subfolders within the layout folder. This is 
a nested set of folder creating a deep hierarchy of possible print combinations. Tread lightly!
Do NOT jump in this brew without serious need and consideration.  An unwieldy explosion
of combinations occurs if you have both special case actions and special case bk/fg files.
This whole issue and how to create a setup is covered in the "bkfg.readme.txt" file.

What are 'ratio' folders?  

In order to contain the explosion of combinations on layouts & print sizes, the 12 most 
common print sizes are translated into their X/Y ratio so to reduce the number of .PSD file
combinations. This allows the operator to create 5 sets of bk/fg files, not 12 sets. Again, 
this is used in the case each print size must have its own unique layout, typically for 
cropping purposes.

The following table shows the translation:

    folder 125 = 4x5, 5x4, 8x10, 10x8 prints
    folder 133 = 3x4, 4x3, 6x8, 8x6 prints
    folder 140 = 3.5x5, 5x3.5, 5x7, 7x5 prints
    fodler 150 = 4x6, 6x4, 6x9, 9x6, 8x12, 12x8 prints
    folder 300 = 2x6, 6x2 photo strips

An example folder structure would look like this (as an example only):

    c:\onsite\backgrounds\006\125
    c:\onsite\backgrounds\006\133
    c:\onsite\backgrounds\006\140
    c:\onsite\backgrounds\006\150

NOTE: These folders are OPTIONAL, and specified in the "c:\onsite\software\bkfglayouts.x00.csv" 
file.  The bkfglayouts csv file has the three digit collection number embedded in the name.  
The file, "bgfglayouts.000.csv" holds the default set, and bkfglayouts.100.csv will hold the 
first add-on pack layouts, etc. 

Don't panic if you don't see the ratio folders in your folders. it means the layouts work with the 
inherent cropping that occurs from the 6x4 down to the 10x8 format.  If you need to control the 
cropping, a custom action can be used before employing custom ratio files.  See the 003 collection 
custom actions in photoshop. The name of the actions is 'JS:003.Print.H:125' 

Add-on set 100, with layout # 103 contains an explosion of combinations for the first four layouts. 
This is due to the custom action required to crop and scale the layer into the frame.  Do a Git pull
of the Add-on set, then open the .PSD files to see whats up.

More to come..




