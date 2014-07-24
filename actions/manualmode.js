
//////////////////////////////////////////////////////////////////////////////////
// 
// Copyright 2002-2003. Adobe Systems, Incorporated. All rights reserved. 
// This scripts demonstrates how to rotate a layer 90 degrees clockwise. 
// Original file came from PSCS scripting\samples\javascript\RotateLayer.js 
// 
// Variation Copyright(c)Douglas Cody, 2013, All Rights Reserved. 
// 
// Set an internal variable to select the background/foreground file to be used on this image
// 
//////////////////////////////////////////////////////////////////////////////////

if (app.documents.length > 0) {
    var usebk = "1";
    doc = activeDocument;
    var fname = doc.name;

    //alert ("BAEP - reset document programming fields"); 

    app.activeDocument.info.instructions = "";	// for rotation

    if (fname.search("_bk1") > 0) { usebk = "1"; }
    if (fname.search("_bk2") > 0) { usebk = "2"; }
    if (fname.search("_bk3") > 0) { usebk = "3"; }
    if (fname.search("_bk4") > 0) { usebk = "4"; }

    // save the selected background

    app.activeDocument.info.jobName = usebk;	// for background/foreground select
 
} 
    