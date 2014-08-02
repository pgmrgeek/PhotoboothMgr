Email Setup
===========

Copyright (c) 2014. Bay Area Event Photography.  All Rights Reserved

Email configuration found in the Configuration Panel.

The following fields must be setup for emails to be sent. This assumes the operator has
access to a pop3 mail server.

#1 - Server URL: ex mail.yahoo.com
Enter the server name, such as mail.<yourdomain>.com.

#2 - Server Outgoing Port #
Historical default setting is port 25, but port 26 is very common.

#3 - Account Name (likely the email addr..)
This is not the senders name (first name, last name) but most likely the email address
of the sender. Thats how it works on many pop3 servers.  You can use your own email
address and use your password on the next field.

#4 - Password
Obvious. If you're not sure of your typing, check the box below, "Show Password" to
make sure its typed correctly, then uncheck the box.

#5 - Sender Email Address (FROM addr)
Now, this is the actual senders email address, and again most likely the same as the
above Account Name.

#6 - Recipient email address (TO addr). BLank=no emailing.
If you target one email address for all emails, then enter it here. Multiple email
addresses can be entered, separated by commas. 

The guests can enter their email addresses on the Preview and Post View forms, and 
Pic2print will send emails to those addresses as well. Again, multiple email
addresses can be entered, separated by commas.

NOTE: if you dont want to send emails to one account, but do want guests to send emails 
to themselves, leave this field blank.  The images will be set to the user email
email addresses they enter in the Preview/Post View forms.  

NOTE: The guest email addresses entered in the Preview/Post View forms are saved 
in the image config.txt files in the "c:\OnSite\capture" folder.  This config file 
acts as a simple meta data file, following the .JPG file through the system and ends 
up in the "c:\OnSite\orig" folder.

#7 Subject Line (caption for Facebook)
This is the email subject line.

Checkbox - Create connection log for debugging. 
If checked, a log file named "c:\OnSite\software\email.log" will be created for 
all emails sent with verbose messages, for the purposes of debugging.




