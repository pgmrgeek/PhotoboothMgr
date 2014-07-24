
/////////////////////////////////////////////////////////////////////////////////////////
//
// automaticmode - The javascript smarts of pic2print. 
//
// Version 7.02
//
//    This module reads the config file, then processes the activeDocument
//    for all features.
///
////////////////////////////////////////////////////////////////////////////////////////

// constants as #defines

    var TRUE = 1;			// obvious..
    var FALSE = 0;
    var VERTICAL = 0;			
    var HORIZONTAL = 1;
    var PRT_LOAD = 0;
    var PRT_PRINT = 1;
    var PRT_GIF = 2;
    var BIT_VERT_SUPPORTED =  0x100;
    var BIT_VBGFG_ACTION   =  0x200;
    var BIT_VPRT_ACTION    =  0x400;
    var BIT_HORZ_SUPPORTED = 0x1000;
    var BIT_HBGFG_ACTION   = 0x2000;
    var BIT_HPRT_ACTION    = 0x4000;

    var PostBuild = TRUE;		// this splits this functionality between automatic
					// processing and just for post-view builds.  I do
					// this to keep the number of files down.


//////////////////////////////////////////////////////////////////////////
/////////////////////////  Global Variables //////////////////////////////
//////////////////////////////////////////////////////////////////////////

    // whats given to us from PS
    var doc = activeDocument;		// fetch the current foreground document
    var fname = doc.name;		// and its name..
    var processMode = PRT_PRINT;	// processing this file as a

    // data read from the config.txt file
    var PrintSiz = '1';			// 1=4x6, 2=5x7, 3=8x10
    var xRes = '0';			// x resolution
    var yres = '0';			// y resolution
    var dpi  = '0';			// DPI dots per inch..
    var BkGrnd = '0';			// 0= nothing, 1 = greenscreen, 2 = separate
    var FGrnd = '0';                    // 0= nothing, 1 = overlay
    var profil = '-';			// string name of the profile
    var NoPrt = '0';                    // 1 = file output only
    var savePSD = TRUE;  		// default to saving a layered .PSD as output
    var bkCount = 1;			// defaults to at least one background/foreground
    var bkAction = 0;			// the background has its own custom action
    var actionsetname = 
		"Onsite.Printing";      // custom action set name
    var message = "";			// message to be place in a text layer

    // bk/fg file variable
    var bkfile;                         // string name of the background file
    var BkIdx = '1'     		// background index
    var BkFolder = '000';		// Background/foreground folder top level folder
    var ActionSet = '000';		// Action Set that goes with the folder
    var CustomAction = "";              // The synthesized action name.
    var orientation;    		// TBD on loadconfig - vertical or horizontal

    // testing variables
    var timeRun = FALSE;   		// set to TRUE to do time analysis
    var millstart;
    var millstop1;
    var millstop2;
    var mtime;

//////////////////////////////////////////////////////////////////////////
/////////////////////////    Process File   //////////////////////////////
//////////////////////////////////////////////////////////////////////////

if (app.documents.length > 0) { 

var keepgoing = TRUE;

    // time the processing

	if (timeRun == TRUE) TimeImageStart();

    // process the file name and config file

	keepgoing = loadConfigFile();

    // build the selector to a specific aspect ratio action set

	BuildCustomActionName();

    // Load the image's text file to load the message to be placed in a text layer

	if (keepgoing == TRUE)
	    keepgoing = loadImageTextFile();

    // Resize to the target size

 	if (keepgoing == TRUE)
	    keepgoing = ResizeImage(0);    // resizes to our working 6x9x300dpi size

    // boost shadows by 15%

        doAction ('JS:more midtones 15%', 'Onsite.Printing');

   // do the greenscreen background

	if (keepgoing == TRUE) 
	    keepgoing = ProcessBackground();

    // do the foreground overlay

	if (keepgoing == TRUE) 
	    keepgoing = ProcessForeGround();

    // run the customization

	if (keepgoing == TRUE) 
	    keepgoing = ProcessCustomAction();

	if (timeRun == TRUE) TimeImageStop();

    // Done with the image processing, now do the output 

	if (PostBuild == TRUE) {

	    // special case of just viewing the post-process image.

	    ProcessPostViewImages();

        } else { 

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

	    //alert ("Custom Action = " + '"' + CustomAction + '"' );
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
	}

    return TRUE;
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

	    if ((xres > 1024) || (yres > 1024)) {

    	    	//alert("Forced resizing to default GIF");

        	if (orientation == VERTICAL) app.activeDocument.rotateCanvas(90.0); 

	        doc.resizeImage(null,UnitValue(480,"px"),160,ResampleMethod.BICUBIC);
		//doc.resizeCanvas(UnitValue(4,"in"),UnitValue(3,"in"),AnchorPosition.MIDDLECENTER);
		//doc.resizeImage(UnitValue(640,"px"),UnitValue(480,"px"),null,ResampleMethod.BICUBIC);

		if (orientation == VERTICAL) app.activeDocument.rotateCanvas(-90.0);

	    }

    	    // Save both the files in the printed folder

    	    //alert(".gif save");
       	    doAction('JS:GIF Save', 'Onsite.Printing');

	    if (savePSD == TRUE) 
                doAction('JS:Save PSD File', 'Onsite.Printing');

            doAction('JS:Save JPG File', 'Onsite.Printing');

    	    //alert(".gif save done");

	} else {  // not gif, so print/save it

	    // 2nd resize - to the printer output size

		ResizeImage(PrintSiz);    // resize to the printer print size

            // Save the files in the printed folder

	    if (savePSD == TRUE) 
               doAction('JS:Save PSD File', 'Onsite.Printing');

            doAction('JS:Save JPG File', 'Onsite.Printing');

    	    // if "File Output Only" = 0, Print the image

            if (NoPrt == '0')   {

		// the name may possess the print count, so extract it

		if (fname.search('_p2')  > 0) { prtcnt = 2; }
		if (fname.search('_p3')  > 0) { prtcnt = 3; }
		if (fname.search('_p4')  > 0) { prtcnt = 4; }
		if (fname.search('_p5')  > 0) { prtcnt = 5; }
		if (fname.search('_p6')  > 0) { prtcnt = 6; }
		if (fname.search('_p7')  > 0) { prtcnt = 7; }
		if (fname.search('_p8')  > 0) { prtcnt = 8; }
		if (fname.search('_p9')  > 0) { prtcnt = 9; }
		if (fname.search('_p10') > 0) { prtcnt = 10;}

                // possibly convert its profile to the target printer profile

                if (profil != "") {
                     // alert ("converting to profile " + profil );
                     activeDocument.convertProfile( profil, Intent.RELATIVECOLORIMETRIC, true, true );

                }

                // no printing is false, so print it!

	        if (orientation == VERTICAL) app.activeDocument.rotateCanvas(90.0); 
    
		while (prtcnt > 0) {
                    doAction('JS:Print One Copy', 'Onsite.Printing');
		    prtcnt = prtcnt - 1;
		}

	        if (orientation == VERTICAL) app.activeDocument.rotateCanvas(-90.0); 

            }
	}

    } 
}


//////////////////////////////////////////////////////////////////////////
/////////////////     ProcessPostViewImages     //////////////////////////
//////////////////////////////////////////////////////////////////////////
//
// Builds a string with the action specified by both the config.txt file
// and the incoming file name.   
//
function ProcessPostViewImages()
{

    // copy the layer here, then close the file

        doAction('JS:Add Border', 'Onsite.Printing');
        doAction('JS:Copy Layer', 'Onsite.Printing');
        doAction('JS:Close', 'Onsite.Printing');

    // fix up the background file extension

        if (orientation == VERTICAL) {

	    bkfile = ".vert.psd";

        } else {

	    bkfile = ".horz.psd";
        }

    // process the first background file

	createpostview(1,"c:/onsite/backgrounds/" + BkFolder + "/background1" + bkfile);

    // process the second background file

	if (bkCount >= 2) {

	    createpostview(2,"c:/onsite/backgrounds/" + BkFolder + "/background2" + bkfile);

	}

    // process the third background file

	if (bkCount >= 3) {

	    createpostview(3,"c:/onsite/backgrounds/" + BkFolder + "/background3" + bkfile);

 	}

    // process the forth background file

        if (bkCount == 4) {

	    createpostview(4,"c:/onsite/backgrounds/" + BkFolder + "/background4" + bkfile);

        }


}


////////////////////////////////////////////////////////////////////////////
////////////////////////    createpostview     /////////////////////////////
////////////////////////////////////////////////////////////////////////////
//
// subroutine for ProcessPostViewImages
//
function createpostview(fnum,str)
{

	// alert("loading background from " + str)

    	fileRef = new File( str );

        if (fileRef.exists) {

    	    open (fileRef);

	    doAction('JS:Paste Layer', 'Onsite.Printing');

            if (FGrnd == '0')
                doAction('JS:Turn off foreground', 'Onsite.Printing');

	    switch(fnum) {
		case 1:
	        doAction('JS:Save Preview 1', 'Onsite.Printing');
		break;
		case 2:
	        doAction('JS:Save Preview 2', 'Onsite.Printing');
		break;
		case 3:
	        doAction('JS:Save Preview 3', 'Onsite.Printing');
		break;
		case 4:
	        doAction('JS:Save Preview 4', 'Onsite.Printing');
		break;
	    }


       } else {

	    alert ( str + " not found!");

       }
       fileRef = null;
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
var sRatio;
var subst;

    // map the print size to an aspect ratio. That ratio is the file folder
    // for the matching BgFg file

	switch (PrintSiz) {

	    case 7:  // 8x10	
		sRatio = "125";
	    	break;

	    case  5:  // 6x8
            case 10:  // 640x480
            case 11:  // 800x600
            case 12:  // 1024x768
		sRatio = "133";
	    	break;

	    case  1:  // 3.5x5
	    case  4:  // 5x7
		sRatio = "140";
	    	break;

	    case  0: // 6x9x300 dpi, our default state
	    case  3: // 4x6
	    case  6: // 6x9
	    case  8: // 8x12
            case  9: // 480x320
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

            sOrient = 'V';
	    if (processMode == PRT_PRINT) {
	        if (bkAction & BIT_VBGFG_ACTION) sOrient = sOrient + BkIdx;
		if (bkAction & BIT_VPRT_ACTION)  sOrient = sOrient + ":" + sRatio;
	    } 

        } else {

            sOrient = 'H';
	    if (processMode == PRT_PRINT) {
	        if (bkAction & BIT_HBGFG_ACTION) sOrient = sOrient + BkIdx;
		if (bkAction & BIT_HPRT_ACTION)  sOrient = sOrient + ":" + sRatio;
	    } 
        }

    // here is the base line action to be executed

	CustomAction = 'JS:' + ActionSet + ':' + mode + ':' + sOrient; 
	//alert("CustomAction = " + '"' + CustomAction + '"');
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

    _len = fname.search('.jpg')

    // convert the file name _mX into working parameters

	processMode = PRT_PRINT;
	mode = 'Print';
	if (fname.search('_m0') > 0) { 
	    processMode = PRT_LOAD;
	    mode = 'Load' 
	}
	if (fname.search('_m1') > 0) { 
	    processMode = PRT_PRINT;
	    mode = 'Print' 
	}
	if (fname.search('_m2') > 0) { 
	    processMode = PRT_GIF;
	    mode = 'GIF' 
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

         xres = parseInt(str);

         //alert ("xRes =" + xres );
      }


    // #4 Read the Yresolution

     if( !dataFile.eof ){

         str =dataFile.readln();

         // convert string to decimal

         yres = parseInt(str);

         //alert ("yRes =" + yres );
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

     dataFile.close();

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
var ftxtnam = fname;
var txtFile;
var str;

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

    // Based on the printer, resize the image

        // rotate as necessary 

        if (orientation == VERTICAL) app.activeDocument.rotateCanvas(90.0); 

	// now handle the special cases

        //alert("PrintSiz=" + prtsz + " xres" + xres + " yres" + yres + " dpi" + dpi)

	switch (prtsz) {

	    case 0: // 6x9x300 dpi, our default state

		if(1) {
	        doc.resizeImage(UnitValue(2700,"px"),null,300,ResampleMethod.BICUBIC);
	        doc.resizeCanvas(UnitValue(9,"in"),UnitValue(6,"in"),AnchorPosition.MIDDLECENTER);
	        doc.resizeImage(UnitValue(2700,"px"),UnitValue(1800,"px"),300,ResampleMethod.BICUBIC);

		} else { // testing smaller sizes. remember to change the bk/fg files to this size too

	        doc.resizeImage(UnitValue(1844,"px"),null,dpi,ResampleMethod.BICUBIC);
	        doc.resizeCanvas(UnitValue(6,"in"),UnitValue(4,"in"),AnchorPosition.MIDDLECENTER);
	        doc.resizeImage(UnitValue(1844,"px"),UnitValue(1240,"px"),null,ResampleMethod.BICUBIC);
		}
	        break;

	    case 1:  // 3.5x5
	        doc.resizeImage(UnitValue(xres,"px"),null,300,ResampleMethod.BICUBIC);
	        doc.resizeCanvas(UnitValue(5,"in"),UnitValue(3.5,"in"),AnchorPosition.MIDDLECENTER);
	        doc.resizeImage(UnitValue(xres,"px"),UnitValue(yres,"px"),dpi,ResampleMethod.BICUBIC);
	    	break;

	    case 2:  // 2x6
 		doc.resizeImage(UnitValue(xres,"px"),null,300,ResampleMethod.BICUBIC);
	        //doc.resizeCanvas(UnitValue(6,"in"),UnitValue(2,"in"),AnchorPosition.MIDDLECENTER);
	        doc.resizeImage(UnitValue(xres,"px"),UnitValue(yres,"px"),dpi,ResampleMethod.BICUBIC);
	        break;

	    case 3:  // 4x6
		doc.resizeImage(UnitValue(xres,"px"),null,300,ResampleMethod.BICUBIC);
	        doc.resizeCanvas(UnitValue(6,"in"),UnitValue(4,"in"),AnchorPosition.MIDDLECENTER);
	        doc.resizeImage(UnitValue(xres,"px"),UnitValue(yres,"px"),dpi,ResampleMethod.BICUBIC);
	    	break;

	    //case 4:  // 5x7
	    //    doc.resizeImage(null,UnitValue(yres,"px"),dpi,ResampleMethod.BICUBIC);
	    //    doc.resizeCanvas(UnitValue(7,"in"),UnitValue(5,"in"),AnchorPosition.MIDDLECENTER);
	    //    doc.resizeImage(UnitValue(xres,"px"),UnitValue(yres,"px"),null,ResampleMethod.BICUBIC);
	    //    break;

	    case 4:  // 5x7
	        doc.resizeImage(null,UnitValue(yres,"px"),300,ResampleMethod.BICUBIC);
	        doc.resizeCanvas(UnitValue(7,"in"),UnitValue(5,"in"),AnchorPosition.MIDDLECENTER);
	        doc.resizeImage(UnitValue(xres,"px"),UnitValue(yres,"px"),dpi,ResampleMethod.BICUBIC);
	        break;

	    case 5:  // 6x8
	        doc.resizeImage(null,UnitValue(yres,"px"),300,ResampleMethod.BICUBIC);
	        doc.resizeCanvas(UnitValue(8,"in"),UnitValue(6,"in"),AnchorPosition.MIDDLECENTER);
	        doc.resizeImage(UnitValue(xres,"px"),UnitValue(yres,"px"),dpi,ResampleMethod.BICUBIC);
	        break;

	    case 6: // 6x9
	        doc.resizeImage(UnitValue(xres,"px"),null,300,ResampleMethod.BICUBIC);
	        doc.resizeCanvas(UnitValue(9,"in"),UnitValue(6,"in"),AnchorPosition.MIDDLECENTER);
	        doc.resizeImage(UnitValue(xres,"px"),UnitValue(yres,"px"),dpi,ResampleMethod.BICUBIC);
	        break;

	    case 7:  // 8x10
	        doc.resizeImage(null,UnitValue(yres,"px"),300,ResampleMethod.BICUBIC);
	        doc.resizeCanvas(UnitValue(10,"in"),UnitValue(8,"in"),AnchorPosition.MIDDLECENTER);
	        doc.resizeImage(UnitValue(xres,"px"),UnitValue(yres,"px"),dpi,ResampleMethod.BICUBIC);
	        break;

	    case 8:  // 8x12
	        doc.resizeImage(UnitValue(xres,"px"),null,300,ResampleMethod.BICUBIC);
	        doc.resizeCanvas(UnitValue(12,"in"),UnitValue(8,"in"),AnchorPosition.MIDDLECENTER);
	        doc.resizeImage(UnitValue(xres,"px"),UnitValue(yres,"px"),dpi,ResampleMethod.BICUBIC);
	        break;

            case 9:  // 480x320
	        doc.resizeImage(null,UnitValue(yres,"px"),dpi,ResampleMethod.BICUBIC);
		doc.resizeCanvas(UnitValue(3,"in"),UnitValue(2,"in"),AnchorPosition.MIDDLECENTER);
		doc.resizeImage(UnitValue(xres,"px"),UnitValue(yres,"px"),null,ResampleMethod.BICUBIC);
	    	break;

            case 10:  // 640x480
		//alert("640x480" + xres + "x" + yres + "x" + dpi)
	        doc.resizeImage(null,UnitValue(yres,"px"),dpi,ResampleMethod.BICUBIC);
		doc.resizeCanvas(UnitValue(4,"in"),UnitValue(3,"in"),AnchorPosition.MIDDLECENTER);
		doc.resizeImage(UnitValue(xres,"px"),UnitValue(yres,"px"),null,ResampleMethod.BICUBIC);
	    	break;

            case 11:  // 800x600
	        doc.resizeImage(null,UnitValue(yres,"px"),dpi,ResampleMethod.BICUBIC);
		doc.resizeCanvas(UnitValue(4,"in"),UnitValue(3,"in"),AnchorPosition.MIDDLECENTER);
		doc.resizeImage(UnitValue(xres,"px"),UnitValue(yres,"px"),null,ResampleMethod.BICUBIC);
	    	break;

            case 12:  // 1024x768
	        doc.resizeImage(null,UnitValue(yres,"px"),dpi,ResampleMethod.BICUBIC);
		doc.resizeCanvas(UnitValue(4,"in"),UnitValue(3,"in"),AnchorPosition.MIDDLECENTER);
		doc.resizeImage(UnitValue(xres,"px"),UnitValue(yres,"px"),null,ResampleMethod.BICUBIC);
	    	break;

	    default:
	        alert("Illegal print size in the config.txt file");
		return FALSE;
	        break;

	}

	if (orientation == VERTICAL) app.activeDocument.rotateCanvas(-90.0);

	return TRUE;
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
var n;
var msg
d = new Date(); 
millstop2 = d.getTime();
n = millstop1 - millstart;
msg = "process time =" + n;
n =  millstop2 - millstop1;
msg = msg + "\nsave time =" + n;
n = millstop2 - millstart 
msg = msg + "\ntotal time =" + n;
alert(msg);
}