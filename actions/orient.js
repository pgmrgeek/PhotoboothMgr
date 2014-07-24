

//////////////////////////////////////////////////////////////////////////////////

// 
// Copyright 2002-2003. Adobe Systems, Incorporated. All rights reserved. 
// This scripts demonstrates how to rotate a layer 90 degrees clockwise. 
// Original file came from PSCS scripting\samples\javascript\RotateLayer.js 
// 
// Variation Copyright(c)Douglas Cody, 2004, All Rights Reserved. 
// clikphoto.com" target="_blank" title="Click to open link in a new browser window">http://www.clikphoto.com 
// 
// This script will look at the document orientation (portrait vs landscape) 
// On the first execution, if the document is a portrait, it will be rotated 
// to a horizontal. On the second execution, a rotated document will be 
// restored to a vertical. This effectively toggles the orientation ONLY if 
// the original document started out as a portrait. NOTE!!! the field, 
// File->FileInfo...->Origin->Instructions is modified to hold an interim 
// state. 
// 

////alert ("Caution: This action modifies the FileInfo Instructions field!"); 

if (app.documents.length > 0) { 

    // if not equal sides, we do the rotation..
    if (app.activeDocument.width != app.activeDocument.height) {

        // if horizontal, check the "rotate back" field.

        if (app.activeDocument.width > app.activeDocument.height) { 

            if (app.activeDocument.info.instructions == "rotate back") { 

                app.activeDocument.rotateCanvas(90.0); 
                app.activeDocument.info.instructions = " "; 
                ////alert( " 90 roate"); 
            } 

         } else { 

                // its vertical, rotate horizontal

                app.activeDocument.rotateCanvas(-90.0); 
                app.activeDocument.info.instructions = "rotate back"; 
                ////alert( app.activeDocument.info.instructions + " -90 roate"); 
         } 
     }

}  else { 
    alert("You must have at least one open document to run this script!"); 
} 


