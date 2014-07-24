//////////////////////////////////////////////////////////////////////////////////
// 
//// 

if (app.documents.length == 0) 
{ 
    alert("You must have at least one open document to run this script!"); 
}
else {

    doc = activeDocument;
    
    //alert ( "BAEP opened " );

    if (doc.height > doc.width) {

	var s = "c:/onsite/backgrounds/background" + doc.info.jobName + ".vert.psd";
    

    } else {

	var s = "c:/onsite/backgrounds/background" + doc.info.jobName + ".horz.psd";
    }

    var fileRef = new File( s );
    open (fileRef);
    fileRef = null;
    doAction('Load Background', 'Onsite.Printing');

}