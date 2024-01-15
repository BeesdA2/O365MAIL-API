const { getMaillog } = require("./getMaillogDb.js");
const { getMailAtt } = require("./getMailAttDb.js");
const { getMailVar } = require("./getMailVarDb.js");
 
const { updateMaillogResponse } = require("./updateMaillogDb.js");
const { updateMaillogErrorResponse } = require("./updateMaillogDb.js"); 
const { updateMaillogResponseWithResponseData} = require("./updateMaillogDb.js");
const axios = require('axios');
const qs = require('qs');
const atob = require('atob');
const btoa = require('btoa');
const handlebars = require("handlebars");
 
var mailnr = process.argv[2];


 

// Wegschrijven naar log 	
console.log('mailnr: '  + mailnr ); 
 
 
async function sendRequest (mailnr) {
  try {
  // Ophalen gegevens Endpoint
   
  const respMaillog   	= await getMaillog(mailnr);
  const respMailAtt   	= await getMailAtt(mailnr);
  const respMailVar   	= await getMailVar(mailnr);
   
  
 // wacht op antwoord functies
 let resultMaillog = await respMaillog;
 let resultMailAtt = await respMailAtt;
 let resultMailVar = await respMailVar;

let mailpgm  = resultMaillog ? resultMaillog[0].MAILPGM : [];
let mailfrom = resultMaillog[0].MAILFROM.trim();  
let mailto   = resultMaillog[0].MAILTO.trim(); 
let mailcc   = resultMaillog[0].MAILCC.trim(); 
let mailbcc = resultMaillog[0].MAILBCC.trim(); 
let mail_subject = resultMaillog[0].MAIL_SUBJECT.trim();
let mail_isdraft = resultMaillog[0].MAIL_ISDRAFT.trim(); 
let mail_savetosentitems = resultMaillog[0].MAIL_SAVETOSENTITEMS.trim();  

let requestMethod = resultMaillog[0].REQUESTMETHOD.trim();
let requestURL =  resultMaillog[0].REQUESTURL.trim();
let requestPARAMETERS =  resultMaillog[0].REQUESTPARAMETERS.trim();
let requestToken   = resultMaillog[0].REQUESTTOKEN.trim();

let verwerkt =  resultMaillog[0].VERWERKT;
//let requestTemplateBefore = resultMaillog[0].REQUESTBODYCONTENT.trim();

const atob = require('atob');
let signatureImage = atob(resultMaillog[0].MAIL_IMAGE);
let requestTemplateBefore =  atob(resultMaillog[0].MAIL_TEMPLATE);
if (signatureImage !== "")
{
requestTemplateBefore = requestTemplateBefore + '<img  src=\"cid:signatureImage\">';
}
//console.log(requestTemplateBefore);
let template = handlebars.compile(requestTemplateBefore);
//let dataBinding = {
 //       naam_klant: 'Tjeu Bollen',
//		model: 'XC40 Recharge T4',
//		afleverdatum: '12 november 2020',
//		aflevertijd: '14:30',
		//verkoop_factuurbedrag: '49.995,00',
//		omwisseldatum: '11 november 2020',
//		verkoper_telefoon: '1234567890',
//		verkoper: 'Marco van Meel'
 //}
		
//console.log(JSON.stringify(resultMailVar));	
let dataBinding = {};
for(i=0; i<resultMailVar.length; i++){
    var var_name =  resultMailVar[i].VAR_NAME.trim();
    var var_content = resultMailVar[i].VAR_CONTENT.trim();	
	dataBinding[var_name] = var_content ;
}
//console.log('Data binding: ' +JSON.stringify(dataBinding));	
let finalHtml = "";
finalHtml = template(dataBinding);




let bodyHTML; 
console.log("mail_Isdraft: " + mail_isdraft);
if (mail_isdraft == "false" )
{
 bodyHTML = { 'message': 
					{
						'subject':  '' + mail_subject , 
						'body': 
							{  
								'contentType': 'HTML', 
								'content':  '' + finalHtml 
							},  
						'toRecipients': 
								[ 
									{	             
											'emailAddress': 
										{ 
											'address': '' +mailto 
										} 
									} 
					],
					'ccRecipients' : [],
					'bccRecipients' : [],
					  'attachments':   []
					},
						'saveToSentItems': '' + mail_savetosentitems
					
};

console.log(" True bodyHTML " +JSON.stringify(bodyHTML)); 
console.log('Aantal attachment objecten ' + resultMailAtt.length);

let attachments = [];

// signature_image toevoegen
   if (signatureImage!== "")
   {
	   
	console.log('Wat is signatureImage ' + JSON.stringify(signatureImage));
	
	let arrobj = {};
    arrobj['@odata.type'] = 'microsoft.graph.fileAttachment' ;
 	arrobj['contentBytes'] = btoa(signatureImage);
 	arrobj['contentId'] = 'signatureImage';
	//arrobj['is_Inline'] = true;
    arrobj['contentType'] = 'image/png';
    arrobj['name'] = 'signature.png'; 
     //attachments= Object.entries(arrobj); 
	 //body.Message.Attachments.push(arrobj)
	 bodyHTML.message.attachments.push(arrobj);
	 }
   
    if (mailcc !== "")
	{	
     let arrobj = {  'EmailAddress' : { 'Address' : '' +mailcc.trim() }};
	   
	  //console.info(arrobj);
	 
	 bodyHTML.message.ccRecipients.push(arrobj);
	 
    } 
	if (mailbcc !== "")
	{	
     let arrobj = {  'EmailAddress' : { 'Address' : '' +mailbcc.trim() }};
	   
	 //console.log(arrobj);
	 
	 bodyHTML.message.bccRecipients.push(arrobj);
	 
    } 

  
    console.log(" True bodyHTML " +JSON.stringify(bodyHTML));
  
var t=0;
for(i=0; i<resultMailAtt.length; i++){
     
	//console.log('Aantal attachments MailAtt: '+ bodyHTML.message.attachments.length);
	
	t = bodyHTML.message.attachments.length;
	let arrobj = {};
    arrobj['@odata.type'] = 'microsoft.graph.fileAttachment' ;
	arrobj['contentBytes'] = btoa(resultMailAtt[i].ATT_FILE);
	//body.Message.Attachments['contentId'] = 'cid:plaatje';
    arrobj['name'] = resultMailAtt[i].ATT_NAME;
	arrobj['contentId'] = '';
	//arrobj['is_Inline'] = true;
 	arrobj['contentType'] = '';
    //attachments.unshift(arrobj); 
//	body.Message.Attachments[1]=Object.entries(arrobj);
    bodyHTML.message.attachments.push(arrobj);
	

}
}
//for(var i = 0; i < body.Message.Attachments.length; i++) { 
// console.log('in loop ' + i);
// console.log(' att ' + JSON.stringify(body.Message.Attachments[i]));
        
        
  //  } 	
	  // body.Message.Attachments= attachments; 
  // console.log(body);
   
  //console.log(" True bodyHTML " +JSON.stringify(bodyHTML)); 
 

console.log("net voor mail_isdraft != false");
if (mail_isdraft != "false")
{
	bodyHTML =  
					{
						'subject':  '' + mail_subject , 
						'body': 
							{  
								'contentType': 'HTML', 
								'content':  '' + finalHtml	
								},  
						'toRecipients': 
								[ 
									{	             
											'emailAddress': 
										{ 
											'address': '' +mailto 
										} 
									} 
					],
					'ccRecipients' : [],
					'bccRecipients' : [],
					'attachments':   []
					  
					}
	//console.log('Body draft: ' + JSON.stringify(bodyHTML));				
 
console.log('Aantal attachment objecten ' + resultMailAtt.length);

let attachments = [];

// signature_image toevoegen
   if (signatureImage!== "")
   {
	  
	//console.log('Wat is signatureImage ' + JSON.stringify(signatureImage));
	 
	let arrobj = {};
    arrobj['@odata.type'] = 'microsoft.graph.fileAttachment' ;
 	arrobj['contentBytes'] = btoa(signatureImage);
 	arrobj['contentId'] = 'signatureImage';
	//arrobj['is_Inline'] = true;
    arrobj['contentType'] = 'image/png';
    arrobj['name'] = 'signature.png'; 
     //attachments= Object.entries(arrobj); 
	 //body.Message.Attachments.push(arrobj)
	 bodyHTML.attachments.push(arrobj);
   }
    
if (mailcc !== "")
	{	
     let arrobj = {  'emailAddress' : { 'address' : '' +mailcc.trim() }};
	   
	 //console.log(arrobj);
	 
	 bodyHTML.ccRecipients.push(arrobj);
	 
    } 
	if (mailbcc !== "")
	{	
     let arrobj = {  'emailAddress' : { 'address' : '' +mailbcc.trim() }};
	    
	 //console.log(arrobj);
	 
	 bodyHTML.bccRecipients.push(arrobj);
	 
    } 
 
var t=0;
for(i=0; i<resultMailAtt.length; i++){
    
	//console.log('Aantal attachments MailAtt: '+ bodyHTML.attachments.length);
	
	t = bodyHTML.attachments.length;
	let arrobj = {};
    arrobj['@odata.type'] = 'microsoft.graph.fileAttachment' ;
	arrobj['contentBytes'] = btoa(resultMailAtt[i].ATT_FILE);
	//body.Message.Attachments['contentId'] = 'cid:plaatje';
    arrobj['name'] = resultMailAtt[i].ATT_NAME;
	arrobj['contentId'] = '';
	//arrobj['is_Inline'] = false;
 	arrobj['contentType'] = '';
    //attachments.unshift(arrobj); 
//	body.Message.Attachments[1]=Object.entries(arrobj);
    bodyHTML.attachments.push(arrobj);
	

}
	//console.log("False body " +JSON.stringify(body)); 		
}	
		

    
 console.log('Net voor maken request');
 
  
			//console.log('BodyHtml ' + JSON.stringify(bodyHTML));
//bodyHTML = requestBody;		

 
	try {
		
		url = requestURL.trim() + requestPARAMETERS.trim();
		 
		// console.log("Url: " + url);
		 
	
	    // set the headers
        const config = {
			method: '' + requestMethod ,
			url:  '' +  url , 
            headers: {
                'Authorization': 'bearer '+ requestToken.trim() ,
				'Content-Type' : 'application/json'
            },
			data: bodyHTML,
			maxContentLength: 100000000,
            maxBodyLength: 1000000000    
                                				
			
        };
//		console.log('config: '+ JSON.stringify(config));
    // aanroep webservice
	const res =  await axios.request(config);
	   
	 //console.log(res.status);
     //console.log('Status code: '+ res.status);
     // console.log('Status text: ' +res.statusText);
     //console.log('Request method: '+res.request.method);
   //console.log('Path: '+ res.request.path);
   // console.log('Date: '+ res.headers.date);
	
    //console.log('Data: '+ JSON.stringify(res.data));
    
 // antwoord webservice teruggeven
 //console.log('response.data : '+ JSON.stringify(res.data)); 
  await updateMaillogResponse(mailnr, res);
  await updateMaillogResponseWithResponseData(mailnr, res);
 
  } catch (err) {
	   
	   
	  console.error("error: " +  JSON.stringify(err.response.data));
	   
		 await updateMaillogErrorResponse(mailnr, err);
 		  	
	    console.error("error: " +  JSON.stringify(err.response.data));
		 		
		 if (err.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      
	  //console.error('err response data ', err.response.data);
      //console.error('err response status ', err.response.status);
     // console.error('err response headers ', err.response.headers);
	 // console.error( 'error request ' +err.request);
	 // console.error('Error message', err.message);
	  
    } else if (err.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
         
	  console.error('error request ' +err.request);
	   
    } else {
      // Something happened in setting up the request that triggered an Error
        
	 // console.error('Error message', err.message);
	   
    }
     // console.log(err.config);
		
     	}
		
			
	} catch (e) {
         
		console.error('catch e '+ e);
		 
    } finally {
		   
        console.log('O365 cleanup here');
		 
		return ({ message: 'O365 succesvol uitgevoerd'});
    }	
  
  };
   

sendRequest (mailnr);

async function handleO365 (mailnr)
{
    try{
     	
	var resolve = await sendRequest (mailnr);
	return (resolve);
    }
	catch(err) {}
	
}


module.exports = {
  handleO365: handleO365
  };
