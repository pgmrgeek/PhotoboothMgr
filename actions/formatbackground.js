//////////////////////////////////////////////////////////////////////////////////
//
// PostViewBld - build up to 4 versions of the incoming image
//
//    This is executed via the Post View button to display up to 4 thumbnails
//    so all four versions can be seen before printing them.
///
/////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////
/////////////////////////  Global Variables //////////////////////////////
//////////////////////////////////////////////////////////////////////////

    var doc = activeDocument;
    var fname = doc.name;
    var BkIdx = '1'     		// background index
    var Printer = '1';			// 1=ds40, 2=sony updr150
    var PrintSiz = '1';			// 1=4x6, 2=5x7, 3=8x10
    var xRes = '0';			// x resolution
    var yres = '0';			// y resolution
    var dpi  = '0';			// DPI dots per inch..
    var BkGrnd = '0';                   // 0= nothing, 1 = greenscreen, 2 = separate
    var FGrnd = '0';			// 0= nothing, 1 = overlay
    var profil = '-';			// string name of the profile
    var NoPrt = '0';                    // 1 = file output only
    var bkCount = 1;			// defaults to at least one background/foreground
    var str;				// for reading from file

    var vertical = 0;			
    var horizontal = 1;
    var orientation;    		// vertical or horizontal
    var bkfile;                         // string name of the background file
    var fileRef;			// file handle of the actual file

//////////////////////////////////////////////////////////////////////////
/////////////////////////    Process File   //////////////////////////////
//////////////////////////////////////////////////////////////////////////

if (app.documents.length > 0) { 

    // load the config.txt file into variables

        loadConfigFile();

   // Resize to the target size

 	ResizeImage();

}

//////////////////////////////////////////////////////////////////////////
//////////////////    create the post view image   ///////////////////////
//////////////////////////////////////////////////////////////////////////

function createpostview(fnum,str)
{

	//alert("loading background from " + str)

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
////////////////////////    loadConfigFile   /////////////////////////////
//////////////////////////////////////////////////////////////////////////
//
// Reads the config.txt file into the global variables.  
//
//

function loadConfigFile() {

    // save the state of the image orientation 

    orientation = vertical;
    if (app.activeDocument.width >= app.activeDocument.height) 
        orientation = horizontal;

    // set the background selection specified in the file name, or default to #1
    
    if (fname.search('_bk1') > 0) { BkIdx = '1'; }
    if (fname.search('_bk2') > 0) { BkIdx = '2'; }
    if (fname.search('_bk3') > 0) { BkIdx = '3'; }
    if (fname.search('_bk4') > 0) { BkIdx = '4'; }

    // build the background file name

    if (orientation == vertical) {

	bkfile = "c:/onsite/backgrounds/background" + BkIdx + ".vert.psd";

    } else {

	bkfile = "c:/onsite/backgrounds/background" + BkIdx + ".horz.psd";
    }

    // read in the text configuration file.

    var dataFile = new File('c:/onsite/config.txt'); 

    dataFile.open('r');
    
    // #1 read the printer type ---------------------------------------------

    if( !dataFile.eof ){

        str =dataFile.readln()	// ignore this, was useful in prior version..

     }

    // #2 read the print size ---------------------------------------------

    if( !dataFile.eof ){

        str =dataFile.readln()

	PrintSiz = parseInt(str)

     }

    // #3 Read the Xresolution

     if( !dataFile.eof ){

         str =dataFile.readln()

         // convert string to decimal

         xres = parseInt(str)

         //alert ("xRes =" + xres );
      }


    // #4 Read the Yresolution

     if( !dataFile.eof ){

         str =dataFile.readln()

         // convert string to decimal

         yres = parseInt(str)

         //alert ("yRes =" + yres );
      }

    // #5 Read the dpi

     if( !dataFile.eof ){

         str =dataFile.readln()

         // convert string to decimal

         dpi = parseInt(str)

         //alert ("DPI =" + dpi );
      }


    // #6 read the Greenscreen config ---------------------------------------

    if( !dataFile.eof ){

        str =dataFile.readln()

        // no to greenscreen or custom
        if (str[0] == '0') { BkGrnd = '0' }

        // Yes to greenscreen
        if (str[0] == '1') { BkGrnd = '1' }

        // Yes to custom
        //if (str[0] == '2') { BkGrnd = '2' }

        //alert ("Greenscreen Enable =" + BkGrnd );
    
     }

    // #7 read the foreground overlay config ---------------------------------------

    if( !dataFile.eof ){

        str =dataFile.readln()

        // no to overlay
        if (str[0] == '0') { FGrnd = '0' }

        // Yes to overlay
        if (str[0] == '1') { FGrnd = '1' }

        //alert ("Overlay Enable =" + FGrnd );
    
     }

    // #8 read the File output only flag (no printing..) config ---------------------------------------

    if( !dataFile.eof ){

        str =dataFile.readln()

        // no to overlay
        if (str[0] == '0') { NoPrt = '0' }

        // Yes to overlay
        if (str[0] == '1') { NoPrt = '1' }

        //alert ("File Output only =" + NoPrt );
    
     }

    // #9 read the ICC Profile name ---------------------------------------

    if( !dataFile.eof ){

        str = dataFile.readln()
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

        str = dataFile.readln()
	bkCount = parseInt(str)
     }

     dataFile.close()
}

function ResizeImage()
{

    // Based on the printer, resize the image

        // rotate as necessary 

        if (orientation == vertical) app.activeDocument.rotateCanvas(90.0); 

	// now handle the special cases

        //alert("PrintSiz=" + PrintSiz + " xres" + xres + " yres" + yres + " dpi" + dpi)

	switch (PrintSiz) {

	    case 1:  // 3.5x5
	        doc.resizeImage(UnitValue(xres,"px"),null,dpi,ResampleMethod.BICUBIC);
	        doc.resizeCanvas(UnitValue(5,"in"),UnitValue(3.5,"in"),AnchorPosition.MIDDLECENTER);
	        doc.resizeImage(UnitValue(xres,"px"),UnitValue(yres,"px"),null,ResampleMethod.BICUBIC);
	    	break;

	    case 2:  // 2x6
 		doc.resizeImage(UnitValue(xres,"px"),null,dpi,ResampleMethod.BICUBIC);
	        doc.resizeCanvas(UnitValue(6,"in"),UnitValue(2,"in"),AnchorPosition.MIDDLECENTER);
	        doc.resizeImage(UnitValue(xres,"px"),UnitValue(yres,"px"),null,ResampleMethod.BICUBIC);
	        break;

	    case 3:  // 4x6
		doc.resizeImage(UnitValue(xres,"px"),null,dpi,ResampleMethod.BICUBIC);
	        doc.resizeCanvas(UnitValue(6,"in"),UnitValue(4,"in"),AnchorPosition.MIDDLECENTER);
	        doc.resizeImage(UnitValue(xres,"px"),UnitValue(yres,"px"),null,ResampleMethod.BICUBIC);
	    	break;

	    case 4:  // 5x7
	        doc.resizeImage(null,UnitValue(yres,"px"),dpi,ResampleMethod.BICUBIC);
	        doc.resizeCanvas(UnitValue(7,"in"),UnitValue(5,"in"),AnchorPosition.MIDDLECENTER);
	        doc.resizeImage(UnitValue(xres,"px"),UnitValue(yres,"px"),null,ResampleMethod.BICUBIC);
	        break;

	    case 5:  // 6x8
	        doc.resizeImage(null,UnitValue(yres,"px"),dpi,ResampleMethod.BICUBIC);
	        doc.resizeCanvas(UnitValue(8,"in"),UnitValue(6,"in"),AnchorPosition.MIDDLECENTER);
	        doc.resizeImage(UnitValue(xres,"px"),UnitValue(yres,"px"),null,ResampleMethod.BICUBIC);
	        break;

	    case 6: // 6x9
	        doc.resizeImage(UnitValue(xres,"px"),null,dpi,ResampleMethod.BICUBIC);
	        doc.resizeCanvas(UnitValue(9,"in"),UnitValue(6,"in"),AnchorPosition.MIDDLECENTER);
	        doc.resizeImage(UnitValue(xres,"px"),UnitValue(yres,"px"),null,ResampleMethod.BICUBIC);
	        break;

	    case 7:  // 8x10
	        doc.resizeImage(null,UnitValue(yres,"px"),dpi,ResampleMethod.BICUBIC);
	        doc.resizeCanvas(UnitValue(10,"in"),UnitValue(8,"in"),AnchorPosition.MIDDLECENTER);
	        doc.resizeImage(UnitValue(xres,"px"),UnitValue(yres,"px"),null,ResampleMethod.BICUBIC);
	        break;

	    case 8:  // 8x12
	        doc.resizeImage(UnitValue(xres,"px"),null,dpi,ResampleMethod.BICUBIC);
	        doc.resizeCanvas(UnitValue(12,"in"),UnitValue(8,"in"),AnchorPosition.MIDDLECENTER);
	        doc.resizeImage(UnitValue(xres,"px"),UnitValue(yres,"px"),null,ResampleMethod.BICUBIC);
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
	        alert("Illegal printsiz in config.txt file");
	        break;

	}

	if (orientation == vertical) app.activeDocument.rotateCanvas(-90.0);

}

