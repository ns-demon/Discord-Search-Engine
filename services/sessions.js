const {
session
}=require("electron");

const path=require("path");
const fs=require("fs");


const discordPath =
path.join(
__dirname,
"..",
"profiles",
"discord"
);


const privatePath =
path.join(
__dirname,
"..",
"profiles",
"private"
);



function discordPartition(){

return session.fromPath(
discordPath
);

}



function privatePartition(){

return session.fromPath(
privatePath
);

}



async function clearDiscord(){

let ses =
discordPartition();


await ses.clearStorageData();

await ses.clearCache();

}



function wipePrivate(){

if(fs.existsSync(privatePath)){

fs.rmSync(
privatePath,
{
recursive:true,
force:true
}
);

}

}



module.exports={

discordPartition,

privatePartition,

clearDiscord,

wipePrivate

};
