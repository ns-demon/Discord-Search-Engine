const fs = require("fs");
const path = require("path");
const crypto = require("crypto");


const PASSWORD_FILE =
path.join(
    __dirname,
    "..",
    "password.hash"
);



function hashPassword(password, salt){


    return crypto
    .pbkdf2Sync(
        password,
        salt,
        310000,
        32,
        "sha256"
    )
    .toString("hex");


}



function hasPassword(){


    return fs.existsSync(
        PASSWORD_FILE
    );


}




function createPassword(password){


    const salt =
    crypto
    .randomBytes(32)
    .toString("hex");



    const hash =
    hashPassword(
        password,
        salt
    );



    const data =
    JSON.stringify({

        salt:salt,

        hash:hash

    });



    fs.writeFileSync(
        PASSWORD_FILE,
        data,
        {
            encoding:"utf8"
        }
    );



    return true;


}





function verifyPassword(password){


    if(
        !hasPassword()
    )
        return false;



    try{


        const data =
        JSON.parse(
            fs.readFileSync(
                PASSWORD_FILE,
                "utf8"
            )
        );



        const check =
        hashPassword(
            password,
            data.salt
        );



        return crypto
        .timingSafeEqual(
            Buffer.from(check),
            Buffer.from(data.hash)
        );



    }
    catch(err){


        console.error(
            "Password verify error:",
            err
        );


        return false;


    }


}



module.exports = {

    hasPassword,

    createPassword,

    verifyPassword

};