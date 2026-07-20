const {
    contextBridge,
    ipcRenderer
} = require("electron");



contextBridge.exposeInMainWorld(
"vault",
{


    setupPassword(pin){

        return ipcRenderer.invoke(
            "setup-password",
            pin
        );

    },



    login(password){

        return ipcRenderer.invoke(
            "login-attempt",
            password
        );

    },



    clearDiscord(){

        return ipcRenderer.invoke(
            "clear-discord"
        );

    },



    clearWebData(){

        return ipcRenderer.invoke(
            "clear-web-data"
        );

    },



    lock(){

        ipcRenderer.send(
            "lock-browser"
        );

    },



    getSettings(){

        return ipcRenderer.invoke(
            "get-settings"
        );

    },



    saveSettings(settings){

        return ipcRenderer.invoke(
            "save-settings",
            settings
        );

    }


});





contextBridge.exposeInMainWorld(
"browser",
{


    newTab(){

        ipcRenderer.send(
            "new-tab"
        );

    },


    toggleView(show){

        ipcRenderer.send(
            "toggle-browser-view",
            show
        );

    },


    switchTab(id){

        ipcRenderer.send(
            "switch-tab",
            id
        );

    },


    closeTab(id){

        ipcRenderer.send(
            "close-tab",
            id
        );

    },


    navigate(url){

        ipcRenderer.send(
            "navigate",
            url
        );

    },


    back(){

        ipcRenderer.send(
            "back"
        );

    },


    forward(){

        ipcRenderer.send(
            "forward"
        );

    },


    reload(){

        ipcRenderer.send(
            "reload"
        );

    },


    onTabsUpdate(callback){

        ipcRenderer.on(
            "tabs-update",
            (_,tabs)=>{

                callback(tabs);

            }
        );

    },


    onActiveTab(callback){

        ipcRenderer.on(
            "active-tab",
            (_,id)=>{

                callback(id);

            }
        );

    }


});