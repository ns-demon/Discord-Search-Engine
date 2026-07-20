const secureStorage =
require("./secureStorage");



const defaultSettings = {


    autoLock:true,


    lockMinutes:30,


    clearCookies:false,


    clearHistory:false


};





let cache = null;





function load(){


    if(
        cache
    ){

        return cache;

    }



    const saved =
    secureStorage.load();



    if(
        saved
    ){

        cache = saved;

    }
    else{


        cache =
        defaultSettings;


        secureStorage.save(
            cache
        );


    }



    return cache;


}





function get(key){


    const data =
    load();



    return data[key];


}





function set(key,value){


    const data =
    load();



    data[key] =
    value;



    cache = data;



    secureStorage.save(
        cache
    );


}





module.exports = {


    get,

    set,

    load


};