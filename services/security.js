const {ipcMain}=require("electron");
const {setupPassword, checkPassword} = require("./auth");

function securitySetup(){

setupPassword();


ipcMain.handle(
"login",
(_,password)=>{

return checkPassword(password);

});


}


module.exports={
securitySetup
};
