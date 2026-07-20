function openSettings(){

document
.getElementById("settings")
.style.display="block";

}



function closeSettings(){

document
.getElementById("settings")
.style.display="none";

}



async function clearDiscord(){

let result =
await window.vault.clearDiscord();


if(result){

alert(
"Discord login cleared. Restart Discord tab."
);

}

}



function navigate(){

let url =
document.getElementById("address").value;


if(!url.startsWith("http")){

url =
"https://duckduckgo.com/?q="
+
encodeURIComponent(url);

}


tabs[active].view.src=url;

}



function goBack(){

tabs[active].view.goBack();

}



function goForward(){

tabs[active].view.goForward();

}



function reloadPage(){

tabs[active].view.reload();

}
