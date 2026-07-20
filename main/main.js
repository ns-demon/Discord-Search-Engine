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
        tabs.map((tab,index)=>({

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
    ] = win.getContentSize();



    tabs.forEach(tab=>{


        tab.view.setBounds({

            x:0,

            y:UI_HEIGHT,

            width:width,

            height:height-UI_HEIGHT

        });


    });


}



function disableDevTools(webContents){


    webContents.on(
        "devtools-opened",
        ()=>{

            webContents.closeDevTools();

        }
    );


    webContents.on(
        "before-input-event",
        (event,input)=>{


            if(
                input.key === "F12" ||
                (
                    input.control &&
                    input.shift &&
                    input.key.toLowerCase() === "i"
                )
            ){

                event.preventDefault();

            }


        }
    );


}



function createTab(
    url,
    options={}
){


    const view =
    new BrowserView({

        webPreferences:{

            partition:
            options.partition ||
            "persist:private-"+Date.now(),


            sandbox:true,

            contextIsolation:true,

            nodeIntegration:false

        }

    });



    disableDevTools(
        view.webContents
    );



    const tab = {

        view:view,

        locked:
        options.locked || false

    };



    tabs.push(tab);


    sendTabs();



    view.webContents.loadURL(
        url
    );



    setupContextMenu(
        view
    );



    return tabs.length - 1;

}

function setupContextMenu(view){


    view.webContents.on(
        "context-menu",
        ()=>{


            const history =
            view.webContents.navigationHistory;



            const menu =
            Menu.buildFromTemplate([


                {
                    label:"Back",

                    click(){

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

                },


                {
                    type:"separator"
                },


                {
                    label:"Copy",

                    role:"copy"

                },


                {
                    label:"Paste",

                    role:"paste"

                }


            ]);



            menu.popup();


        }
    );


}




function switchTab(id){


    if(!tabs[id])
        return;



    const current =
    win.getBrowserView();



    if(current){

        win.removeBrowserView(
            current
        );

    }



    win.setBrowserView(
        tabs[id].view
    );



    activeTab = id;



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



    tabs[id]
    .view
    .webContents
    .destroy();



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




function lockBrowser(){


    unlocked = false;



    tabs.forEach(tab=>{


        tab.view
        .webContents
        .destroy();


    });



    tabs = [];



    win.loadFile(
        path.join(
            __dirname,
            "renderer/login.html"
        )
    );


}



function resetLockTimer(){


    clearTimeout(
        lockTimer
    );


    let settings =
    storage.get("settings");



    if(
        !settings ||
        !settings.autoLock
    )
        return;



    lockTimer =
    setTimeout(()=>{


        lockBrowser();


    },
    settings.lockMinutes * 60000);


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
                !/^\d{4,6}$/.test(pin)
            ){

                return false;

            }



            createPassword(
                pin
            );



            return true;


        }
    );





    ipcMain.handle(
        "login-attempt",
        (_,password)=>{


            const valid =
            verifyPassword(
                password
            );



            if(
                valid
            ){

                unlocked = true;



                win.loadFile(
                    path.join(
                        __dirname,
                        "renderer/index.html"
                    )
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



                resetLockTimer();


            }



            return valid;


        }
    );


ipcMain.on(
"toggle-browser-view",
(_,hide)=>{


    if(!win)
        return;



    const view =
    win.getBrowserView();



    if(!view)
        return;



    if(hide){


        win.removeBrowserView(
            view
        );


    }
    else{


        win.setBrowserView(
            view
        );


        resizeViews();


    }


});


    ipcMain.on(
        "new-tab",
        ()=>{


            if(
                !unlocked
            )
                return;



            const id =
            createTab(
                "https://duckduckgo.com"
            );



            switchTab(
                id
            );


        }
    );





    ipcMain.on(
        "switch-tab",
        (_,id)=>{


            if(
                !unlocked
            )
                return;



            switchTab(
                id
            );


        }
    );





    ipcMain.on(
        "close-tab",
        (_,id)=>{


            closeTab(
                id
            );


        }
    );





    ipcMain.on(
        "navigate",
        (_,url)=>{


            if(
                !unlocked ||
                !tabs[activeTab]
            )
                return;



            tabs[activeTab]
            .view
            .webContents
            .loadURL(
                url
            );



            resetLockTimer();


        }
    );





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


        }
    );





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


        }
    );





    ipcMain.on(
        "reload",
        ()=>{


            if(
                tabs[activeTab]
            ){

                tabs[activeTab]
                .view
                .webContents
                .reload();

            }


        }
    );
	
	    ipcMain.handle(
        "clear-discord",
        async()=>{


            const discord =
            session.fromPartition(
                "persist:discord"
            );



            await discord.clearStorageData();



            return true;


        }
    );





    ipcMain.handle(
        "clear-web-data",
        async()=>{


            for(
                const partition of [
                    "persist:discord"
                ]
            ){


                const ses =
                session.fromPartition(
                    partition
                );


                await ses.clearStorageData();


            }



            return true;


        }
    );





    ipcMain.on(
        "lock-browser",
        ()=>{


            lockBrowser();


        }
    );





    ipcMain.handle(
        "get-settings",
        ()=>{


            return storage.get(
                "settings"
            );


        }
    );





    ipcMain.handle(
        "save-settings",
        (_,settings)=>{


            storage.set(
                "settings",
                settings
            );



            return true;


        }
    );


}




function createWindow(){


    win =
    new BrowserWindow({

        width:1400,

        height:900,


        minWidth:900,

        minHeight:600,


        backgroundColor:"#111111",


        webPreferences:{

            preload:path.join(
                __dirname,
                "preload.js"
            ),


            sandbox:true,

            contextIsolation:true,

            nodeIntegration:false

        }


    });



    disableDevTools(
        win.webContents
    );



    if(
        hasPassword()
    ){

        win.loadFile(
            path.join(
                __dirname,
                "renderer/login.html"
            )
        );

    }
    else{


        win.loadFile(
            path.join(
                __dirname,
                "renderer/setup.html"
            )
        );


    }



    win.on(
        "resize",
        resizeViews
    );


}




app.whenReady().then(()=>{


    setupPermissions();


    setupIPC();


    createWindow();


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

