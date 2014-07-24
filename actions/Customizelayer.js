//////////////////////////////////////////////////////////////////////////////////
// 
//

if (app.documents.length == 0) 
{ 
    alert("You must have at least one open document to run this script!"); 
}
else {

    doc = activeDocument;

    if (doc.height > doc.width) {

       doAction('JS:Customize:vert', 'Onsite.Printing');

    } else {

       doAction('JS:Customize:horz', 'Onsite.Printing');

    }
}