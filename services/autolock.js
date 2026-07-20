const {ipcMain}=require("electron");


let timer;


function startAutoLock(win){


resetTimer(win);


["mouse-move","keydown","mousedown"]
.forEach(event=>{

win.webContents.on(
event,
()=>resetTimer(win)
);

});


}



function resetTimer(win){


clearTimeout(timer);


timer=setTimeout(()=>{


win.webContents.send(
"lock-screen"
);


},30*60*1000);


}



module.exports={
startAutoLock
};
