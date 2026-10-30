(function(){var K='cr.welcome.v1',ov=document.getElementById('wlOv'),ok=document.getElementById('wlOk');if(!ov||!ok)return;
var seen=false;try{seen=localStorage.getItem(K)==='1'}catch(e){}if(seen)return;
var last=document.activeElement;ov.hidden=false;setTimeout(function(){try{ok.focus()}catch(e){}},30);
function close(){try{localStorage.setItem(K,'1')}catch(e){}ov.hidden=true;var g=document.getElementById('gdOv');var n=g&&!g.hidden&&(document.getElementById('gdNext')||g.querySelector('button'));try{(n||last||document.body).focus()}catch(e){}document.removeEventListener('keydown',kd,true)}
function kd(e){if(ov.hidden)return;if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close()}else if(e.key==='Tab'){e.preventDefault();var f=[ov.querySelector('a'),ok];var i=f.indexOf(document.activeElement);f[(i+(e.shiftKey?f.length-1:1))%f.length].focus()}}
document.addEventListener('keydown',kd,true);ok.addEventListener('click',close)})();
