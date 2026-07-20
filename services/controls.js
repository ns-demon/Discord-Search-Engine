const {
ipcMain
}=require("electron");


const {
clearDiscord
}=require("./sessions");


function setupControls(){


ipcMain.handle(
"clear-discord",
async()=>{

await clearDiscord();

return true;

});


ipcMain.handle(
"lock",
()=>{

return true;

});


}



module.exports={
setupControls
};
