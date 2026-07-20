console.log("browser.js loaded");


const newTab = document.getElementById("new-tab");
const back = document.getElementById("back");
const forward = document.getElementById("forward");
const reload = document.getElementById("reload");

const address = document.getElementById("address");
const go = document.getElementById("go");

const settings = document.getElementById("settings");
const settingsPanel = document.getElementById("settings-panel");

const saveSettings = document.getElementById("save-settings");
const closeSettings = document.getElementById("close-settings");

const clearDiscord = document.getElementById("clear-discord");
const lockNow = document.getElementById("lock-now");

const autoLock = document.getElementById("autoLock");
const lockMinutes = document.getElementById("lockMinutes");
const clearData = document.getElementById("clearData");

const tabs = document.getElementById("tabs");


let tabButtons = [];



function hideBrowserView(){

    if(window.browser.toggleView){

        window.browser.toggleView(true);

    }

}



function showBrowserView(){

    if(window.browser.toggleView){

        window.browser.toggleView(false);

    }

}




if(newTab){

    newTab.onclick = ()=>{

        window.browser.newTab();

    };

}



if(back){

    back.onclick = ()=>{

        window.browser.back();

    };

}



if(forward){

    forward.onclick = ()=>{

        window.browser.forward();

    };

}



if(reload){

    reload.onclick = ()=>{

        window.browser.reload();

    };

}



if(go){

    go.onclick = ()=>{

        navigate();

    };

}



if(address){

    address.addEventListener(
        "keydown",
        (e)=>{

            if(e.key === "Enter"){

                navigate();

            }

        }
    );

}




function navigate(){

    let url =
    address.value.trim();



    if(!url)
        return;



    if(
        !url.startsWith("http://") &&
        !url.startsWith("https://")
    ){

        url =
        "https://duckduckgo.com/?q=" +
        encodeURIComponent(url);

    }



    window.browser.navigate(url);

}




if(settings){

    settings.onclick = async()=>{


        const open =
        settingsPanel.style.display !== "block";



        if(open){


            hideBrowserView();


            settingsPanel.style.display =
            "block";



            try{


                const data =
                await window.vault.getSettings();



                if(data){


                    autoLock.checked =
                    !!data.autoLock;


                    lockMinutes.value =
                    data.lockMinutes || 30;


                    clearData.checked =
                    !!data.clearCookies;


                }


            }
            catch(error){

                console.error(
                    "Settings error:",
                    error
                );

            }



        }
        else{


            settingsPanel.style.display =
            "none";


            showBrowserView();


        }


    };

}




if(closeSettings){

    closeSettings.onclick = ()=>{


        settingsPanel.style.display =
        "none";


        showBrowserView();


    };

}




if(saveSettings){

    saveSettings.onclick = async()=>{


        try{


            await window.vault.saveSettings({

                autoLock:
                autoLock.checked,


                lockMinutes:
                Number(
                    lockMinutes.value
                ),


                clearCookies:
                clearData.checked

            });



            alert(
                "Settings saved"
            );


        }
        catch(error){


            console.error(
                "Save settings error:",
                error
            );


        }


    };

}




if(clearDiscord){

    clearDiscord.onclick =
    async()=>{


        try{


            await window.vault.clearDiscord();


            alert(
                "Discord session cleared"
            );


        }
        catch(error){

            console.error(error);

        }


    };

}




if(lockNow){

    lockNow.onclick = ()=>{


        window.vault.lock();


    };

}




window.browser.onTabsUpdate(
(tabList)=>{


    tabs.innerHTML = "";

    tabButtons = [];



    tabList.forEach(
    (tab)=>{


        const button =
        document.createElement(
            "button"
        );



        button.className =
        "tab";



        button.textContent =
        tab.locked
        ?
        "Discord"
        :
        "Tab";



        button.onclick = ()=>{


            window.browser.switchTab(
                tab.id
            );


        };



        if(!tab.locked){


            button.onauxclick =
            (event)=>{


                if(event.button === 1){


                    window.browser.closeTab(
                        tab.id
                    );


                }


            };


        }



        tabs.appendChild(button);


        tabButtons.push(button);


    });


});





window.browser.onActiveTab(
(id)=>{


    tabButtons.forEach(
    (button,index)=>{


        if(index === id){


            button.classList.add(
                "active"
            );


        }
        else{


            button.classList.remove(
                "active"
            );


        }


    });


});