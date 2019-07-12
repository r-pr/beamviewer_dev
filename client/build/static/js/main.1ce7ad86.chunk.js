(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{11:function(e,n,t){e.exports=t(20)},17:function(e,n,t){},19:function(e,n,t){},20:function(e,n,t){"use strict";t.r(n);var o=t(0),a=t.n(o),s=t(10),i=t.n(s),c=t(1),r=t(2),l=t(7),d=t(5),u=t(4),h=t(6),f=(t(17),function(e){function n(e,t){var o;return Object(c.a)(this,n),(o=Object(l.a)(this,Object(d.a)(n).call(this,e,t))).onClickPub=o.onClickPub.bind(Object(u.a)(o)),o.onClickSub=o.onClickSub.bind(Object(u.a)(o)),o.handleSessIdChange=o.handleSessIdChange.bind(Object(u.a)(o)),o.handleNickNameChnage=o.handleNickNameChnage.bind(Object(u.a)(o)),o.state={sessId:"",nickName:""},o}return Object(h.a)(n,e),Object(r.a)(n,[{key:"render",value:function(){return a.a.createElement(a.a.Fragment,null,a.a.createElement("div",{className:"row"},a.a.createElement("div",{className:"col-sm-6 col-md-4 col-lg-3"},a.a.createElement("div",{className:"input-group mb-3"},a.a.createElement("input",{type:"text",className:"form-control",placeholder:"Session id",value:this.state.sessId,onChange:this.handleSessIdChange})),a.a.createElement("div",{className:"input-group mb-3"},a.a.createElement("input",{type:"text",className:"form-control",placeholder:"Nickname",value:this.state.nickName,onChange:this.handleNickNameChnage})),a.a.createElement("button",{className:"btn btn-primary btn-block",onClick:this.onClickSub},"Join session"))),a.a.createElement("div",{style:{minHeight:"2em"}}),a.a.createElement("div",{className:"row"},a.a.createElement("div",{className:"col-sm-6 col-md-4 col-lg-3 mb-3"},a.a.createElement("button",{className:"btn btn-success btn-block",onClick:this.onClickPub},"Create session"))))}},{key:"handleSessIdChange",value:function(e){this.setState({sessId:e.target.value.trim()})}},{key:"handleNickNameChnage",value:function(e){this.setState({nickName:e.target.value.trim()})}},{key:"onClickPub",value:function(e){this.props.onDecision({mode:"pub"})}},{key:"onClickSub",value:function(e){this.props.onDecision({mode:"sub",nickName:this.state.nickName,sessionId:this.state.sessId})}}]),n}(a.a.Component)),m=t(3),p=t.n(m),v=t(8),w="https:"===window.location.protocol?"wss":"ws",g=window.location.host,b={WS_SRV_URL:"".concat(w,"://").concat(g)};function k(e){return new Promise(function(n){setTimeout(n,e)})}var y=function(){function e(n){Object(c.a)(this,e),this.onCandidate=void 0,this.onOffer=void 0,this.onAnswer=void 0,this.url=void 0,this.ws=void 0,this.pendingPromise=void 0,this.sessId=void 0,this.previousReconnectTime=void 0,this.url=n,this.ws=null,this.pendingPromise={},this.sessId="",this.previousReconnectTime=0}return Object(r.a)(e,[{key:"getSessId",value:function(){return this.sessId}},{key:"connect",value:function(){var e=this;return new Promise(function(n,t){try{console.log("try construct websocket"),e.ws=new WebSocket(e.url),console.log("ws constructed")}catch(o){return console.log("ws construct:: err"),t(o),e.reconnect()}e.ws.onopen=n,e.ws.onerror=function(e){console.warn("ws::on_error::"+e)},e.ws.onmessage=e.onMessage.bind(e),e.ws.onclose=function(){e.ws.onerror=null,e.ws.onmessage=null,console.log("ws closed, gonna reconnect"),Date.now()-e.previousReconnectTime<2e3?(console.log("wait 2000 msec before reconnect"),setTimeout(e.reconnect.bind(e),2e3)):e.reconnect()}})}},{key:"logIn",value:function(e){var n=this;return new Promise(function(t,o){n.pendingPromise={resolve:t,reject:o},e?console.log("login, sessId=".concat(e," (").concat(typeof e,")")):(e=function(){var e=new Uint8Array(3),n=[];return window.crypto.getRandomValues(e),e.forEach(function(e){return n.push(e.toString(16))}),n.join("")}(),n.sessId=e),n.send({type:"login",sess_id:e})})}},{key:"send",value:function(e){this.ws.send(JSON.stringify(e))}},{key:"onMessage",value:function(e){var n={};try{n=JSON.parse(e.data)}catch(t){return void console.warn("ws: "+t.message+". msg.data="+e.data)}switch(console.log("ws: ",n),n.type){case"login_resp":this.handleLoginResp(n);break;case"candidate":this.handleCandidate(n);break;case"offer":this.handleOffer(n);break;case"answer":this.handleAnswer(n)}}},{key:"handleLoginResp",value:function(e){"ok"===e.status?this.pendingPromise.resolve(this.sessId):(console.warn("ws: "+JSON.stringify(e)),this.pendingPromise.resolve(null)),this.pendingPromise={}}},{key:"handleCandidate",value:function(e){console.log(Date.now()+" ws: got candidate"),this.onCandidate&&"function"===typeof this.onCandidate&&this.onCandidate(e.candidate)}},{key:"handleOffer",value:function(e){console.log(Date.now()+" ws: got offer"),this.onOffer&&"function"===typeof this.onOffer&&this.onOffer(e.offer)}},{key:"handleAnswer",value:function(e){console.log(Date.now()+" ws: got answer"),this.onAnswer&&"function"===typeof this.onAnswer&&this.onAnswer(e.answer)}},{key:"reconnect",value:function(){var e=this;this.previousReconnectTime=Date.now(),this.ws=null;var n=1;Object(v.a)(p.a.mark(function t(){return p.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.prev=1,console.log("try reconnect"),t.next=5,e.connect();case 5:return t.abrupt("break",17);case 8:return t.prev=8,t.t0=t.catch(1),console.warn(t.t0),n<10&&n++,console.log("reconnect failed, now sleeping ".concat(n," sec")),t.next=15,k(1e3*n);case 15:t.next=0;break;case 17:if(console.log("reconnected"),!e.sessId){t.next=23;break}return console.log("was logged in before, logging after reconnect"),t.next=22,e.logIn(e.sessId);case 22:console.log("login after reconnect: ok");case 23:case"end":return t.stop()}},t,null,[[1,8]])}))()}}]),e}(),O=function(){function e(){Object(c.a)(this,e)}return Object(r.a)(e,[{key:"getDisplayMedia",value:function(e){if(!this.canGetDisplayMedia())throw new Error("old browser");return e||(e={audio:!1,video:{cursor:"never"}}),navigator.mediaDevices.getDisplayMedia(e)}},{key:"canGetDisplayMedia",value:function(){return navigator.mediaDevices&&!!navigator.mediaDevices.getDisplayMedia}}]),e}(),E={},C=null,j=[],N=!1,R=function(e){function n(e){var t;return Object(c.a)(this,n),(t=Object(l.a)(this,Object(d.a)(n).call(this,e))).videoRef=void 0,t.userMedia=void 0,t.state={sessId:"",error:""},t.videoRef=a.a.createRef(),t.userMedia=new O,t}return Object(h.a)(n,e),Object(r.a)(n,[{key:"componentDidMount",value:function(){var e=this;this.userMedia.canGetDisplayMedia()?Object(v.a)(p.a.mark(function n(){var t,o,a,s,i,c;return p.a.wrap(function(n){for(;;)switch(n.prev=n.next){case 0:return n.prev=0,t=new y(b.WS_SRV_URL),o=function(e){j=[],(C=new RTCPeerConnection({})).addStream(i),C.onicecandidate=function(e){console.log("on ice"),e.candidate?N?(t.send({type:"candidate",candidate:e.candidate}),console.log("candidate sent")):(console.log("candidate buffered"),j.push(e.candidate)):(console.log("no event.candidate::"),console.log(e))}},a=function(e){t.send({type:"offer",offer:e}),N=!0,j.length&&j.forEach(function(e){t.send({type:"candidate",candidate:e})})},console.log("gona connect"),n.next=7,t.connect();case 7:return console.log("connected"),n.next=10,t.logIn();case 10:return s=t.getSessId(),console.log("logged in with sess_id="+s),n.next=14,e.userMedia.getDisplayMedia();case 14:return i=n.sent,e.videoRef.current&&(e.videoRef.current.srcObject=i),o(i),n.next=19,C.createOffer();case 19:c=n.sent,console.log("offer created"),C.setLocalDescription(c),t.onAnswer=function(e){C.onicecandidate=function(){},C.setRemoteDescription(new RTCSessionDescription(e)),console.log("got answer"),E[e.nickname]=C,Object(v.a)(p.a.mark(function e(){var n;return p.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return console.log("creating new tmp connection..."),o(i),e.next=4,C.createOffer();case 4:n=e.sent,console.log("new offer created"),C.setLocalDescription(n),a(n);case 8:case"end":return e.stop()}},e)}))()},a(c),e.setState({sessId:s}),n.next=31;break;case 27:n.prev=27,n.t0=n.catch(0),console.error(n.t0),e.setState({error:n.t0.message});case 31:case"end":return n.stop()}},n,null,[[0,27]])}))():this.setState({error:"you have an old browser, go get a newer one"})}},{key:"render",value:function(){return a.a.createElement("div",{className:"row"},a.a.createElement("div",{className:"col-sm-6 col-md-4 col-lg-3"},a.a.createElement("video",{ref:this.videoRef,autoPlay:!0,style:{width:"100%"}}),a.a.createElement("p",null,"Session Id: ",a.a.createElement("b",null,this.state.sessId)),this.getErrorElement()))}},{key:"getErrorElement",value:function(){return""!==this.state.error?a.a.createElement("div",{className:"alert alert-danger",role:"alert"},this.state.error):a.a.createElement("div",null)}}]),n}(a.a.Component),S=function(e){function n(e){var t;return Object(c.a)(this,n),(t=Object(l.a)(this,Object(d.a)(n).call(this,e))).videoRef=void 0,t.videoRef=a.a.createRef(),console.log("sub screen ctor::ws_srv_url:"+b.WS_SRV_URL),t}return Object(h.a)(n,e),Object(r.a)(n,[{key:"componentDidMount",value:function(){var e=this,n=this.props.nickName,t=new y(b.WS_SRV_URL);Object(v.a)(p.a.mark(function o(){var a;return p.a.wrap(function(o){for(;;)switch(o.prev=o.next){case 0:return console.log("sub: gona connect"),o.next=3,t.connect();case 3:console.log("sub: connected"),(a=new RTCPeerConnection({})).ontrack=function(n){if(!e.videoRef.current)throw new Error("sth went wrong");e.videoRef.current.srcObject=n.streams[0],e.videoRef.current.style.position="absolute",e.videoRef.current.style.top="0px",e.videoRef.current.style.left="0px"},a.onicecandidate=function(e){console.log("on ice"),e.candidate&&t.send({type:"candidate",candidate:e.candidate,nickname:n})},t.onOffer=function(e){a.setRemoteDescription(new RTCSessionDescription(e)),a.createAnswer().then(function(e){a.setLocalDescription(e),t.send({type:"answer",answer:e,nickname:n})},function(e){console.error(e)})},t.onCandidate=function(e){a.addIceCandidate(new RTCIceCandidate(e))},t.send({type:"join",sess_id:e.props.sessId,nickname:n});case 10:case"end":return o.stop()}},o)}))()}},{key:"render",value:function(){return a.a.createElement("div",{className:"row"},a.a.createElement("div",{className:"col-xs-12"},a.a.createElement("video",{ref:this.videoRef,autoPlay:!0,style:{width:"100%"}}),a.a.createElement("div",{style:{background:"rgba(0, 255, 0, .5)",width:50,height:50,position:"absolute",top:0,right:0,zIndex:2,textAlign:"center",fontSize:"2em",cursor:"pointer"},onClick:this.props.onExit},"X")))}}]),n}(a.a.Component),I=function(e){function n(e,t){var o;return Object(c.a)(this,n),(o=Object(l.a)(this,Object(d.a)(n).call(this,e,t))).state={},o.onUserDecision=o.onUserDecision.bind(Object(u.a)(o)),o.onExit=o.onExit.bind(Object(u.a)(o)),o}return Object(h.a)(n,e),Object(r.a)(n,[{key:"render",value:function(){return a.a.createElement("div",{className:"container-fluid"},a.a.createElement("div",{className:"row"},a.a.createElement("h1",{className:"col-sm-12 App-header2"},"BeamViewer")),this.getActiveComponent())}},{key:"onExit",value:function(){this.setState({appMode:void 0})}},{key:"onUserDecision",value:function(e){this.setState({appMode:e})}},{key:"getActiveComponent",value:function(){if(this.state.appMode){if("pub"===this.state.appMode.mode)return a.a.createElement(R,null);if("sub"===this.state.appMode.mode)return a.a.createElement(S,{nickName:this.state.appMode.nickName,sessId:this.state.appMode.sessionId,onExit:this.onExit});throw new Error}return a.a.createElement(f,{onDecision:this.onUserDecision})}}]),n}(a.a.Component);t(19),Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));"http:"===window.location.protocol&&"localhost"!==window.location.hostname&&(console.log("redirect to https"),window.location.replace(window.location.href.replace("http:","https:"))),i.a.render(a.a.createElement(I,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then(function(e){e.unregister()})}},[[11,1,2]]]);
//# sourceMappingURL=main.1ce7ad86.chunk.js.map