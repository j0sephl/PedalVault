(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["rive"] = factory();
	else
		root["rive"] = factory();
})(this, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });

var Rive = (() => {
  var _scriptDir = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : undefined;
  
  return (
function(moduleArg = {}) {

var l=moduleArg,aa,ba;l.ready=new Promise((a,b)=>{aa=a;ba=b});
function fa(){function a(g){const m=d;c=b=0;d=new Map;m.forEach(n=>{try{n(g)}catch(k){console.error(k)}});this.pc();e&&e.Yc()}let b=0,c=0,d=new Map,e=null,f=null;this.requestAnimationFrame=function(g){b||(b=requestAnimationFrame(a.bind(this)));const m=++c;d.set(m,g);return m};this.cancelAnimationFrame=function(g){d.delete(g);b&&0==d.size&&(cancelAnimationFrame(b),b=0)};this.Wc=function(g){f&&(document.body.remove(f),f=null);g||(f=document.createElement("div"),f.style.backgroundColor="black",f.style.position=
"fixed",f.style.right=0,f.style.top=0,f.style.color="white",f.style.padding="4px",f.innerHTML="RIVE FPS",g=function(m){f.innerHTML="RIVE FPS "+m.toFixed(1)},document.body.appendChild(f));e=new function(){let m=0,n=0;this.Yc=function(){var k=performance.now();n?(++m,k-=n,1E3<k&&(g(1E3*m/k),m=n=0)):(n=k,m=0)}}};this.Tc=function(){f&&(document.body.remove(f),f=null);e=null};this.pc=function(){}}
function ha(a){console.assert(!0);const b=new Map;let c=-Infinity;this.push=function(d){d=d+((1<<a)-1)>>a;b.has(d)&&clearTimeout(b.get(d));b.set(d,setTimeout(function(){b.delete(d);0==b.length?c=-Infinity:d==c&&(c=Math.max(...b.keys()),console.assert(c<d))},1E3));c=Math.max(d,c);return c<<a}}
const ia="createConicGradient createImageData createLinearGradient createPattern createRadialGradient getContextAttributes getImageData getLineDash getTransform isContextLost isPointInPath isPointInStroke measureText".split(" "),ja=new function(){function a(){if(!b){var h=document.createElement("canvas"),r={alpha:1,depth:0,stencil:0,antialias:0,premultipliedAlpha:1,preserveDrawingBuffer:0,preferLowPowerToHighPerformance:0,failIfMajorPerformanceCaveat:0,enableExtensionsByDefault:1,explicitSwapControl:1,
renderViaOffscreenBackBuffer:1};let q;if(/iPhone|iPad|iPod/i.test(navigator.userAgent)){if(q=h.getContext("webgl",r),c=1,!q)return console.log("No WebGL support. Image mesh will not be drawn."),!1}else if(q=h.getContext("webgl2",r))c=2;else if(q=h.getContext("webgl",r))c=1;else return console.log("No WebGL support. Image mesh will not be drawn."),!1;q=new Proxy(q,{get(D,v){if(D.isContextLost()){if(n||(console.error("Cannot render the mesh because the GL Context was lost. Tried to invoke ",v),n=!0),
"function"===typeof D[v])return function(){}}else return"function"===typeof D[v]?function(...N){return D[v].apply(D,N)}:D[v]},set(D,v,N){if(D.isContextLost())n||(console.error("Cannot render the mesh because the GL Context was lost. Tried to set property "+v),n=!0);else return D[v]=N,!0}});d=Math.min(q.getParameter(q.MAX_RENDERBUFFER_SIZE),q.getParameter(q.MAX_TEXTURE_SIZE));function A(D,v,N){v=q.createShader(v);q.shaderSource(v,N);q.compileShader(v);N=q.getShaderInfoLog(v);if(0<(N||"").length)throw N;
q.attachShader(D,v)}h=q.createProgram();A(h,q.VERTEX_SHADER,"attribute vec2 vertex;\n                attribute vec2 uv;\n                uniform vec4 mat;\n                uniform vec2 translate;\n                varying vec2 st;\n                void main() {\n                    st = uv;\n                    gl_Position = vec4(mat2(mat) * vertex + translate, 0, 1);\n                }");A(h,q.FRAGMENT_SHADER,"precision highp float;\n                uniform sampler2D image;\n                varying vec2 st;\n                void main() {\n                    gl_FragColor = texture2D(image, st);\n                }");
q.bindAttribLocation(h,0,"vertex");q.bindAttribLocation(h,1,"uv");q.linkProgram(h);r=q.getProgramInfoLog(h);if(0<(r||"").trim().length)throw r;e=q.getUniformLocation(h,"mat");f=q.getUniformLocation(h,"translate");q.useProgram(h);q.bindBuffer(q.ARRAY_BUFFER,q.createBuffer());q.enableVertexAttribArray(0);q.enableVertexAttribArray(1);q.bindBuffer(q.ELEMENT_ARRAY_BUFFER,q.createBuffer());q.uniform1i(q.getUniformLocation(h,"image"),0);q.pixelStorei(q.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!0);b=q}return!0}let b=
null,c=0,d=0,e=null,f=null,g=0,m=0,n=!1;a();this.md=function(){a();return d};this.Qc=function(h){b.deleteTexture&&b.deleteTexture(h)};this.Oc=function(h){if(!a())return null;const r=b.createTexture();if(!r)return null;b.bindTexture(b.TEXTURE_2D,r);b.texImage2D(b.TEXTURE_2D,0,b.RGBA,b.RGBA,b.UNSIGNED_BYTE,h);b.texParameteri(b.TEXTURE_2D,b.TEXTURE_WRAP_S,b.CLAMP_TO_EDGE);b.texParameteri(b.TEXTURE_2D,b.TEXTURE_WRAP_T,b.CLAMP_TO_EDGE);b.texParameteri(b.TEXTURE_2D,b.TEXTURE_MAG_FILTER,b.LINEAR);2==c?(b.texParameteri(b.TEXTURE_2D,
b.TEXTURE_MIN_FILTER,b.LINEAR_MIPMAP_LINEAR),b.generateMipmap(b.TEXTURE_2D)):b.texParameteri(b.TEXTURE_2D,b.TEXTURE_MIN_FILTER,b.LINEAR);return r};const k=new ha(8),t=new ha(8),u=new ha(10),x=new ha(10);this.Vc=function(h,r,q,A,D){if(a()){var v=k.push(h),N=t.push(r);if(b.canvas){if(b.canvas.width!=v||b.canvas.height!=N)b.canvas.width=v,b.canvas.height=N;b.viewport(0,N-r,h,r);b.disable(b.SCISSOR_TEST);b.clearColor(0,0,0,0);b.clear(b.COLOR_BUFFER_BIT);b.enable(b.SCISSOR_TEST);q.sort((G,ca)=>ca.xc-G.xc);
v=u.push(A);g!=v&&(b.bufferData(b.ARRAY_BUFFER,8*v,b.DYNAMIC_DRAW),g=v);v=0;for(var T of q)b.bufferSubData(b.ARRAY_BUFFER,v,T.Ub),v+=4*T.Ub.length;console.assert(v==4*A);for(var da of q)b.bufferSubData(b.ARRAY_BUFFER,v,da.Ec),v+=4*da.Ec.length;console.assert(v==8*A);v=x.push(D);m!=v&&(b.bufferData(b.ELEMENT_ARRAY_BUFFER,2*v,b.DYNAMIC_DRAW),m=v);T=0;for(var va of q)b.bufferSubData(b.ELEMENT_ARRAY_BUFFER,T,va.indices),T+=2*va.indices.length;console.assert(T==2*D);va=0;da=!0;v=T=0;for(const G of q){G.image.Kb!=
va&&(b.bindTexture(b.TEXTURE_2D,G.image.Jb||null),va=G.image.Kb);G.sd?(b.scissor(G.Zb,N-G.$b-G.jc,G.Id,G.jc),da=!0):da&&(b.scissor(0,N-r,h,r),da=!1);q=2/h;const ca=-2/r;b.uniform4f(e,G.hb[0]*q*G.Bb,G.hb[1]*ca*G.Cb,G.hb[2]*q*G.Bb,G.hb[3]*ca*G.Cb);b.uniform2f(f,G.hb[4]*q*G.Bb+q*(G.Zb-G.nd*G.Bb)-1,G.hb[5]*ca*G.Cb+ca*(G.$b-G.od*G.Cb)+1);b.vertexAttribPointer(0,2,b.FLOAT,!1,0,v);b.vertexAttribPointer(1,2,b.FLOAT,!1,0,v+4*A);b.drawElements(b.TRIANGLES,G.indices.length,b.UNSIGNED_SHORT,T);v+=4*G.Ub.length;
T+=2*G.indices.length}console.assert(v==4*A);console.assert(T==2*D)}}};this.canvas=function(){return a()&&b.canvas}},ka=l.onRuntimeInitialized;
l.onRuntimeInitialized=function(){function a(p){switch(p){case k.srcOver:return"source-over";case k.screen:return"screen";case k.overlay:return"overlay";case k.darken:return"darken";case k.lighten:return"lighten";case k.colorDodge:return"color-dodge";case k.colorBurn:return"color-burn";case k.hardLight:return"hard-light";case k.softLight:return"soft-light";case k.difference:return"difference";case k.exclusion:return"exclusion";case k.multiply:return"multiply";case k.hue:return"hue";case k.saturation:return"saturation";
case k.color:return"color";case k.luminosity:return"luminosity"}}function b(p){return"rgba("+((16711680&p)>>>16)+","+((65280&p)>>>8)+","+((255&p)>>>0)+","+((4278190080&p)>>>24)/255+")"}function c(){0<N.length&&(ja.Vc(v.drawWidth(),v.drawHeight(),N,T,da),N=[],da=T=0,v.reset(512,512));for(const p of D){for(const y of p.Ja)y();p.Ja=[]}D.clear()}ka&&ka();var d=l.RenderPaintStyle;const e=l.RenderPath,f=l.RenderPaint,g=l.Renderer,m=l.StrokeCap,n=l.StrokeJoin,k=l.BlendMode,t=d.fill,u=d.stroke,x=l.FillRule.evenOdd;
let h=1;var r=l.RenderImage.extend("CanvasRenderImage",{__construct:function({lb:p,yb:y}={}){this.__parent.__construct.call(this);this.Kb=h;h=h+1&2147483647||1;this.lb=p;this.yb=y},__destruct:function(){this.Jb&&(ja.Qc(this.Jb),URL.revokeObjectURL(this.Xb));this.__parent.__destruct.call(this)},decode:function(p){var y=this;y.yb&&y.yb(y);var H=new Image;y.Xb=URL.createObjectURL(new Blob([p],{type:"image/png"}));H.src=y.Xb;H.onload=function(){y.Gc=H;y.Jb=ja.Oc(H);y.size(H.width,H.height);y.lb&&y.lb(y)}}}),
q=e.extend("CanvasRenderPath",{__construct:function(){this.__parent.__construct.call(this);this.Ta=new Path2D},rewind:function(){this.Ta=new Path2D},addPath:function(p,y,H,I,C,J,K){var L=this.Ta,Y=L.addPath;p=p.Ta;const Q=new DOMMatrix;Q.a=y;Q.b=H;Q.c=I;Q.d=C;Q.e=J;Q.f=K;Y.call(L,p,Q)},fillRule:function(p){this.Wb=p},moveTo:function(p,y){this.Ta.moveTo(p,y)},lineTo:function(p,y){this.Ta.lineTo(p,y)},cubicTo:function(p,y,H,I,C,J){this.Ta.bezierCurveTo(p,y,H,I,C,J)},close:function(){this.Ta.closePath()}}),
A=f.extend("CanvasRenderPaint",{color:function(p){this.Yb=b(p)},thickness:function(p){this.Jc=p},join:function(p){switch(p){case n.miter:this.Ib="miter";break;case n.round:this.Ib="round";break;case n.bevel:this.Ib="bevel"}},cap:function(p){switch(p){case m.butt:this.Hb="butt";break;case m.round:this.Hb="round";break;case m.square:this.Hb="square"}},style:function(p){this.Ic=p},blendMode:function(p){this.Fc=a(p)},clearGradient:function(){this.jb=null},linearGradient:function(p,y,H,I){this.jb={zc:p,
Ac:y,cc:H,dc:I,Sb:[]}},radialGradient:function(p,y,H,I){this.jb={zc:p,Ac:y,cc:H,dc:I,Sb:[],kd:!0}},addStop:function(p,y){this.jb.Sb.push({color:p,stop:y})},completeGradient:function(){},draw:function(p,y,H){let I=this.Ic;var C=this.Yb,J=this.jb;p.globalCompositeOperation=this.Fc;if(null!=J){C=J.zc;var K=J.Ac;const Y=J.cc;var L=J.dc;const Q=J.Sb;J.kd?(J=Y-C,L-=K,C=p.createRadialGradient(C,K,0,C,K,Math.sqrt(J*J+L*L))):C=p.createLinearGradient(C,K,Y,L);for(let ea=0,R=Q.length;ea<R;ea++)K=Q[ea],C.addColorStop(K.stop,
b(K.color));this.Yb=C;this.jb=null}switch(I){case u:p.strokeStyle=C;p.lineWidth=this.Jc;p.lineCap=this.Hb;p.lineJoin=this.Ib;p.stroke(y);break;case t:p.fillStyle=C,p.fill(y,H)}}});const D=new Set;let v=null,N=[],T=0,da=0;var va=l.CanvasRenderer=g.extend("Renderer",{__construct:function(p){this.__parent.__construct.call(this);this.Sa=[1,0,0,1,0,0];this.Da=p.getContext("2d");this.Vb=p;this.Ja=[]},save:function(){this.Sa.push(...this.Sa.slice(this.Sa.length-6));this.Ja.push(this.Da.save.bind(this.Da))},
restore:function(){const p=this.Sa.length-6;if(6>p)throw"restore() called without matching save().";this.Sa.splice(p);this.Ja.push(this.Da.restore.bind(this.Da))},transform:function(p,y,H,I,C,J){const K=this.Sa,L=K.length-6;K.splice(L,6,K[L]*p+K[L+2]*y,K[L+1]*p+K[L+3]*y,K[L]*H+K[L+2]*I,K[L+1]*H+K[L+3]*I,K[L]*C+K[L+2]*J+K[L+4],K[L+1]*C+K[L+3]*J+K[L+5]);this.Ja.push(this.Da.transform.bind(this.Da,p,y,H,I,C,J))},rotate:function(p){const y=Math.sin(p);p=Math.cos(p);this.transform(p,y,-y,p,0,0)},_drawPath:function(p,
y){this.Ja.push(y.draw.bind(y,this.Da,p.Ta,p.Wb===x?"evenodd":"nonzero"))},_drawRiveImage:function(p,y,H){var I=p.Gc;if(I){var C=this.Da,J=a(y);this.Ja.push(function(){C.globalCompositeOperation=J;C.globalAlpha=H;C.drawImage(I,0,0);C.globalAlpha=1})}},_getMatrix:function(p){const y=this.Sa,H=y.length-6;for(let I=0;6>I;++I)p[I]=y[H+I]},_drawImageMesh:function(p,y,H,I,C,J,K,L,Y,Q){var ea=this.Da.canvas.width,R=this.Da.canvas.height;const Yb=Y-K,Zb=Q-L;K=Math.max(K,0);L=Math.max(L,0);Y=Math.min(Y,ea);
Q=Math.min(Q,R);const Ia=Y-K,Ja=Q-L;console.assert(Ia<=Math.min(Yb,ea));console.assert(Ja<=Math.min(Zb,R));if(!(0>=Ia||0>=Ja)){Y=Ia<Yb||Ja<Zb;ea=Q=1;var wa=Math.ceil(Ia*Q),xa=Math.ceil(Ja*ea);R=ja.md();wa>R&&(Q*=R/wa,wa=R);xa>R&&(ea*=R/xa,xa=R);v||(v=new l.DynamicRectanizer(R),v.reset(512,512));R=v.addRect(wa,xa);0>R&&(c(),D.add(this),R=v.addRect(wa,xa),console.assert(0<=R));var $b=R&65535,ac=R>>16;N.push({hb:this.Sa.slice(this.Sa.length-6),image:p,Zb:$b,$b:ac,nd:K,od:L,Id:wa,jc:xa,Bb:Q,Cb:ea,Ub:new Float32Array(I),
Ec:new Float32Array(C),indices:new Uint16Array(J),sd:Y,xc:p.Kb<<1|(Y?1:0)});T+=I.length;da+=J.length;var Ca=this.Da,nd=a(y);this.Ja.push(function(){Ca.save();Ca.resetTransform();Ca.globalCompositeOperation=nd;Ca.globalAlpha=H;const bc=ja.canvas();bc&&Ca.drawImage(bc,$b,ac,wa,xa,K,L,Ia,Ja);Ca.restore()})}},_clipPath:function(p){this.Ja.push(this.Da.clip.bind(this.Da,p.Ta,p.Wb===x?"evenodd":"nonzero"))},clear:function(){D.add(this);this.Ja.push(this.Da.clearRect.bind(this.Da,0,0,this.Vb.width,this.Vb.height))},
flush:function(){},translate:function(p,y){this.transform(1,0,0,1,p,y)}});l.makeRenderer=function(p){const y=new va(p),H=y.Da;return new Proxy(y,{get(I,C){if("function"===typeof I[C])return function(...J){return I[C].apply(I,J)};if("function"===typeof H[C]){if(-1<ia.indexOf(C))throw Error("RiveException: Method call to '"+C+"()' is not allowed, as the renderer cannot immediately pass through the return                 values of any canvas 2d context methods.");return function(...J){y.Ja.push(H[C].bind(H,
...J))}}return I[C]},set(I,C,J){if(C in H)return H[C]=J,!0}})};l.decodeImage=function(p,y){(new r({lb:y})).decode(p)};l.renderFactory={makeRenderPaint:function(){return new A},makeRenderPath:function(){return new q},makeRenderImage:function(){let p=ca;return new r({yb:()=>{p.total++},lb:()=>{p.loaded++;if(p.loaded===p.total){const y=p.ready;y&&(y(),p.ready=null)}}})}};let G=l.load,ca=null;l.load=function(p,y,H=!0){const I=new l.FallbackFileAssetLoader;void 0!==y&&I.addLoader(y);H&&(y=new l.CDNFileAssetLoader,
I.addLoader(y));return new Promise(function(C){let J=null;ca={total:0,loaded:0,ready:function(){C(J)}};J=G(p,I);0==ca.total&&C(J)})};d=new fa;l.requestAnimationFrame=d.requestAnimationFrame.bind(d);l.cancelAnimationFrame=d.cancelAnimationFrame.bind(d);l.enableFPSCounter=d.Wc.bind(d);l.disableFPSCounter=d.Tc;d.pc=c;l.resolveAnimationFrame=c;l.cleanup=function(){v&&v.delete()}};const la=l.onRuntimeInitialized;
l.onRuntimeInitialized=function(){la&&la();let a=l.decodeFont;l.decodeFont=function(c,d){c=a(c);d(c)};const b=l.FileAssetLoader;l.ptrToAsset=c=>{let d=l.ptrToFileAsset(c);return d.isImage?l.ptrToImageAsset(c):d.isFont?l.ptrToFontAsset(c):d};l.CustomFileAssetLoader=b.extend("CustomFileAssetLoader",{__construct:function({loadContents:c}){this.__parent.__construct.call(this);this.Hc=c},loadContents:function(c,d){c=l.ptrToAsset(c);return this.Hc(c,d)}});l.CDNFileAssetLoader=b.extend("CDNFileAssetLoader",
{__construct:function(){this.__parent.__construct.call(this)},loadContents:function(c){let d=l.ptrToAsset(c);c=d.cdnUuid;if(""===c)return!1;(function(e,f){var g=new XMLHttpRequest;g.responseType="arraybuffer";g.onreadystatechange=function(){4==g.readyState&&200==g.status&&f(g)};g.open("GET",e,!0);g.send(null)})(d.cdnBaseUrl+"/"+c,e=>{d.decode(new Uint8Array(e.response))});return!0}});l.FallbackFileAssetLoader=b.extend("FallbackFileAssetLoader",{__construct:function(){this.__parent.__construct.call(this);
this.lc=[]},addLoader:function(c){this.lc.push(c)},loadContents:function(c,d){for(let e of this.lc)if(e.loadContents(c,d))return!0;return!1}})};var ma=Object.assign({},l),na="./this.program",oa="object"==typeof window,pa="function"==typeof importScripts,qa="",ra,ta;
if(oa||pa)pa?qa=self.location.href:"undefined"!=typeof document&&document.currentScript&&(qa=document.currentScript.src),_scriptDir&&(qa=_scriptDir),0!==qa.indexOf("blob:")?qa=qa.substr(0,qa.replace(/[?#].*/,"").lastIndexOf("/")+1):qa="",pa&&(ta=a=>{var b=new XMLHttpRequest;b.open("GET",a,!1);b.responseType="arraybuffer";b.send(null);return new Uint8Array(b.response)}),ra=(a,b,c)=>{var d=new XMLHttpRequest;d.open("GET",a,!0);d.responseType="arraybuffer";d.onload=()=>{200==d.status||0==d.status&&d.response?
b(d.response):c()};d.onerror=c;d.send(null)};var ua=l.print||console.log.bind(console),ya=l.printErr||console.error.bind(console);Object.assign(l,ma);ma=null;l.thisProgram&&(na=l.thisProgram);var za;l.wasmBinary&&(za=l.wasmBinary);var noExitRuntime=l.noExitRuntime||!0;"object"!=typeof WebAssembly&&Aa("no native wasm support detected");var Ba,w,Da=!1,z,B,Ea,Fa,E,F,Ga,Ha;
function Ka(){var a=Ba.buffer;l.HEAP8=z=new Int8Array(a);l.HEAP16=Ea=new Int16Array(a);l.HEAP32=E=new Int32Array(a);l.HEAPU8=B=new Uint8Array(a);l.HEAPU16=Fa=new Uint16Array(a);l.HEAPU32=F=new Uint32Array(a);l.HEAPF32=Ga=new Float32Array(a);l.HEAPF64=Ha=new Float64Array(a)}var La,Ma=[],Na=[],Oa=[];function Pa(){var a=l.preRun.shift();Ma.unshift(a)}var Qa=0,Ra=null,Sa=null;
function Aa(a){if(l.onAbort)l.onAbort(a);a="Aborted("+a+")";ya(a);Da=!0;a=new WebAssembly.RuntimeError(a+". Build with -sASSERTIONS for more info.");ba(a);throw a;}function Ta(a){return a.startsWith("data:application/octet-stream;base64,")}var Ua;Ua="canvas_advanced.wasm";if(!Ta(Ua)){var Va=Ua;Ua=l.locateFile?l.locateFile(Va,qa):qa+Va}function Wa(a){if(a==Ua&&za)return new Uint8Array(za);if(ta)return ta(a);throw"both async and sync fetching of the wasm failed";}
function Xa(a){if(!za&&(oa||pa)){if("function"==typeof fetch&&!a.startsWith("file://"))return fetch(a,{credentials:"same-origin"}).then(b=>{if(!b.ok)throw"failed to load wasm binary file at '"+a+"'";return b.arrayBuffer()}).catch(()=>Wa(a));if(ra)return new Promise((b,c)=>{ra(a,d=>b(new Uint8Array(d)),c)})}return Promise.resolve().then(()=>Wa(a))}function Ya(a,b,c){return Xa(a).then(d=>WebAssembly.instantiate(d,b)).then(d=>d).then(c,d=>{ya("failed to asynchronously prepare wasm: "+d);Aa(d)})}
function Za(a,b){var c=Ua;return za||"function"!=typeof WebAssembly.instantiateStreaming||Ta(c)||c.startsWith("file://")||"function"!=typeof fetch?Ya(c,a,b):fetch(c,{credentials:"same-origin"}).then(d=>WebAssembly.instantiateStreaming(d,a).then(b,function(e){ya("wasm streaming compile failed: "+e);ya("falling back to ArrayBuffer instantiation");return Ya(c,a,b)}))}
var M,O,cb={177276:(a,b,c,d,e)=>{if("undefined"===typeof window||void 0===(window.AudioContext||window.webkitAudioContext))return 0;if("undefined"===typeof window.sa){window.sa={Ab:0};window.sa.Ha={};window.sa.Ha.zb=a;window.sa.Ha.capture=b;window.sa.Ha.Lb=c;window.sa.gb={};window.sa.gb.stopped=d;window.sa.gb.yc=e;let f=window.sa;f.Ea=[];f.Gd=function(g){for(var m=0;m<f.Ea.length;++m)if(null==f.Ea[m])return f.Ea[m]=g,m;f.Ea.push(g);return f.Ea.length-1};f.Dc=function(g){for(f.Ea[g]=null;0<f.Ea.length;)if(null==
f.Ea[f.Ea.length-1])f.Ea.pop();else break};f.Sd=function(g){for(var m=0;m<f.Ea.length;++m)if(f.Ea[m]==g)return f.Dc(m)};f.sb=function(g){return f.Ea[g]};f.Cc=["touchend","click"];f.unlock=function(){for(var g=0;g<f.Ea.length;++g){var m=f.Ea[g];null!=m&&null!=m.Ia&&m.state===f.gb.yc&&m.Ia.resume().then(()=>{$a(m.qc)},n=>{console.error("Failed to resume audiocontext",n)})}f.Cc.map(function(n){document.removeEventListener(n,f.unlock,!0)})};f.Cc.map(function(g){document.addEventListener(g,f.unlock,!0)})}window.sa.Ab+=
1;return 1},179454:()=>{"undefined"!==typeof window.sa&&(--window.sa.Ab,0===window.sa.Ab&&delete window.sa)},179618:()=>void 0!==navigator.mediaDevices&&void 0!==navigator.mediaDevices.getUserMedia,179722:()=>{try{var a=new (window.AudioContext||window.webkitAudioContext),b=a.sampleRate;a.close();return b}catch(c){return 0}},179893:(a,b,c,d,e,f)=>{if("undefined"===typeof window.sa)return-1;var g={},m={};a==window.sa.Ha.zb&&0!=c&&(m.sampleRate=c);g.Ia=new (window.AudioContext||window.webkitAudioContext)(m);
g.Ia.suspend();g.state=window.sa.gb.stopped;c=0;a!=window.sa.Ha.zb&&(c=b);g.Za=g.Ia.createScriptProcessor(d,c,b);g.Za.onaudioprocess=function(n){if(null==g.tb||0==g.tb.length)g.tb=new Float32Array(Ga.buffer,e,d*b);if(a==window.sa.Ha.capture||a==window.sa.Ha.Lb){for(var k=0;k<b;k+=1)for(var t=n.inputBuffer.getChannelData(k),u=g.tb,x=0;x<d;x+=1)u[x*b+k]=t[x];ab(f,d,e)}if(a==window.sa.Ha.zb||a==window.sa.Ha.Lb)for(bb(f,d,e),k=0;k<n.outputBuffer.numberOfChannels;++k)for(t=n.outputBuffer.getChannelData(k),
u=g.tb,x=0;x<d;x+=1)t[x]=u[x*b+k];else for(k=0;k<n.outputBuffer.numberOfChannels;++k)n.outputBuffer.getChannelData(k).fill(0)};a!=window.sa.Ha.capture&&a!=window.sa.Ha.Lb||navigator.mediaDevices.getUserMedia({audio:!0,video:!1}).then(function(n){g.Db=g.Ia.createMediaStreamSource(n);g.Db.connect(g.Za);g.Za.connect(g.Ia.destination)}).catch(function(n){console.log("Failed to get user media: "+n)});a==window.sa.Ha.zb&&g.Za.connect(g.Ia.destination);g.qc=f;return window.sa.Gd(g)},182770:a=>window.sa.sb(a).Ia.sampleRate,
182843:a=>{a=window.sa.sb(a);void 0!==a.Za&&(a.Za.onaudioprocess=function(){},a.Za.disconnect(),a.Za=void 0);void 0!==a.Db&&(a.Db.disconnect(),a.Db=void 0);a.Ia.close();a.Ia=void 0;a.qc=void 0},183243:a=>{window.sa.Dc(a)},183293:a=>{a=window.sa.sb(a);a.Ia.resume();a.state=window.sa.gb.yc},183432:a=>{a=window.sa.sb(a);a.Ia.suspend();a.state=window.sa.gb.stopped}},db=a=>{for(;0<a.length;)a.shift()(l)},eb=(a,b)=>{for(var c=0,d=a.length-1;0<=d;d--){var e=a[d];"."===e?a.splice(d,1):".."===e?(a.splice(d,
1),c++):c&&(a.splice(d,1),c--)}if(b)for(;c;c--)a.unshift("..");return a},fb=a=>{var b="/"===a.charAt(0),c="/"===a.substr(-1);(a=eb(a.split("/").filter(d=>!!d),!b).join("/"))||b||(a=".");a&&c&&(a+="/");return(b?"/":"")+a},gb=a=>{var b=/^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/.exec(a).slice(1);a=b[0];b=b[1];if(!a&&!b)return".";b&&(b=b.substr(0,b.length-1));return a+b},hb=a=>{if("/"===a)return"/";a=fb(a);a=a.replace(/\/$/,"");var b=a.lastIndexOf("/");return-1===b?a:a.substr(b+1)},
ib=()=>{if("object"==typeof crypto&&"function"==typeof crypto.getRandomValues)return a=>crypto.getRandomValues(a);Aa("initRandomDevice")},jb=a=>(jb=ib())(a);function kb(){for(var a="",b=!1,c=arguments.length-1;-1<=c&&!b;c--){b=0<=c?arguments[c]:"/";if("string"!=typeof b)throw new TypeError("Arguments to path.resolve must be strings");if(!b)return"";a=b+"/"+a;b="/"===b.charAt(0)}a=eb(a.split("/").filter(d=>!!d),!b).join("/");return(b?"/":"")+a||"."}
var lb="undefined"!=typeof TextDecoder?new TextDecoder("utf8"):void 0,mb=(a,b,c)=>{var d=b+c;for(c=b;a[c]&&!(c>=d);)++c;if(16<c-b&&a.buffer&&lb)return lb.decode(a.subarray(b,c));for(d="";b<c;){var e=a[b++];if(e&128){var f=a[b++]&63;if(192==(e&224))d+=String.fromCharCode((e&31)<<6|f);else{var g=a[b++]&63;e=224==(e&240)?(e&15)<<12|f<<6|g:(e&7)<<18|f<<12|g<<6|a[b++]&63;65536>e?d+=String.fromCharCode(e):(e-=65536,d+=String.fromCharCode(55296|e>>10,56320|e&1023))}}else d+=String.fromCharCode(e)}return d},
nb=[],ob=a=>{for(var b=0,c=0;c<a.length;++c){var d=a.charCodeAt(c);127>=d?b++:2047>=d?b+=2:55296<=d&&57343>=d?(b+=4,++c):b+=3}return b},pb=(a,b,c,d)=>{if(!(0<d))return 0;var e=c;d=c+d-1;for(var f=0;f<a.length;++f){var g=a.charCodeAt(f);if(55296<=g&&57343>=g){var m=a.charCodeAt(++f);g=65536+((g&1023)<<10)|m&1023}if(127>=g){if(c>=d)break;b[c++]=g}else{if(2047>=g){if(c+1>=d)break;b[c++]=192|g>>6}else{if(65535>=g){if(c+2>=d)break;b[c++]=224|g>>12}else{if(c+3>=d)break;b[c++]=240|g>>18;b[c++]=128|g>>12&
63}b[c++]=128|g>>6&63}b[c++]=128|g&63}}b[c]=0;return c-e};function qb(a,b){var c=Array(ob(a)+1);a=pb(a,c,0,c.length);b&&(c.length=a);return c}var rb=[];function sb(a,b){rb[a]={input:[],Fa:[],Va:b};tb(a,ub)}
var ub={open:function(a){var b=rb[a.node.mb];if(!b)throw new P(43);a.ya=b;a.seekable=!1},close:function(a){a.ya.Va.rb(a.ya)},rb:function(a){a.ya.Va.rb(a.ya)},read:function(a,b,c,d){if(!a.ya||!a.ya.Va.ic)throw new P(60);for(var e=0,f=0;f<d;f++){try{var g=a.ya.Va.ic(a.ya)}catch(m){throw new P(29);}if(void 0===g&&0===e)throw new P(6);if(null===g||void 0===g)break;e++;b[c+f]=g}e&&(a.node.timestamp=Date.now());return e},write:function(a,b,c,d){if(!a.ya||!a.ya.Va.Pb)throw new P(60);try{for(var e=0;e<d;e++)a.ya.Va.Pb(a.ya,
b[c+e])}catch(f){throw new P(29);}d&&(a.node.timestamp=Date.now());return e}},vb={ic:function(){a:{if(!nb.length){var a=null;"undefined"!=typeof window&&"function"==typeof window.prompt?(a=window.prompt("Input: "),null!==a&&(a+="\n")):"function"==typeof readline&&(a=readline(),null!==a&&(a+="\n"));if(!a){a=null;break a}nb=qb(a,!0)}a=nb.shift()}return a},Pb:function(a,b){null===b||10===b?(ua(mb(a.Fa,0)),a.Fa=[]):0!=b&&a.Fa.push(b)},rb:function(a){a.Fa&&0<a.Fa.length&&(ua(mb(a.Fa,0)),a.Fa=[])},gd:function(){return{Ld:25856,
Nd:5,Kd:191,Md:35387,Jd:[3,28,127,21,4,0,1,0,17,19,26,0,18,15,23,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}},hd:function(){return 0},jd:function(){return[24,80]}},wb={Pb:function(a,b){null===b||10===b?(ya(mb(a.Fa,0)),a.Fa=[]):0!=b&&a.Fa.push(b)},rb:function(a){a.Fa&&0<a.Fa.length&&(ya(mb(a.Fa,0)),a.Fa=[])}};function xb(a,b){var c=a.va?a.va.length:0;c>=b||(b=Math.max(b,c*(1048576>c?2:1.125)>>>0),0!=c&&(b=Math.max(b,256)),c=a.va,a.va=new Uint8Array(b),0<a.Aa&&a.va.set(c.subarray(0,a.Aa),0))}
var S={Pa:null,Ua(){return S.createNode(null,"/",16895,0)},createNode(a,b,c,d){if(24576===(c&61440)||4096===(c&61440))throw new P(63);S.Pa||(S.Pa={dir:{node:{Na:S.ua.Na,Qa:S.ua.Qa,kb:S.ua.kb,wb:S.ua.wb,vc:S.ua.vc,Bc:S.ua.Bc,wc:S.ua.wc,tc:S.ua.tc,Eb:S.ua.Eb},stream:{ab:S.wa.ab}},file:{node:{Na:S.ua.Na,Qa:S.ua.Qa},stream:{ab:S.wa.ab,read:S.wa.read,write:S.wa.write,qb:S.wa.qb,mc:S.wa.mc,oc:S.wa.oc}},link:{node:{Na:S.ua.Na,Qa:S.ua.Qa,nb:S.ua.nb},stream:{}},ac:{node:{Na:S.ua.Na,Qa:S.ua.Qa},stream:yb}});
c=zb(a,b,c,d);16384===(c.mode&61440)?(c.ua=S.Pa.dir.node,c.wa=S.Pa.dir.stream,c.va={}):32768===(c.mode&61440)?(c.ua=S.Pa.file.node,c.wa=S.Pa.file.stream,c.Aa=0,c.va=null):40960===(c.mode&61440)?(c.ua=S.Pa.link.node,c.wa=S.Pa.link.stream):8192===(c.mode&61440)&&(c.ua=S.Pa.ac.node,c.wa=S.Pa.ac.stream);c.timestamp=Date.now();a&&(a.va[b]=c,a.timestamp=c.timestamp);return c},Od(a){return a.va?a.va.subarray?a.va.subarray(0,a.Aa):new Uint8Array(a.va):new Uint8Array(0)},ua:{Na(a){var b={};b.Sc=8192===(a.mode&
61440)?a.id:1;b.kc=a.id;b.mode=a.mode;b.td=1;b.uid=0;b.dd=0;b.mb=a.mb;16384===(a.mode&61440)?b.size=4096:32768===(a.mode&61440)?b.size=a.Aa:40960===(a.mode&61440)?b.size=a.link.length:b.size=0;b.Kc=new Date(a.timestamp);b.qd=new Date(a.timestamp);b.Pc=new Date(a.timestamp);b.Lc=4096;b.Mc=Math.ceil(b.size/b.Lc);return b},Qa(a,b){void 0!==b.mode&&(a.mode=b.mode);void 0!==b.timestamp&&(a.timestamp=b.timestamp);if(void 0!==b.size&&(b=b.size,a.Aa!=b))if(0==b)a.va=null,a.Aa=0;else{var c=a.va;a.va=new Uint8Array(b);
c&&a.va.set(c.subarray(0,Math.min(b,a.Aa)));a.Aa=b}},kb(){throw Ab[44];},wb(a,b,c,d){return S.createNode(a,b,c,d)},vc(a,b,c){if(16384===(a.mode&61440)){try{var d=Bb(b,c)}catch(f){}if(d)for(var e in d.va)throw new P(55);}delete a.parent.va[a.name];a.parent.timestamp=Date.now();a.name=c;b.va[c]=a;b.timestamp=a.parent.timestamp;a.parent=b},Bc(a,b){delete a.va[b];a.timestamp=Date.now()},wc(a,b){var c=Bb(a,b),d;for(d in c.va)throw new P(55);delete a.va[b];a.timestamp=Date.now()},tc(a){var b=[".",".."],
c;for(c in a.va)a.va.hasOwnProperty(c)&&b.push(c);return b},Eb(a,b,c){a=S.createNode(a,b,41471,0);a.link=c;return a},nb(a){if(40960!==(a.mode&61440))throw new P(28);return a.link}},wa:{read(a,b,c,d,e){var f=a.node.va;if(e>=a.node.Aa)return 0;a=Math.min(a.node.Aa-e,d);if(8<a&&f.subarray)b.set(f.subarray(e,e+a),c);else for(d=0;d<a;d++)b[c+d]=f[e+d];return a},write(a,b,c,d,e,f){b.buffer===z.buffer&&(f=!1);if(!d)return 0;a=a.node;a.timestamp=Date.now();if(b.subarray&&(!a.va||a.va.subarray)){if(f)return a.va=
b.subarray(c,c+d),a.Aa=d;if(0===a.Aa&&0===e)return a.va=b.slice(c,c+d),a.Aa=d;if(e+d<=a.Aa)return a.va.set(b.subarray(c,c+d),e),d}xb(a,e+d);if(a.va.subarray&&b.subarray)a.va.set(b.subarray(c,c+d),e);else for(f=0;f<d;f++)a.va[e+f]=b[c+f];a.Aa=Math.max(a.Aa,e+d);return d},ab(a,b,c){1===c?b+=a.position:2===c&&32768===(a.node.mode&61440)&&(b+=a.node.Aa);if(0>b)throw new P(28);return b},qb(a,b,c){xb(a.node,b+c);a.node.Aa=Math.max(a.node.Aa,b+c)},mc(a,b,c,d,e){if(32768!==(a.node.mode&61440))throw new P(43);
a=a.node.va;if(e&2||a.buffer!==z.buffer){if(0<c||c+b<a.length)a.subarray?a=a.subarray(c,c+b):a=Array.prototype.slice.call(a,c,c+b);c=!0;Aa();b=void 0;if(!b)throw new P(48);z.set(a,b)}else c=!1,b=a.byteOffset;return{xa:b,Ma:c}},oc(a,b,c,d){S.wa.write(a,b,0,d,c,!1);return 0}}};function Cb(a,b){var c=0;a&&(c|=365);b&&(c|=146);return c}
var Db=null,Eb={},Fb=[],Gb=1,Hb=null,Ib=!0,P=null,Ab={},Kb=(a,b={})=>{a=kb(a);if(!a)return{path:"",node:null};b=Object.assign({fc:!0,Rb:0},b);if(8<b.Rb)throw new P(32);a=a.split("/").filter(g=>!!g);for(var c=Db,d="/",e=0;e<a.length;e++){var f=e===a.length-1;if(f&&b.parent)break;c=Bb(c,a[e]);d=fb(d+"/"+a[e]);c.xb&&(!f||f&&b.fc)&&(c=c.xb.root);if(!f||b.Mb)for(f=0;40960===(c.mode&61440);)if(c=Jb(d),d=kb(gb(d),c),c=Kb(d,{Rb:b.Rb+1}).node,40<f++)throw new P(32);}return{path:d,node:c}},Lb=a=>{for(var b;;){if(a===
a.parent)return a=a.Ua.nc,b?"/"!==a[a.length-1]?`${a}/${b}`:a+b:a;b=b?`${a.name}/${b}`:a.name;a=a.parent}},Mb=(a,b)=>{for(var c=0,d=0;d<b.length;d++)c=(c<<5)-c+b.charCodeAt(d)|0;return(a+c>>>0)%Hb.length},Bb=(a,b)=>{var c;if(c=(c=Nb(a,"x"))?c:a.ua.kb?0:2)throw new P(c,a);for(c=Hb[Mb(a.id,b)];c;c=c.rd){var d=c.name;if(c.parent.id===a.id&&d===b)return c}return a.ua.kb(a,b)},zb=(a,b,c,d)=>{a=new Ob(a,b,c,d);b=Mb(a.parent.id,a.name);a.rd=Hb[b];return Hb[b]=a},Pb=a=>{var b=["r","w","rw"][a&3];a&512&&(b+=
"w");return b},Nb=(a,b)=>{if(Ib)return 0;if(!b.includes("r")||a.mode&292){if(b.includes("w")&&!(a.mode&146)||b.includes("x")&&!(a.mode&73))return 2}else return 2;return 0},Qb=(a,b)=>{try{return Bb(a,b),20}catch(c){}return Nb(a,"wx")},Rb=()=>{for(var a=0;4096>=a;a++)if(!Fb[a])return a;throw new P(33);},Sb=a=>{a=Fb[a];if(!a)throw new P(8);return a},Ub=(a,b=-1)=>{Tb||(Tb=function(){this.sa={}},Tb.prototype={},Object.defineProperties(Tb.prototype,{object:{get(){return this.node},set(c){this.node=c}},
flags:{get(){return this.sa.flags},set(c){this.sa.flags=c}},position:{get(){return this.sa.position},set(c){this.sa.position=c}}}));a=Object.assign(new Tb,a);-1==b&&(b=Rb());a.Ya=b;return Fb[b]=a},yb={open:a=>{a.wa=Eb[a.node.mb].wa;a.wa.open&&a.wa.open(a)},ab:()=>{throw new P(70);}},tb=(a,b)=>{Eb[a]={wa:b}},Vb=(a,b)=>{var c="/"===b,d=!b;if(c&&Db)throw new P(10);if(!c&&!d){var e=Kb(b,{fc:!1});b=e.path;e=e.node;if(e.xb)throw new P(10);if(16384!==(e.mode&61440))throw new P(54);}b={type:a,Qd:{},nc:b,
pd:[]};a=a.Ua(b);a.Ua=b;b.root=a;c?Db=a:e&&(e.xb=b,e.Ua&&e.Ua.pd.push(b))},Wb=(a,b,c)=>{var d=Kb(a,{parent:!0}).node;a=hb(a);if(!a||"."===a||".."===a)throw new P(28);var e=Qb(d,a);if(e)throw new P(e);if(!d.ua.wb)throw new P(63);return d.ua.wb(d,a,b,c)},Xb=(a,b,c)=>{"undefined"==typeof c&&(c=b,b=438);Wb(a,b|8192,c)},cc=(a,b)=>{if(!kb(a))throw new P(44);var c=Kb(b,{parent:!0}).node;if(!c)throw new P(44);b=hb(b);var d=Qb(c,b);if(d)throw new P(d);if(!c.ua.Eb)throw new P(63);c.ua.Eb(c,b,a)},Jb=a=>{a=Kb(a).node;
if(!a)throw new P(44);if(!a.ua.nb)throw new P(28);return kb(Lb(a.parent),a.ua.nb(a))},ec=(a,b,c)=>{if(""===a)throw new P(44);if("string"==typeof b){var d={r:0,"r+":2,w:577,"w+":578,a:1089,"a+":1090}[b];if("undefined"==typeof d)throw Error(`Unknown file open mode: ${b}`);b=d}c=b&64?("undefined"==typeof c?438:c)&4095|32768:0;if("object"==typeof a)var e=a;else{a=fb(a);try{e=Kb(a,{Mb:!(b&131072)}).node}catch(f){}}d=!1;if(b&64)if(e){if(b&128)throw new P(20);}else e=Wb(a,c,0),d=!0;if(!e)throw new P(44);
8192===(e.mode&61440)&&(b&=-513);if(b&65536&&16384!==(e.mode&61440))throw new P(54);if(!d&&(c=e?40960===(e.mode&61440)?32:16384===(e.mode&61440)&&("r"!==Pb(b)||b&512)?31:Nb(e,Pb(b)):44))throw new P(c);if(b&512&&!d){c=e;c="string"==typeof c?Kb(c,{Mb:!0}).node:c;if(!c.ua.Qa)throw new P(63);if(16384===(c.mode&61440))throw new P(31);if(32768!==(c.mode&61440))throw new P(28);if(d=Nb(c,"w"))throw new P(d);c.ua.Qa(c,{size:0,timestamp:Date.now()})}b&=-131713;e=Ub({node:e,path:Lb(e),flags:b,seekable:!0,position:0,
wa:e.wa,Hd:[],error:!1});e.wa.open&&e.wa.open(e);!l.logReadFiles||b&1||(dc||(dc={}),a in dc||(dc[a]=1));return e},fc=(a,b,c)=>{if(null===a.Ya)throw new P(8);if(!a.seekable||!a.wa.ab)throw new P(70);if(0!=c&&1!=c&&2!=c)throw new P(28);a.position=a.wa.ab(a,b,c);a.Hd=[]},gc=()=>{P||(P=function(a,b){this.name="ErrnoError";this.node=b;this.xd=function(c){this.Xa=c};this.xd(a);this.message="FS error"},P.prototype=Error(),P.prototype.constructor=P,[44].forEach(a=>{Ab[a]=new P(a);Ab[a].stack="<generic error, no stack>"}))},
hc,jc=(a,b,c)=>{a=fb("/dev/"+a);var d=Cb(!!b,!!c);ic||(ic=64);var e=ic++<<8|0;tb(e,{open:f=>{f.seekable=!1},close:()=>{c&&c.buffer&&c.buffer.length&&c(10)},read:(f,g,m,n)=>{for(var k=0,t=0;t<n;t++){try{var u=b()}catch(x){throw new P(29);}if(void 0===u&&0===k)throw new P(6);if(null===u||void 0===u)break;k++;g[m+t]=u}k&&(f.node.timestamp=Date.now());return k},write:(f,g,m,n)=>{for(var k=0;k<n;k++)try{c(g[m+k])}catch(t){throw new P(29);}n&&(f.node.timestamp=Date.now());return k}});Xb(a,d,e)},ic,kc={},
Tb,dc,lc=void 0;function mc(){lc+=4;return E[lc-4>>2]}function nc(a){if(void 0===a)return"_unknown";a=a.replace(/[^a-zA-Z0-9_]/g,"$");var b=a.charCodeAt(0);return 48<=b&&57>=b?`_${a}`:a}function oc(a,b){a=nc(a);return{[a]:function(){return b.apply(this,arguments)}}[a]}function pc(){this.Ma=[void 0];this.hc=[]}var U=new pc,qc=void 0;function V(a){throw new qc(a);}
var rc=a=>{a||V("Cannot use deleted val. handle = "+a);return U.get(a).value},sc=a=>{switch(a){case void 0:return 1;case null:return 2;case !0:return 3;case !1:return 4;default:return U.qb({uc:1,value:a})}};
function tc(a){var b=Error,c=oc(a,function(d){this.name=a;this.message=d;d=Error(d).stack;void 0!==d&&(this.stack=this.toString()+"\n"+d.replace(/^Error(:[^\n]*)?\n/,""))});c.prototype=Object.create(b.prototype);c.prototype.constructor=c;c.prototype.toString=function(){return void 0===this.message?this.name:`${this.name}: ${this.message}`};return c}var uc=void 0,vc=void 0;function W(a){for(var b="";B[a];)b+=vc[B[a++]];return b}var wc=[];
function xc(){for(;wc.length;){var a=wc.pop();a.ra.fb=!1;a["delete"]()}}var yc=void 0,zc={};function Ac(a,b){for(void 0===b&&V("ptr should not be undefined");a.Ba;)b=a.ob(b),a=a.Ba;return b}var Bc={};function Cc(a){a=Dc(a);var b=W(a);Ec(a);return b}function Fc(a,b){var c=Bc[a];void 0===c&&V(b+" has unknown type "+Cc(a));return c}function Gc(){}var Hc=!1;function Ic(a){--a.count.value;0===a.count.value&&(a.Ga?a.La.Wa(a.Ga):a.za.ta.Wa(a.xa))}
function Jc(a,b,c){if(b===c)return a;if(void 0===c.Ba)return null;a=Jc(a,b,c.Ba);return null===a?null:c.Uc(a)}var Kc={};function Lc(a,b){b=Ac(a,b);return zc[b]}var Mc=void 0;function Nc(a){throw new Mc(a);}function Oc(a,b){b.za&&b.xa||Nc("makeClassHandle requires ptr and ptrType");!!b.La!==!!b.Ga&&Nc("Both smartPtrType and smartPtr must be specified");b.count={value:1};return Pc(Object.create(a,{ra:{value:b}}))}
function Pc(a){if("undefined"===typeof FinalizationRegistry)return Pc=b=>b,a;Hc=new FinalizationRegistry(b=>{Ic(b.ra)});Pc=b=>{var c=b.ra;c.Ga&&Hc.register(b,{ra:c},b);return b};Gc=b=>{Hc.unregister(b)};return Pc(a)}var Qc={};function Rc(a){for(;a.length;){var b=a.pop();a.pop()(b)}}function Sc(a){return this.fromWireType(E[a>>2])}var Tc={},Uc={};
function X(a,b,c){function d(m){m=c(m);m.length!==a.length&&Nc("Mismatched type converter count");for(var n=0;n<a.length;++n)Vc(a[n],m[n])}a.forEach(function(m){Uc[m]=b});var e=Array(b.length),f=[],g=0;b.forEach((m,n)=>{Bc.hasOwnProperty(m)?e[n]=Bc[m]:(f.push(m),Tc.hasOwnProperty(m)||(Tc[m]=[]),Tc[m].push(()=>{e[n]=Bc[m];++g;g===f.length&&d(e)}))});0===f.length&&d(e)}
function Wc(a){switch(a){case 1:return 0;case 2:return 1;case 4:return 2;case 8:return 3;default:throw new TypeError(`Unknown type size: ${a}`);}}function Xc(a,b,c={}){var d=b.name;a||V(`type "${d}" must have a positive integer typeid pointer`);if(Bc.hasOwnProperty(a)){if(c.ed)return;V(`Cannot register type '${d}' twice`)}Bc[a]=b;delete Uc[a];Tc.hasOwnProperty(a)&&(b=Tc[a],delete Tc[a],b.forEach(e=>e()))}
function Vc(a,b,c={}){if(!("argPackAdvance"in b))throw new TypeError("registerType registeredInstance requires argPackAdvance");Xc(a,b,c)}function Yc(a){V(a.ra.za.ta.name+" instance already deleted")}function Zc(){}
function $c(a,b,c){if(void 0===a[b].Ca){var d=a[b];a[b]=function(){a[b].Ca.hasOwnProperty(arguments.length)||V(`Function '${c}' called with an invalid number of arguments (${arguments.length}) - expects one of (${a[b].Ca})!`);return a[b].Ca[arguments.length].apply(this,arguments)};a[b].Ca=[];a[b].Ca[d.eb]=d}}
function ad(a,b,c){l.hasOwnProperty(a)?((void 0===c||void 0!==l[a].Ca&&void 0!==l[a].Ca[c])&&V(`Cannot register public name '${a}' twice`),$c(l,a,a),l.hasOwnProperty(c)&&V(`Cannot register multiple overloads of a function with the same number of arguments (${c})!`),l[a].Ca[c]=b):(l[a]=b,void 0!==c&&(l[a].Pd=c))}function bd(a,b,c,d,e,f,g,m){this.name=a;this.constructor=b;this.Oa=c;this.Wa=d;this.Ba=e;this.Zc=f;this.ob=g;this.Uc=m;this.rc=[]}
function cd(a,b,c){for(;b!==c;)b.ob||V(`Expected null or instance of ${c.name}, got an instance of ${b.name}`),a=b.ob(a),b=b.Ba;return a}function dd(a,b){if(null===b)return this.Ob&&V(`null is not a valid ${this.name}`),0;b.ra||V(`Cannot pass "${ed(b)}" as a ${this.name}`);b.ra.xa||V(`Cannot pass deleted object as a pointer of type ${this.name}`);return cd(b.ra.xa,b.ra.za.ta,this.ta)}
function fd(a,b){if(null===b){this.Ob&&V(`null is not a valid ${this.name}`);if(this.vb){var c=this.Qb();null!==a&&a.push(this.Wa,c);return c}return 0}b.ra||V(`Cannot pass "${ed(b)}" as a ${this.name}`);b.ra.xa||V(`Cannot pass deleted object as a pointer of type ${this.name}`);!this.ub&&b.ra.za.ub&&V(`Cannot convert argument of type ${b.ra.La?b.ra.La.name:b.ra.za.name} to parameter type ${this.name}`);c=cd(b.ra.xa,b.ra.za.ta,this.ta);if(this.vb)switch(void 0===b.ra.Ga&&V("Passing raw pointer to smart pointer is illegal"),
this.Bd){case 0:b.ra.La===this?c=b.ra.Ga:V(`Cannot convert argument of type ${b.ra.La?b.ra.La.name:b.ra.za.name} to parameter type ${this.name}`);break;case 1:c=b.ra.Ga;break;case 2:if(b.ra.La===this)c=b.ra.Ga;else{var d=b.clone();c=this.vd(c,sc(function(){d["delete"]()}));null!==a&&a.push(this.Wa,c)}break;default:V("Unsupporting sharing policy")}return c}
function gd(a,b){if(null===b)return this.Ob&&V(`null is not a valid ${this.name}`),0;b.ra||V(`Cannot pass "${ed(b)}" as a ${this.name}`);b.ra.xa||V(`Cannot pass deleted object as a pointer of type ${this.name}`);b.ra.za.ub&&V(`Cannot convert argument of type ${b.ra.za.name} to parameter type ${this.name}`);return cd(b.ra.xa,b.ra.za.ta,this.ta)}
function hd(a,b,c,d){this.name=a;this.ta=b;this.Ob=c;this.ub=d;this.vb=!1;this.Wa=this.vd=this.Qb=this.sc=this.Bd=this.ud=void 0;void 0!==b.Ba?this.toWireType=fd:(this.toWireType=d?dd:gd,this.Ka=null)}function jd(a,b,c){l.hasOwnProperty(a)||Nc("Replacing nonexistant public symbol");void 0!==l[a].Ca&&void 0!==c?l[a].Ca[c]=b:(l[a]=b,l[a].eb=c)}
var kd=(a,b)=>{var c=[];return function(){c.length=0;Object.assign(c,arguments);if(a.includes("j")){var d=l["dynCall_"+a];d=c&&c.length?d.apply(null,[b].concat(c)):d.call(null,b)}else d=La.get(b).apply(null,c);return d}};function Z(a,b){a=W(a);var c=a.includes("j")?kd(a,b):La.get(b);"function"!=typeof c&&V(`unknown function pointer with signature ${a}: ${b}`);return c}var ld=void 0;
function md(a,b){function c(f){e[f]||Bc[f]||(Uc[f]?Uc[f].forEach(c):(d.push(f),e[f]=!0))}var d=[],e={};b.forEach(c);throw new ld(`${a}: `+d.map(Cc).join([", "]));}
function od(a,b,c,d,e){var f=b.length;2>f&&V("argTypes array size mismatch! Must at least get return value and 'this' types!");var g=null!==b[1]&&null!==c,m=!1;for(c=1;c<b.length;++c)if(null!==b[c]&&void 0===b[c].Ka){m=!0;break}var n="void"!==b[0].name,k=f-2,t=Array(k),u=[],x=[];return function(){arguments.length!==k&&V(`function ${a} called with ${arguments.length} arguments, expected ${k} args!`);x.length=0;u.length=g?2:1;u[0]=e;if(g){var h=b[1].toWireType(x,this);u[1]=h}for(var r=0;r<k;++r)t[r]=
b[r+2].toWireType(x,arguments[r]),u.push(t[r]);r=d.apply(null,u);if(m)Rc(x);else for(var q=g?1:2;q<b.length;q++){var A=1===q?h:t[q-2];null!==b[q].Ka&&b[q].Ka(A)}h=n?b[0].fromWireType(r):void 0;return h}}function pd(a,b){for(var c=[],d=0;d<a;d++)c.push(F[b+4*d>>2]);return c}
function qd(a,b,c){a instanceof Object||V(`${c} with invalid "this": ${a}`);a instanceof b.ta.constructor||V(`${c} incompatible with "this" of type ${a.constructor.name}`);a.ra.xa||V(`cannot call emscripten binding method ${c} on deleted object`);return cd(a.ra.xa,a.ra.za.ta,b.ta)}function rd(a){a>=U.sa&&0===--U.get(a).uc&&U.wd(a)}
function sd(a,b,c){switch(b){case 0:return function(d){return this.fromWireType((c?z:B)[d])};case 1:return function(d){return this.fromWireType((c?Ea:Fa)[d>>1])};case 2:return function(d){return this.fromWireType((c?E:F)[d>>2])};default:throw new TypeError("Unknown integer type: "+a);}}function ed(a){if(null===a)return"null";var b=typeof a;return"object"===b||"array"===b||"function"===b?a.toString():""+a}
function td(a,b){switch(b){case 2:return function(c){return this.fromWireType(Ga[c>>2])};case 3:return function(c){return this.fromWireType(Ha[c>>3])};default:throw new TypeError("Unknown float type: "+a);}}
function ud(a,b,c){switch(b){case 0:return c?function(d){return z[d]}:function(d){return B[d]};case 1:return c?function(d){return Ea[d>>1]}:function(d){return Fa[d>>1]};case 2:return c?function(d){return E[d>>2]}:function(d){return F[d>>2]};default:throw new TypeError("Unknown integer type: "+a);}}
var vd="undefined"!=typeof TextDecoder?new TextDecoder("utf-16le"):void 0,wd=(a,b)=>{var c=a>>1;for(var d=c+b/2;!(c>=d)&&Fa[c];)++c;c<<=1;if(32<c-a&&vd)return vd.decode(B.subarray(a,c));c="";for(d=0;!(d>=b/2);++d){var e=Ea[a+2*d>>1];if(0==e)break;c+=String.fromCharCode(e)}return c},xd=(a,b,c)=>{void 0===c&&(c=2147483647);if(2>c)return 0;c-=2;var d=b;c=c<2*a.length?c/2:a.length;for(var e=0;e<c;++e)Ea[b>>1]=a.charCodeAt(e),b+=2;Ea[b>>1]=0;return b-d},yd=a=>2*a.length,zd=(a,b)=>{for(var c=0,d="";!(c>=
b/4);){var e=E[a+4*c>>2];if(0==e)break;++c;65536<=e?(e-=65536,d+=String.fromCharCode(55296|e>>10,56320|e&1023)):d+=String.fromCharCode(e)}return d},Ad=(a,b,c)=>{void 0===c&&(c=2147483647);if(4>c)return 0;var d=b;c=d+c-4;for(var e=0;e<a.length;++e){var f=a.charCodeAt(e);if(55296<=f&&57343>=f){var g=a.charCodeAt(++e);f=65536+((f&1023)<<10)|g&1023}E[b>>2]=f;b+=4;if(b+4>c)break}E[b>>2]=0;return b-d},Bd=a=>{for(var b=0,c=0;c<a.length;++c){var d=a.charCodeAt(c);55296<=d&&57343>=d&&++c;b+=4}return b},Cd=
{};function Dd(a){var b=Cd[a];return void 0===b?W(a):b}var Ed=[];function Fd(a){var b=Ed.length;Ed.push(a);return b}function Gd(a,b){for(var c=Array(a),d=0;d<a;++d)c[d]=Fc(F[b+4*d>>2],"parameter "+d);return c}
var Hd=[],Id=[],Jd={},Ld=()=>{if(!Kd){var a={USER:"web_user",LOGNAME:"web_user",PATH:"/",PWD:"/",HOME:"/home/web_user",LANG:("object"==typeof navigator&&navigator.languages&&navigator.languages[0]||"C").replace("-","_")+".UTF-8",_:na||"./this.program"},b;for(b in Jd)void 0===Jd[b]?delete a[b]:a[b]=Jd[b];var c=[];for(b in a)c.push(`${b}=${a[b]}`);Kd=c}return Kd},Kd,Md=a=>0===a%4&&(0!==a%100||0===a%400),Nd=[31,29,31,30,31,30,31,31,30,31,30,31],Od=[31,28,31,30,31,30,31,31,30,31,30,31],Pd=(a,b,c,d)=>
{function e(h,r,q){for(h="number"==typeof h?h.toString():h||"";h.length<r;)h=q[0]+h;return h}function f(h,r){return e(h,r,"0")}function g(h,r){function q(D){return 0>D?-1:0<D?1:0}var A;0===(A=q(h.getFullYear()-r.getFullYear()))&&0===(A=q(h.getMonth()-r.getMonth()))&&(A=q(h.getDate()-r.getDate()));return A}function m(h){switch(h.getDay()){case 0:return new Date(h.getFullYear()-1,11,29);case 1:return h;case 2:return new Date(h.getFullYear(),0,3);case 3:return new Date(h.getFullYear(),0,2);case 4:return new Date(h.getFullYear(),
0,1);case 5:return new Date(h.getFullYear()-1,11,31);case 6:return new Date(h.getFullYear()-1,11,30)}}function n(h){var r=h.bb;for(h=new Date((new Date(h.cb+1900,0,1)).getTime());0<r;){var q=h.getMonth(),A=(Md(h.getFullYear())?Nd:Od)[q];if(r>A-h.getDate())r-=A-h.getDate()+1,h.setDate(1),11>q?h.setMonth(q+1):(h.setMonth(0),h.setFullYear(h.getFullYear()+1));else{h.setDate(h.getDate()+r);break}}q=new Date(h.getFullYear()+1,0,4);r=m(new Date(h.getFullYear(),0,4));q=m(q);return 0>=g(r,h)?0>=g(q,h)?h.getFullYear()+
1:h.getFullYear():h.getFullYear()-1}var k=E[d+40>>2];d={Ed:E[d>>2],Dd:E[d+4>>2],Fb:E[d+8>>2],Tb:E[d+12>>2],Gb:E[d+16>>2],cb:E[d+20>>2],Ra:E[d+24>>2],bb:E[d+28>>2],Rd:E[d+32>>2],Cd:E[d+36>>2],Fd:k?k?mb(B,k):"":""};c=c?mb(B,c):"";k={"%c":"%a %b %d %H:%M:%S %Y","%D":"%m/%d/%y","%F":"%Y-%m-%d","%h":"%b","%r":"%I:%M:%S %p","%R":"%H:%M","%T":"%H:%M:%S","%x":"%m/%d/%y","%X":"%H:%M:%S","%Ec":"%c","%EC":"%C","%Ex":"%m/%d/%y","%EX":"%H:%M:%S","%Ey":"%y","%EY":"%Y","%Od":"%d","%Oe":"%e","%OH":"%H","%OI":"%I",
"%Om":"%m","%OM":"%M","%OS":"%S","%Ou":"%u","%OU":"%U","%OV":"%V","%Ow":"%w","%OW":"%W","%Oy":"%y"};for(var t in k)c=c.replace(new RegExp(t,"g"),k[t]);var u="Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "),x="January February March April May June July August September October November December".split(" ");k={"%a":h=>u[h.Ra].substring(0,3),"%A":h=>u[h.Ra],"%b":h=>x[h.Gb].substring(0,3),"%B":h=>x[h.Gb],"%C":h=>f((h.cb+1900)/100|0,2),"%d":h=>f(h.Tb,2),"%e":h=>e(h.Tb,2," "),"%g":h=>
n(h).toString().substring(2),"%G":h=>n(h),"%H":h=>f(h.Fb,2),"%I":h=>{h=h.Fb;0==h?h=12:12<h&&(h-=12);return f(h,2)},"%j":h=>{for(var r=0,q=0;q<=h.Gb-1;r+=(Md(h.cb+1900)?Nd:Od)[q++]);return f(h.Tb+r,3)},"%m":h=>f(h.Gb+1,2),"%M":h=>f(h.Dd,2),"%n":()=>"\n","%p":h=>0<=h.Fb&&12>h.Fb?"AM":"PM","%S":h=>f(h.Ed,2),"%t":()=>"\t","%u":h=>h.Ra||7,"%U":h=>f(Math.floor((h.bb+7-h.Ra)/7),2),"%V":h=>{var r=Math.floor((h.bb+7-(h.Ra+6)%7)/7);2>=(h.Ra+371-h.bb-2)%7&&r++;if(r)53==r&&(q=(h.Ra+371-h.bb)%7,4==q||3==q&&Md(h.cb)||
(r=1));else{r=52;var q=(h.Ra+7-h.bb-1)%7;(4==q||5==q&&Md(h.cb%400-1))&&r++}return f(r,2)},"%w":h=>h.Ra,"%W":h=>f(Math.floor((h.bb+7-(h.Ra+6)%7)/7),2),"%y":h=>(h.cb+1900).toString().substring(2),"%Y":h=>h.cb+1900,"%z":h=>{h=h.Cd;var r=0<=h;h=Math.abs(h)/60;return(r?"+":"-")+String("0000"+(h/60*100+h%60)).slice(-4)},"%Z":h=>h.Fd,"%%":()=>"%"};c=c.replace(/%%/g,"\x00\x00");for(t in k)c.includes(t)&&(c=c.replace(new RegExp(t,"g"),k[t](d)));c=c.replace(/\0\0/g,"%");t=qb(c,!1);if(t.length>b)return 0;z.set(t,
a);return t.length-1};function Ob(a,b,c,d){a||(a=this);this.parent=a;this.Ua=a.Ua;this.xb=null;this.id=Gb++;this.name=b;this.mode=c;this.ua={};this.wa={};this.mb=d}Object.defineProperties(Ob.prototype,{read:{get:function(){return 365===(this.mode&365)},set:function(a){a?this.mode|=365:this.mode&=-366}},write:{get:function(){return 146===(this.mode&146)},set:function(a){a?this.mode|=146:this.mode&=-147}}});gc();Hb=Array(4096);Vb(S,"/");Wb("/tmp",16895,0);Wb("/home",16895,0);
Wb("/home/web_user",16895,0);(()=>{Wb("/dev",16895,0);tb(259,{read:()=>0,write:(d,e,f,g)=>g});Xb("/dev/null",259);sb(1280,vb);sb(1536,wb);Xb("/dev/tty",1280);Xb("/dev/tty1",1536);var a=new Uint8Array(1024),b=0,c=()=>{0===b&&(b=jb(a).byteLength);return a[--b]};jc("random",c);jc("urandom",c);Wb("/dev/shm",16895,0);Wb("/dev/shm/tmp",16895,0)})();
(()=>{Wb("/proc",16895,0);var a=Wb("/proc/self",16895,0);Wb("/proc/self/fd",16895,0);Vb({Ua:()=>{var b=zb(a,"fd",16895,73);b.ua={kb:(c,d)=>{var e=Sb(+d);c={parent:null,Ua:{nc:"fake"},ua:{nb:()=>e.path}};return c.parent=c}};return b}},"/proc/self/fd")})();Object.assign(pc.prototype,{get(a){return this.Ma[a]},has(a){return void 0!==this.Ma[a]},qb(a){var b=this.hc.pop()||this.Ma.length;this.Ma[b]=a;return b},wd(a){this.Ma[a]=void 0;this.hc.push(a)}});
qc=l.BindingError=class extends Error{constructor(a){super(a);this.name="BindingError"}};U.Ma.push({value:void 0},{value:null},{value:!0},{value:!1});U.sa=U.Ma.length;l.count_emval_handles=function(){for(var a=0,b=U.sa;b<U.Ma.length;++b)void 0!==U.Ma[b]&&++a;return a};uc=l.PureVirtualError=tc("PureVirtualError");for(var Qd=Array(256),Rd=0;256>Rd;++Rd)Qd[Rd]=String.fromCharCode(Rd);vc=Qd;l.getInheritedInstanceCount=function(){return Object.keys(zc).length};
l.getLiveInheritedInstances=function(){var a=[],b;for(b in zc)zc.hasOwnProperty(b)&&a.push(zc[b]);return a};l.flushPendingDeletes=xc;l.setDelayFunction=function(a){yc=a;wc.length&&yc&&yc(xc)};Mc=l.InternalError=class extends Error{constructor(a){super(a);this.name="InternalError"}};Zc.prototype.isAliasOf=function(a){if(!(this instanceof Zc&&a instanceof Zc))return!1;var b=this.ra.za.ta,c=this.ra.xa,d=a.ra.za.ta;for(a=a.ra.xa;b.Ba;)c=b.ob(c),b=b.Ba;for(;d.Ba;)a=d.ob(a),d=d.Ba;return b===d&&c===a};
Zc.prototype.clone=function(){this.ra.xa||Yc(this);if(this.ra.ib)return this.ra.count.value+=1,this;var a=Pc,b=Object,c=b.create,d=Object.getPrototypeOf(this),e=this.ra;a=a(c.call(b,d,{ra:{value:{count:e.count,fb:e.fb,ib:e.ib,xa:e.xa,za:e.za,Ga:e.Ga,La:e.La}}}));a.ra.count.value+=1;a.ra.fb=!1;return a};Zc.prototype["delete"]=function(){this.ra.xa||Yc(this);this.ra.fb&&!this.ra.ib&&V("Object already scheduled for deletion");Gc(this);Ic(this.ra);this.ra.ib||(this.ra.Ga=void 0,this.ra.xa=void 0)};
Zc.prototype.isDeleted=function(){return!this.ra.xa};Zc.prototype.deleteLater=function(){this.ra.xa||Yc(this);this.ra.fb&&!this.ra.ib&&V("Object already scheduled for deletion");wc.push(this);1===wc.length&&yc&&yc(xc);this.ra.fb=!0;return this};hd.prototype.$c=function(a){this.sc&&(a=this.sc(a));return a};hd.prototype.bc=function(a){this.Wa&&this.Wa(a)};hd.prototype.argPackAdvance=8;hd.prototype.readValueFromPointer=Sc;hd.prototype.deleteObject=function(a){if(null!==a)a["delete"]()};
hd.prototype.fromWireType=function(a){function b(){return this.vb?Oc(this.ta.Oa,{za:this.ud,xa:c,La:this,Ga:a}):Oc(this.ta.Oa,{za:this,xa:a})}var c=this.$c(a);if(!c)return this.bc(a),null;var d=Lc(this.ta,c);if(void 0!==d){if(0===d.ra.count.value)return d.ra.xa=c,d.ra.Ga=a,d.clone();d=d.clone();this.bc(a);return d}d=this.ta.Zc(c);d=Kc[d];if(!d)return b.call(this);d=this.ub?d.Nc:d.pointerType;var e=Jc(c,this.ta,d.ta);return null===e?b.call(this):this.vb?Oc(d.ta.Oa,{za:d,xa:e,La:this,Ga:a}):Oc(d.ta.Oa,
{za:d,xa:e})};ld=l.UnboundTypeError=tc("UnboundTypeError");
var Ud={A:function(a,b,c){lc=c;try{var d=Sb(a);switch(b){case 0:var e=mc();return 0>e?-28:Ub(d,e).Ya;case 1:case 2:return 0;case 3:return d.flags;case 4:return e=mc(),d.flags|=e,0;case 5:return e=mc(),Ea[e+0>>1]=2,0;case 6:case 7:return 0;case 16:case 8:return-28;case 9:return E[Sd()>>2]=28,-1;default:return-28}}catch(f){if("undefined"==typeof kc||"ErrnoError"!==f.name)throw f;return-f.Xa}},K:function(a,b){try{a:{var c=Sb(a).path;try{var d=Kb(c,{Mb:!0}).node;if(!d)throw new P(44);if(!d.ua.Na)throw new P(63);
var e=d.ua.Na(d)}catch(k){if(k&&k.node&&fb(c)!==fb(Lb(k.node))){var f=-54;break a}throw k;}E[b>>2]=e.Sc;E[b+4>>2]=e.mode;F[b+8>>2]=e.td;E[b+12>>2]=e.uid;E[b+16>>2]=e.dd;E[b+20>>2]=e.mb;O=[e.size>>>0,(M=e.size,1<=+Math.abs(M)?0<M?+Math.floor(M/4294967296)>>>0:~~+Math.ceil((M-+(~~M>>>0))/4294967296)>>>0:0)];E[b+24>>2]=O[0];E[b+28>>2]=O[1];E[b+32>>2]=4096;E[b+36>>2]=e.Mc;var g=e.Kc.getTime(),m=e.qd.getTime(),n=e.Pc.getTime();O=[Math.floor(g/1E3)>>>0,(M=Math.floor(g/1E3),1<=+Math.abs(M)?0<M?+Math.floor(M/
4294967296)>>>0:~~+Math.ceil((M-+(~~M>>>0))/4294967296)>>>0:0)];E[b+40>>2]=O[0];E[b+44>>2]=O[1];F[b+48>>2]=g%1E3*1E3;O=[Math.floor(m/1E3)>>>0,(M=Math.floor(m/1E3),1<=+Math.abs(M)?0<M?+Math.floor(M/4294967296)>>>0:~~+Math.ceil((M-+(~~M>>>0))/4294967296)>>>0:0)];E[b+56>>2]=O[0];E[b+60>>2]=O[1];F[b+64>>2]=m%1E3*1E3;O=[Math.floor(n/1E3)>>>0,(M=Math.floor(n/1E3),1<=+Math.abs(M)?0<M?+Math.floor(M/4294967296)>>>0:~~+Math.ceil((M-+(~~M>>>0))/4294967296)>>>0:0)];E[b+72>>2]=O[0];E[b+76>>2]=O[1];F[b+80>>2]=
n%1E3*1E3;O=[e.kc>>>0,(M=e.kc,1<=+Math.abs(M)?0<M?+Math.floor(M/4294967296)>>>0:~~+Math.ceil((M-+(~~M>>>0))/4294967296)>>>0:0)];E[b+88>>2]=O[0];E[b+92>>2]=O[1];f=0}return f}catch(k){if("undefined"==typeof kc||"ErrnoError"!==k.name)throw k;return-k.Xa}},N:function(a,b,c){lc=c;try{var d=Sb(a);switch(b){case 21509:return d.ya?0:-59;case 21505:if(!d.ya)return-59;if(d.ya.Va.gd){b=[3,28,127,21,4,0,1,0,17,19,26,0,18,15,23,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];var e=mc();E[e>>2]=25856;E[e+4>>2]=5;E[e+8>>2]=
191;E[e+12>>2]=35387;for(var f=0;32>f;f++)z[e+f+17>>0]=b[f]||0}return 0;case 21510:case 21511:case 21512:return d.ya?0:-59;case 21506:case 21507:case 21508:if(!d.ya)return-59;if(d.ya.Va.hd)for(e=mc(),b=[],f=0;32>f;f++)b.push(z[e+f+17>>0]);return 0;case 21519:if(!d.ya)return-59;e=mc();return E[e>>2]=0;case 21520:return d.ya?-28:-59;case 21531:e=mc();if(!d.wa.fd)throw new P(59);return d.wa.fd(d,b,e);case 21523:if(!d.ya)return-59;d.ya.Va.jd&&(f=[24,80],e=mc(),Ea[e>>1]=f[0],Ea[e+2>>1]=f[1]);return 0;
case 21524:return d.ya?0:-59;case 21515:return d.ya?0:-59;default:return-28}}catch(g){if("undefined"==typeof kc||"ErrnoError"!==g.name)throw g;return-g.Xa}},O:function(a,b,c,d){lc=d;try{b=b?mb(B,b):"";var e=b;if("/"===e.charAt(0))b=e;else{var f=-100===a?"/":Sb(a).path;if(0==e.length)throw new P(44);b=fb(f+"/"+e)}var g=d?mc():0;return ec(b,c,g).Ya}catch(m){if("undefined"==typeof kc||"ErrnoError"!==m.name)throw m;return-m.Xa}},T:function(a,b,c){a=W(a);b=Fc(b,"wrapper");c=rc(c);var d=[].slice,e=b.ta,
f=e.Oa,g=e.Ba.Oa,m=e.Ba.constructor;a=oc(a,function(){e.Ba.rc.forEach(function(k){if(this[k]===g[k])throw new uc(`Pure virtual function ${k} must be implemented in JavaScript`);}.bind(this));Object.defineProperty(this,"__parent",{value:f});this.__construct.apply(this,d.call(arguments))});f.__construct=function(){this===f&&V("Pass correct 'this' to __construct");var k=m.implement.apply(void 0,[this].concat(d.call(arguments)));Gc(k);var t=k.ra;k.notifyOnDestruction();t.ib=!0;Object.defineProperties(this,
{ra:{value:t}});Pc(this);k=t.xa;k=Ac(e,k);zc.hasOwnProperty(k)?V(`Tried to register registered instance: ${k}`):zc[k]=this};f.__destruct=function(){this===f&&V("Pass correct 'this' to __destruct");Gc(this);var k=this.ra.xa;k=Ac(e,k);zc.hasOwnProperty(k)?delete zc[k]:V(`Tried to unregister unregistered instance: ${k}`)};a.prototype=Object.create(f);for(var n in c)a.prototype[n]=c[n];return sc(a)},U:function(a){var b=Qc[a];delete Qc[a];var c=b.Qb,d=b.Wa,e=b.ec,f=e.map(g=>g.cd).concat(e.map(g=>g.zd));
X([a],f,g=>{var m={};e.forEach((n,k)=>{var t=g[k],u=n.ad,x=n.bd,h=g[k+e.length],r=n.yd,q=n.Ad;m[n.Xc]={read:A=>t.fromWireType(u(x,A)),write:(A,D)=>{var v=[];r(q,A,h.toWireType(v,D));Rc(v)}}});return[{name:b.name,fromWireType:function(n){var k={},t;for(t in m)k[t]=m[t].read(n);d(n);return k},toWireType:function(n,k){for(var t in m)if(!(t in k))throw new TypeError(`Missing field: "${t}"`);var u=c();for(t in m)m[t].write(u,k[t]);null!==n&&n.push(d,u);return u},argPackAdvance:8,readValueFromPointer:Sc,
Ka:d}]})},F:function(){},Q:function(a,b,c,d,e){var f=Wc(c);b=W(b);Vc(a,{name:b,fromWireType:function(g){return!!g},toWireType:function(g,m){return m?d:e},argPackAdvance:8,readValueFromPointer:function(g){if(1===c)var m=z;else if(2===c)m=Ea;else if(4===c)m=E;else throw new TypeError("Unknown boolean type size: "+b);return this.fromWireType(m[g>>f])},Ka:null})},f:function(a,b,c,d,e,f,g,m,n,k,t,u,x){t=W(t);f=Z(e,f);m&&(m=Z(g,m));k&&(k=Z(n,k));x=Z(u,x);var h=nc(t);ad(h,function(){md(`Cannot construct ${t} due to unbound types`,
[d])});X([a,b,c],d?[d]:[],function(r){r=r[0];if(d){var q=r.ta;var A=q.Oa}else A=Zc.prototype;r=oc(h,function(){if(Object.getPrototypeOf(this)!==D)throw new qc("Use 'new' to construct "+t);if(void 0===v.$a)throw new qc(t+" has no accessible constructor");var T=v.$a[arguments.length];if(void 0===T)throw new qc(`Tried to invoke ctor of ${t} with invalid number of parameters (${arguments.length}) - expected (${Object.keys(v.$a).toString()}) parameters instead!`);return T.apply(this,arguments)});var D=
Object.create(A,{constructor:{value:r}});r.prototype=D;var v=new bd(t,r,D,x,q,f,m,k);v.Ba&&(void 0===v.Ba.pb&&(v.Ba.pb=[]),v.Ba.pb.push(v));q=new hd(t,v,!0,!1);A=new hd(t+"*",v,!1,!1);var N=new hd(t+" const*",v,!1,!0);Kc[a]={pointerType:A,Nc:N};jd(h,r);return[q,A,N]})},j:function(a,b,c,d,e,f,g){var m=pd(c,d);b=W(b);f=Z(e,f);X([],[a],function(n){function k(){md(`Cannot call ${t} due to unbound types`,m)}n=n[0];var t=`${n.name}.${b}`;b.startsWith("@@")&&(b=Symbol[b.substring(2)]);var u=n.ta.constructor;
void 0===u[b]?(k.eb=c-1,u[b]=k):($c(u,b,t),u[b].Ca[c-1]=k);X([],m,function(x){x=od(t,[x[0],null].concat(x.slice(1)),null,f,g);void 0===u[b].Ca?(x.eb=c-1,u[b]=x):u[b].Ca[c-1]=x;if(n.ta.pb)for(const h of n.ta.pb)h.constructor.hasOwnProperty(b)||(h.constructor[b]=x);return[]});return[]})},y:function(a,b,c,d,e,f,g,m){b=W(b);f=Z(e,f);X([],[a],function(n){n=n[0];var k=`${n.name}.${b}`,t={get(){md(`Cannot access ${k} due to unbound types`,[c])},enumerable:!0,configurable:!0};t.set=m?()=>{md(`Cannot access ${k} due to unbound types`,
[c])}:()=>{V(`${k} is a read-only property`)};Object.defineProperty(n.ta.constructor,b,t);X([],[c],function(u){u=u[0];var x={get(){return u.fromWireType(f(d))},enumerable:!0};m&&(m=Z(g,m),x.set=h=>{var r=[];m(d,u.toWireType(r,h));Rc(r)});Object.defineProperty(n.ta.constructor,b,x);return[]});return[]})},t:function(a,b,c,d,e,f){var g=pd(b,c);e=Z(d,e);X([],[a],function(m){m=m[0];var n=`constructor ${m.name}`;void 0===m.ta.$a&&(m.ta.$a=[]);if(void 0!==m.ta.$a[b-1])throw new qc(`Cannot register multiple constructors with identical number of parameters (${b-
1}) for class '${m.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`);m.ta.$a[b-1]=()=>{md(`Cannot construct ${m.name} due to unbound types`,g)};X([],g,function(k){k.splice(1,0,null);m.ta.$a[b-1]=od(n,k,null,e,f);return[]});return[]})},a:function(a,b,c,d,e,f,g,m){var n=pd(c,d);b=W(b);f=Z(e,f);X([],[a],function(k){function t(){md(`Cannot call ${u} due to unbound types`,n)}k=k[0];var u=`${k.name}.${b}`;b.startsWith("@@")&&(b=Symbol[b.substring(2)]);
m&&k.ta.rc.push(b);var x=k.ta.Oa,h=x[b];void 0===h||void 0===h.Ca&&h.className!==k.name&&h.eb===c-2?(t.eb=c-2,t.className=k.name,x[b]=t):($c(x,b,u),x[b].Ca[c-2]=t);X([],n,function(r){r=od(u,r,k,f,g);void 0===x[b].Ca?(r.eb=c-2,x[b]=r):x[b].Ca[c-2]=r;return[]});return[]})},e:function(a,b,c,d,e,f,g,m,n,k){b=W(b);e=Z(d,e);X([],[a],function(t){t=t[0];var u=`${t.name}.${b}`,x={get(){md(`Cannot access ${u} due to unbound types`,[c,g])},enumerable:!0,configurable:!0};x.set=n?()=>{md(`Cannot access ${u} due to unbound types`,
[c,g])}:()=>{V(u+" is a read-only property")};Object.defineProperty(t.ta.Oa,b,x);X([],n?[c,g]:[c],function(h){var r=h[0],q={get(){var D=qd(this,t,u+" getter");return r.fromWireType(e(f,D))},enumerable:!0};if(n){n=Z(m,n);var A=h[1];q.set=function(D){var v=qd(this,t,u+" setter"),N=[];n(k,v,A.toWireType(N,D));Rc(N)}}Object.defineProperty(t.ta.Oa,b,q);return[]});return[]})},P:function(a,b){b=W(b);Vc(a,{name:b,fromWireType:function(c){var d=rc(c);rd(c);return d},toWireType:function(c,d){return sc(d)},
argPackAdvance:8,readValueFromPointer:Sc,Ka:null})},q:function(a,b,c,d){function e(){}c=Wc(c);b=W(b);e.values={};Vc(a,{name:b,constructor:e,fromWireType:function(f){return this.constructor.values[f]},toWireType:function(f,g){return g.value},argPackAdvance:8,readValueFromPointer:sd(b,c,d),Ka:null});ad(b,e)},d:function(a,b,c){var d=Fc(a,"enum");b=W(b);a=d.constructor;d=Object.create(d.constructor.prototype,{value:{value:c},constructor:{value:oc(`${d.name}_${b}`,function(){})}});a.values[c]=d;a[b]=d},
B:function(a,b,c){c=Wc(c);b=W(b);Vc(a,{name:b,fromWireType:function(d){return d},toWireType:function(d,e){return e},argPackAdvance:8,readValueFromPointer:td(b,c),Ka:null})},l:function(a,b,c,d,e,f){var g=pd(b,c);a=W(a);e=Z(d,e);ad(a,function(){md(`Cannot call ${a} due to unbound types`,g)},b-1);X([],g,function(m){jd(a,od(a,[m[0],null].concat(m.slice(1)),null,e,f),b-1);return[]})},m:function(a,b,c,d,e){b=W(b);-1===e&&(e=4294967295);e=Wc(c);var f=m=>m;if(0===d){var g=32-8*c;f=m=>m<<g>>>g}c=b.includes("unsigned")?
function(m,n){return n>>>0}:function(m,n){return n};Vc(a,{name:b,fromWireType:f,toWireType:c,argPackAdvance:8,readValueFromPointer:ud(b,e,0!==d),Ka:null})},g:function(a,b,c){function d(f){f>>=2;var g=F;return new e(g.buffer,g[f+1],g[f])}var e=[Int8Array,Uint8Array,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array][b];c=W(c);Vc(a,{name:c,fromWireType:d,argPackAdvance:8,readValueFromPointer:d},{ed:!0})},C:function(a,b){b=W(b);var c="std::string"===b;Vc(a,{name:b,fromWireType:function(d){var e=
F[d>>2],f=d+4;if(c)for(var g=f,m=0;m<=e;++m){var n=f+m;if(m==e||0==B[n]){g=g?mb(B,g,n-g):"";if(void 0===k)var k=g;else k+=String.fromCharCode(0),k+=g;g=n+1}}else{k=Array(e);for(m=0;m<e;++m)k[m]=String.fromCharCode(B[f+m]);k=k.join("")}Ec(d);return k},toWireType:function(d,e){e instanceof ArrayBuffer&&(e=new Uint8Array(e));var f="string"==typeof e;f||e instanceof Uint8Array||e instanceof Uint8ClampedArray||e instanceof Int8Array||V("Cannot pass non-string to std::string");var g=c&&f?ob(e):e.length;
var m=Td(4+g+1),n=m+4;F[m>>2]=g;if(c&&f)pb(e,B,n,g+1);else if(f)for(f=0;f<g;++f){var k=e.charCodeAt(f);255<k&&(Ec(n),V("String has UTF-16 code units that do not fit in 8 bits"));B[n+f]=k}else for(f=0;f<g;++f)B[n+f]=e[f];null!==d&&d.push(Ec,m);return m},argPackAdvance:8,readValueFromPointer:Sc,Ka:function(d){Ec(d)}})},v:function(a,b,c){c=W(c);if(2===b){var d=wd;var e=xd;var f=yd;var g=()=>Fa;var m=1}else 4===b&&(d=zd,e=Ad,f=Bd,g=()=>F,m=2);Vc(a,{name:c,fromWireType:function(n){for(var k=F[n>>2],t=
g(),u,x=n+4,h=0;h<=k;++h){var r=n+4+h*b;if(h==k||0==t[r>>m])x=d(x,r-x),void 0===u?u=x:(u+=String.fromCharCode(0),u+=x),x=r+b}Ec(n);return u},toWireType:function(n,k){"string"!=typeof k&&V(`Cannot pass non-string to C++ string type ${c}`);var t=f(k),u=Td(4+t+b);F[u>>2]=t>>m;e(k,u+4,t+b);null!==n&&n.push(Ec,u);return u},argPackAdvance:8,readValueFromPointer:Sc,Ka:function(n){Ec(n)}})},W:function(a,b,c,d,e,f){Qc[a]={name:W(b),Qb:Z(c,d),Wa:Z(e,f),ec:[]}},V:function(a,b,c,d,e,f,g,m,n,k){Qc[a].ec.push({Xc:W(b),
cd:c,ad:Z(d,e),bd:f,zd:g,yd:Z(m,n),Ad:k})},R:function(a,b){b=W(b);Vc(a,{ld:!0,name:b,argPackAdvance:0,fromWireType:function(){},toWireType:function(){}})},w:function(a,b,c){a=rc(a);b=Fc(b,"emval::as");var d=[],e=sc(d);F[c>>2]=e;return b.toWireType(d,a)},x:function(a,b,c,d,e){a=Ed[a];b=rc(b);c=Dd(c);var f=[];F[d>>2]=sc(f);return a(b,c,f,e)},i:function(a,b,c,d){a=Ed[a];b=rc(b);c=Dd(c);a(b,c,null,d)},c:rd,h:function(a,b){var c=Gd(a,b),d=c[0];b=d.name+"_$"+c.slice(1).map(function(g){return g.name}).join("_")+
"$";var e=Hd[b];if(void 0!==e)return e;var f=Array(a-1);e=Fd((g,m,n,k)=>{for(var t=0,u=0;u<a-1;++u)f[u]=c[u+1].readValueFromPointer(k+t),t+=c[u+1].argPackAdvance;g=g[m].apply(g,f);for(u=0;u<a-1;++u)c[u+1].Rc&&c[u+1].Rc(f[u]);if(!d.ld)return d.toWireType(n,g)});return Hd[b]=e},u:function(a){a=Dd(a);return sc(l[a])},S:function(a,b){a=rc(a);b=rc(b);return sc(a[b])},o:function(a){4<a&&(U.get(a).uc+=1)},p:function(a){return sc(Dd(a))},D:function(){return sc({})},r:function(a){var b=rc(a);Rc(b);rd(a)},
n:function(a,b,c){a=rc(a);b=rc(b);c=rc(c);a[b]=c},s:function(a,b){a=Fc(a,"_emval_take_value");a=a.readValueFromPointer(b);return sc(a)},b:()=>{Aa("")},k:(a,b,c)=>{Id.length=0;var d;for(c>>=2;d=B[b++];)c+=105!=d&c,Id.push(105==d?E[c]:Ha[c++>>1]),++c;return cb[a].apply(null,Id)},H:a=>{var b=B.length;a>>>=0;if(2147483648<a)return!1;for(var c=1;4>=c;c*=2){var d=b*(1+.2/c);d=Math.min(d,a+100663296);var e=Math;d=Math.max(a,d);a:{e=e.min.call(e,2147483648,d+(65536-d%65536)%65536)-Ba.buffer.byteLength+65535>>>
16;try{Ba.grow(e);Ka();var f=1;break a}catch(g){}f=void 0}if(f)return!0}return!1},I:(a,b)=>{var c=0;Ld().forEach(function(d,e){var f=b+c;e=F[a+4*e>>2]=f;for(f=0;f<d.length;++f)z[e++>>0]=d.charCodeAt(f);z[e>>0]=0;c+=d.length+1});return 0},J:(a,b)=>{var c=Ld();F[a>>2]=c.length;var d=0;c.forEach(function(e){d+=e.length+1});F[b>>2]=d;return 0},z:function(a){try{var b=Sb(a);if(null===b.Ya)throw new P(8);b.Nb&&(b.Nb=null);try{b.wa.close&&b.wa.close(b)}catch(c){throw c;}finally{Fb[b.Ya]=null}b.Ya=null;return 0}catch(c){if("undefined"==
typeof kc||"ErrnoError"!==c.name)throw c;return c.Xa}},M:function(a,b,c,d){try{a:{var e=Sb(a);a=b;for(var f,g=b=0;g<c;g++){var m=F[a>>2],n=F[a+4>>2];a+=8;var k=e,t=m,u=n,x=f,h=z;if(0>u||0>x)throw new P(28);if(null===k.Ya)throw new P(8);if(1===(k.flags&2097155))throw new P(8);if(16384===(k.node.mode&61440))throw new P(31);if(!k.wa.read)throw new P(28);var r="undefined"!=typeof x;if(!r)x=k.position;else if(!k.seekable)throw new P(70);var q=k.wa.read(k,h,t,u,x);r||(k.position+=q);var A=q;if(0>A){var D=
-1;break a}b+=A;if(A<n)break;"undefined"!==typeof f&&(f+=A)}D=b}F[d>>2]=D;return 0}catch(v){if("undefined"==typeof kc||"ErrnoError"!==v.name)throw v;return v.Xa}},E:function(a,b,c,d,e){b=c+2097152>>>0<4194305-!!b?(b>>>0)+4294967296*c:NaN;try{if(isNaN(b))return 61;var f=Sb(a);fc(f,b,d);O=[f.position>>>0,(M=f.position,1<=+Math.abs(M)?0<M?+Math.floor(M/4294967296)>>>0:~~+Math.ceil((M-+(~~M>>>0))/4294967296)>>>0:0)];E[e>>2]=O[0];E[e+4>>2]=O[1];f.Nb&&0===b&&0===d&&(f.Nb=null);return 0}catch(g){if("undefined"==
typeof kc||"ErrnoError"!==g.name)throw g;return g.Xa}},L:function(a,b,c,d){try{a:{var e=Sb(a);a=b;for(var f,g=b=0;g<c;g++){var m=F[a>>2],n=F[a+4>>2];a+=8;var k=e,t=m,u=n,x=f,h=z;if(0>u||0>x)throw new P(28);if(null===k.Ya)throw new P(8);if(0===(k.flags&2097155))throw new P(8);if(16384===(k.node.mode&61440))throw new P(31);if(!k.wa.write)throw new P(28);k.seekable&&k.flags&1024&&fc(k,0,2);var r="undefined"!=typeof x;if(!r)x=k.position;else if(!k.seekable)throw new P(70);var q=k.wa.write(k,h,t,u,x,void 0);
r||(k.position+=q);var A=q;if(0>A){var D=-1;break a}b+=A;"undefined"!==typeof f&&(f+=A)}D=b}F[d>>2]=D;return 0}catch(v){if("undefined"==typeof kc||"ErrnoError"!==v.name)throw v;return v.Xa}},G:(a,b,c,d)=>Pd(a,b,c,d)};
(function(){function a(c){w=c=c.exports;Ba=w.X;Ka();La=w.ha;Na.unshift(w.Y);Qa--;l.monitorRunDependencies&&l.monitorRunDependencies(Qa);if(0==Qa&&(null!==Ra&&(clearInterval(Ra),Ra=null),Sa)){var d=Sa;Sa=null;d()}return c}var b={a:Ud};Qa++;l.monitorRunDependencies&&l.monitorRunDependencies(Qa);if(l.instantiateWasm)try{return l.instantiateWasm(b,a)}catch(c){ya("Module.instantiateWasm callback failed with error: "+c),ba(c)}Za(b,function(c){a(c.instance)}).catch(ba);return{}})();
var Ec=a=>(Ec=w.Z)(a),Td=a=>(Td=w._)(a),Sd=()=>(Sd=w.$)(),$a=l._ma_device__on_notification_unlocked=a=>($a=l._ma_device__on_notification_unlocked=w.aa)(a);l._ma_malloc_emscripten=(a,b)=>(l._ma_malloc_emscripten=w.ba)(a,b);l._ma_free_emscripten=(a,b)=>(l._ma_free_emscripten=w.ca)(a,b);
var ab=l._ma_device_process_pcm_frames_capture__webaudio=(a,b,c)=>(ab=l._ma_device_process_pcm_frames_capture__webaudio=w.da)(a,b,c),bb=l._ma_device_process_pcm_frames_playback__webaudio=(a,b,c)=>(bb=l._ma_device_process_pcm_frames_playback__webaudio=w.ea)(a,b,c),Dc=a=>(Dc=w.fa)(a);l.__embind_initialize_bindings=()=>(l.__embind_initialize_bindings=w.ga)();l.dynCall_iiji=(a,b,c,d,e)=>(l.dynCall_iiji=w.ia)(a,b,c,d,e);l.dynCall_iiiji=(a,b,c,d,e,f)=>(l.dynCall_iiiji=w.ja)(a,b,c,d,e,f);
l.dynCall_jiji=(a,b,c,d,e)=>(l.dynCall_jiji=w.ka)(a,b,c,d,e);l.dynCall_iij=(a,b,c,d)=>(l.dynCall_iij=w.la)(a,b,c,d);l.dynCall_jii=(a,b,c)=>(l.dynCall_jii=w.ma)(a,b,c);l.dynCall_viijii=(a,b,c,d,e,f,g)=>(l.dynCall_viijii=w.na)(a,b,c,d,e,f,g);l.dynCall_iiiiij=(a,b,c,d,e,f,g)=>(l.dynCall_iiiiij=w.oa)(a,b,c,d,e,f,g);l.dynCall_iiiiijj=(a,b,c,d,e,f,g,m,n)=>(l.dynCall_iiiiijj=w.pa)(a,b,c,d,e,f,g,m,n);l.dynCall_iiiiiijj=(a,b,c,d,e,f,g,m,n,k)=>(l.dynCall_iiiiiijj=w.qa)(a,b,c,d,e,f,g,m,n,k);var Vd;
Sa=function Wd(){Vd||Xd();Vd||(Sa=Wd)};
function Xd(){function a(){if(!Vd&&(Vd=!0,l.calledRun=!0,!Da)){l.noFSInit||hc||(hc=!0,gc(),l.stdin=l.stdin,l.stdout=l.stdout,l.stderr=l.stderr,l.stdin?jc("stdin",l.stdin):cc("/dev/tty","/dev/stdin"),l.stdout?jc("stdout",null,l.stdout):cc("/dev/tty","/dev/stdout"),l.stderr?jc("stderr",null,l.stderr):cc("/dev/tty1","/dev/stderr"),ec("/dev/stdin",0),ec("/dev/stdout",1),ec("/dev/stderr",1));Ib=!1;db(Na);aa(l);if(l.onRuntimeInitialized)l.onRuntimeInitialized();if(l.postRun)for("function"==typeof l.postRun&&
(l.postRun=[l.postRun]);l.postRun.length;){var b=l.postRun.shift();Oa.unshift(b)}db(Oa)}}if(!(0<Qa)){if(l.preRun)for("function"==typeof l.preRun&&(l.preRun=[l.preRun]);l.preRun.length;)Pa();db(Ma);0<Qa||(l.setStatus?(l.setStatus("Running..."),setTimeout(function(){setTimeout(function(){l.setStatus("")},1);a()},1)):a())}}if(l.preInit)for("function"==typeof l.preInit&&(l.preInit=[l.preInit]);0<l.preInit.length;)l.preInit.pop()();Xd();


  return moduleArg.ready
}

);
})();
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Rive);

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = JSON.parse('{"name":"@rive-app/canvas","version":"2.10.3","description":"Rive\'s canvas based web api.","main":"rive.js","homepage":"https://rive.app","repository":{"type":"git","url":"https://github.com/rive-app/rive-wasm/tree/master/js"},"keywords":["rive","animation"],"author":"Rive","contributors":["Luigi Rosso <luigi@rive.app> (https://rive.app)","Maxwell Talbot <max@rive.app> (https://rive.app)","Arthur Vivian <arthur@rive.app> (https://rive.app)","Umberto Sonnino <umberto@rive.app> (https://rive.app)","Matthew Sullivan <matt.j.sullivan@gmail.com> (mailto:matt.j.sullivan@gmail.com)"],"license":"MIT","files":["rive.js","rive.js.map","rive.wasm","rive.d.ts","rive_advanced.mjs.d.ts"],"typings":"rive.d.ts","dependencies":{},"browser":{"fs":false,"path":false}}');

/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BLANK_URL: () => (/* reexport safe */ _sanitizeUrl__WEBPACK_IMPORTED_MODULE_1__.BLANK_URL),
/* harmony export */   registerTouchInteractions: () => (/* reexport safe */ _registerTouchInteractions__WEBPACK_IMPORTED_MODULE_0__.registerTouchInteractions),
/* harmony export */   sanitizeUrl: () => (/* reexport safe */ _sanitizeUrl__WEBPACK_IMPORTED_MODULE_1__.sanitizeUrl)
/* harmony export */ });
/* harmony import */ var _registerTouchInteractions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4);
/* harmony import */ var _sanitizeUrl__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5);




/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   registerTouchInteractions: () => (/* binding */ registerTouchInteractions)
/* harmony export */ });
var _this = undefined;
/**
 * Returns the clientX and clientY properties from touch or mouse events. Also
 * calls preventDefault() on the event if it is a touchstart or touchmove to prevent
 * scrolling the page on mobile devices
 * @param event - Either a TouchEvent or a MouseEvent
 * @returns - Coordinates of the clientX and clientY properties from the touch/mouse event
 */
var getClientCoordinates = function (event) {
    var _a, _b;
    if (["touchstart", "touchmove"].indexOf(event.type) > -1 &&
        ((_a = event.touches) === null || _a === void 0 ? void 0 : _a.length)) {
        event.preventDefault();
        return {
            clientX: event.touches[0].clientX,
            clientY: event.touches[0].clientY,
        };
    }
    else if (event.type === "touchend" &&
        ((_b = event.changedTouches) === null || _b === void 0 ? void 0 : _b.length)) {
        return {
            clientX: event.changedTouches[0].clientX,
            clientY: event.changedTouches[0].clientY,
        };
    }
    else {
        return {
            clientX: event.clientX,
            clientY: event.clientY,
        };
    }
};
/**
 * Registers mouse move/up/down callback handlers on the canvas to send meaningful coordinates to
 * the state machine pointer move/up/down functions based on cursor interaction
 */
var registerTouchInteractions = function (_a) {
    var canvas = _a.canvas, artboard = _a.artboard, _b = _a.stateMachines, stateMachines = _b === void 0 ? [] : _b, renderer = _a.renderer, rive = _a.rive, fit = _a.fit, alignment = _a.alignment;
    if (!canvas ||
        !stateMachines.length ||
        !renderer ||
        !rive ||
        !artboard ||
        typeof window === "undefined") {
        return null;
    }
    var processEventCallback = function (event) {
        var boundingRect = event.currentTarget.getBoundingClientRect();
        var _a = getClientCoordinates(event), clientX = _a.clientX, clientY = _a.clientY;
        if (!clientX && !clientY) {
            return;
        }
        var canvasX = clientX - boundingRect.left;
        var canvasY = clientY - boundingRect.top;
        var forwardMatrix = rive.computeAlignment(fit, alignment, {
            minX: 0,
            minY: 0,
            maxX: boundingRect.width,
            maxY: boundingRect.height,
        }, artboard.bounds);
        var invertedMatrix = new rive.Mat2D();
        forwardMatrix.invert(invertedMatrix);
        var canvasCoordinatesVector = new rive.Vec2D(canvasX, canvasY);
        var transformedVector = rive.mapXY(invertedMatrix, canvasCoordinatesVector);
        var transformedX = transformedVector.x();
        var transformedY = transformedVector.y();
        transformedVector.delete();
        invertedMatrix.delete();
        canvasCoordinatesVector.delete();
        forwardMatrix.delete();
        switch (event.type) {
            /**
             * There's a 2px buffer for a hitRadius when translating the pointer coordinates
             * down to the state machine. In cases where the hitbox is about that much away
             * from the Artboard border, we don't have exact precision on determining pointer
             * exit. We're therefore adding to the translated coordinates on mouseout of a canvas
             * to ensure that we report the mouse has truly exited the hitarea.
             * https://github.com/rive-app/rive-cpp/blob/master/src/animation/state_machine_instance.cpp#L336
             *
             * We add/subtract 10000 to account for when the graphic goes beyond the canvas bound
             * due to for example, a fit: 'cover'. Not perfect, but helps reliably (for now) ensure
             * we report going out of bounds when the mouse is out of the canvas
             */
            case "mouseout":
                for (var _i = 0, stateMachines_1 = stateMachines; _i < stateMachines_1.length; _i++) {
                    var stateMachine = stateMachines_1[_i];
                    stateMachine.pointerMove(transformedX < 0 ? transformedX - 10000 : transformedX + 10000, transformedY < 0 ? transformedY - 10000 : transformedY + 10000);
                }
                break;
            // Pointer moving/hovering on the canvas
            case "touchmove":
            case "mouseover":
            case "mousemove": {
                for (var _b = 0, stateMachines_2 = stateMachines; _b < stateMachines_2.length; _b++) {
                    var stateMachine = stateMachines_2[_b];
                    stateMachine.pointerMove(transformedX, transformedY);
                }
                break;
            }
            // Pointer click initiated but not released yet on the canvas
            case "touchstart":
            case "mousedown": {
                for (var _c = 0, stateMachines_3 = stateMachines; _c < stateMachines_3.length; _c++) {
                    var stateMachine = stateMachines_3[_c];
                    stateMachine.pointerDown(transformedX, transformedY);
                }
                break;
            }
            // Pointer click released on the canvas
            case "touchend":
            case "mouseup": {
                for (var _d = 0, stateMachines_4 = stateMachines; _d < stateMachines_4.length; _d++) {
                    var stateMachine = stateMachines_4[_d];
                    stateMachine.pointerUp(transformedX, transformedY);
                }
                break;
            }
            default:
        }
    };
    var callback = processEventCallback.bind(_this);
    canvas.addEventListener("mouseover", callback);
    canvas.addEventListener("mouseout", callback);
    canvas.addEventListener("mousemove", callback);
    canvas.addEventListener("mousedown", callback);
    canvas.addEventListener("mouseup", callback);
    canvas.addEventListener("touchmove", callback);
    canvas.addEventListener("touchstart", callback);
    canvas.addEventListener("touchend", callback);
    return function () {
        canvas.removeEventListener("mouseover", callback);
        canvas.removeEventListener("mouseout", callback);
        canvas.removeEventListener("mousemove", callback);
        canvas.removeEventListener("mousedown", callback);
        canvas.removeEventListener("mouseup", callback);
        canvas.removeEventListener("touchmove", callback);
        canvas.removeEventListener("touchstart", callback);
        canvas.removeEventListener("touchend", callback);
    };
};


/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BLANK_URL: () => (/* binding */ BLANK_URL),
/* harmony export */   sanitizeUrl: () => (/* binding */ sanitizeUrl)
/* harmony export */ });
// Reference: https://github.com/braintree/sanitize-url/tree/main
var invalidProtocolRegex = /^([^\w]*)(javascript|data|vbscript)/im;
var htmlEntitiesRegex = /&#(\w+)(^\w|;)?/g;
var htmlCtrlEntityRegex = /&(newline|tab);/gi;
var ctrlCharactersRegex = /[\u0000-\u001F\u007F-\u009F\u2000-\u200D\uFEFF]/gim;
var urlSchemeRegex = /^.+(:|&colon;)/gim;
var relativeFirstCharacters = [".", "/"];
var BLANK_URL = "about:blank";
function isRelativeUrlWithoutProtocol(url) {
    return relativeFirstCharacters.indexOf(url[0]) > -1;
}
// adapted from https://stackoverflow.com/a/29824550/2601552
function decodeHtmlCharacters(str) {
    var removedNullByte = str.replace(ctrlCharactersRegex, "");
    return removedNullByte.replace(htmlEntitiesRegex, function (match, dec) {
        return String.fromCharCode(dec);
    });
}
function sanitizeUrl(url) {
    if (!url) {
        return BLANK_URL;
    }
    var sanitizedUrl = decodeHtmlCharacters(url)
        .replace(htmlCtrlEntityRegex, "")
        .replace(ctrlCharactersRegex, "")
        .trim();
    if (!sanitizedUrl) {
        return BLANK_URL;
    }
    if (isRelativeUrlWithoutProtocol(sanitizedUrl)) {
        return sanitizedUrl;
    }
    var urlSchemeParseResults = sanitizedUrl.match(urlSchemeRegex);
    if (!urlSchemeParseResults) {
        return sanitizedUrl;
    }
    var urlScheme = urlSchemeParseResults[0];
    if (invalidProtocolRegex.test(urlScheme)) {
        return BLANK_URL;
    }
    return sanitizedUrl;
}


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Alignment: () => (/* binding */ Alignment),
/* harmony export */   EventType: () => (/* binding */ EventType),
/* harmony export */   Fit: () => (/* binding */ Fit),
/* harmony export */   Layout: () => (/* binding */ Layout),
/* harmony export */   LoopType: () => (/* binding */ LoopType),
/* harmony export */   Rive: () => (/* binding */ Rive),
/* harmony export */   RiveEventType: () => (/* binding */ RiveEventType),
/* harmony export */   RuntimeLoader: () => (/* binding */ RuntimeLoader),
/* harmony export */   StateMachineInput: () => (/* binding */ StateMachineInput),
/* harmony export */   StateMachineInputType: () => (/* binding */ StateMachineInputType),
/* harmony export */   Testing: () => (/* binding */ Testing),
/* harmony export */   decodeFont: () => (/* binding */ decodeFont),
/* harmony export */   decodeImage: () => (/* binding */ decodeImage)
/* harmony export */ });
/* harmony import */ var _rive_advanced_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var package_json__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2);
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(3);
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};



// #region layout
// Fit options for the canvas
var Fit;
(function (Fit) {
    Fit["Cover"] = "cover";
    Fit["Contain"] = "contain";
    Fit["Fill"] = "fill";
    Fit["FitWidth"] = "fitWidth";
    Fit["FitHeight"] = "fitHeight";
    Fit["None"] = "none";
    Fit["ScaleDown"] = "scaleDown";
})(Fit || (Fit = {}));
// Alignment options for the canvas
var Alignment;
(function (Alignment) {
    Alignment["Center"] = "center";
    Alignment["TopLeft"] = "topLeft";
    Alignment["TopCenter"] = "topCenter";
    Alignment["TopRight"] = "topRight";
    Alignment["CenterLeft"] = "centerLeft";
    Alignment["CenterRight"] = "centerRight";
    Alignment["BottomLeft"] = "bottomLeft";
    Alignment["BottomCenter"] = "bottomCenter";
    Alignment["BottomRight"] = "bottomRight";
})(Alignment || (Alignment = {}));
// Alignment options for Rive animations in a HTML canvas
var Layout = /** @class */ (function () {
    function Layout(params) {
        var _a, _b, _c, _d, _e, _f;
        this.fit = (_a = params === null || params === void 0 ? void 0 : params.fit) !== null && _a !== void 0 ? _a : Fit.Contain;
        this.alignment = (_b = params === null || params === void 0 ? void 0 : params.alignment) !== null && _b !== void 0 ? _b : Alignment.Center;
        this.minX = (_c = params === null || params === void 0 ? void 0 : params.minX) !== null && _c !== void 0 ? _c : 0;
        this.minY = (_d = params === null || params === void 0 ? void 0 : params.minY) !== null && _d !== void 0 ? _d : 0;
        this.maxX = (_e = params === null || params === void 0 ? void 0 : params.maxX) !== null && _e !== void 0 ? _e : 0;
        this.maxY = (_f = params === null || params === void 0 ? void 0 : params.maxY) !== null && _f !== void 0 ? _f : 0;
    }
    // Alternative constructor to build a Layout from an interface/object
    Layout.new = function (_a) {
        var fit = _a.fit, alignment = _a.alignment, minX = _a.minX, minY = _a.minY, maxX = _a.maxX, maxY = _a.maxY;
        console.warn("This function is deprecated: please use `new Layout({})` instead");
        return new Layout({ fit: fit, alignment: alignment, minX: minX, minY: minY, maxX: maxX, maxY: maxY });
    };
    /**
     * Makes a copy of the layout, replacing any specified parameters
     */
    Layout.prototype.copyWith = function (_a) {
        var fit = _a.fit, alignment = _a.alignment, minX = _a.minX, minY = _a.minY, maxX = _a.maxX, maxY = _a.maxY;
        return new Layout({
            fit: fit !== null && fit !== void 0 ? fit : this.fit,
            alignment: alignment !== null && alignment !== void 0 ? alignment : this.alignment,
            minX: minX !== null && minX !== void 0 ? minX : this.minX,
            minY: minY !== null && minY !== void 0 ? minY : this.minY,
            maxX: maxX !== null && maxX !== void 0 ? maxX : this.maxX,
            maxY: maxY !== null && maxY !== void 0 ? maxY : this.maxY,
        });
    };
    // Returns fit for the Wasm runtime format
    Layout.prototype.runtimeFit = function (rive) {
        if (this.cachedRuntimeFit)
            return this.cachedRuntimeFit;
        var fit;
        if (this.fit === Fit.Cover)
            fit = rive.Fit.cover;
        else if (this.fit === Fit.Contain)
            fit = rive.Fit.contain;
        else if (this.fit === Fit.Fill)
            fit = rive.Fit.fill;
        else if (this.fit === Fit.FitWidth)
            fit = rive.Fit.fitWidth;
        else if (this.fit === Fit.FitHeight)
            fit = rive.Fit.fitHeight;
        else if (this.fit === Fit.ScaleDown)
            fit = rive.Fit.scaleDown;
        else
            fit = rive.Fit.none;
        this.cachedRuntimeFit = fit;
        return fit;
    };
    // Returns alignment for the Wasm runtime format
    Layout.prototype.runtimeAlignment = function (rive) {
        if (this.cachedRuntimeAlignment)
            return this.cachedRuntimeAlignment;
        var alignment;
        if (this.alignment === Alignment.TopLeft)
            alignment = rive.Alignment.topLeft;
        else if (this.alignment === Alignment.TopCenter)
            alignment = rive.Alignment.topCenter;
        else if (this.alignment === Alignment.TopRight)
            alignment = rive.Alignment.topRight;
        else if (this.alignment === Alignment.CenterLeft)
            alignment = rive.Alignment.centerLeft;
        else if (this.alignment === Alignment.CenterRight)
            alignment = rive.Alignment.centerRight;
        else if (this.alignment === Alignment.BottomLeft)
            alignment = rive.Alignment.bottomLeft;
        else if (this.alignment === Alignment.BottomCenter)
            alignment = rive.Alignment.bottomCenter;
        else if (this.alignment === Alignment.BottomRight)
            alignment = rive.Alignment.bottomRight;
        else
            alignment = rive.Alignment.center;
        this.cachedRuntimeAlignment = alignment;
        return alignment;
    };
    return Layout;
}());

// Runtime singleton; use getInstance to provide a callback that returns the
// Rive runtime
var RuntimeLoader = /** @class */ (function () {
    // Class is never instantiated
    function RuntimeLoader() {
    }
    // Loads the runtime
    RuntimeLoader.loadRuntime = function () {
        _rive_advanced_mjs__WEBPACK_IMPORTED_MODULE_0__["default"]({
            // Loads Wasm bundle
            locateFile: function () { return RuntimeLoader.wasmURL; },
        })
            .then(function (rive) {
            var _a;
            RuntimeLoader.runtime = rive;
            // Fire all the callbacks
            while (RuntimeLoader.callBackQueue.length > 0) {
                (_a = RuntimeLoader.callBackQueue.shift()) === null || _a === void 0 ? void 0 : _a(RuntimeLoader.runtime);
            }
        })
            .catch(function () {
            // In case unpkg fails or goes down, we should try to load from jsdelivr
            var backupJsdelivrUrl = "https://cdn.jsdelivr.net/npm/".concat(package_json__WEBPACK_IMPORTED_MODULE_1__.name, "@").concat(package_json__WEBPACK_IMPORTED_MODULE_1__.version, "/rive.wasm");
            if (RuntimeLoader.wasmURL.toLowerCase() !== backupJsdelivrUrl) {
                console.warn("Failed to load WASM from ".concat(RuntimeLoader.wasmURL, ", trying jsdelivr as a backup"));
                RuntimeLoader.setWasmUrl(backupJsdelivrUrl);
                RuntimeLoader.loadRuntime();
            }
            else {
                console.error("Could not load Rive WASM file from unpkg or jsdelivr, network connection may be down, or \
        you may need to call set a new WASM source via RuntimeLoader.setWasmUrl() and call \
        RuntimeLoader.loadRuntime() again");
            }
        });
    };
    // Provides a runtime instance via a callback
    RuntimeLoader.getInstance = function (callback) {
        // If it's not loading, start loading runtime
        if (!RuntimeLoader.isLoading) {
            RuntimeLoader.isLoading = true;
            RuntimeLoader.loadRuntime();
        }
        if (!RuntimeLoader.runtime) {
            RuntimeLoader.callBackQueue.push(callback);
        }
        else {
            callback(RuntimeLoader.runtime);
        }
    };
    // Provides a runtime instance via a promise
    RuntimeLoader.awaitInstance = function () {
        return new Promise(function (resolve) {
            return RuntimeLoader.getInstance(function (rive) { return resolve(rive); });
        });
    };
    // Manually sets the wasm url
    RuntimeLoader.setWasmUrl = function (url) {
        RuntimeLoader.wasmURL = url;
    };
    // Flag to indicate that loading has started/completed
    RuntimeLoader.isLoading = false;
    // List of callbacks for the runtime that come in while loading
    RuntimeLoader.callBackQueue = [];
    // Path to the Wasm file; default path works for testing only;
    // if embedded wasm is used then this is never used.
    RuntimeLoader.wasmURL = "https://unpkg.com/".concat(package_json__WEBPACK_IMPORTED_MODULE_1__.name, "@").concat(package_json__WEBPACK_IMPORTED_MODULE_1__.version, "/rive.wasm");
    return RuntimeLoader;
}());

// #endregion
// #region animations
// Wraps animations and instances from the runtime and keeps track of playback
// state
var Animation = /** @class */ (function () {
    /**
     * Constructs a new animation
     * @constructor
     * @param {any} animation: runtime animation object
     * @param {any} instance: runtime animation instance object
     */
    function Animation(animation, artboard, runtime, playing) {
        this.animation = animation;
        this.artboard = artboard;
        this.playing = playing;
        this.loopCount = 0;
        // Time to which the animation should move to on the next render
        this.scrubTo = null;
        this.instance = new runtime.LinearAnimationInstance(animation, artboard);
    }
    Object.defineProperty(Animation.prototype, "name", {
        // Returns the animation's name
        get: function () {
            return this.animation.name;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Animation.prototype, "time", {
        // Returns the animation's current time
        get: function () {
            return this.instance.time;
        },
        // Sets the animation's current time
        set: function (value) {
            this.instance.time = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Animation.prototype, "loopValue", {
        // Returns the animation's loop type
        get: function () {
            return this.animation.loopValue;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Advances the animation by the give time. If the animation needs scrubbing,
     * time is ignored and the stored scrub value is used.
     * @param time the time to advance the animation by if no scrubbing required
     */
    Animation.prototype.advance = function (time) {
        if (this.scrubTo === null) {
            this.instance.advance(time);
        }
        else {
            this.instance.time = 0;
            this.instance.advance(this.scrubTo);
            this.scrubTo = null;
        }
    };
    /**
     * Apply interpolated keyframe values to the artboard. This should be called after calling
     * .advance() on an animation instance so that new values are applied to properties.
     *
     * Note: This does not advance the artboard, which updates all objects on the artboard
     * @param mix - Mix value for the animation from 0 to 1
     */
    Animation.prototype.apply = function (mix) {
        this.instance.apply(mix);
    };
    Object.defineProperty(Animation.prototype, "needsScrub", {
        get: function () {
            return this.scrubTo !== null;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Deletes the backing Wasm animation instance; once this is called, this
     * animation is no more.
     */
    Animation.prototype.cleanup = function () {
        this.instance.delete();
    };
    return Animation;
}());
// #endregion
// #region state machines
var StateMachineInputType;
(function (StateMachineInputType) {
    StateMachineInputType[StateMachineInputType["Number"] = 56] = "Number";
    StateMachineInputType[StateMachineInputType["Trigger"] = 58] = "Trigger";
    StateMachineInputType[StateMachineInputType["Boolean"] = 59] = "Boolean";
})(StateMachineInputType || (StateMachineInputType = {}));
/**
 * An input for a state machine
 */
var StateMachineInput = /** @class */ (function () {
    function StateMachineInput(type, runtimeInput) {
        this.type = type;
        this.runtimeInput = runtimeInput;
    }
    Object.defineProperty(StateMachineInput.prototype, "name", {
        /**
         * Returns the name of the input
         */
        get: function () {
            return this.runtimeInput.name;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StateMachineInput.prototype, "value", {
        /**
         * Returns the current value of the input
         */
        get: function () {
            return this.runtimeInput.value;
        },
        /**
         * Sets the value of the input
         */
        set: function (value) {
            this.runtimeInput.value = value;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Fires a trigger; does nothing on Number or Boolean input types
     */
    StateMachineInput.prototype.fire = function () {
        if (this.type === StateMachineInputType.Trigger) {
            this.runtimeInput.fire();
        }
    };
    return StateMachineInput;
}());

var RiveEventType;
(function (RiveEventType) {
    RiveEventType[RiveEventType["General"] = 128] = "General";
    RiveEventType[RiveEventType["OpenUrl"] = 131] = "OpenUrl";
})(RiveEventType || (RiveEventType = {}));
var StateMachine = /** @class */ (function () {
    /**
     * @constructor
     * @param stateMachine runtime state machine object
     * @param instance runtime state machine instance object
     */
    function StateMachine(stateMachine, runtime, playing, artboard) {
        this.stateMachine = stateMachine;
        this.playing = playing;
        this.artboard = artboard;
        /**
         * Caches the inputs from the runtime
         */
        this.inputs = [];
        this.instance = new runtime.StateMachineInstance(stateMachine, artboard);
        this.initInputs(runtime);
    }
    Object.defineProperty(StateMachine.prototype, "name", {
        get: function () {
            return this.stateMachine.name;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StateMachine.prototype, "statesChanged", {
        /**
         * Returns a list of state names that have changed on this frame
         */
        get: function () {
            var names = [];
            for (var i = 0; i < this.instance.stateChangedCount(); i++) {
                names.push(this.instance.stateChangedNameByIndex(i));
            }
            return names;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Advances the state machine instance by a given time.
     * @param time - the time to advance the animation by in seconds
     */
    StateMachine.prototype.advance = function (time) {
        this.instance.advance(time);
    };
    /**
     * Returns the number of events reported from the last advance call
     * @returns Number of events reported
     */
    StateMachine.prototype.reportedEventCount = function () {
        return this.instance.reportedEventCount();
    };
    /**
     * Returns a RiveEvent object emitted from the last advance call at the given index
     * of a list of potentially multiple events. If an event at the index is not found,
     * undefined is returned.
     * @param i index of the event reported in a list of potentially multiple events
     * @returns RiveEvent or extended RiveEvent object returned, or undefined
     */
    StateMachine.prototype.reportedEventAt = function (i) {
        return this.instance.reportedEventAt(i);
    };
    /**
     * Fetches references to the state machine's inputs and caches them
     * @param runtime an instance of the runtime; needed for the SMIInput types
     */
    StateMachine.prototype.initInputs = function (runtime) {
        // Fetch the inputs from the runtime if we don't have them
        for (var i = 0; i < this.instance.inputCount(); i++) {
            var input = this.instance.input(i);
            this.inputs.push(this.mapRuntimeInput(input, runtime));
        }
    };
    /**
     * Maps a runtime input to it's appropriate type
     * @param input
     */
    StateMachine.prototype.mapRuntimeInput = function (input, runtime) {
        if (input.type === runtime.SMIInput.bool) {
            return new StateMachineInput(StateMachineInputType.Boolean, input.asBool());
        }
        else if (input.type === runtime.SMIInput.number) {
            return new StateMachineInput(StateMachineInputType.Number, input.asNumber());
        }
        else if (input.type === runtime.SMIInput.trigger) {
            return new StateMachineInput(StateMachineInputType.Trigger, input.asTrigger());
        }
    };
    /**
     * Deletes the backing Wasm state machine instance; once this is called, this
     * state machine is no more.
     */
    StateMachine.prototype.cleanup = function () {
        this.instance.delete();
    };
    return StateMachine;
}());
// #endregion
// #region animator
/**
 * Manages animation
 */
var Animator = /** @class */ (function () {
    /**
     * Constructs a new animator
     * @constructor
     * @param runtime Rive runtime; needed to instance animations & state machines
     * @param artboard the artboard that holds all animations and state machines
     * @param animations optional list of animations
     * @param stateMachines optional list of state machines
     */
    function Animator(runtime, artboard, eventManager, animations, stateMachines) {
        if (animations === void 0) { animations = []; }
        if (stateMachines === void 0) { stateMachines = []; }
        this.runtime = runtime;
        this.artboard = artboard;
        this.eventManager = eventManager;
        this.animations = animations;
        this.stateMachines = stateMachines;
    }
    /**
     * Adds animations and state machines by their names. If names are shared
     * between animations & state machines, then the first one found will be
     * created. Best not to use the same names for these in your Rive file.
     * @param animatable the name(s) of animations and state machines to add
     * @returns a list of names of the playing animations and state machines
     */
    Animator.prototype.add = function (animatables, playing, fireEvent) {
        if (fireEvent === void 0) { fireEvent = true; }
        animatables = mapToStringArray(animatables);
        // If animatables is empty, play or pause everything
        if (animatables.length === 0) {
            this.animations.forEach(function (a) { return (a.playing = playing); });
            this.stateMachines.forEach(function (m) { return (m.playing = playing); });
        }
        else {
            // Play/pause already instanced items, or create new instances
            var instancedAnimationNames = this.animations.map(function (a) { return a.name; });
            var instancedMachineNames = this.stateMachines.map(function (m) { return m.name; });
            for (var i = 0; i < animatables.length; i++) {
                var aIndex = instancedAnimationNames.indexOf(animatables[i]);
                var mIndex = instancedMachineNames.indexOf(animatables[i]);
                if (aIndex >= 0 || mIndex >= 0) {
                    if (aIndex >= 0) {
                        // Animation is instanced, play/pause it
                        this.animations[aIndex].playing = playing;
                    }
                    else {
                        // State machine is instanced, play/pause it
                        this.stateMachines[mIndex].playing = playing;
                    }
                }
                else {
                    // Try to create a new animation instance
                    var anim = this.artboard.animationByName(animatables[i]);
                    if (anim) {
                        var newAnimation = new Animation(anim, this.artboard, this.runtime, playing);
                        // Display the first frame of the specified animation
                        newAnimation.advance(0);
                        newAnimation.apply(1.0);
                        this.animations.push(newAnimation);
                    }
                    else {
                        // Try to create a new state machine instance
                        var sm = this.artboard.stateMachineByName(animatables[i]);
                        if (sm) {
                            var newStateMachine = new StateMachine(sm, this.runtime, playing, this.artboard);
                            this.stateMachines.push(newStateMachine);
                        }
                    }
                }
            }
        }
        // Fire play/paused events for animations
        if (fireEvent) {
            if (playing) {
                this.eventManager.fire({
                    type: EventType.Play,
                    data: this.playing,
                });
            }
            else {
                this.eventManager.fire({
                    type: EventType.Pause,
                    data: this.paused,
                });
            }
        }
        return playing ? this.playing : this.paused;
    };
    /**
     * Adds linear animations by their names.
     * @param animatables the name(s) of animations to add
     * @param playing whether animations should play on instantiation
     */
    Animator.prototype.initLinearAnimations = function (animatables, playing) {
        // Play/pause already instanced items, or create new instances
        // This validation is kept to maintain compatibility with current behavior.
        // But given that it this is called during artboard initialization
        // it should probably be safe to remove.
        var instancedAnimationNames = this.animations.map(function (a) { return a.name; });
        for (var i = 0; i < animatables.length; i++) {
            var aIndex = instancedAnimationNames.indexOf(animatables[i]);
            if (aIndex >= 0) {
                this.animations[aIndex].playing = playing;
            }
            else {
                // Try to create a new animation instance
                var anim = this.artboard.animationByName(animatables[i]);
                if (anim) {
                    var newAnimation = new Animation(anim, this.artboard, this.runtime, playing);
                    // Display the first frame of the specified animation
                    newAnimation.advance(0);
                    newAnimation.apply(1.0);
                    this.animations.push(newAnimation);
                }
            }
        }
    };
    /**
     * Adds state machines by their names.
     * @param animatables the name(s) of state machines to add
     * @param playing whether state machines should play on instantiation
     */
    Animator.prototype.initStateMachines = function (animatables, playing) {
        // Play/pause already instanced items, or create new instances
        // This validation is kept to maintain compatibility with current behavior.
        // But given that it this is called during artboard initialization
        // it should probably be safe to remove.
        var instancedStateMachineNames = this.stateMachines.map(function (a) { return a.name; });
        for (var i = 0; i < animatables.length; i++) {
            var aIndex = instancedStateMachineNames.indexOf(animatables[i]);
            if (aIndex >= 0) {
                this.stateMachines[aIndex].playing = playing;
            }
            else {
                // Try to create a new state machine instance
                var sm = this.artboard.stateMachineByName(animatables[i]);
                if (sm) {
                    var newStateMachine = new StateMachine(sm, this.runtime, playing, this.artboard);
                    this.stateMachines.push(newStateMachine);
                }
                else {
                    // In order to maintain compatibility with current behavior, if a state machine is not found
                    // we look for an animation with the same name
                    this.initLinearAnimations([animatables[i]], playing);
                }
            }
        }
    };
    /**
     * Play the named animations/state machines
     * @param animatables the names of the animations/machines to play; plays all if empty
     * @returns a list of the playing items
     */
    Animator.prototype.play = function (animatables) {
        return this.add(animatables, true);
    };
    /**
     * Pauses named animations and state machines, or everything if nothing is
     * specified
     * @param animatables names of the animations and state machines to pause
     * @returns a list of names of the animations and state machines paused
     */
    Animator.prototype.pause = function (animatables) {
        return this.add(animatables, false);
    };
    /**
     * Set time of named animations
     * @param animations names of the animations to scrub
     * @param value time scrub value, a floating point number to which the playhead is jumped
     * @returns a list of names of the animations that were scrubbed
     */
    Animator.prototype.scrub = function (animatables, value) {
        var forScrubbing = this.animations.filter(function (a) {
            return animatables.includes(a.name);
        });
        forScrubbing.forEach(function (a) { return (a.scrubTo = value); });
        return forScrubbing.map(function (a) { return a.name; });
    };
    Object.defineProperty(Animator.prototype, "playing", {
        /**
         * Returns a list of names of all animations and state machines currently
         * playing
         */
        get: function () {
            return this.animations
                .filter(function (a) { return a.playing; })
                .map(function (a) { return a.name; })
                .concat(this.stateMachines.filter(function (m) { return m.playing; }).map(function (m) { return m.name; }));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Animator.prototype, "paused", {
        /**
         * Returns a list of names of all animations and state machines currently
         * paused
         */
        get: function () {
            return this.animations
                .filter(function (a) { return !a.playing; })
                .map(function (a) { return a.name; })
                .concat(this.stateMachines.filter(function (m) { return !m.playing; }).map(function (m) { return m.name; }));
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Stops and removes all named animations and state machines
     * @param animatables animations and state machines to remove
     * @returns a list of names of removed items
     */
    Animator.prototype.stop = function (animatables) {
        var _this = this;
        animatables = mapToStringArray(animatables);
        // If nothing's specified, wipe them out, all of them
        var removedNames = [];
        // Stop everything
        if (animatables.length === 0) {
            removedNames = this.animations
                .map(function (a) { return a.name; })
                .concat(this.stateMachines.map(function (m) { return m.name; }));
            // Clean up before emptying the arrays
            this.animations.forEach(function (a) { return a.cleanup(); });
            this.stateMachines.forEach(function (m) { return m.cleanup(); });
            // Empty out the arrays
            this.animations.splice(0, this.animations.length);
            this.stateMachines.splice(0, this.stateMachines.length);
        }
        else {
            // Remove only the named animations/state machines
            var animationsToRemove = this.animations.filter(function (a) {
                return animatables.includes(a.name);
            });
            animationsToRemove.forEach(function (a) {
                a.cleanup();
                _this.animations.splice(_this.animations.indexOf(a), 1);
            });
            var machinesToRemove = this.stateMachines.filter(function (m) {
                return animatables.includes(m.name);
            });
            machinesToRemove.forEach(function (m) {
                m.cleanup();
                _this.stateMachines.splice(_this.stateMachines.indexOf(m), 1);
            });
            removedNames = animationsToRemove
                .map(function (a) { return a.name; })
                .concat(machinesToRemove.map(function (m) { return m.name; }));
        }
        this.eventManager.fire({
            type: EventType.Stop,
            data: removedNames,
        });
        // Return the list of animations removed
        return removedNames;
    };
    Object.defineProperty(Animator.prototype, "isPlaying", {
        /**
         * Returns true if at least one animation is active
         */
        get: function () {
            return (this.animations.reduce(function (acc, curr) { return acc || curr.playing; }, false) ||
                this.stateMachines.reduce(function (acc, curr) { return acc || curr.playing; }, false));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Animator.prototype, "isPaused", {
        /**
         * Returns true if all animations are paused and there's at least one animation
         */
        get: function () {
            return (!this.isPlaying &&
                (this.animations.length > 0 || this.stateMachines.length > 0));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Animator.prototype, "isStopped", {
        /**
         * Returns true if there are no playing or paused animations/state machines
         */
        get: function () {
            return this.animations.length === 0 && this.stateMachines.length === 0;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * If there are no animations or state machines, add the first one found
     * @returns the name of the animation or state machine instanced
     */
    Animator.prototype.atLeastOne = function (playing, fireEvent) {
        if (fireEvent === void 0) { fireEvent = true; }
        var instancedName;
        if (this.animations.length === 0 && this.stateMachines.length === 0) {
            if (this.artboard.animationCount() > 0) {
                // Add the first animation
                this.add([(instancedName = this.artboard.animationByIndex(0).name)], playing, fireEvent);
            }
            else if (this.artboard.stateMachineCount() > 0) {
                // Add the first state machine
                this.add([(instancedName = this.artboard.stateMachineByIndex(0).name)], playing, fireEvent);
            }
        }
        return instancedName;
    };
    /**
     * Checks if any animations have looped and if so, fire the appropriate event
     */
    Animator.prototype.handleLooping = function () {
        for (var _i = 0, _a = this.animations.filter(function (a) { return a.playing; }); _i < _a.length; _i++) {
            var animation = _a[_i];
            // Emit if the animation looped
            if (animation.loopValue === 0 && animation.loopCount) {
                animation.loopCount = 0;
                // This is a one-shot; if it has ended, delete the instance
                this.stop(animation.name);
            }
            else if (animation.loopValue === 1 && animation.loopCount) {
                this.eventManager.fire({
                    type: EventType.Loop,
                    data: { animation: animation.name, type: LoopType.Loop },
                });
                animation.loopCount = 0;
            }
            // Wasm indicates a loop at each time the animation
            // changes direction, so a full loop/lap occurs every
            // two loop counts
            else if (animation.loopValue === 2 && animation.loopCount > 1) {
                this.eventManager.fire({
                    type: EventType.Loop,
                    data: { animation: animation.name, type: LoopType.PingPong },
                });
                animation.loopCount = 0;
            }
        }
    };
    /**
     * Checks if states have changed in state machines and fires a statechange
     * event
     */
    Animator.prototype.handleStateChanges = function () {
        var statesChanged = [];
        for (var _i = 0, _a = this.stateMachines.filter(function (sm) { return sm.playing; }); _i < _a.length; _i++) {
            var stateMachine = _a[_i];
            statesChanged.push.apply(statesChanged, stateMachine.statesChanged);
        }
        if (statesChanged.length > 0) {
            this.eventManager.fire({
                type: EventType.StateChange,
                data: statesChanged,
            });
        }
    };
    Animator.prototype.handleAdvancing = function (time) {
        this.eventManager.fire({
            type: EventType.Advance,
            data: time,
        });
    };
    return Animator;
}());
// #endregion
// #region events
/**
 * Supported event types triggered in Rive
 */
var EventType;
(function (EventType) {
    EventType["Load"] = "load";
    EventType["LoadError"] = "loaderror";
    EventType["Play"] = "play";
    EventType["Pause"] = "pause";
    EventType["Stop"] = "stop";
    EventType["Loop"] = "loop";
    EventType["Draw"] = "draw";
    EventType["Advance"] = "advance";
    EventType["StateChange"] = "statechange";
    EventType["RiveEvent"] = "riveevent";
})(EventType || (EventType = {}));
/**
 * Looping types: one-shot, loop, and ping-pong
 */
var LoopType;
(function (LoopType) {
    LoopType["OneShot"] = "oneshot";
    LoopType["Loop"] = "loop";
    LoopType["PingPong"] = "pingpong";
})(LoopType || (LoopType = {}));
// Manages Rive events and listeners
var EventManager = /** @class */ (function () {
    function EventManager(listeners) {
        if (listeners === void 0) { listeners = []; }
        this.listeners = listeners;
    }
    // Gets listeners of specified type
    EventManager.prototype.getListeners = function (type) {
        return this.listeners.filter(function (e) { return e.type === type; });
    };
    // Adds a listener
    EventManager.prototype.add = function (listener) {
        if (!this.listeners.includes(listener)) {
            this.listeners.push(listener);
        }
    };
    /**
     * Removes a listener
     * @param listener the listener with the callback to be removed
     */
    EventManager.prototype.remove = function (listener) {
        // We can't simply look for the listener as it'll be a different instance to
        // one originally subscribed. Find all the listeners of the right type and
        // then check their callbacks which should match.
        for (var i = 0; i < this.listeners.length; i++) {
            var currentListener = this.listeners[i];
            if (currentListener.type === listener.type) {
                if (currentListener.callback === listener.callback) {
                    this.listeners.splice(i, 1);
                    break;
                }
            }
        }
    };
    /**
     * Clears all listeners of specified type, or every listener if no type is
     * specified
     * @param type the type of listeners to clear, or all listeners if not
     * specified
     */
    EventManager.prototype.removeAll = function (type) {
        var _this = this;
        if (!type) {
            this.listeners.splice(0, this.listeners.length);
        }
        else {
            this.listeners
                .filter(function (l) { return l.type === type; })
                .forEach(function (l) { return _this.remove(l); });
        }
    };
    // Fires an event
    EventManager.prototype.fire = function (event) {
        var eventListeners = this.getListeners(event.type);
        eventListeners.forEach(function (listener) { return listener.callback(event); });
    };
    return EventManager;
}());
// Manages a queue of tasks
var TaskQueueManager = /** @class */ (function () {
    function TaskQueueManager(eventManager) {
        this.eventManager = eventManager;
        this.queue = [];
    }
    // Adds a task top the queue
    TaskQueueManager.prototype.add = function (task) {
        this.queue.push(task);
    };
    // Processes all tasks in the queue
    TaskQueueManager.prototype.process = function () {
        while (this.queue.length > 0) {
            var task = this.queue.shift();
            if (task === null || task === void 0 ? void 0 : task.action) {
                task.action();
            }
            if (task === null || task === void 0 ? void 0 : task.event) {
                this.eventManager.fire(task.event);
            }
        }
    };
    return TaskQueueManager;
}());
var Rive = /** @class */ (function () {
    function Rive(params) {
        var _a;
        // Tracks if a Rive file is loaded
        this.loaded = false;
        /**
         * Tracks if a Rive file is loaded; we need this in addition to loaded as some
         * commands (e.g. contents) can be called as soon as the file is loaded.
         * However, playback commands need to be queued and run in order once initial
         * animations and autoplay has been sorted out. This applies to play, pause,
         * and start.
         */
        this.readyForPlaying = false;
        // Runtime artboard
        this.artboard = null;
        // place to clear up event listeners
        this.eventCleanup = null;
        this.shouldDisableRiveListeners = false;
        this.automaticallyHandleEvents = false;
        // Allow the runtime to automatically load assets hosted in Rive's runtime.
        this.enableRiveAssetCDN = true;
        // Durations to generate a frame for the last second. Used for performance profiling.
        this.durations = [];
        this.frameTimes = [];
        this.frameCount = 0;
        /**
         * Used be draw to track when a second of active rendering time has passed.
         * Used for debugging purposes
         */
        this.renderSecondTimer = 0;
        this.canvas = params.canvas;
        this.src = params.src;
        this.buffer = params.buffer;
        this.layout = (_a = params.layout) !== null && _a !== void 0 ? _a : new Layout();
        this.shouldDisableRiveListeners = !!params.shouldDisableRiveListeners;
        this.automaticallyHandleEvents = !!params.automaticallyHandleEvents;
        this.enableRiveAssetCDN =
            params.enableRiveAssetCDN === undefined
                ? true
                : params.enableRiveAssetCDN;
        // New event management system
        this.eventManager = new EventManager();
        if (params.onLoad)
            this.on(EventType.Load, params.onLoad);
        if (params.onLoadError)
            this.on(EventType.LoadError, params.onLoadError);
        if (params.onPlay)
            this.on(EventType.Play, params.onPlay);
        if (params.onPause)
            this.on(EventType.Pause, params.onPause);
        if (params.onStop)
            this.on(EventType.Stop, params.onStop);
        if (params.onLoop)
            this.on(EventType.Loop, params.onLoop);
        if (params.onStateChange)
            this.on(EventType.StateChange, params.onStateChange);
        if (params.onAdvance)
            this.on(EventType.Advance, params.onAdvance);
        /**
         * @deprecated Use camelCase'd versions instead.
         */
        if (params.onload && !params.onLoad)
            this.on(EventType.Load, params.onload);
        if (params.onloaderror && !params.onLoadError)
            this.on(EventType.LoadError, params.onloaderror);
        if (params.onplay && !params.onPlay)
            this.on(EventType.Play, params.onplay);
        if (params.onpause && !params.onPause)
            this.on(EventType.Pause, params.onpause);
        if (params.onstop && !params.onStop)
            this.on(EventType.Stop, params.onstop);
        if (params.onloop && !params.onLoop)
            this.on(EventType.Loop, params.onloop);
        if (params.onstatechange && !params.onStateChange)
            this.on(EventType.StateChange, params.onstatechange);
        /**
         * Asset loading
         */
        if (params.assetLoader)
            this.assetLoader = params.assetLoader;
        // Hook up the task queue
        this.taskQueue = new TaskQueueManager(this.eventManager);
        this.init({
            src: this.src,
            buffer: this.buffer,
            autoplay: params.autoplay,
            animations: params.animations,
            stateMachines: params.stateMachines,
            artboard: params.artboard,
            useOffscreenRenderer: params.useOffscreenRenderer,
        });
    }
    // Alternative constructor to build a Rive instance from an interface/object
    Rive.new = function (params) {
        console.warn("This function is deprecated: please use `new Rive({})` instead");
        return new Rive(params);
    };
    // Initializes the Rive object either from constructor or load()
    Rive.prototype.init = function (_a) {
        var _this = this;
        var src = _a.src, buffer = _a.buffer, animations = _a.animations, stateMachines = _a.stateMachines, artboard = _a.artboard, _b = _a.autoplay, autoplay = _b === void 0 ? false : _b, _c = _a.useOffscreenRenderer, useOffscreenRenderer = _c === void 0 ? false : _c;
        this.src = src;
        this.buffer = buffer;
        // If no source file url specified, it's a bust
        if (!this.src && !this.buffer) {
            throw new Error(Rive.missingErrorMessage);
        }
        // List of animations that should be initialized.
        var startingAnimationNames = mapToStringArray(animations);
        // List of state machines that should be initialized
        var startingStateMachineNames = mapToStringArray(stateMachines);
        // Ensure loaded is marked as false if loading new file
        this.loaded = false;
        this.readyForPlaying = false;
        // Ensure the runtime is loaded
        RuntimeLoader.awaitInstance()
            .then(function (runtime) {
            _this.runtime = runtime;
            // Get the canvas where you want to render the animation and create a renderer
            _this.renderer = _this.runtime.makeRenderer(_this.canvas, useOffscreenRenderer);
            // Initial size adjustment based on devicePixelRatio if no width/height are
            // specified explicitly
            if (!(_this.canvas.width || _this.canvas.height)) {
                _this.resizeDrawingSurfaceToCanvas();
            }
            // Load Rive data from a source uri or a data buffer
            _this.initData(artboard, startingAnimationNames, startingStateMachineNames, autoplay)
                .then(function () { return _this.setupRiveListeners(); })
                .catch(function (e) {
                console.error(e);
            });
        })
            .catch(function (e) {
            console.error(e);
        });
    };
    Rive.prototype.setupRiveListeners = function () {
        var _this = this;
        if (!this.shouldDisableRiveListeners) {
            var activeStateMachines = (this.animator.stateMachines || [])
                .filter(function (sm) { return sm.playing && _this.runtime.hasListeners(sm.instance); })
                .map(function (sm) { return sm.instance; });
            this.eventCleanup = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.registerTouchInteractions)({
                canvas: this.canvas,
                artboard: this.artboard,
                stateMachines: activeStateMachines,
                renderer: this.renderer,
                rive: this.runtime,
                fit: this._layout.runtimeFit(this.runtime),
                alignment: this._layout.runtimeAlignment(this.runtime),
            });
        }
    };
    // Initializes runtime with Rive data and preps for playing
    Rive.prototype.initData = function (artboardName, animationNames, stateMachineNames, autoplay) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, loader, _c, msg;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!this.src) return [3 /*break*/, 2];
                        _b = this;
                        return [4 /*yield*/, loadRiveFile(this.src)];
                    case 1:
                        _b.buffer = _d.sent();
                        _d.label = 2;
                    case 2:
                        if (this.assetLoader) {
                            loader = new this.runtime.CustomFileAssetLoader({
                                loadContents: this.assetLoader,
                            });
                        }
                        // Load the Rive file
                        _c = this;
                        return [4 /*yield*/, this.runtime.load(new Uint8Array(this.buffer), loader, this.enableRiveAssetCDN)];
                    case 3:
                        // Load the Rive file
                        _c.file = _d.sent();
                        if (this.file) {
                            // Initialize and draw frame
                            this.initArtboard(artboardName, animationNames, stateMachineNames, autoplay);
                            // Everything's set up, emit a load event
                            this.loaded = true;
                            this.eventManager.fire({
                                type: EventType.Load,
                                data: (_a = this.src) !== null && _a !== void 0 ? _a : "buffer",
                            });
                            // Flag ready for playback commands and clear the task queue; this order
                            // is important or it may infinitely recurse
                            this.readyForPlaying = true;
                            this.taskQueue.process();
                            this.drawFrame();
                            return [2 /*return*/, Promise.resolve()];
                        }
                        else {
                            msg = "Problem loading file; may be corrupt!";
                            console.warn(msg);
                            this.eventManager.fire({ type: EventType.LoadError, data: msg });
                            return [2 /*return*/, Promise.reject(msg)];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    // Initialize for playback
    Rive.prototype.initArtboard = function (artboardName, animationNames, stateMachineNames, autoplay) {
        // Fetch the artboard
        var rootArtboard = artboardName
            ? this.file.artboardByName(artboardName)
            : this.file.defaultArtboard();
        // Check we have a working artboard
        if (!rootArtboard) {
            var msg = "Invalid artboard name or no default artboard";
            console.warn(msg);
            this.eventManager.fire({ type: EventType.LoadError, data: msg });
            return;
        }
        this.artboard = rootArtboard;
        // Check that the artboard has at least 1 animation
        if (this.artboard.animationCount() < 1) {
            var msg = "Artboard has no animations";
            this.eventManager.fire({ type: EventType.LoadError, data: msg });
            throw msg;
        }
        // Initialize the animator
        this.animator = new Animator(this.runtime, this.artboard, this.eventManager);
        // Initialize the animations; as loaded hasn't happened yet, we need to
        // suppress firing the play/pause events until the load event has fired. To
        // do this we tell the animator to suppress firing events, and add event
        // firing to the task queue.
        var instanceNames;
        if (animationNames.length > 0 || stateMachineNames.length > 0) {
            instanceNames = animationNames.concat(stateMachineNames);
            this.animator.initLinearAnimations(animationNames, autoplay);
            this.animator.initStateMachines(stateMachineNames, autoplay);
        }
        else {
            instanceNames = [this.animator.atLeastOne(autoplay, false)];
        }
        // Queue up firing the playback events
        this.taskQueue.add({
            event: {
                type: autoplay ? EventType.Play : EventType.Pause,
                data: instanceNames,
            },
        });
    };
    // Draws the current artboard frame
    Rive.prototype.drawFrame = function () {
        this.startRendering();
    };
    /**
     * Draw rendering loop; renders animation frames at the correct time interval.
     * @param time the time at which to render a frame
     */
    Rive.prototype.draw = function (time, onSecond) {
        var before = performance.now();
        // Clear the frameRequestId, as we're now rendering a fresh frame
        this.frameRequestId = null;
        // On the first pass, make sure lastTime has a valid value
        if (!this.lastRenderTime) {
            this.lastRenderTime = time;
        }
        // Handle the onSecond callback
        this.renderSecondTimer += time - this.lastRenderTime;
        if (this.renderSecondTimer > 5000) {
            this.renderSecondTimer = 0;
            onSecond === null || onSecond === void 0 ? void 0 : onSecond();
        }
        // Calculate the elapsed time between frames in seconds
        var elapsedTime = (time - this.lastRenderTime) / 1000;
        this.lastRenderTime = time;
        // - Advance non-paused animations by the elapsed number of seconds
        // - Advance any animations that require scrubbing
        // - Advance to the first frame even when autoplay is false
        var activeAnimations = this.animator.animations
            .filter(function (a) { return a.playing || a.needsScrub; })
            // The scrubbed animations must be applied first to prevent weird artifacts
            // if the playing animations conflict with the scrubbed animating attribuates.
            .sort(function (first) { return (first.needsScrub ? -1 : 1); });
        for (var _i = 0, activeAnimations_1 = activeAnimations; _i < activeAnimations_1.length; _i++) {
            var animation = activeAnimations_1[_i];
            animation.advance(elapsedTime);
            if (animation.instance.didLoop) {
                animation.loopCount += 1;
            }
            animation.apply(1.0);
        }
        // - Advance non-paused state machines by the elapsed number of seconds
        // - Advance to the first frame even when autoplay is false
        var activeStateMachines = this.animator.stateMachines.filter(function (a) { return a.playing; });
        for (var _a = 0, activeStateMachines_1 = activeStateMachines; _a < activeStateMachines_1.length; _a++) {
            var stateMachine = activeStateMachines_1[_a];
            // Check for events before the current frame's state machine advance
            var numEventsReported = stateMachine.reportedEventCount();
            if (numEventsReported) {
                for (var i = 0; i < numEventsReported; i++) {
                    var event_1 = stateMachine.reportedEventAt(i);
                    if (event_1) {
                        if (event_1.type === RiveEventType.OpenUrl) {
                            this.eventManager.fire({
                                type: EventType.RiveEvent,
                                data: event_1,
                            });
                            // Handle the event side effect if explicitly enabled
                            if (this.automaticallyHandleEvents) {
                                var newAnchorTag = document.createElement("a");
                                var _b = event_1, url = _b.url, target = _b.target;
                                var sanitizedUrl = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.sanitizeUrl)(url);
                                url && newAnchorTag.setAttribute("href", sanitizedUrl);
                                target && newAnchorTag.setAttribute("target", target);
                                if (sanitizedUrl && sanitizedUrl !== _utils__WEBPACK_IMPORTED_MODULE_2__.BLANK_URL) {
                                    newAnchorTag.click();
                                }
                            }
                        }
                        else {
                            this.eventManager.fire({
                                type: EventType.RiveEvent,
                                data: event_1,
                            });
                        }
                    }
                }
            }
            stateMachine.advance(elapsedTime);
            // stateMachine.instance.apply(this.artboard);
        }
        // Once the animations have been applied to the artboard, advance it
        // by the elapsed time.
        this.artboard.advance(elapsedTime);
        var renderer = this.renderer;
        // Canvas must be wiped to prevent artifacts
        renderer.clear();
        renderer.save();
        // Update the renderer alignment if necessary
        this.alignRenderer();
        this.artboard.draw(renderer);
        renderer.restore();
        renderer.flush();
        // Check for any animations that looped
        this.animator.handleLooping();
        // Check for any state machines that had a state change
        this.animator.handleStateChanges();
        // Report advanced time
        this.animator.handleAdvancing(elapsedTime);
        // Add duration to create frame to durations array
        this.frameCount++;
        var after = performance.now();
        this.frameTimes.push(after);
        this.durations.push(after - before);
        while (this.frameTimes[0] <= after - 1000) {
            this.frameTimes.shift();
            this.durations.shift();
        }
        // Calling requestAnimationFrame will rerun draw() at the correct rate:
        // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Basic_animations
        if (this.animator.isPlaying) {
            // Request a new rendering frame
            this.startRendering();
        }
        else if (this.animator.isPaused) {
            // Reset the end time so on playback it starts at the correct frame
            this.lastRenderTime = 0;
        }
        else if (this.animator.isStopped) {
            // Reset animation instances, artboard and time
            // TODO: implement this properly when we have instancing
            // this.initArtboard();
            // this.drawFrame();
            this.lastRenderTime = 0;
        }
    };
    /**
     * Align the renderer
     */
    Rive.prototype.alignRenderer = function () {
        var _a = this, renderer = _a.renderer, runtime = _a.runtime, _layout = _a._layout, artboard = _a.artboard;
        // Align things up safe in the knowledge we can restore if changed
        renderer.align(_layout.runtimeFit(runtime), _layout.runtimeAlignment(runtime), {
            minX: _layout.minX,
            minY: _layout.minY,
            maxX: _layout.maxX,
            maxY: _layout.maxY,
        }, artboard.bounds);
    };
    Object.defineProperty(Rive.prototype, "fps", {
        get: function () {
            return this.durations.length;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rive.prototype, "frameTime", {
        get: function () {
            if (this.durations.length === 0) {
                return 0;
            }
            return (this.durations.reduce(function (a, b) { return a + b; }, 0) / this.durations.length).toFixed(4);
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Cleans up all Wasm-generated objects that need to be manually destroyed:
     * artboard instances, animation instances, state machine instances,
     * renderer instance, file and runtime.
     *
     * Once this is called, you will need to initialise a new instance of the
     * Rive class
     */
    Rive.prototype.cleanup = function () {
        var _a, _b, _c;
        // Stop the renderer if it hasn't already been stopped.
        this.stopRendering();
        // Clean up any artboard, animation or state machine instances.
        this.cleanupInstances();
        // Only CanvasRenderer needs a delete for now, not WebGL.. might be a better
        // way to detect this in the future 
        if ((_a = this.runtime) === null || _a === void 0 ? void 0 : _a.CanvasRenderer) {
            (_b = this.renderer) === null || _b === void 0 ? void 0 : _b.delete();
        }
        this.renderer = null;
        // Delete the rive file
        (_c = this.file) === null || _c === void 0 ? void 0 : _c.delete();
        this.file = null;
    };
    /**
     * Cleans up any Wasm-generated objects that need to be manually destroyed:
     * artboard instances, animation instances, state machine instances.
     *
     * Once this is called, things will need to be reinitialized or bad things
     * might happen.
     */
    Rive.prototype.cleanupInstances = function () {
        if (this.eventCleanup !== null) {
            this.eventCleanup();
        }
        // Delete all animation and state machine instances
        this.stop();
        if (this.artboard) {
            this.artboard.delete();
            this.artboard = null;
        }
    };
    /**
     * Tries to query the setup Artboard for a text run node with the given name.
     *
     * @param textRunName - Name of the text run node associated with a text object
     * @returns - TextValueRun node or undefined if the text run cannot be queried
     */
    Rive.prototype.retrieveTextRun = function (textRunName) {
        var _a;
        if (!textRunName) {
            console.warn("No text run name provided");
            return;
        }
        if (!this.artboard) {
            console.warn("Tried to access text run, but the Artboard is null");
            return;
        }
        var textRun = this.artboard.textRun(textRunName);
        if (!textRun) {
            console.warn("Could not access a text run with name '".concat(textRunName, "' in the '").concat((_a = this.artboard) === null || _a === void 0 ? void 0 : _a.name, "' Artboard. Note that you must rename a text run node in the Rive editor to make it queryable at runtime."));
            return;
        }
        return textRun;
    };
    /**
     * Returns a string from a given text run node name, or undefined if the text run
     * cannot be queried.
     *
     * @param textRunName - Name of the text run node associated with a text object
     * @returns - String value of the text run node or undefined
     */
    Rive.prototype.getTextRunValue = function (textRunName) {
        var textRun = this.retrieveTextRun(textRunName);
        return textRun ? textRun.text : undefined;
    };
    /**
     * Sets a text value for a given text run node name if possible
     *
     * @param textRunName - Name of the text run node associated with a text object
     * @param textRunValue - String value to set on the text run node
     */
    Rive.prototype.setTextRunValue = function (textRunName, textRunValue) {
        var textRun = this.retrieveTextRun(textRunName);
        if (textRun) {
            textRun.text = textRunValue;
        }
    };
    // Plays specified animations; if none specified, it unpauses everything.
    Rive.prototype.play = function (animationNames, autoplay) {
        var _this = this;
        animationNames = mapToStringArray(animationNames);
        // If the file's not loaded, queue up the play
        if (!this.readyForPlaying) {
            this.taskQueue.add({
                action: function () { return _this.play(animationNames, autoplay); },
            });
            return;
        }
        this.animator.play(animationNames);
        if (this.eventCleanup) {
            this.eventCleanup();
        }
        this.setupRiveListeners();
        this.startRendering();
    };
    // Pauses specified animations; if none specified, pauses all.
    Rive.prototype.pause = function (animationNames) {
        var _this = this;
        animationNames = mapToStringArray(animationNames);
        // If the file's not loaded, early out, nothing to pause
        if (!this.readyForPlaying) {
            this.taskQueue.add({
                action: function () { return _this.pause(animationNames); },
            });
            return;
        }
        if (this.eventCleanup) {
            this.eventCleanup();
        }
        this.animator.pause(animationNames);
    };
    Rive.prototype.scrub = function (animationNames, value) {
        var _this = this;
        animationNames = mapToStringArray(animationNames);
        // If the file's not loaded, early out, nothing to pause
        if (!this.readyForPlaying) {
            this.taskQueue.add({
                action: function () { return _this.scrub(animationNames, value); },
            });
            return;
        }
        // Scrub the animation time; we draw a single frame here so that if
        // nothing's currently playing, the scrubbed animation is still rendered/
        this.animator.scrub(animationNames, value || 0);
        this.drawFrame();
    };
    // Stops specified animations; if none specifies, stops them all.
    Rive.prototype.stop = function (animationNames) {
        var _this = this;
        animationNames = mapToStringArray(animationNames);
        // If the file's not loaded, early out, nothing to pause
        if (!this.readyForPlaying) {
            this.taskQueue.add({
                action: function () { return _this.stop(animationNames); },
            });
            return;
        }
        this.animator.stop(animationNames);
        if (this.eventCleanup) {
            this.eventCleanup();
        }
    };
    /**
     * Resets the animation
     * @param artboard the name of the artboard, or default if none given
     * @param animations the names of animations for playback
     * @param stateMachines the names of state machines for playback
     * @param autoplay whether to autoplay when reset, defaults to false
     *
     */
    Rive.prototype.reset = function (params) {
        var _a;
        // Get the current artboard, animations, state machines, and playback states
        var artBoardName = params === null || params === void 0 ? void 0 : params.artboard;
        var animationNames = mapToStringArray(params === null || params === void 0 ? void 0 : params.animations);
        var stateMachineNames = mapToStringArray(params === null || params === void 0 ? void 0 : params.stateMachines);
        var autoplay = (_a = params === null || params === void 0 ? void 0 : params.autoplay) !== null && _a !== void 0 ? _a : false;
        // Stop everything and clean up
        this.cleanupInstances();
        // Reinitialize an artboard instance with the state
        this.initArtboard(artBoardName, animationNames, stateMachineNames, autoplay);
        this.taskQueue.process();
    };
    // Loads a new Rive file, keeping listeners in place
    Rive.prototype.load = function (params) {
        // Stop all animations
        this.stop();
        // Reinitialize
        this.init(params);
    };
    Object.defineProperty(Rive.prototype, "layout", {
        /**
         * Returns the current layout. Note that layout should be treated as
         * immutable. If you want to change the layout, create a new one use the
         * layout setter
         */
        get: function () {
            return this._layout;
        },
        // Sets a new layout
        set: function (layout) {
            this._layout = layout;
            // If the maxX or maxY are 0, then set them to the canvas width and height
            if (!layout.maxX || !layout.maxY) {
                this.resizeToCanvas();
            }
            if (this.loaded && !this.animator.isPlaying) {
                this.drawFrame();
            }
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Sets the layout bounds to the current canvas size; this is typically called
     * when the canvas is resized
     */
    Rive.prototype.resizeToCanvas = function () {
        this._layout = this.layout.copyWith({
            minX: 0,
            minY: 0,
            maxX: this.canvas.width,
            maxY: this.canvas.height,
        });
    };
    /**
     * Accounts for devicePixelRatio as a multiplier to render the size of the canvas drawing surface.
     * Uses the size of the backing canvas to set new width/height attributes. Need to re-render
     * and resize the layout to match the new drawing surface afterwards.
     * Useful function for consumers to include in a window resize listener
     */
    Rive.prototype.resizeDrawingSurfaceToCanvas = function (customDevicePixelRatio) {
        if (this.canvas instanceof HTMLCanvasElement && !!window) {
            var _a = this.canvas.getBoundingClientRect(), width = _a.width, height = _a.height;
            var dpr = customDevicePixelRatio || window.devicePixelRatio || 1;
            this.canvas.width = dpr * width;
            this.canvas.height = dpr * height;
            this.startRendering();
            this.resizeToCanvas();
        }
    };
    Object.defineProperty(Rive.prototype, "source", {
        // Returns the animation source, which may be undefined
        get: function () {
            return this.src;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rive.prototype, "activeArtboard", {
        /**
         * Returns the name of the active artboard
         */
        get: function () {
            return this.artboard ? this.artboard.name : "";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rive.prototype, "animationNames", {
        // Returns a list of animation names on the chosen artboard
        get: function () {
            // If the file's not loaded, we got nothing to return
            if (!this.loaded) {
                return [];
            }
            var animationNames = [];
            for (var i = 0; i < this.artboard.animationCount(); i++) {
                animationNames.push(this.artboard.animationByIndex(i).name);
            }
            return animationNames;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rive.prototype, "stateMachineNames", {
        /**
         * Returns a list of state machine names from the current artboard
         */
        get: function () {
            // If the file's not loaded, we got nothing to return
            if (!this.loaded) {
                return [];
            }
            var stateMachineNames = [];
            for (var i = 0; i < this.artboard.stateMachineCount(); i++) {
                stateMachineNames.push(this.artboard.stateMachineByIndex(i).name);
            }
            return stateMachineNames;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Returns the inputs for the specified instanced state machine, or an empty
     * list if the name is invalid or the state machine is not instanced
     * @param name the state machine name
     * @returns the inputs for the named state machine
     */
    Rive.prototype.stateMachineInputs = function (name) {
        // If the file's not loaded, early out, nothing to pause
        if (!this.loaded) {
            return;
        }
        var stateMachine = this.animator.stateMachines.find(function (m) { return m.name === name; });
        return stateMachine === null || stateMachine === void 0 ? void 0 : stateMachine.inputs;
    };
    Object.defineProperty(Rive.prototype, "playingStateMachineNames", {
        // Returns a list of playing machine names
        get: function () {
            // If the file's not loaded, we got nothing to return
            if (!this.loaded) {
                return [];
            }
            return this.animator.stateMachines
                .filter(function (m) { return m.playing; })
                .map(function (m) { return m.name; });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rive.prototype, "playingAnimationNames", {
        // Returns a list of playing animation names
        get: function () {
            // If the file's not loaded, we got nothing to return
            if (!this.loaded) {
                return [];
            }
            return this.animator.animations.filter(function (a) { return a.playing; }).map(function (a) { return a.name; });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rive.prototype, "pausedAnimationNames", {
        // Returns a list of paused animation names
        get: function () {
            // If the file's not loaded, we got nothing to return
            if (!this.loaded) {
                return [];
            }
            return this.animator.animations
                .filter(function (a) { return !a.playing; })
                .map(function (a) { return a.name; });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rive.prototype, "pausedStateMachineNames", {
        /**
         *  Returns a list of paused machine names
         * @returns a list of state machine names that are paused
         */
        get: function () {
            // If the file's not loaded, we got nothing to return
            if (!this.loaded) {
                return [];
            }
            return this.animator.stateMachines
                .filter(function (m) { return !m.playing; })
                .map(function (m) { return m.name; });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rive.prototype, "isPlaying", {
        /**
         * @returns true if any animation is playing
         */
        get: function () {
            return this.animator.isPlaying;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rive.prototype, "isPaused", {
        /**
         * @returns true if all instanced animations are paused
         */
        get: function () {
            return this.animator.isPaused;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rive.prototype, "isStopped", {
        /**
         * @returns true if no animations are playing or paused
         */
        get: function () {
            return this.animator.isStopped;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rive.prototype, "bounds", {
        /**
         * @returns the bounds of the current artboard, or undefined if the artboard
         * isn't loaded yet.
         */
        get: function () {
            return this.artboard ? this.artboard.bounds : undefined;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Subscribe to Rive-generated events
     * @param type the type of event to subscribe to
     * @param callback callback to fire when the event occurs
     */
    Rive.prototype.on = function (type, callback) {
        this.eventManager.add({
            type: type,
            callback: callback,
        });
    };
    /**
     * Unsubscribes from a Rive-generated event
     * @param type the type of event to unsubscribe from
     * @param callback the callback to unsubscribe
     */
    Rive.prototype.off = function (type, callback) {
        this.eventManager.remove({
            type: type,
            callback: callback,
        });
    };
    /**
     * Unsubscribes from a Rive-generated event
     * @deprecated
     * @param callback the callback to unsubscribe from
     */
    Rive.prototype.unsubscribe = function (type, callback) {
        console.warn("This function is deprecated: please use `off()` instead.");
        this.off(type, callback);
    };
    /**
     * Unsubscribes all Rive listeners from an event type, or everything if no type is
     * given
     * @param type the type of event to unsubscribe from, or all types if
     * undefined
     */
    Rive.prototype.removeAllRiveEventListeners = function (type) {
        this.eventManager.removeAll(type);
    };
    /**
     * Unsubscribes all listeners from an event type, or everything if no type is
     * given
     * @deprecated
     * @param type the type of event to unsubscribe from, or all types if
     * undefined
     */
    Rive.prototype.unsubscribeAll = function (type) {
        console.warn("This function is deprecated: please use `removeAllRiveEventListeners()` instead.");
        this.removeAllRiveEventListeners(type);
    };
    /**
     * Stops the rendering loop; this is different from pausing in that it doesn't
     * change the state of any animation. It stops rendering from occurring. This
     * is designed for situations such as when Rive isn't visible.
     *
     * The only way to start rendering again is to call `startRendering`.
     * Animations that are marked as playing will start from the position that
     * they would have been at if rendering had not been stopped.
     */
    Rive.prototype.stopRendering = function () {
        if (this.loaded && this.frameRequestId) {
            if (this.runtime.cancelAnimationFrame) {
                this.runtime.cancelAnimationFrame(this.frameRequestId);
            }
            else {
                cancelAnimationFrame(this.frameRequestId);
            }
            this.frameRequestId = null;
        }
    };
    /**
     * Starts the rendering loop if it has been previously stopped. If the
     * renderer is already active, then this will have zero effect.
     */
    Rive.prototype.startRendering = function () {
        if (this.loaded && this.artboard && !this.frameRequestId) {
            if (this.runtime.requestAnimationFrame) {
                this.frameRequestId = this.runtime.requestAnimationFrame(this.draw.bind(this));
            }
            else {
                this.frameRequestId = requestAnimationFrame(this.draw.bind(this));
            }
        }
    };
    /**
     * Enables frames-per-second (FPS) reporting for the runtime
     * If no callback is provided, Rive will append a fixed-position div at the top-right corner of
     * the page with the FPS reading
     * @param fpsCallback - Callback from the runtime during the RAF loop that supplies the FPS value
     */
    Rive.prototype.enableFPSCounter = function (fpsCallback) {
        this.runtime.enableFPSCounter(fpsCallback);
    };
    /**
     * Disables frames-per-second (FPS) reporting for the runtime
     */
    Rive.prototype.disableFPSCounter = function () {
        this.runtime.disableFPSCounter();
    };
    Object.defineProperty(Rive.prototype, "contents", {
        /**
         * Returns the contents of a Rive file: the artboards, animations, and state machines
         */
        get: function () {
            if (!this.loaded) {
                return undefined;
            }
            var riveContents = {
                artboards: [],
            };
            for (var i = 0; i < this.file.artboardCount(); i++) {
                var artboard = this.file.artboardByIndex(i);
                var artboardContents = {
                    name: artboard.name,
                    animations: [],
                    stateMachines: [],
                };
                for (var j = 0; j < artboard.animationCount(); j++) {
                    var animation = artboard.animationByIndex(j);
                    artboardContents.animations.push(animation.name);
                }
                for (var k = 0; k < artboard.stateMachineCount(); k++) {
                    var stateMachine = artboard.stateMachineByIndex(k);
                    var name_1 = stateMachine.name;
                    var instance = new this.runtime.StateMachineInstance(stateMachine, artboard);
                    var inputContents = [];
                    for (var l = 0; l < instance.inputCount(); l++) {
                        var input = instance.input(l);
                        inputContents.push({ name: input.name, type: input.type });
                    }
                    artboardContents.stateMachines.push({
                        name: name_1,
                        inputs: inputContents,
                    });
                }
                riveContents.artboards.push(artboardContents);
            }
            return riveContents;
        },
        enumerable: false,
        configurable: true
    });
    // Error message for missing source or buffer
    Rive.missingErrorMessage = "Rive source file or data buffer required";
    return Rive;
}());

// Loads Rive data from a URI via fetch.
var loadRiveFile = function (src) { return __awaiter(void 0, void 0, void 0, function () {
    var req, res, buffer;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                req = new Request(src);
                return [4 /*yield*/, fetch(req)];
            case 1:
                res = _a.sent();
                return [4 /*yield*/, res.arrayBuffer()];
            case 2:
                buffer = _a.sent();
                return [2 /*return*/, buffer];
        }
    });
}); };
// #endregion
// #region utility functions
/*
 * Utility function to ensure an object is a string array
 */
var mapToStringArray = function (obj) {
    if (typeof obj === "string") {
        return [obj];
    }
    else if (obj instanceof Array) {
        return obj;
    }
    // If obj is undefined, return empty array
    return [];
};
// #endregion
// #region testing utilities
// Exports to only be used for tests
var Testing = {
    EventManager: EventManager,
    TaskQueueManager: TaskQueueManager,
};
// #endregion
// #region asset loaders
/**
 * Decodes bytes into an image.
 *
 * Be sure to call `.dispose()` on the image once it is no longer needed. This
 * allows the engine to clean it up when it is not used by any more animations.
 */
var decodeImage = function (bytes) {
    return new Promise(function (resolve) {
        return RuntimeLoader.getInstance(function (rive) {
            rive.decodeImage(bytes, resolve);
        });
    });
};
/**
 * Decodes bytes into a font.
 *
 * Be sure to call `.dispose()` on the font once it is no longer needed. This
 * allows the engine to clean it up when it is not used by any more animations.
 */
var decodeFont = function (bytes) {
    return new Promise(function (resolve) {
        return RuntimeLoader.getInstance(function (rive) {
            rive.decodeFont(bytes, resolve);
        });
    });
};
// #endregion

})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=rive.js.map