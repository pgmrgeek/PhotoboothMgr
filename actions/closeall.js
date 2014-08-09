
/////////////////////////////////////////////////////////////////////////////////////////
//
// Close all documents except pssetup.jpg
//
// Version 7.03
//
///
////////////////////////////////////////////////////////////////////////////////////////

if (app.documents.length > 0) {

    // alert (app.documents.length + ' documents open');

    var fname;
    var doc = app.activeDocument;               // fetch the current foreground document
  
    // simple while loop to close all documents starting with the active document working back 
    // to pssetup.jpg, if its loaded.

    while (app.documents.length > 0) {

        // if it's named "pssetup.jpg", we assume its the first file and exit.

        var fname = doc.name;           

        if (fname.search('pssetup.jpg') == 0) break;

        // alert (' closing the active document');

        doAction('JS:Close No Changes', 'Onsite.Printing');

        if (app.documents.length == 0) break;

        doc = app.activeDocument;

    } 


} 
