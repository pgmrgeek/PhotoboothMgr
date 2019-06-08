
//////////////////////////////////////////////////////////////////////////////////////////
//
// automaticmode - The javascript smarts of pic2print. 
//
// Version 14.10.05
//
//    This module reads the config file, then processes the activeDocument
//    for all features.
///
/////////////////////////////////////////////////////////////////////////////////////////

// constants as #defines

    var TRUE = 1;                       // obvious..
    var FALSE = 0;
    var VERTICAL = 0;                   
    var HORIZONTAL = 1;
    var PRT_LOAD = 0;
    var PRT_PRINT = 1;
    var PRT_GIF = 2;
    var PRT_REPRINT=4;
    var BIT_VERT_SUPPORTED =  0x100;
    var BIT_VBGFG_ACTION   =  0x200;
    var BIT_VPRT_ACTION    =  0x400;
    var BIT_HORZ_SUPPORTED = 0x1000;
    var BIT_HBGFG_ACTION   = 0x2000;
    var BIT_HPRT_ACTION    = 0x4000;


//////////////////////////////////////////////////////////////////////////
/////////////////////////  Global Variables //////////////////////////////
//////////////////////////////////////////////////////////////////////////

    // whats given to us from PS
    var doc = activeDocument;           // fetch the current foreground document
    var fname  = doc.name;              // and its name..
    var fname2 = doc.name;              // and the extracted email/txt msg name
    var processMode = PRT_PRINT;        // processing this file as a

    // data read from the config.txt file
    var PrintSiz = 1;                   // 1=3.5x5, 2=2x6, 3=4x6, 4=5x7, etc.
    var xRes = 0;                       // x resolution
    var yRes = 0;                       // y resolution
    var dpi  = 0;                       // DPI dots per inch..
    var BkGrnd = 0;                     // 0= nothing, 1 = greenscreen, 2 = separate
    var FGrnd = 0;                      // 0= nothing, 1 = overlay
    var profil = '-';                   // string name of the profile
    var NoPrt = 0;                      // 1 = file output only
    var bkCount = 1;                    // defaults to at least one background/foreground
    var bkAction = 0;                   // the background has its own custom action
    var actionsetname = 
                "Onsite.Printing";      // custom action set name
    var savepsd = TRUE;                 // save a layered .PSD on output
    var message = "";                   // message to be place in a text layer
    var GifDelay = 0;                   // delay at end of gif?
    var SeqNumber = "";			// prefix on file name is typically a number
    var SeqNumber2 = "";		// 2nd serial # layer for 2x6 photo strips
    var MachineID = "";                 // Machine ID is 3 characters
    var prtrHorzPCT = 100;		// scale image horizontal to ..
    var prtrVertPCT = 100;		// scale image vertical to ..
    var prtrHorzOFF = 0;		// offset this layer by X % for alignment
    var prtrVertOFF = 0;		// offset this layer by X % for alignment
    var Filter1Name = "";		// Filter #1 selected
    var Filter1Set  = "";
    var Filter2Name = "";		// Filter #2 selected
    var Filter2Set  = "";
    var Filter3Name = ""		// Filter #3 selected
    var Filter3Set  = ""

    // bk/fg file variable
    var bkfile;                         // string name of the background file
    var BkIdx = '1'                     // background index
    var BkFolder = '000';               // Background/foreground folder top level folder
    var ActionSet = '000';              // Action Set that goes with the folder
    var CustomAction = "";              // The synthesized action name.
    var CustomLoadAction = "";          // The synthesized action name for loaded files.
    var orientation;                    // TBD on loadconfig - vertical or horizontal
    var PSver = 'CS2';                  // default set of actions
    var sRatio;                         // string holds the ratio - 125,133,140,150,300
    var defaultDPI = 300;               // DPI on rescaling to intermim working size.
    var colorR = 0;                     // Text layer color RBG
    var colorG = 0;                     //
    var colorB = 0;                     //
    var fontname = "Arial";             // the font passed in..

    // testing variables
    var timeRun = FALSE;                // set to TRUE to do time analysis
    var millstart;
    var millstop1;
    var millstop2;
    var mtime;
    var DBG = FALSE;			// debug enabled

//////////////////////////////////////////////////////////////////////////
/////////////////////////    Process File   //////////////////////////////
//////////////////////////////////////////////////////////////////////////

if (app.documents.length > 0) { 

var keepgoing = TRUE;

    // process the file name and config file

        keepgoing = loadConfigFile();

    // build the selector to a specific aspect ratio action set

        BuildCustomActionName();

    // special case reprints - do it and end it

        if (processMode == PRT_REPRINT) {
            ProcessReprint();
            keepgoing = FALSE;
        }

    // Time the processing

        if (timeRun == TRUE) TimeImageStart();

    // Load the image's text file to load the message to be placed in a text layer

        if (keepgoing == TRUE) 
            keepgoing = loadImageTextFile();

    // Resize to the target size

        if (keepgoing == TRUE) 
            keepgoing = NormalizeImage();

    // boost shadows by 15% - 12.03 - now a filter. may need this for greenscreen.

        // doAction ('JS:more midtones 15%', 'Onsite.Printing');

   // do the greenscreen background

        if (keepgoing == TRUE) 
            keepgoing = ProcessBackground();

    // do the foreground overlay

        if (keepgoing == TRUE) 
            keepgoing = ProcessForeGround();

    // Maybe add a custom text layer with the user data from the txt data file

        if (keepgoing == TRUE)  
            ProcessTextLayer();
        
    // run the customization

        if (keepgoing == TRUE) 
            keepgoing = ProcessCustomAction();

    // run the possible filters

        if (keepgoing == TRUE) 
            keepgoing = ProcessFilters();

        if (timeRun == TRUE) TimeImageStop();

    // Done with the image processing, now do the output 

    // Loads, Prints and GIFs happen here.

        if (keepgoing == TRUE) 
            keepgoing = ProcessOutput();

        if (timeRun == TRUE) TimeReport();

    // finally, we're done, we can close the file. Leave it open if a LOAD cmd. Close
    // it if the file format is not supported.

        if ((processMode != PRT_LOAD) || (keepgoing == FALSE)) {

            // alert("closing");

            if (keepgoing = TRUE)
                doAction('JS:Close', 'Onsite.Printing');

        } else {

            // alert("leaving open");
        }


}

//////////////////////////////////////////////////////////////////////////
////////////////////////   NormalizeImage   /////////////////////////////
//////////////////////////////////////////////////////////////////////////
//
// Look over the incoming image.  If its not a 4x6, then we need to 
// resize it's canvas to match this basic format.  This can happen if 
// a camera is used that creates 4x5 images.  Also, emailed images may
// come in as 4x4, 4x5, 2x6 or worse.
//
// Ver 14.00 - adding mode conversion from any mode to RGB mode.
//
function NormalizeImage() {
var iRatio,w,h,horz;
var startRulerUnits = preferences.rulerUnits;
var startTypeUnits = app.preferences.typeUnits;

    	// make sure we're talkin pixels
    	preferences.rulerUnits = Units.PIXELS;
    	preferences.typeUnits = TypeUnits.PIXELS;

	// debugging message
	if (DBG == TRUE) alert("NormalizeImage");

	// make sure its RGB mode. The actions will choke on anything else

	doc.changeMode(ChangeMode.RGB);	

	// calculate the image ratio

	    w = app.activeDocument.width;
	    h = app.activeDocument.height;

	    if (w >= h) {
	    	iRatio = parseInt(w * 100 / h);
	    	horz = TRUE;
	    } else {
	    	iRatio = parseInt(h * 100 / w);
		horz = FALSE;
	    }
	//alert( "iRatio = " + iRatio + " w=" + w + " h=" + h);

	// if not a 4x6, then we need to adjust the canvas to make it a 4x6

	    if (iRatio != 150) {

	    	// if less that 1.5, then its a 4x4, 4x5, etc.

	    	if (iRatio < 150) {

		    if (horz == TRUE) {
			//alert("1 - stretch Y to edge, pad canvas");
            	    	// take the yRes and expand it out to the edge
                    	doc.resizeImage(null,UnitValue(1800,"px"),defaultDPI,ResampleMethod.BICUBIC);
                    	doc.resizeCanvas(UnitValue(9,"in"),UnitValue(6,"in"),AnchorPosition.MIDDLECENTER);

		    } else {
			//alert("2 - stretch X to edge, pad canvas");
            	    	// take the xRes and expand it out to the 
                    	doc.resizeImage(UnitValue(1800,"px"),null,defaultDPI,ResampleMethod.BICUBIC);
                    	doc.resizeCanvas(UnitValue(6,"in"),UnitValue(9,"in"),AnchorPosition.MIDDLECENTER);

		    }

		} else {  // this could be a photostrip, 6x2

		    if (horz == TRUE) {
			//alert("3 - stretch X to edge, pad canvas");
            	    	// take the xRes and expand it out to the 
                    	doc.resizeImage(UnitValue(2700,"px"),null,defaultDPI,ResampleMethod.BICUBIC);
                    	doc.resizeCanvas(UnitValue(9,"in"),UnitValue(6,"in"),AnchorPosition.MIDDLECENTER);
                    	//doc.resizeImage(UnitValue(2700,"px"),UnitValue(1800,"px"),defaultDPI,ResampleMethod.BICUBIC);

		    } else {
			//alert("4 - stretch Y to edge, pad canvas");
            	    	// take the xRes and expand it out to the 
                    	doc.resizeImage(null,UnitValue(2700,"px"),defaultDPI,ResampleMethod.BICUBIC);
                    	doc.resizeCanvas(UnitValue(6,"in"),UnitValue(9,"in"),AnchorPosition.MIDDLECENTER);
                    	//doc.resizeImage(UnitValue(2700,"px"),UnitValue(1800,"px"),defaultDPI,ResampleMethod.BICUBIC);

		    }
		}

	    } else {
		//alert("iRatio is a 4x6");

		// it is a 4x6, so just resize it

	    	ResizeImage(0);    // resizes to our working 6x9x300dpi size

	    }

    	app.preferences.rulerUnits = startRulerUnits;
    	app.preferences.typeUnits = startTypeUnits;

	return(TRUE);
}

//////////////////////////////////////////////////////////////////////////
////////////////////////  ProcessBackground  /////////////////////////////
//////////////////////////////////////////////////////////////////////////
//
// Performs greenscreen separation or just dummies up a copy of the
// background as a separation to leave a normalized set of layers. Either
// case, you get a layer named "separation"  
//
function ProcessBackground()
{
var str;
var fileref;

        if (BkGrnd == '1')  { 

            // do the separation
            doAction('JS:Greenscreen', 'Onsite.Printing');

            // process the appropriate file & appropriate action
    
            //alert("loading background from " + bkfile);

            fileRef = new File( bkfile );

            if (!fileRef.exists) {

                AlertNoGo();
                fileref = null;
                return (FALSE);

            } else {

                open (fileRef);
                doAction('JS:Background', 'Onsite.Printing');

            }

        } else {

            // dup the background and name it 'separation' to normalize the image

            doAction('JS:Dup Background', 'Onsite.Printing');
        }

        fileRef = null;
        return TRUE;

}

//////////////////////////////////////////////////////////////////////////
////////////////////////  ProcessForeGround  /////////////////////////////
//////////////////////////////////////////////////////////////////////////
//
// Performs the file loading and copy/paste of the foreground layer 
// into the image.  If foreground processing isn't checked by the user,
// then we just create an empty layer with board  to leave a normalized 
// set of layers. Either case, you get a layer named "green". 
//
function ProcessForeGround()
{
var str;
var fileref;

        if (FGrnd == '1')   {

            // if overlay foreground, process the file & appropriate action

            // alert("loading foreground from " + bkfile);
            fileRef = new File( bkfile );

            if (!fileRef.exists) {

                AlertNoGo();
                fileref = null;
                return FALSE;

            } else {

                open (fileRef);

                doAction('JS:Foreground', 'Onsite.Printing');
                doAction('JS:Layer to top', 'Onsite.Printing');

            }

        } else {
        
            // create a transparent overlay to normalize the image

            doAction('JS:New foreground Layer', 'Onsite.Printing');
            doAction('JS:Layer to top', 'Onsite.Printing');
        }

        fileRef = null;

        return TRUE;

}

////////////////////////////////////////////////////////////////////////////
////////////////////////  ProcessCustomAction  /////////////////////////////
////////////////////////////////////////////////////////////////////////////
//
// Performs the action set based on the background/foreground selection.
// The folder name ("000" as default) is used to identify the action set.  
//
function ProcessCustomAction()
{
    // execute the synthesized action name, for prints & gifs only

        if (processMode != PRT_LOAD) {

            //alert ("Custom Action = " + '"' + CustomAction + '" in ' + actionsetname);
            doAction(CustomAction, actionsetname);  //  'Onsite.Printing'
        
            // after the action, check the orientation, it might have changed. 2x6 always
            // end up as verticals

            if (app.activeDocument.width >= app.activeDocument.height) {
                orientation = HORIZONTAL;
                //alert("Image is a horizontal");
            } else {
                orientation = VERTICAL;
                //alert("Image is a vertical");
            }

        } else {

            // Files just loaded may still need filters, etc to the visible layers

            //alert ("Custom Load Action = " + '"' + CustomAction + '" in ' + actionsetname);
            doAction(CustomLoadAction, actionsetname);  //  'Onsite.Printing'
        }

    return TRUE;
}

////////////////////////////////////////////////////////////////////////////
////////////////////////  ProcessFilters  /////////////////////////////
////////////////////////////////////////////////////////////////////////////
//
// Performs the selected filter on the separation+green layer or the s1,s2,s3,s4 layers.
//
// Assumptions - At this point, the layer stack is normalized (see below) so its
// an easy thing to go in and apply adjustments to the current layer called 'filtered'
// The action can do everything it wants, modify, add layers, apply PS filters, sharpening,
//  etc, but must merge all these back into the 'filtered' layer, leaving it as the 
// current layer.  Thats important for this code to be able to restore the names that
// only this code knows.  These filters only know the layer is called 'filtered', but 
// do not know if it is s1,s2,s3, or s4 for GIFs. This java code handles that part.
//
// The layer stack looks like -
//
//     PRINTS ==================   GIFS ===============
//       serial #2 layer             serial #2 layer   
//       serial #1 layer             serial #1 layer     
//       user text layer             user text layer
//       foreground layer            s1
//       separation layer,           s2
//       green layer                 s3
//       background original         s4
//                                   background original
//
//     Prints and GIF stacks are handled differently here so the filters only
//     see one layer to work with, named 'filtered'
//     For Prints, a supplied action is called to merge a copy of the 
//     separation and green layer into a new one called 'filtered'.
//     For GIFs, supplied actions are called to rename the s1,s2,s3,s4
//     layers to 'filtered' and then restored to s1,s2,s3,s4 after
//     the filter is applied.
//
function ProcessFilters()
{
var doit = false

    // execute the synthesized action name, for prints & gifs only

	if (Filter1Name.search("None") != 0) doit = true;
	if (Filter2Name.search("None") != 0) doit = true;
	if (Filter3Name.search("None") != 0) doit = true;

    // do this only if there is a filter selected.

	if (doit) {

	    // on a print, if there is a filter, merge the separation and green layers, 
	    // rename it 'filtered' to maintained the layer stack.

            if (processMode == PRT_PRINT) {

		    doAction("JS:Filter:Setup","Onsite.Printing");
		    _applyFilters();

	    }

            // GIFs have the separation layers named s1,s2,s3,s4, so we have to handle the individually

	    if (processMode == PRT_GIF) {
		
		// current layer will be s1,s2,s3, or s4 on each call. Coming back each layer will
		// be renamed s1,s2,s3 and s4 respectively to maintain the layer stack.

		    doAction("JS:Select s1","Onsite.Printing");
		    _applyFilters();
		    doAction("JS:Filter:Rename-s1","Onsite.Printing");  // rename it s1

		    doAction("JS:Select s2","Onsite.Printing");
		    _applyFilters();
		    doAction("JS:Filter:Rename-s2","Onsite.Printing");  // rename the layer s2

		    doAction("JS:Select s3","Onsite.Printing");
		    _applyFilters();
		    doAction("JS:Filter:Rename-s3","Onsite.Printing");

		    doAction("JS:Select s4","Onsite.Printing");
		    _applyFilters();
		    doAction("JS:Filter:Rename-s4","Onsite.Printing");

	    }
	}

    // doAction("JS:Stop","Onsite.Printing");  // for debugging of filters

    return TRUE;
}

//
// _applyFilters applies the three filters to the CURRENT layer only. As a courtesy to
// the caller, the current name will be renamed 'filtered' on exit.
//
function _applyFilters()
{
	// if spec'd in the config file, run filter #1
	    if (Filter1Name.search("None") != 0) {
		doAction("JS:Filter:" + Filter1Name, Filter1Set);
		doAction("JS:Filter:Rename-filtered","Onsite.Printing");
	    }

	// if spec'd in the config file, run filter #2
	    if (Filter2Name.search("None") != 0) {
		doAction("JS:Filter:" + Filter2Name, Filter2Set);
		doAction("JS:Filter:Rename-filtered","Onsite.Printing");
	    }

	// if spec'd in the config file, run filter #3
	    if (Filter3Name.search("None") != 0) {
		doAction("JS:Filter:" + Filter3Name, Filter3Set);
		doAction("JS:Filter:Rename-filtered","Onsite.Printing");
	    }

}

////////////////////////////////////////////////////////////////////////////
////////////////////////     ProcessOutput     /////////////////////////////
////////////////////////////////////////////////////////////////////////////
//
// If this is a print or gif request, do it.  If its a load, we're already done. 
//
function ProcessOutput()
{
var prtcnt = 1

    // prints and .GIFs get processed here. we're done already on loads.

    if (processMode != PRT_LOAD) {
           
        // a _m2=gif, means this file is the 4th image loaded to generate 
        // a .gif file, so process that action

        if (processMode == PRT_GIF) { 

            // resize down if the file size is calculated on a printer, not gif

            if ((xRes > 1024) || (yRes > 1024)) {

                // alert("Forced resizing to default GIF");

		// this number ratio assumes the incoming image is in a 6x4 aspect ratio. 
		// some cameras might still have the 5x4 ratio?  This will break in that 
		// case

		if (xRes > yRes) {
		    xRes = 640; yRes = 427;
		} else {
		    yRes = 640; xRes = 427;
		}
		
                ResizeImage(10);    // resize to the 640x427 size

            } else {

                // size is indicating this is one of the gif sizes, so resize by standard means

                ResizeImage(PrintSiz);    // resize to the printer print size

            }           

            // Save both the files in the printed folder

            //alert(".gif save");

            if (GifDelay == 0) 
                doAction('JS:' + PSver + ':Save GIF', 'Onsite.Printing');
            else
                doAction('JS:' + PSver + ':Save GIF Delay', 'Onsite.Printing');

            if (savepsd == TRUE) 
                doAction('JS:Save PSD File', 'Onsite.Printing');

	    if (orientation == VERTICAL) {
                doAction('JS:Save JPG File Vertical', 'Onsite.Printing');
            } else {
                doAction('JS:Save JPG File Horizontal', 'Onsite.Printing');
            }

            //alert(".gif save done");

        } else {  // not gif, so print/save it

                // 2nd resize - to the printer output size

                    ResizeImage(PrintSiz);    // resize to the printer print size

                // Save the files in the printed folder

                if (savepsd == TRUE) 
                   doAction('JS:Save PSD File', 'Onsite.Printing');

	    	if (orientation == VERTICAL) {
                   doAction('JS:Save JPG File Vertical', 'Onsite.Printing');
            	} else {
                   doAction('JS:Save JPG File Horizontal', 'Onsite.Printing');
            	}

                // if "File Output Only" = 0, Print the image

                if (NoPrt == '0')   {

                    // the name may possess the print count, so extract it

		    while (1) {
                        if (fname.search('_p10') > 0) { prtcnt = 10;break; }
                        if (fname.search('_p1')  > 0) { prtcnt = 1; break; }
                        if (fname.search('_p2')  > 0) { prtcnt = 2; break; }
                        if (fname.search('_p3')  > 0) { prtcnt = 3; break; }
                        if (fname.search('_p4')  > 0) { prtcnt = 4; break; }
                        if (fname.search('_p5')  > 0) { prtcnt = 5; break; }
                        if (fname.search('_p6')  > 0) { prtcnt = 6; break; }
                        if (fname.search('_p7')  > 0) { prtcnt = 7; break; }
                        if (fname.search('_p8')  > 0) { prtcnt = 8; break; }
                        if (fname.search('_p9')  > 0) { prtcnt = 9; break; }
			break; 
		    }
		    // alert("prtcnt = " + prtcnt);

                    // possibly convert its profile to the target printer profile

                    if (profil != "") {
                         // alert ("converting to profile " + profil );
                         activeDocument.convertProfile( profil, Intent.RELATIVECOLORIMETRIC, true, true );

                    }

                    if (orientation == VERTICAL) app.activeDocument.rotateCanvas(90.0); 

                    // photostrips on the DS40 need to go out as 4x6 prints so we're introducing the "ratio" 
                    // reformatting. 

                    doAction ("JS:PreprintFormatRatio:" + sRatio, "Onsite.Printing");

		    // Account for the cropping of 1/8 boarders like on DNP DS-40

		    ResizeImageToPaper();

                    // no printing is false, so print it!
    
                    while (prtcnt > 0) {
                        doAction('JS:' + PSver + ':Print One Copy', 'Onsite.Printing');
                        prtcnt = prtcnt - 1;
                    }

                    if (orientation == VERTICAL) app.activeDocument.rotateCanvas(-90.0); 

                }
        }
    } 
}

////////////////////////////////////////////////////////////////////////////
////////////////////////     ProcessReprint     ////////////////////////////
////////////////////////////////////////////////////////////////////////////
//
// The file is already formatted, etc. We just need to output it to the printer
//
function ProcessReprint()
{
var prtcnt = 1;
var x,y,h;

    // debugging message..
    if (DBG == TRUE) alert("ProcessReprint");

    // prints and .GIFs get processed here. we're done already on loads.

    if (processMode == PRT_REPRINT) {
           
        // First, check this reprint that it matches the printers paper size. If not, resize it.
	    x = parseInt(doc.width.as('px'));
	    y = parseInt(doc.height.as('px'));

	    // adjust for portrait vs landscape..
	    if (x < y) { h=x; x=y; y=h; }

	    //alert ("xRes:" + xRes + " yRes:" + yRes +", doc.x:" + x + " doc.y:" + y);

	    if ( (xRes == x) && (yRes == y) )  {
		//alert ("Reprint same size - xRes:" + xRes + " yRes:" + yRes +", doc.x:" + x + " doc.y" + y);
	    } else {
		//alert ("Resizing reprint..");
		ResizeImage(PrintSiz);    // resize to the printer print size
	    }

        // Save the files in the printed folder. dsc 4/28/18 no need to save reprints. it fills the postview window needlessly..

            //if (savepsd == TRUE) 
            //   doAction('JS:Save PSD File', 'Onsite.Printing');

            //if (orientation == VERTICAL) {
            //    doAction('JS:Save JPG File Vertical', 'Onsite.Printing');
            //} else {
            //    doAction('JS:Save JPG File Horizontal', 'Onsite.Printing');
            //}

        // if "File Output Only" = 0, Print the image

            if (NoPrt == '0')   {

                // the name may possess the print count, so extract it

		    while (1) {
                        if (fname.search('_p1')  > 0) { prtcnt = 1; break; }
                        if (fname.search('_p2')  > 0) { prtcnt = 2; break; }
                        if (fname.search('_p3')  > 0) { prtcnt = 3; break; }
                        if (fname.search('_p4')  > 0) { prtcnt = 4; break; }
                        if (fname.search('_p5')  > 0) { prtcnt = 5; break; }
                        if (fname.search('_p6')  > 0) { prtcnt = 6; break; }
                        if (fname.search('_p7')  > 0) { prtcnt = 7; break; }
                        if (fname.search('_p8')  > 0) { prtcnt = 8; break; }
                        if (fname.search('_p9')  > 0) { prtcnt = 9; break; }
                        if (fname.search('_p10') > 0) { prtcnt = 10;break; }
			break; 
		    }
		    // alert("prtcnt = " + prtcnt);

                // Convert the profile to the target printer profile. This was not saved when created..

                if (profil != "") {
                     // alert ("converting to profile " + profil );
                     activeDocument.convertProfile( profil, Intent.RELATIVECOLORIMETRIC, true, true );
                }

                if (orientation == VERTICAL) app.activeDocument.rotateCanvas(90.0); 

                // photostrips on the DS40 need to go out as 4x6 prints so we're introducing the "ratio" 
                // reformatting. 

                doAction ("JS:PreprintFormatRatio:" + sRatio, "Onsite.Printing");

                // no printing is false, so print it!
    
                while (prtcnt > 0) {
                    doAction('JS:' + PSver + ':Print One Copy', 'Onsite.Printing');
                    prtcnt = prtcnt - 1;
                }

                if (orientation == VERTICAL) app.activeDocument.rotateCanvas(-90.0); 

            }
    } 
}

//////////////////////////////////////////////////////////////////////////
/////////////////       ProcessTextLayer       //////////////////////////
//////////////////////////////////////////////////////////////////////////
//
// Create two text layers, and place them out of view.  The actions can
// place them correctly and make them visible.  The font & color is 
// determined in Pic2Print config panel.
//  
function ProcessTextLayer()
{
	// build two layers - the user text and the sequence number from the file name

	_buildTextLayer("textlayer", message);
	_buildTextLayer("serial",    SeqNumber);
	_buildTextLayer("serial2",   SeqNumber2);
	_buildTextLayer("fname",     fname2);

        //doAction ('JS:Hide Text Layer','Onsite.Printing');

        // restore to our normalized set
        doAction ('JS:Select Foreground Layer','Onsite.Printing');
}


//////////////////////////////////////////////////////////////////////////
/////////////////         TimeImageStart        //////////////////////////
//////////////////////////////////////////////////////////////////////////
//
// Profiling Timing routines to measure how long it takes to process
// a given layout from input to "Ready to Print" state.  
//
function TimeImageStart()
{
var d = new Date();
	millstart = d.getTime();
}

function TimeImageStop()
{
d = new Date(); 
	millstop1 = d.getTime();
}

function TimeReport()
{
var s;
var n;
var msg;

	d = new Date(); 
	millstop2 = d.getTime();

	n = millstop1 - millstart;
	s = n / 1000
	msg = "process time in seconds = " + s + "(" + n + " milliseconds)";

	n =  millstop2 - millstop1;
	s = n / 1000
	msg = msg + "\nsave-to-file in seconds = " + s + "(" + n + " milliseconds)";

	n = millstop2 - millstart 
	s = n / 1000
	msg = msg + "\ntotal time in seconds = " + s + "(" + n + " milliseconds)";
	alert(msg);
}

//////////////////////////////////////////////////////////////////////////
/////////////////         _buildTextLayer        //////////////////////////
//////////////////////////////////////////////////////////////////////////
//
// Create a text layer, with or without a user txt message.
//  
//
function _buildTextLayer(layername,msg)
{
var txtLayer;
var txtRef;
var origUnits;
var textColor;
var txtRef;

        // save the original state

        origUnits = preferences.rulerUnits;
        preferences.rulerUnits = Units.PIXELS;

        // setup the selected color here..

        textColor = new SolidColor;
        textColor.rgb.red   = colorR;
        textColor.rgb.green = colorG;
        textColor.rgb.blue  = colorB;

        // in order to have a standard set we always create a text layer, but it might have no text.
        //  create a text layer at the front

        txtLayer = doc.artLayers.add();
        txtLayer.kind = LayerKind.TEXT;
        txtLayer.name = layername;   		// "textlayer";
        txtLayer.visible = false;
       
        // adding the user text here..

        txtRef = txtLayer.textItem;
        txtRef.font = fontname;
        txtRef.contents = msg;			// message;       
        txtRef.color = textColor;
        txtRef.antiAliasMethod = AntiAlias.NONE;

        // add the selected font size here. Keep it at 28 and use an action to scale it.

        txtRef.size = 28;
                
        // position it the center of the image for now, and hide the layer
        txtRef.position = new Array( 0, 0 );

        // Everything went Ok. Restore ruler units
        preferences.rulerUnits = origUnits;

}

//////////////////////////////////////////////////////////////////////////
/////////////////     BuildCustomActionName     //////////////////////////
//////////////////////////////////////////////////////////////////////////
//
// Builds a string with the action specified by both the config.txt file
// and the incoming file name.   
//

function BuildCustomActionName()
{
var sOrient;
var sHV;
var subst;

    // map the print size to an aspect ratio. That ratio is the file folder
    // for the matching BgFg file

        switch (PrintSiz) {

            case 7:  // 8x10    
                sRatio = "125";
                break;

            case  5:  // 6x8
            case 11:  // 640x480
            case 12:  // 800x600
            case 13:  // 1024x768
                sRatio = "133";
                break;

            case  1:  // 3.5x5
            case  4:  // 5x7
                sRatio = "140";
                break;

            case  0: // 6x9 dpi, our default state
            case  3: // 4x6
            case  6: // 6x9
            case  8: // 8x12
            case  9: // 480x320
            case 10: // 640x427
                sRatio = "150";
                break;

            case 2:  // 2x6
                sRatio = "300";
                break;

            default:
                sRatio = "";
                alert("Illegal print size in the config.txt file");
                break;

        }

    //
    // synthesize the name of the action in the format of:
    //
    // JS:Folder:Mode:Orientation+BkFgIndex:Ratio

    // if this output requires the custom action for the aspect
    // ratio, we append it to the action name.

    // Select the orientation, and if a print, we build the full actio name.

        if (orientation == VERTICAL) {

            sOrient = sHV = 'V';
            if (processMode == PRT_PRINT) {

                if (bkAction & BIT_VBGFG_ACTION) sOrient = sOrient + BkIdx;
                if (bkAction & BIT_VPRT_ACTION)  sOrient = sOrient + ":" + sRatio;

            } 
            
        } else {

            sOrient = sHV = 'H';
            if (processMode == PRT_PRINT) {

                if (bkAction & BIT_HBGFG_ACTION) sOrient = sOrient + BkIdx;
                if (bkAction & BIT_HPRT_ACTION)  sOrient = sOrient + ":" + sRatio;

            } 
            
        }

    // here is the base line action to be executed

        CustomAction     = 'JS:' + ActionSet + ':' + mode + ':' + sOrient; 
        CustomLoadAction = 'JS:' + ActionSet + ':' + 'Load:' + sHV; 
        //alert("CustomAction = " + '"' + CustomAction + '  CustomLoadAction = ' + '"' + CustomLoadAction + '"');

}

//////////////////////////////////////////////////////////////////////////
////////////////////////    loadConfigFile   /////////////////////////////
//////////////////////////////////////////////////////////////////////////
//
// Reads the config.txt file into the global variables.  
//
function loadConfigFile() 
{
var _len = 0;
var str;
var num;

    _len = fname.search('.jpg')

    // convert the file name _mX into working parameters

        processMode = PRT_PRINT;
        mode = 'Print';
        if (fname.search('_m0') > 0) { 
            processMode = PRT_LOAD;
            mode = 'Load'; 
            //alert("mode=" + mode);
        } else {
            if (fname.search('_m1') > 0) { 
                processMode = PRT_PRINT;
                mode = 'Print' ;
                //alert("mode=" + mode);
            } else {
                if (fname.search('_m2') > 0) { 
                    processMode = PRT_GIF;
                    mode = 'GIF'; 
                    //alert("mode=" + mode);
                } else {
                    if (fname.search('_m4') > 0) {  
                        processMode = PRT_REPRINT;
                        mode = 'RePRint';
                        //alert("mode=" + "RePrint");
                    }
                }
            }
        }

        //alert("mode = " + mode +" processMode = " + processMode.toString());

    // save the state of the image orientation 

    orientation = VERTICAL;
    if (app.activeDocument.width >= app.activeDocument.height) 
        orientation = HORIZONTAL;

    // set the background selection specified in the file name, or default to #1
    
    BkIdx = '1';
    if (fname.search('_bk1') > 0) { BkIdx = '1'; }
    if (fname.search('_bk2') > 0) { BkIdx = '2'; }
    if (fname.search('_bk3') > 0) { BkIdx = '3'; }
    if (fname.search('_bk4') > 0) { BkIdx = '4'; }

    // read in the text configuration file.

    var dataFile = new File('c:/onsite/config.txt'); 

    if (!dataFile.exists) {
        alert("Missing configuration file\n" + "Looking for c:\\onsite\\config.txt");
        return FALSE;
    }

    dataFile.open('r');
    
    // #1 read the background/foreground folder name type ----------

    if( !dataFile.eof ){

        str =dataFile.readln()
        _len = str.length

        BkFolder = "";
        if (str.charAt(0) == '"') { 
            var i = 1;

            while (i < _len) {
                if (str.charAt(i) == '"') break;
                BkFolder = BkFolder + str.charAt(i);
                i++;
            }

        } else {
            BkFolder = "000";
        }

     }

    // #2 read the print size ------------------------------

    if( !dataFile.eof ){

        str =dataFile.readln();

        PrintSiz = parseInt(str);
        //alert ("Print size idx =" + PrintSiz );

    }

    // #3 Read the Xresolution

     if( !dataFile.eof ){

         str =dataFile.readln();

         // convert string to decimal

         xRes = parseInt(str);

         //alert ("xRes =" + xRes );
      }


    // #4 Read the Yresolution

     if( !dataFile.eof ){

         str =dataFile.readln();

         // convert string to decimal

         yRes = parseInt(str);

         //alert ("yRes =" + yRes );
      }

    // #5 Read the dpi ---------------------------------------

     if( !dataFile.eof ){

         str =dataFile.readln();

         // convert string to decimal

         dpi = parseInt(str);

         //alert ("DPI =" + dpi );
      }

    // #6 read the Greenscreen config --------------------------

    if( !dataFile.eof ){

        str =dataFile.readln();

        // no to greenscreen or custom
        if (str[0] == '0') { BkGrnd = '0' }

        // Yes to greenscreen
        if (str[0] == '1') { BkGrnd = '1' }

        //alert ("Greenscreen Enable =" + BkGrnd );
    
     }

    // #7 read the foreground overlay config --------------------

    if( !dataFile.eof ){

        str =dataFile.readln();

        // no to overlay
        if (str[0] == '0') { FGrnd = '0' }

        // Yes to overlay
        if (str[0] == '1') { FGrnd = '1' }

        //alert ("Overlay Enable =" + FGrnd );
    
     }

    // #8 read the File output only flag (no printing..) config ------------

    if( !dataFile.eof ){

        str =dataFile.readln();

        // no to overlay
        if (str[0] == '0') { NoPrt = '0' }

        // Yes to overlay
        if (str[0] == '1') { NoPrt = '1' }

        //alert ("File Output only =" + NoPrt );
    
     }

    // #9 read the ICC Profile name ---------------------------------------

    if( !dataFile.eof ){

        str = dataFile.readln();
        _len = str.length

        //alert ("profile = " + str + " str len=" + str.length);

        // check for a valid profile name, null out the target name

        profil = "";
        if (str.charAt(0) == '"') { 
            var i = 1;

            while (i < _len) {
                if (str.charAt(i) == '"') break;
                profil = profil + str.charAt(i);
                i++;
            }

            // null it out if its just a dash
            if (profil == "-") { profil = ""; }

        }

        // alert ("Profile Name = (" + profil + ")" );
    
     }

     //  #10 - Read the background count. 

     if( !dataFile.eof ){

        str = dataFile.readln();
        bkCount = parseInt(str);
     }

     //  #11 - bitfield indication each output size needing its own action 

     if( !dataFile.eof ){

        str = dataFile.readln();
        bkAction = parseInt(str);
     }


    // #12 read the background/foreground action set name ----------

     if( !dataFile.eof ){

        str =dataFile.readln()
        _len = str.length

        actionsetname = "";
        if (str.charAt(0) == '"') { 
            var i = 1;

            while (i < _len) {
                if (str.charAt(i) == '"') break;
                actionsetname = actionsetname + str.charAt(i);
                i++;
            }

        } else {
            actionsetname = "Onsite.Printing";
        }

        // alert("Action Set ='" + actionsetname + "'");
     }

    // #13 Save layered .PSD on output

     savepsd = TRUE;
     if( !dataFile.eof ){

        str = dataFile.readln();
        num = parseInt(str);

        if (num == 0) savepsd = FALSE;
     }

    // #14 Text layer color

     colorR = 0;
     colorG = 0;
     colorB = 0;

     if( !dataFile.eof ){

        str = dataFile.readln();
        colorR = parseInt(str);

        str = dataFile.readln();
        colorG = parseInt(str);

        str = dataFile.readln();
        colorB = parseInt(str);

     }

     // #15 Font Name

     if( !dataFile.eof ){

        str =dataFile.readln()
        _len = str.length

        fontname = "";
        if (str.charAt(0) == '"') { 
            var i = 1;

            while (i < _len) {
                if (str.charAt(i) == '"') break;
                fontname = fontname + str.charAt(i);
                i++;
            }

        } else {
            fontname = "Arial";
        }

        // convert to the photoshop name

        fontname = fontname.toUpperCase();

        for (i=0; i < app.fonts.length; i++) {
            str = app.fonts[i].name; 
            str = str.toUpperCase();
            if (str == fontname) {
                fontname = app.fonts[i].postScriptName;
                //alert (str + ' is ' + fontname);
                continue;
            }
        }

       // alert("Font ='" + fontname + "'");
     }

    // #16 GIF delay 

        if( !dataFile.eof ) {

            str = dataFile.readln();
            GifDelay = parseInt(str);
        }


    // #17 Printer Horz scale 

        if( !dataFile.eof ) {
            str = dataFile.readln();
            prtrHorzPCT = parseInt(str);
	    //alert("parsing #17: prtrHorzPCT = " + prtrHorzPCT);
        }


    // #18 Printer Vert scale 

        if( !dataFile.eof ) {
            str = dataFile.readln();
            prtrVertPCT = parseInt(str);
	    //alert("parsing #18: prtrVertPCT = " + prtrVertPCT);
        }


    // #19 Printer Horz scale 

        if( !dataFile.eof ) {

            str = dataFile.readln();
            prtrHorzOFF = parseInt(str);
        }

    // #20 Printer Horz scale 

        if( !dataFile.eof ) {

            str = dataFile.readln();
            prtrVertOFF = parseInt(str);
        }
        
    // #21 read the Filter  name ----------

     if( !dataFile.eof ){

        str =dataFile.readln()
        _len = str.length

        Filter1Name = "";
        if (str.charAt(0) == '"') { 
            var i = 1;

            while (i < _len) {
                if (str.charAt(i) == '"') break;
                Filter1Name = Filter1Name + str.charAt(i);
                i++;
            }

        } else {
            Filter1Name = "None";
        }

        // alert("Filter1Name ='" + Filter1Name + "'");
     }

    // #22 read the Filter set name ----------

     if( !dataFile.eof ){

        str =dataFile.readln()
        _len = str.length

        Filter1Set = "";
        if (str.charAt(0) == '"') { 
            var i = 1;

            while (i < _len) {
                if (str.charAt(i) == '"') break;
                Filter1Set = Filter1Set + str.charAt(i);
                i++;
            }

        } else {
            Filter1Set = "Onsite.Printing";
        }

        // alert("Filter1Set ='" + Filter1Set + "'");
     }

    // #23 read the Filter  name ----------

     if( !dataFile.eof ){

        str =dataFile.readln()
        _len = str.length

        Filter2Name = "";
        if (str.charAt(0) == '"') { 
            var i = 1;

            while (i < _len) {
                if (str.charAt(i) == '"') break;
                Filter2Name = Filter2Name + str.charAt(i);
                i++;
            }

        } else {
            Filter2Name = "None";
        }

        // alert("Filter2Name ='" + Filter2Name + "'");
     }

    // #24 read the Filter set name ----------

     if( !dataFile.eof ){

        str =dataFile.readln()
        _len = str.length

        Filter2Set = "";
        if (str.charAt(0) == '"') { 
            var i = 1;

            while (i < _len) {
                if (str.charAt(i) == '"') break;
                Filter2Set = Filter2Set + str.charAt(i);
                i++;
            }

        } else {
            Filter2Set = "Onsite.Printing";
        }

        // alert("Filter2Set ='" + Filter2Set + "'");
     }

    // #25 read the Filter  name ----------

     if( !dataFile.eof ){

        str =dataFile.readln()
        _len = str.length

        Filter3Name = "";
        if (str.charAt(0) == '"') { 
            var i = 1;

            while (i < _len) {
                if (str.charAt(i) == '"') break;
                Filter3Name = Filter3Name + str.charAt(i);
                i++;
            }

        } else {
            Filter3Name = "None";
        }

        // alert("Filter3Name ='" + Filter3Name + "'");
     }

    // #26 read the Filter set name ----------

     if( !dataFile.eof ){

        str =dataFile.readln()
        _len = str.length

        Filter3Set = "";
        if (str.charAt(0) == '"') { 
            var i = 1;

            while (i < _len) {
                if (str.charAt(i) == '"') break;
                Filter3Set = Filter3Set + str.charAt(i);
                i++;
            }

        } else {
            Filter3Set = "Onsite.Printing";
        }

        // alert("Filter3Set ='" + Filter3Set + "'");
     }

     // #27 Profile Timing Run

	if( !dataFile.eof ) {

            str = dataFile.readln();
            if (parseInt(str) == 1) timeRun = TRUE
        }

     dataFile.close();

    // calculate the Photoshop version

     num = parseInt(app.version);

     switch (num) {

        case 9:
            PSver = 'CS2'
            break;

        case 10:
            PSver = 'CS3'
            break;

        case 11:
            PSver = 'CS4'
            break;

        case 12:
            PSver = 'CS5'
            break;

        case 13:
            PSver = 'CS6'
            break;

        case 14:
        case 15:
        case 16:
        case 17:
        case 18:
        case 19:
	case 20: // future #
	case 21: // future #
            PSver = 'PSCC'
            break;

        default:
            alert ('Unknown version of Photoshop! (' + num + ')');
            break;

     }
     //alert ("version # = " + num + " known as " + PSver);

     if (BuildBkFgPath() == FALSE) return FALSE;
     return TRUE;

}


//////////////////////////////////////////////////////////////////////////
////////////////////////    loadImageTextFile   /////////////////////////////
//////////////////////////////////////////////////////////////////////////
//
// See if there is a matching text file to this image. If so then load it too.
//
function loadImageTextFile() 
{
var _len = 0;
var _n = 0;
var ftxtnam = fname;
var txtFile;
var str;

    // first build the extracted email/txtmsg name if it exists

    fname2 = fname2.toLowerCase()
    _n = fname2.search('_xqz') 
    if (_n > 0) { 
        fname2 = fname.slice(_n + 4);
        _n = fname2.search('.jpg')
        if (_n > 0) {
            fname2 = fname2.substr(0,_n)
        }
        //alert("new fname2 = " + fname2);
    }

    // debugging message
    if (DBG == TRUE) alert("LoadImageTextFile");

    // extract the machine name
    _n = ftxtnam.search('_n');
    MachineID = ftxtnam.substr(_n+2,3);
    // alert("Machine ID = " + MachineID);

    // extract the sequence number for the serial layer & Prefix the MachineID as a 3 character prefix
    SeqNumber  = fname.slice(0,5);
    SeqNumber2 = SeqNumber.substr(0,4) + '5';	// replace the 5th digit with the #5.
    SeqNumber  = MachineID + SeqNumber;		// prefix the machineIDs as
    SeqNumber2 = MachineID + SeqNumber2;

    // alert("Looking for " + ftxtnam);
    _len = ftxtnam.search('.jpg')
    ftxtnam = ftxtnam.substr(0,_len) + ".txt";

    // alert("Looking for " + ftxtnam);

    // read in the text configuration file.

    var txtFile = new File("c:\\onsite\\" + ftxtnam); 

    if (!txtFile.exists) {
        //alert (ftxtnam + " not found (okay)");
        return TRUE;
    }

    //alert("image text file found, now reading..");

    txtFile.open('r');
    
    // #1 printed count 

    if( !txtFile.eof ){

        str =txtFile.readln()

     }

    // #2 nothing.. 

    if( !txtFile.eof ){

        str =txtFile.readln();

    }

    // #3 nothing.. 

    if( !txtFile.eof ){

        str =txtFile.readln();

    }

    // #4 email address

     if( !txtFile.eof ){

         str =txtFile.readln();

      }

    // #5 Phone number

     if( !txtFile.eof ){

         str =txtFile.readln();

         // convert string to decimal

      }

    // #5 carrier index #

     if( !txtFile.eof ){

         str =txtFile.readln();

      }

    // #7 User text message

    if( !txtFile.eof ){

        message =txtFile.readln();
        // alert("Message ='" + message + "'");
     }

     txtFile.close();

     return TRUE;
}

//////////////////////////////////////////////////////////////////////////
////////////////////////    BuildBkFgPath    /////////////////////////////
//////////////////////////////////////////////////////////////////////////
//
// loads 'bkfile' with the path to the appropriate bk/fg file  
//

function BuildBkFgPath()
{
var str = "";
var test;

    // if this is a reprint, we don't use the background file, so bail now

        if (processMode == PRT_REPRINT)
            return TRUE;

    // first, save the folder as the action set name

        ActionSet = BkFolder

    // build the background file name

    if (orientation == VERTICAL) {

        bkfile = "c:/onsite/backgrounds/" + BkFolder + "/background" + BkIdx + ".vert.psd";

    } else {

        bkfile = "c:/onsite/backgrounds/" + BkFolder + "/background" + BkIdx + ".horz.psd";
    }

    var dataFile = new File(bkfile); 
    if (dataFile.exists) {
        dataFile = null;
        return TRUE;
    }

    // no background file, lets kill it now.
    dataFile = null;
    AlertNoGo();
    return FALSE;

}

//////////////////////////////////////////////////////////////////////////
////////////////////////     ResizeImage     /////////////////////////////
//////////////////////////////////////////////////////////////////////////
//
// Resizes the image, trying to handle the cases of aspect ratio changes.   
//

function ResizeImage(prtsz)
{
var h;
var w;

    // Based on the printer, resize the image

        // rotate as necessary 

        if (orientation == VERTICAL) app.activeDocument.rotateCanvas(90.0); 

        // now handle the special cases

        //alert("PrintSiz=" + prtsz + " xRes=" + xRes + " yRes=" + yRes + " dpi=" + dpi)

	w = parseInt(xRes / dpi);
	h = (yRes / dpi);
	if (prtsz != 1) h = parseInt(h);  // 3.5x5 needs decimal places, all others are integers

   	//alert("h=" + h + " w=" + w + " @" + dpi + " dpi");

        switch (prtsz) {

            case 0: // 6x9 @ default dpi, our interim working size
                doc.resizeImage(UnitValue(2700,"px"),null,defaultDPI,ResampleMethod.BICUBIC);
                doc.resizeCanvas(UnitValue(9,"in"),UnitValue(6,"in"),AnchorPosition.MIDDLECENTER);
                doc.resizeImage(UnitValue(2700,"px"),UnitValue(1800,"px"),defaultDPI,ResampleMethod.BICUBIC);
                break;

            case 1:  // 3.5x5
                doc.resizeImage(UnitValue(xRes,"px"),null,dpi,ResampleMethod.BICUBIC);
                doc.resizeCanvas(UnitValue(w,"in"),UnitValue(h,"in"),AnchorPosition.MIDDLECENTER);
                doc.resizeImage(UnitValue(xRes,"px"),UnitValue(yRes,"px"),dpi,ResampleMethod.BICUBIC);
                break;

            case 2:  // 2x6
                doc.resizeImage(UnitValue(xRes,"px"),null,dpi,ResampleMethod.BICUBIC);
                //doc.resizeCanvas(UnitValue(w,"in"),UnitValue(h,"in"),AnchorPosition.MIDDLECENTER);
                doc.resizeImage(UnitValue(xRes,"px"),UnitValue(yRes,"px"),dpi,ResampleMethod.BICUBIC);
                break;

            case 3:  // 4x6
                doc.resizeImage(UnitValue(xRes,"px"),null,dpi,ResampleMethod.BICUBIC);
                doc.resizeCanvas(UnitValue(w,"in"),UnitValue(h,"in"),AnchorPosition.MIDDLECENTER);
                doc.resizeImage(UnitValue(xRes,"px"),UnitValue(yRes,"px"),dpi,ResampleMethod.BICUBIC);
                break;

            case 4:  // 5x7
                doc.resizeImage(null,UnitValue(yRes,"px"),dpi,ResampleMethod.BICUBIC);
                doc.resizeCanvas(UnitValue(w,"in"),UnitValue(h,"in"),AnchorPosition.MIDDLECENTER);
                doc.resizeImage(UnitValue(xRes,"px"),UnitValue(yRes,"px"),dpi,ResampleMethod.BICUBIC);
                break;

            case 5:  // 6x8
                doc.resizeImage(null,UnitValue(yRes,"px"),dpi,ResampleMethod.BICUBIC);
                doc.resizeCanvas(UnitValue(w,"in"),UnitValue(h,"in"),AnchorPosition.MIDDLECENTER);
                doc.resizeImage(UnitValue(xRes,"px"),UnitValue(yRes,"px"),dpi,ResampleMethod.BICUBIC);
                break;

            case 6: // 6x9
                doc.resizeImage(UnitValue(xRes,"px"),null,dpi,ResampleMethod.BICUBIC);
                doc.resizeCanvas(UnitValue(w,"in"),UnitValue(h,"in"),AnchorPosition.MIDDLECENTER);
                doc.resizeImage(UnitValue(xRes,"px"),UnitValue(yRes,"px"),dpi,ResampleMethod.BICUBIC);
                break;

            case 7:  // 8x10
                doc.resizeImage(null,UnitValue(yRes,"px"),dpi,ResampleMethod.BICUBIC);
                doc.resizeCanvas(UnitValue(w,"in"),UnitValue(h,"in"),AnchorPosition.MIDDLECENTER);
                doc.resizeImage(UnitValue(xRes,"px"),UnitValue(yRes,"px"),dpi,ResampleMethod.BICUBIC);
                break;

            case 8:  // 8x12
                doc.resizeImage(UnitValue(xRes,"px"),null,dpi,ResampleMethod.BICUBIC);
                doc.resizeCanvas(UnitValue(w,"in"),UnitValue(h,"in"),AnchorPosition.MIDDLECENTER);
                doc.resizeImage(UnitValue(xRes,"px"),UnitValue(yRes,"px"),dpi,ResampleMethod.BICUBIC);
                break;

            case 9:  // 480x320
                //alert ('resizing to 480x320');
                doc.resizeImage(null,UnitValue(yRes,"px"),dpi,ResampleMethod.BICUBIC);
                doc.resizeCanvas(UnitValue(480,"px"),UnitValue(320,"px"),AnchorPosition.MIDDLECENTER);
                doc.resizeImage(UnitValue(xRes,"px"),UnitValue(yRes,"px"),null,ResampleMethod.BICUBIC);
                break;

            case 10:  // 640x427
                //alert(xRes + "x" + yRes + "@" + dpi + " dpi")
                doc.resizeImage(null,UnitValue(yRes,"px"),dpi,ResampleMethod.BICUBIC);
                doc.resizeCanvas(UnitValue(640,"px"),UnitValue(427,"px"),AnchorPosition.MIDDLECENTER);
                doc.resizeImage(UnitValue(xRes,"px"),UnitValue(yRes,"px"),null,ResampleMethod.BICUBIC);
                break;

            case 11:  // 640x480
                //alert("640x480" + xRes + "x" + yRes + "x" + dpi)
                doc.resizeImage(null,UnitValue(yRes,"px"),dpi,ResampleMethod.BICUBIC);
                doc.resizeCanvas(UnitValue(640,"px"),UnitValue(480,"px"),AnchorPosition.MIDDLECENTER);
                doc.resizeImage(UnitValue(xRes,"px"),UnitValue(yRes,"px"),null,ResampleMethod.BICUBIC);
                break;

            case 12:  // 800x600
                doc.resizeImage(null,UnitValue(yRes,"px"),dpi,ResampleMethod.BICUBIC);
                doc.resizeCanvas(UnitValue(800,"px"),UnitValue(600,"px"),AnchorPosition.MIDDLECENTER);
                doc.resizeImage(UnitValue(xRes,"px"),UnitValue(yRes,"px"),null,ResampleMethod.BICUBIC);
                break;

            case 13:  // 1024x768
                doc.resizeImage(null,UnitValue(yRes,"px"),dpi,ResampleMethod.BICUBIC);
                doc.resizeCanvas(UnitValue(1024,"px"),UnitValue(768,"px"),AnchorPosition.MIDDLECENTER);
                doc.resizeImage(UnitValue(xRes,"px"),UnitValue(yRes,"px"),null,ResampleMethod.BICUBIC);
                break;

            default:
                alert("Illegal print size in the config.txt file");
                return FALSE;
                break;

        }

        if (orientation == VERTICAL) app.activeDocument.rotateCanvas(-90.0);

        return TRUE;
}


////////////////////////////////////////////////////////////////////////////////
////////////////////////     ResizeImageToPaper    /////////////////////////////
////////////////////////////////////////////////////////////////////////////////
//
// Resizes the image to the actual paper by taking parameters from the config file.  
//
// This is needed by printers that crop 1/8" off the borders.  This code resizes
// the visible image layer down to fit within this paper cropping so not to lose
// any visible portion of the image. There are X,Y offsets too, for alignment.
//
function ResizeImageToPaper()
{
var startRulerUnits = preferences.rulerUnits;
var startTypeUnits = app.preferences.typeUnits;

    // return if 100% and no offsets
    if ((prtrHorzPCT == 100) && (prtrVertPCT == 100) && (prtrHorzOFF == 0) && (prtrVertOFF == 0)) return;

    //alert("pct=" + prtrHorzPCT + "," + prtrVertPCT + " Offset=" + prtrHorzOFF + "," + prtrVertOFF)

    // make sure we're talkin pixels
    preferences.rulerUnits = Units.PIXELS;
    preferences.typeUnits = TypeUnits.PIXELS;

    // flaten the image now, and then create a new top layer

    doAction ("JS:Flatten Image", "Onsite.Printing");
    doAction ("JS:New Layer", "Onsite.Printing");
    _resizeLayer(prtrHorzPCT , prtrVertPCT, false, prtrHorzOFF, prtrVertOFF, );

    // kill the background to eliminate visible duplication on edges
    doAction ("JS:BlankBackgroundLayer", "Onsite.Printing");	

    // debugging.  Save the actual data sent to the printer
    //doAction ("JS:SavePrintPSD", "Onsite.Printing");

    app.preferences.rulerUnits = startRulerUnits;
    app.preferences.typeUnits = startTypeUnits;
}

function _resizeLayer(WidthPCT , HeightPCT, Constrain, x, y)
{
var LayerBounds = activeDocument.activeLayer.bounds;

    // force constraints, then make it equal

    if(Constrain) HeightPCT = WidthPCT; 

    // resizes by percentage, so incoming params are good as-is
    activeDocument.activeLayer.resize(WidthPCT,HeightPCT,AnchorPosition.MIDDLECENTER); 

    // now move the layer by percentages + or -

    // the difference between where layer needs to be and is now  
    var deltaX = LayerBounds[0].value + x;  
    var deltaY = LayerBounds[1].value + y;  

    // move the layer into position  
    activeDocument.activeLayer.translate (deltaX, deltaY);  

}


//////////////////////////////////////////////////////////////////////////
////////////////////////      AlertNoGo      /////////////////////////////
//////////////////////////////////////////////////////////////////////////
//
// simple routine to throw an alert that this file format is not supported.   
//
function AlertNoGo()
{
var str = (orientation==VERTICAL) ? "Vertical" : "Horizontal";
alert ("Missing bk/fg file!\n" + str + " images are not supported\nfor this layout.");
}

