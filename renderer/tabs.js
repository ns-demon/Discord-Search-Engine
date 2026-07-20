let tabs=[];
let active=0;


function addTab(title,url,locked=false){


let id=tabs.length;


let tab=document.createElement("div");

tab.className="tab";


tab.innerHTML=title;


if(!locked){

tab.innerHTML +=
` <button onclick="closeTab(${id})">×</button>`;

}
else{

tab.innerHTML+=" 🔒";

}


tab.onclick=()=>switchTab(id);


document
.getElementById("tabs")
.appendChild(tab);



let view=document.createElement("webview");

view.src=url;

view.style.display=
id===0?"block":"none";


document
.getElementById("views")
.appendChild(view);


tabs.push({

tab,
view,
locked

});


}



function switchTab(id){

tabs.forEach(t=>{

t.view.style.display="none";
t.tab.classList.remove("active");

});


tabs[id].view.style.display="block";
tabs[id].tab.classList.add("active");

active=id;

}



function closeTab(id){


if(tabs[id].locked)
return;


tabs[id].view.remove();
tabs[id].tab.remove();


}



function newTab(){

addTab(
"New Tab",
"https://duckduckgo.com/"
);


switchTab(tabs.length-1);

}



addTab(
"Discord",
"https://discord.com/app",
true
);

switchTab(0);
