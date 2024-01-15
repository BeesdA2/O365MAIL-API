const {dbconn, dbstmt} = require('idb-connector');

function updateMaillogResponse (mailnr, response) {
	 
  return new Promise(function(resolve)
  {
	try{
	//console.log('updatMaillogResponse'); 
	 
    const sSql = 'UPDATE dasfp@v.maillog set RESPONSEHTTPCODE  = \'' + response.status + '\' , RESPONSEHTTPMESSAGE = \'' + response.statusText + '\' , RESPONSEDATE = \'' + response.headers.date  + '\' where mailnr= ' + mailnr + ' with NONE';				  
    //console.log('sSQL ' + sSql);
	//console.log('response.data : '+ JSON.stringify(response.data));
  const connection = new dbconn();
    connection.conn('*LOCAL');
  	const statement = new dbstmt(connection); 
   
   statement.execSync(sSql, (x) => {

    statement.close();
      connection.disconn();
      connection.close();
    //console.log(x);
	resolve('update geslaagd');    
	});
	}  catch (e) {
        console.error('e :' +e);
    }
	});
	
}

function updateMaillogResponseWithResponseData (mailnr, response) {
	 
  return new Promise(function(resolve)
  {
	 try {
	//console.log('updatMaillogResponseWithData'); 
    const sSql = 'UPDATE dasfp@v.maillog set RESPONSEHTTPCODE  = \'' + response.status + '\' , RESPONSEHTTPMESSAGE = \'' + response.statusText + '\' , RESPONSEDATE = \'' + response.headers.date + '\', RESPONSEDATA = \'' + JSON.stringify(response.data) + '\' where mailnr= ' + mailnr + ' with NONE';				  
    //console.log('updateMaillog ' + sSql);
  const connection = new dbconn();
    connection.conn('*LOCAL');
  	const statement = new dbstmt(connection); 
   
   statement.execSync(sSql, (x) => {

    statement.close();
      connection.disconn();
      connection.close();
    //console.log(x);
	//console.log('UpdateWithData uitgevoerd');
	resolve('update geslaagd');    
	});
	}  catch (e) {
        console.error('e :' +e);
    }
	});
	
	
}

function updateMaillogErrorResponse (mailnr, err) {
	 
  return new Promise(function(resolve)
  {
	
    try { 
	console.log('updatMaillogErrorResponse'); 
    const sSql = 'UPDATE dasfp@v.maillog set RESPONSEERRORMESSAGE  = \'' + JSON.stringify(err.response.data) + '\'  where mailnr= ' + mailnr + ' with NONE';
	//console.log('sSQL ' + sSql);			  
				  
				  
	//console.log("Log weblog response:  " + sSql)
  const connection = new dbconn();
    connection.conn('*LOCAL');
  	const statement = new dbstmt(connection); 
   
   statement.execSync(sSql, (x) => {

    statement.close();
      connection.disconn();
      connection.close();
    //console.log(x);
	resolve('update geslaagd');    
	});
	}  catch (e) {
        console.error('e :' +e);
    }
	});
  
}
 
 
 module.exports = {
  
 updateMaillogResponse : updateMaillogResponse,
 updateMaillogResponseWithResponseData : updateMaillogResponseWithResponseData,
 updateMaillogErrorResponse : updateMaillogErrorResponse
 };