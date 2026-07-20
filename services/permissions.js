const {
    session
} = require("electron");



function setupPermissions(){


    const ses =
    session.defaultSession;



    ses.setPermissionRequestHandler(
        (
            webContents,
            permission,
            callback
        )=>{


            const allowed = [

                "media"

            ];



            if(
                allowed.includes(permission)
            ){

                callback(true);

            }
            else{

                callback(false);

            }


        }
    );





    ses.webRequest.onHeadersReceived(
    (
        details,
        callback
    )=>{


        callback({

            responseHeaders: {

                ...details.responseHeaders,


                "Content-Security-Policy":[

                    "default-src 'self' https:; " +
                    "script-src 'self'; " +
                    "style-src 'self' 'unsafe-inline'; " +
                    "img-src 'self' https: data:;"

                ]

            }

        });


    });


}




module.exports = {

    setupPermissions

};