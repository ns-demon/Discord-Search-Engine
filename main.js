const {
    app,
    BrowserWindow,
    BrowserView,
    Menu,
    ipcMain,
    session
} = require("electron");


const path = require("path");


const {
    hasPassword,
    createPassword,
    verifyPassword
} = require("./services/auth");


const storage =
require("./services/storage");


const {
    setupPermissions
} = require("./services/permissions");



let win;

let tabs = [];

let activeTab = 0;

let unlocked = false;

let lockTimer;



const UI_HEIGHT = 87;




function sendTabs(){


    if(!win)
        return;



    win.webContents.send(
        "tabs-update",
        tabs.map(
        (tab,index)=>({

            id:index,

            locked:tab.locked

        }))
    );


}





function resizeViews(){


    if(!win)
        return;



    const [
        width,
        height
    ] =
    win.getContentSize();



    tabs.forEach(
    tab=>{


        tab.view.setBounds({

            x:0,

            y:UI_HEIGHT,

            width,

            height:
            height - UI_HEIGHT

        });


    });


}




function lockBrowser(){


    unlocked=false;



    tabs.forEach(
    tab=>{


        try{

            tab.view.webContents.destroy();

        }
        catch{}

    });



    tabs=[];



    win.loadFile(
        "renderer/login.html"
    );


}

function createTab(
    url,
    options={}
){


    const view =
    new BrowserView({

        webPreferences:{

            sandbox:true,

            contextIsolation:true,

            nodeIntegration:false,


            partition:
            options.partition ||
            "persist:private-" +
            Date.now()

        }

    });



    const tab = {

        view,

        locked:
        options.locked || false

    };



    tabs.push(tab);



    view.webContents.loadURL(
        url
    );



    setupContextMenu(
        view
    );



    sendTabs();



    return tabs.length - 1;

}






function setupContextMenu(view){


    view.webContents.on(
        "context-menu",
        ()=>{


            const menu =
            Menu.buildFromTemplate([


                {

                    label:"Back",

                    click(){

                        const history =
                        view.webContents.navigationHistory;


                        if(
                            history.canGoBack()
                        ){

                            history.goBack();

                        }

                    }

                },


                {

                    label:"Forward",

                    click(){

                        const history =
                        view.webContents.navigationHistory;


                        if(
                            history.canGoForward()
                        ){

                            history.goForward();

                        }

                    }

                },


                {

                    label:"Reload",

                    click(){

                        view.webContents.reload();

                    }

                }


            ]);



            menu.popup();


        }
    );


}






function switchTab(id){


    if(!tabs[id])
        return;



    const old =
    win.getBrowserView();



    if(old){

        win.removeBrowserView(
            old
        );

    }



    win.setBrowserView(
        tabs[id].view
    );



    activeTab=id;



    win.webContents.send(
        "active-tab",
        id
    );



    resizeViews();


}






function closeTab(id){


    if(!tabs[id])
        return;



    if(
        tabs[id].locked
    )
        return;



    try{


        tabs[id]
        .view
        .webContents
        .destroy();


    }
    catch{}




    tabs.splice(
        id,
        1
    );



    sendTabs();



    if(
        activeTab >= tabs.length
    ){

        activeTab =
        tabs.length - 1;

    }



    if(
        tabs.length
    ){

        switchTab(
            activeTab
        );

    }


}

function setupIPC(){



ipcMain.handle(
"setup-password",
(_,pin)=>{


    if(
        hasPassword()
    ){

        return false;

    }



    if(
        !/^\d{4}$|^\d{6}$/.test(pin)
    ){

        return false;

    }



    createPassword(pin);



    return true;


});






ipcMain.handle(
"login-attempt",
(_,password)=>{


    const valid =
    verifyPassword(password);



    if(valid){


        unlocked=true;



        win.loadFile(
            "renderer/index.html"
        );



        const discord =
        createTab(

            "https://discord.com/app",

            {

                locked:true,

                partition:
                "persist:discord"

            }

        );



        switchTab(
            discord
        );


    }



    return valid;


});







ipcMain.on(
"new-tab",
()=>{


    if(!unlocked)
        return;



    const id =
    createTab(
        "https://duckduckgo.com"
    );



    switchTab(
        id
    );


});







ipcMain.on(
"switch-tab",
(_,id)=>{


    if(!unlocked)
        return;



    switchTab(
        id
    );


});






ipcMain.on(
"close-tab",
(_,id)=>{


    closeTab(
        id
    );


});







ipcMain.on(
"navigate",
(_,url)=>{


    if(
        !tabs[activeTab]
    )
        return;



    tabs[activeTab]
    .view
    .webContents
    .loadURL(
        url
    );


});







ipcMain.on(
"back",
()=>{


    if(
        !tabs[activeTab]
    )
        return;



    const history =
    tabs[activeTab]
    .view
    .webContents
    .navigationHistory;



    if(
        history.canGoBack()
    ){

        history.goBack();

    }


});







ipcMain.on(
"forward",
()=>{


    if(
        !tabs[activeTab]
    )
        return;



    const history =
    tabs[activeTab]
    .view
    .webContents
    .navigationHistory;



    if(
        history.canGoForward()
    ){

        history.goForward();

    }


});







ipcMain.on(
"reload",
()=>{


    if(
        !tabs[activeTab]
    )
        return;



    tabs[activeTab]
    .view
    .webContents
    .reload();


});

ipcMain.handle(
"clear-discord",
async()=>{


    const discordSession =
    session.fromPartition(
        "persist:discord"
    );


    await discordSession.clearStorageData();


    return true;


});






ipcMain.on(
"lock-browser",
()=>{


    lockBrowser();


});







ipcMain.handle(
"get-settings",
()=>{


    return storage.get(
        "settings"
    );


});







ipcMain.handle(
"save-settings",
(_,settings)=>{


    storage.set(
        "settings",
        settings
    );


    return true;


});



}






function createWindow(){


    win =
    new BrowserWindow({

        width:1400,

        height:900,

        minWidth:900,

        minHeight:600,


        webPreferences:{


            preload:
            path.join(
                __dirname,
                "preload.js"
            ),


            sandbox:true,

            contextIsolation:true,

            nodeIntegration:false


        }


    });



    // First launch = create PIN
    // Existing PIN = login screen

    if(hasPassword()){


        win.loadFile(
            "renderer/login.html"
        );


    }
    else{


        win.loadFile(
            "renderer/setup.html"
        );


    }




    win.on(
        "resize",
        resizeViews
    );



    // Block devtools

    win.webContents.on(
        "devtools-opened",
        ()=>{

            win.webContents.closeDevTools();

        }
    );



    // Block popups

    win.webContents.setWindowOpenHandler(
        ()=>({

            action:"deny"

        })
    );


}


app.whenReady().then(()=>{


    setupPermissions();


    createWindow();


    setupIPC();



});







app.on(
"window-all-closed",
()=>{


    if(
        process.platform !== "darwin"
    ){

        app.quit();

    }


});
