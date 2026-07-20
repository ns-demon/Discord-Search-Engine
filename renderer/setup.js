console.log("setup.js loaded");


const pinInput =
document.getElementById("pin");


const confirmInput =
document.getElementById("confirm");


const createButton =
document.getElementById("create");


const status =
document.getElementById("status");



createButton.onclick = async()=>{


    const pin =
    pinInput.value.trim();


    const confirm =
    confirmInput.value.trim();



    if(pin !== confirm){

        status.textContent =
        "PINs do not match";

        return;

    }



    if(!/^\d{4,6}$/.test(pin)){


        status.textContent =
        "PIN must be 4-6 numbers";


        return;

    }



    try{


        const result =
        await window.vault.setupPassword(pin);



        console.log(
            "setup result:",
            result
        );



        if(result){


            status.textContent =
            "PIN created";


            setTimeout(()=>{


                location.href =
                "login.html";


            },1000);


        }
        else{


            status.textContent =
            "PIN setup failed";


        }


    }
    catch(error){


        console.error(
            error
        );


        status.textContent =
        "Error creating PIN";


    }


};