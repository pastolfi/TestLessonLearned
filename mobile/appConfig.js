/*  Logon configuration used by packaged apps (N.B. We do not include the fioriclient 
 *  plugin to packaged apps but just borrow some of its configuration format.)
 *	The {{}} placeholder values, if any, will be populated before the first build. 
 *	The "appName" and "appVersion" will be updated with the input values in the build wizard.
 *	Do not change the "appID", "fioriURL" and "auth" values to avoid inconsistent 
 *	app settings.
 */
var fiori_client_appConfig = {
	"appName": "{{AppName}}",
	"appVersion": "{{AppVersion}}",
	"appID": "{{AppId}}",
	"fioriURL": "{{FioriURL}}",
	"auth": "{{Auth}}",	
	
	"communicatorId": "REST"
};