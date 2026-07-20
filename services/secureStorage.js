const {
    safeStorage,
    app
} = require("electron");


const fs = require("fs");
const path = require("path");



function getStoragePath(){


    return path.join(

        app.getPath("userData"),

        "settings.secure"

    );


}




function save(data){


    try{


        const json =
        JSON.stringify(
            data
        );



        const encrypted =
        safeStorage.encryptString(
            json
        );



        fs.writeFileSync(

            getStoragePath(),

            encrypted

        );



        return true;


    }
    catch(err){


        console.error(
            "Secure storage save failed:",
            err
        );


        return false;


    }


}





function load(){


    try{


        const file =
        getStoragePath();



        if(
            !fs.existsSync(file)
        ){

            return null;

        }



        const encrypted =
        fs.readFileSync(
            file
        );



        const decrypted =
        safeStorage.decryptString(
            encrypted
        );



        return JSON.parse(
            decrypted
        );


    }
    catch(err){


        console.error(
            "Secure storage load failed:",
            err
        );


        return null;


    }


}





module.exports = {

    save,

    load

};