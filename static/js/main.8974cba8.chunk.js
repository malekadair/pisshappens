(this["webpackJsonppisshappens-client"]=this["webpackJsonppisshappens-client"]||[]).push([[0],{20:function(e,t,n){e.exports=n(35)},25:function(e,t,n){},26:function(e,t,n){},27:function(e,t,n){},33:function(e,t,n){},34:function(e,t,n){},35:function(e,t,n){"use strict";n.r(t);var a=n(0),r=n.n(a),c=n(18),l=n.n(c),o=n(7),i=(n(25),n(5)),u=n(6),m=n(9),s=n(8),p=n(1),h=(n(26),n(27),function(e){Object(m.a)(n,e);var t=Object(s.a)(n);function n(){var e;Object(i.a)(this,n);for(var a=arguments.length,r=new Array(a),c=0;c<a;c++)r[c]=arguments[c];return(e=t.call.apply(t,[this].concat(r))).handleLogoutClick=function(){},e}return Object(u.a)(n,[{key:"renderLogout",value:function(){return r.a.createElement("div",null,r.a.createElement(o.b,{className:"link",onClick:this.handleLogoutClick,to:"/"},"Logout"))}},{key:"renderLogin",value:function(){return r.a.createElement("div",null,r.a.createElement(o.b,{className:"link",to:"/login"},"Login"),r.a.createElement(o.b,{className:"link",to:"/register"},"Register"))}},{key:"render",value:function(){return r.a.createElement("nav",{className:"zone sticky main-nav"},r.a.createElement(o.b,{className:"right  siteTitle",to:"/"},"PissHappens"),r.a.createElement(o.b,{className:"comics",to:"/comics"},"See Comics"))}}]),n}(a.Component));n(33),n(34);var f=function(){return r.a.createElement("footer",{className:"zone footer-content"},r.a.createElement("h2",{className:"footer-link footer-right"},"c@2020"),r.a.createElement("a",{className:"footer-link grace",href:"https://arbitraders.io/",target:"_blank",rel:"noopener noreferrer"},"Kevin Schwindt"),r.a.createElement("a",{className:"footer-link malek",href:"https://malekadair.github.io/portfolio/",target:"_blank",rel:"noopener noreferrer"},"Malek Adair"))},E=function(e){Object(m.a)(n,e);var t=Object(s.a)(n);function n(){return Object(i.a)(this,n),t.apply(this,arguments)}return Object(u.a)(n,[{key:"componentDidMount",value:function(){}},{key:"render",value:function(){return r.a.createElement("div",null,r.a.createElement("header",null,r.a.createElement(h,null)),r.a.createElement("main",null,r.a.createElement("h2",null,"HomePage")),r.a.createElement(f,null))}}]),n}(a.Component),d=(a.Component,function(e){Object(m.a)(n,e);var t=Object(s.a)(n);function n(){return Object(i.a)(this,n),t.apply(this,arguments)}return Object(u.a)(n,[{key:"componentDidMount",value:function(){}},{key:"render",value:function(){return r.a.createElement("div",null,r.a.createElement("header",null,r.a.createElement(h,null)),r.a.createElement("main",null,r.a.createElement("h2",null,"Comics List Page")),r.a.createElement(f,null))}}]),n}(a.Component)),v=function(e){Object(m.a)(n,e);var t=Object(s.a)(n);function n(){return Object(i.a)(this,n),t.apply(this,arguments)}return Object(u.a)(n,[{key:"componentDidMount",value:function(){}},{key:"render",value:function(){var e=this.props.match.params.comicId,t="www.pisshappens.io/#"+this.props.match.url;return r.a.createElement("div",null,r.a.createElement("header",null,r.a.createElement(h,null)),r.a.createElement("main",null,r.a.createElement("h2",null,"Comic #",e),r.a.createElement("a",{href:t,target:"_blank"},t)),r.a.createElement(f,null))}}]),n}(a.Component),b=function(e){Object(m.a)(n,e);var t=Object(s.a)(n);function n(){return Object(i.a)(this,n),t.apply(this,arguments)}return Object(u.a)(n,[{key:"render",value:function(){return r.a.createElement("div",{className:"App"},r.a.createElement("h1",null,"PissHappens"),r.a.createElement(p.c,null,r.a.createElement(p.a,{exact:!0,path:"/",component:E}),r.a.createElement(p.a,{exact:!0,path:"/comics",component:d}),r.a.createElement(p.a,{path:"/comics/:comicId",component:v})))}}]),n}(a.Component);Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));l.a.render(r.a.createElement(r.a.StrictMode,null,r.a.createElement(o.a,null,r.a.createElement(b,null))),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()})).catch((function(e){console.error(e.message)}))}},[[20,1,2]]]);
//# sourceMappingURL=main.8974cba8.chunk.js.map