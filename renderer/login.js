console.log("login.js loaded");


const passwordInput =
document.getElementById("password");


const unlockButton =
document.getElementById("unlock");


const status =
document.getElementById("status");



unlockButton.onclick = async()=>{


    const password =
    passwordInput.value.trim();



    if(!password){

        status.textContent =
        "Enter PIN";

        return;

    }



    try{


        const result =
        await window.vault.login(password);



        console.log(
            "login result:",
            result
        );



        if(result){


            status.textContent =
            "Unlocked";


        }
        else{


            status.textContent =
            "Wrong PIN";


        }


    }
    catch(error){


        console.error(
            error
        );


        status.textContent =
        "Login error";


    }


};