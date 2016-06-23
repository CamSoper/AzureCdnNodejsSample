//Requires
var msRestAzure = require('ms-rest-azure');
var cdnManagementClient = require('azure-arm-cdn');

//Tenant app constants
const clientId = "<YOUR CLIENT ID>";
const clientSecret = "<YOUR CLIENT AUTHENTICATION KEY>"; //Only for service principals
const tenantId = "<YOUR TENANT ID>";

//Application constants
const subscriptionId = "<YOUR SUBSCRIPTION ID>";
const resourceGroupName = "CdnConsoleTutorial";
const resourceLocation = "<YOUR PREFERRED AZURE LOCATION, SUCH AS Central US>";

//Get a client 
var credentials = new msRestAzure.ApplicationTokenCredentials(clientId, tenantId, clientSecret);
var cdnClient = new cdnManagementClient(credentials, subscriptionId);

//Collect command line parameters
var parms = process.argv.slice(2);

//Do we have parameters?
if(parms == null || parms.length == 0)
{
    console.log("Not enough parameters!");
    console.log("Valid commands are list, delete, create, and purge.");
    process.exit(1);
}

//Decide what to do...
switch(parms[0].toLowerCase())
{
    case "list":
        cdnList();
        break;

    case "create":
        cdnCreate();
        break;
    
    case "delete":
        cdnDelete();
        break;

    case "purge":
        cdnPurge();
        break;

    default:
        console.log("Valid commands are list, delete, create, and purge.");
        process.exit(1);
}

// list profiles
// list endpoints <profile name>
function cdnList(){
    requireParms(2);
    switch(parms[1].toLowerCase())
    {
        case "profiles":
            console.log("Listing profiles...")
            cdnClient.profiles.listByResourceGroup(resourceGroupName, callback);
            break;

        case "endpoints":
            requireParms(3)
            console.log("Listing endpoints...")
            cdnClient.endpoints.listByProfile(parms[2], resourceGroupName, callback);
            break;

        default:
            console.log("Invalid parameter.");
            process.exit(1);
    }
}

function cdnCreate() {
    requireParms(2);
    switch(parms[1].toLowerCase())
    {
        case "profile":
            cdnCreateProfile();
            break;

        case "endpoint":
            cdnCreateEndpoint();
            break;

        default:
            console.log("Invalid parameter.");
            process.exit(1);
    }
}

// create profile <profile name>
function cdnCreateProfile() {
    requireParms(3);
    console.log("Creating profile...")
    var standardCreateParameters = {
        location: resourceLocation,
        sku: {
            name: 'Standard_Verizon'
        }
    };

    cdnClient.profiles.create(parms[2], standardCreateParameters, resourceGroupName, callback);
}

// create endpoint <profile name> <endpoint name> <origin hostname>        
function cdnCreateEndpoint() {
    requireParms(5);
    console.log("Creating endpoint...")
    var endpointProperties = {
        location: resourceLocation,
        origins: [{
            name: parms[4],
            hostName: parms[4]
        }]
    }

    cdnClient.endpoints.create(parms[3], endpointProperties, parms[2], resourceGroupName, callback);
}

function cdnDelete() {
    requireParms(2);
    switch(parms[1].toLowerCase())
    {
        // delete profile <profile name>
        case "profile":
            requireParms(3);
            console.log("Deleting profile...")
            cdnClient.profiles.deleteIfExists(parms[2], resourceGroupName, callback);
            break;

        // delete endpoint <profile name> <endpoint name>
        case "endpoint":
            requireParms(4)
            console.log("Deleting endpoint...")
            cdnClient.endpoints.deleteIfExists(parms[3], parms[2], resourceGroupName, callback);
            break;

        default:
            console.log("Invalid parameter.");
            process.exit(1);
    }
}

// purge <endpoint name> <path>
function cdnPurge() {
    requireParms(4);
    console.log("Purging endpoint...")
    var purgeContentPaths = [ parms[3] ];
    cdnClient.endpoints.purgeContent(parms[2], parms[1], resourceGroupName, purgeContentPaths, callback);
}

// Function for determining if the requisite number of parameters were passed in
function requireParms(parmCount) {
    if(parms.length < parmCount) {
        usageHelp(parms[0].toLowerCase());
        process.exit(1);
    }
}

function usageHelp(cmd) {
    console.log("Usage for " + cmd + ":");
    switch(cmd)
    {
        case "list":
            console.log("list profiles");
            console.log("list endpoints <profile name>");
            break;

        case "create":
            console.log("create profile <profile name>");
            console.log("create endpoint <profile name> <endpoint name> <origin hostname>");
            break;
        
        case "delete":
            console.log("delete profile <profile name>");
            console.log("delete endpoint <profile name> <endpoint name>");
            break;

        case "purge":
            console.log("purge <profile name> <endpoint name> <path>");
            break;

        default:
            console.log("Invalid command.");
    }
}

function callback(err, result, request, response) {
    if (err) {
        console.log(err);
        process.exit(1);
    } else {
        console.log((result == null) ? "Done!" : result);
        process.exit(0);
    }
}
