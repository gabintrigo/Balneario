/* O trabalhador de serviço da versão instalada (feito por pipeline/web.py): a aplicação abre sem rede.
   Núcleo: guardado na instalação. O resto guarda-se quando se vê; os vídeos num armazém à parte, com os 24 mais recentes. */
'use strict';
var VERSAO='1df02fae40',NUCLEO='balneario-'+VERSAO,VIDEOS='balneario-videos-2026-11-06c',MAXV=24;
var LISTA=["./", "index.html", "manifest.webmanifest", "colecao.json", "sala/sala.json", "icones/apple-touch-icon.png", "icones/icone-192.png", "icones/icone-512-m.png", "icones/icone-512.png", "emblemas/ajax.webp", "emblemas/alemanha.webp", "emblemas/argentina.webp", "emblemas/arsenal.webp", "emblemas/aves.webp", "emblemas/barcelona.webp", "emblemas/bayern.webp", "emblemas/benfica.webp", "emblemas/betis.webp", "emblemas/boavista.webp", "emblemas/bologna.webp", "emblemas/braga.webp", "emblemas/brugge.webp", "emblemas/caboverde.webp", "emblemas/canada.webp", "emblemas/chelsea.webp", "emblemas/covilha.webp", "emblemas/estrela.webp", "emblemas/flamengo.webp", "emblemas/galatasaray.webp", "emblemas/gales.webp", "emblemas/gent.webp", "emblemas/gilvicente.webp", "emblemas/inter.webp", "emblemas/levante.webp", "emblemas/mancity.webp", "emblemas/palmeiras.webp", "emblemas/porto.webp", "emblemas/portugal.webp", "emblemas/realmadrid.webp", "emblemas/rioave.webp", "emblemas/santos.webp", "emblemas/saopaulo.webp", "emblemas/stuttgart.webp", "emblemas/universitario.webp", "emblemas/venezia.webp", "videos/messi_t.webp", "videos/zidane_t.webp", "videos/saopaulo_t.webp", "videos/ajax_t.webp", "videos/neymar_t.webp", "videos/robben_t.webp", "videos/pavlidis_t.webp", "videos/sainz_t.webp", "videos/darocha_t.webp", "videos/diop_t.webp", "videos/pobega_t.webp", "videos/joaomario_t.webp", "videos/espi_t.webp", "videos/aursnes_t.webp", "videos/canada_t.webp", "videos/bernardo_t.webp", "videos/city_t.webp", "videos/betis_t.webp", "videos/palmeiras_t.webp", "videos/inter_t.webp", "videos/alemanha_t.webp", "videos/flamengo_t.webp", "videos/rios_t.webp", "videos/arsenal_t.webp", "videos/palestra_t.webp", "videos/gales_t.webp", "videos/bragaazul_t.webp", "videos/estrela_t.webp", "videos/nani_t.webp", "videos/bragamangas_t.webp", "videos/gilazul_t.webp", "videos/gilbranco_t.webp", "videos/boavista_t.webp", "videos/boavistacasa_t.webp", "videos/aves_t.webp", "videos/gilbranco2_t.webp", "videos/eusebio_t.webp", "videos/covilha_t.webp", "videos/rioave_t.webp", "videos/matthaus_t.webp", "videos/benficabranca_t.webp", "videos/universitario_t.webp", "videos/venezia_t.webp", "videos/barca_t.webp", "videos/nocta_t.webp", "videos/citycasa_t.webp", "videos/caboverde_t.webp", "videos/bayern_t.webp", "videos/ferro_t.webp", "videos/gala_t.webp", "videos/stuttgart_t.webp", "videos/brugge_t.webp", "sala/p/minis.json", "sala/p/lados.json", "sala/c/pequenas.json", "sala/t/alto.webp", "sala/t/assento.webp", "sala/t/chao.webp", "sala/t/frente.webp", "sala/t/fundo.webp", "sala/t/lado.webp", "sala/t/tecto.webp", "sala/t/varao.webp", "sala/g/mundo.png", "sala/g/ceu.jpg", "sala/g/p_BEL.png", "sala/g/p_CPV.png", "sala/g/p_DEU.png", "sala/g/p_ENG.png", "sala/g/p_ESP.png", "sala/g/p_ITA.png", "sala/g/p_NLD.png", "sala/g/p_PRT.png", "sala/g/p_WLS.png"];
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(NUCLEO).then(function(c){
    return Promise.all(LISTA.map(function(u){return fetch(u,{cache:'reload'}).then(function(r){if(r.ok)return c.put(u,r)}).catch(function(){})}));
  }).then(function(){return self.skipWaiting()}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return /^balneario-/.test(k)&&k!==NUCLEO&&k!==VIDEOS}).map(function(k){return caches.delete(k)}))})
    .then(function(){return self.clients.claim()}));
});
/* a rede primeiro (com um limite de tempo); sem ela, o que está guardado */
function redePrimeiro(q,chave){
  var guardado=function(){return caches.match(chave,{ignoreSearch:true}).then(function(r){return r||Promise.reject(new Error('sem rede e sem cópia'))})};
  return new Promise(function(ok,falha){
    var feito=false,t=setTimeout(function(){guardado().then(function(r){if(!feito){feito=true;ok(r)}},function(){})},4000);
    fetch(q).then(function(r){if(r.ok){var c=r.clone();caches.open(NUCLEO).then(function(k){k.put(chave,c)})}if(!feito){feito=true;clearTimeout(t);ok(r)}})
      .catch(function(){clearTimeout(t);if(!feito)guardado().then(function(r){feito=true;ok(r)},falha)});
  });
}
/* um pedido com intervalo (o leitor de vídeo pede aos bocados) servido a partir do ficheiro inteiro guardado */
function parte(q,r){
  return r.arrayBuffer().then(function(b){
    var n=b.byteLength,m=/bytes=(\d*)-(\d*)/.exec(q.headers.get('range')||''),a=m&&m[1]?+m[1]:0,z=m&&m[2]?+m[2]:n-1;
    if(m&&!m[1]&&m[2]){a=Math.max(0,n-(+m[2]));z=n-1}
    z=Math.min(z,n-1);if(a>z)return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+n}});
    return new Response(b.slice(a,z+1),{status:206,headers:{'Content-Type':r.headers.get('Content-Type')||'video/mp4','Content-Range':'bytes '+a+'-'+z+'/'+n,'Content-Length':String(z-a+1),'Accept-Ranges':'bytes'}});
  });
}
function aparaVideos(c){return c.keys().then(function(ks){var d=ks.length-MAXV,p=[];for(var i=0;i<d;i++)p.push(c.delete(ks[i]));return Promise.all(p)})}
self.addEventListener('fetch',function(e){
  var q=e.request;if(q.method!=='GET')return;
  var u=new URL(q.url);if(u.origin!==location.origin)return;
  var base=new URL('./',location.href).pathname,cam=u.pathname.indexOf(base)===0?u.pathname.slice(base.length):u.pathname;
  if(q.mode==='navigate'||cam===''||cam==='index.html'){e.respondWith(redePrimeiro(q,'index.html'));return}
  if(cam==='colecao.json'||cam==='sala/sala.json'){e.respondWith(redePrimeiro(q,cam));return}
  if(/\.mp4$/.test(cam)){
    var intervalo=q.headers.has('range');
    e.respondWith(caches.open(VIDEOS).then(function(c){return c.match(q,{ignoreSearch:true}).then(function(r){
      if(r)return intervalo?parte(q,r):r;
      if(intervalo)return fetch(q);
      return fetch(q).then(function(r2){if(r2.ok&&r2.status===200){var cp=r2.clone();c.put(q,cp).then(function(){return aparaVideos(c)})}return r2});
    })}));
    return;
  }
  e.respondWith(caches.match(q,{ignoreSearch:true}).then(function(r){
    return r||fetch(q).then(function(r2){if(r2.ok&&r2.status===200){var cp=r2.clone();caches.open(NUCLEO).then(function(c){c.put(q,cp)})}return r2});
  }));
});
