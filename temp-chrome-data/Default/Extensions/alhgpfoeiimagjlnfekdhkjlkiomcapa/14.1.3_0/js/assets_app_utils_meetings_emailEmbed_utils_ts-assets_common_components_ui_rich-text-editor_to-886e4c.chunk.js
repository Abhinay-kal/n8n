!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},t=(new e.Error).stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]="8833a9b4-a436-4f87-a4af-24a5c9d36629",e._sentryDebugIdIdentifier="sentry-dbid-8833a9b4-a436-4f87-a4af-24a5c9d36629")}catch(e){}}();var _global="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{};_global.SENTRY_RELEASE={id:"chrome-extension@14.1.3"};"use strict";(globalThis.webpackChunkleadgenie=globalThis.webpackChunkleadgenie||[]).push([["assets_app_utils_meetings_emailEmbed_utils_ts-assets_common_components_ui_rich-text-editor_to-886e4c"],{12571:(e,t,n)=>{n.d(t,{Rz:()=>s,rR:()=>c,xu:()=>r,yd:()=>d});var a=n(96424),l=n(52122);if("inject"==n.j)var o=n(61393);if("inject"==n.j)var i=n(25596);let s={MAX_SELECTABLE_SLOTS:25};var r=function(e){return e.MEETING_NAME="name",e.MEETING_DURATION="duration",e.MEETING_TIMEZONE="timeZone",e.MEETING_LOCATION="location",e.MEETING_RESERVATION="active",e}({});let d=e=>{var t;let{slots:n,formValues:a,reservationId:l,meetingInfo:s={},composeView:r}=e,d=r.getBodyElement();d.focus();let c=null==(t=getSelection())?void 0:t.getRangeAt(0),m=(0,i.yF)({formValues:a,reservationId:l,slots:n,meetingInfo:s});null==c||c.insertNode(m),null==c||c.insertNode(document.createElement("br")),r.on("presending",()=>{let e=r.getToRecipients().map(e=>({name:e.name??"",email:e.emailAddress}));o.Z.fetch("/meeting_type_calendar_event_settings/update_reserved_meeting",{method:"put",data:{reserved_meeting_slot_id:l,recipients:e}});let t=r.getBodyElement().querySelector("#zp-meetings-header-delete-button");null==t||t.remove(),d.focus()})},c=(e,t)=>{try{return e.reduce((e,n)=>{let[o,i]=[(0,l.zW)(n.start,t),(0,l.zW)(n.end,t)],s=(0,a.WU)(o,"yyyy-MM-dd"),r=parseInt((0,a.WU)(o,"HHmm"),10),d=parseInt((0,a.WU)(i,"HHmm"),10);return e[s]?e[s].push([r,d]):e[s]=[[r,d]],e},{})}catch{return{}}}},25596:(e,t,n)=>{n.d(t,{CJ:()=>p,dx:()=>g,vz:()=>u,yF:()=>y});var a=n(96424),l=n(10590),o=n(14430),i=n(34323),s=n(32482),r=n(93743),d=n(47953),c=n(41849),m=n(9084);let p={[o.Mw.CUSTOM]:{label:"Custom",value:o.Mw.CUSTOM},[o.Mw.GOOGLE_MEET]:{label:"Google meet",value:o.Mw.GOOGLE_MEET},[o.Mw.ZOOM]:{label:"Zoom",value:o.Mw.ZOOM}};var u=function(e){return e.EMAILER_MEETINGS="emailer_meetings_product_tour",e}({});let g=function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[],t={};return e.forEach(e=>{Array.isArray(e.start)&&(e.start=e.start[0]);let n=new Date(e.start).toDateString();t[n]||(t[n]=[]),t[n].push(e)}),t},y=e=>{let{slots:t,formValues:n,reservationId:o,meetingInfo:p={},source:u="gmail"}=e,y=(0,m.c)(n.timeZone??p.timeZone??""),f=document.createElement("div");f.style.cssText=`
    width: 90%;
    max-width: 440px;

    border-radius: 4px;
    border: 1px solid #1991EB;
    background: var(--color-base-sand-0, #FFF);
  `;let b=document.createElement("div");b.style.cssText=`
    padding: 16px;
  `;let x=document.createElement("div");x.style.cssText=`
  `;let E=document.createElement("div");E.style.cssText=`
    color: var(--color-base-ocean-70, #242D3E);
    font-size: 16px;
    font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
    font-weight: 600;
    line-height: 140%;
    display: table;
    width: 100%;
  `;let h=document.createElement("div");h.innerHTML=(0,s.ub)(n.name),h.style.cssText=`
    display: table-cell;
    vertical-align: middle;
  `;let v=document.createElement("div");v.style.cssText=`
    display: table-cell;
    text-align: right;
  `;let T=document.createElement("div");T.innerHTML=(0,s.ub)(`<img src="https://storage.googleapis.com/app-public-assets/eternal/clock-eight.png" width="16" alt="" style="vertical-align: middle; margin-right: 4px;"/>   <span style="vertical-align: middle;">${n.durationInText} </span>`),T.style.cssText=`
    display: table;
    margin-top: 12px;

    color: var(--base-neutral-neutral-70, #474747);
    font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
    font-size: 14px;
    font-style: normal;
    font-weight: 500;
    line-height: 21px;
  `;let S=document.createElement("div");S.style.display="table";let I=document.createElement("span");I.style.cssText=`
    margin-top: 4px;
    margin-right: 12px;

    color: var(--color-base-sand-70, #474747);
    font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
    font-size: 14px;
    font-style: normal;
    font-weight: 500;
    line-height: 21px;
  `;let M=(0,r.M1)(y);I.innerHTML=(0,s.ub)('<img src="https://storage.googleapis.com/app-public-assets/eternal/globe.png" width="16" alt="" style="vertical-align: middle; margin-right: 4px;"/>  <span style="vertical-align: middle;">'+(M?`${M} - `:"")+`${y} (${(0,i.hs)(y)})</span>`);let w=document.createElement("a");w.style.cssText=`
    vertical-align: middle;

    color: var(--color-data-blue-blue-50, #146EF6);
    font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
    font-size: 14px;
    font-style: normal;
    font-weight: 600;
    line-height: 21px;

    text-decoration: none;
  `,w.innerHTML="Change",w.href=`${(0,d.L)()}/#/meet/${p.link}/one-off/slots?${c.lZ.TIMEZONE}=${encodeURIComponent(y)}&${c.lZ.RESERVATION_ID}=${o}`;let _=document.createElement("div"),C=document.createElement("div");Object.entries(g(t)).forEach(e=>{let[t,n]=e,i=document.createElement("div");i.style.cssText=`
      padding: 16px;
      border-top: 1px solid #E3E3E5;
    `;let r=document.createElement("div");r.style.cssText=`
      margin-bottom: 8px;
      color: var(--color-base-ocean-70, #242D3E);
      font-size: 15px;
      font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
      font-weight: 500;
      line-height: 22px;
    `,r.innerHTML=(0,s.ub)((0,a.WU)(new Date(t),"E, MMM d"));let m=document.createElement("div");n.forEach(e=>{Array.isArray(e.start)&&(e.start=e.start[0]);let t=document.createElement("a");t.style.cssText=`
        display: inline-block;

        padding: 5px 13px;
        margin-right: 8px;
        margin-bottom: 8px;

        border-radius: 4px;
        border: 1px solid #D3DAE3;
        background: var(--color-base-sand-0, #FFF);
        text-decoration: none;
      `,t.innerHTML=(0,s.ub)((0,a.WU)(new Date(e.start),"hh:mm a")),p.link&&(t.href=`${(0,d.L)()}/#/meet/${p.link}/one-off/submission?${c.lZ.SOURCE}=${u}&${c.lZ.SLOT_START}=${encodeURIComponent((0,l.c)(new Date(e.start)))}&${c.lZ.TIMEZONE}=${encodeURIComponent(y)}&${c.lZ.RESERVATION_ID}=${o}`),m.append(t)}),i.append(r,m),C.append(i)});let N=document.createElement("div");N.style.cssText=`
    padding: 16px;

    border: 1px solid #D3DAE3;

    font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
    font-size: 14px;
    font-style: normal;
    font-weight: 500;
    line-height: 21px;

    text-align: center;
  `;let O=`${(0,d.L)()}/#/meet/${p.link}?source=${u}`;N.innerHTML=(0,s.ub)(`Need a different time slot? <a target="_blank" href="${O}" style="text-decoration: none; font-weight: 500;">View all availability</a>`);let k=document.createElement("div");return k.style.cssText=`
    padding: 10px 20px;

    border-radius: 0px 0px 6px 6px;
    background: var(--grays-gray-6, #F7F9FB);

    text-align: center;
  `,k.innerHTML=(0,s.ub)(`
    <span style="display: table; margin: auto; color: var(--grays-gray-2, #5D6A7E); font-size: 12px; text-align:center; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif; line-height: 16px; ">
      Powered by
      <img src="https://assets.apollo.io/eternal/apollo-full-logo.svg" alt="Apollo.io" style="width:56px; height:auto; vertical-align:middle;" />
    </span>
  `),S.append(I,w),E.append(h,v),x.append(E,T,S),b.append(x,_),f.append(b,C,N,k),f}},90112:(e,t,n)=>{n.d(t,{F:()=>d,P:()=>s});var a=n(55097),l=n(30260);if("inject"==n.j)var o=n(45631);if("inject"==n.j)var i=n(77324);let s=(e,t,n)=>{var o;let i=(0,a.hi)()&&"gmail",s={snippetName:e.name,channel:i||"extension",ownerEmail:null==(o=t[e.userId])?void 0:o.email,linksPresent:e.bodyHtml.includes("<a"),imagesPresent:e.bodyHtml.includes("<img"),source:""};n&&(s.source="Control Center"),l.Z.track("Snippet Inserted",s)},r=function(e,t){let n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},a=arguments.length>3?arguments[3]:void 0;return new Promise(l=>{let{name:i,emailAddress:s}=n;i&&s&&e.bodyHtml.includes("{{")?t((0,o.jJ)({snippetId:e.id,name:i,email:s,draftId:a},{success:e=>{l(e.bodyHtml)},error:e=>{console.error(e),l("")}})):l(e.bodyHtml)})},d=async(e,t,n)=>{let a=t.inboxSdkView.getToRecipients()[0],l=await Promise.race([t.inboxSdkView.getDraftID(),(0,i.nx)()]),o=await r(e,n,a,l);t.inboxSdkView.getBodyElement().focus(),t.inboxSdkView.insertHTMLIntoBodyAtCursor(o)}},4887:(e,t,n)=>{n.d(t,{C:()=>x,Z:()=>E});var a=n(85893),l=n(67294),o=n(79518),i=n(94184),s=n.n(i),r=n(86896),d=n(83455),c=n(65346),m=n(99834),p=n(7616),u=n(29784),g=n(90112),y=n(52152),f=n(94856),b=n(95240);function x(e){let{disabled:t,onSnippetSelected:n,className:l,isControlCenterPage:o,button:i}=e,c=(0,r.Z)();return(0,a.jsx)(E,{className:l,onSnippetSelected:n,isControlCenterPage:o,children:e=>{let{toggleMenu:n}=e;return i?i({onClick:n,disabled:t}):(0,a.jsx)(d.zx,{variant:"secondary",className:s()("emailerPrimaryActionButton"),onClick:n,icon:"scissors",iconOnly:!0,tooltipContent:c.formatMessage(f.s.addSnippet),disabled:t})}})}function E(e){let{children:t,className:n,onSnippetSelected:i,toolBarRef:r,isControlCenterPage:d,portal:f,portalElement:x,backdrop:E}=e,h=(0,o.useSelector)(u.YN),[v,T]=(0,l.useState)(!1),S=(0,l.useRef)();function I(){T(!1)}return(0,a.jsxs)("div",{ref:S,className:n,children:[t({toggleMenu:function(){v?I():T(!0)}}),(0,a.jsx)(c.a,{show:v,hideOnInteractOutside:!0,onHide:I,target:()=>r?r.current:S.current,placement:"left",modal:!0,portal:f,portalElement:x,backdrop:E||!0,children:(0,a.jsx)(m.i,{children:(0,a.jsx)("div",{className:s()("text-body-sm-medium",b.Z.overlayContent,r&&b.Z.overlayContentInToolBar,{[b.Z.extensionSidePanel]:(0,y.FW)()&&!0}),children:(0,a.jsx)(p.Z,{onSelect:function(e){I(),(0,g.P)(e,h,d),i(e)},type:"snippets",hideOverlay:I})})})},"overlay")]})}x.defaultProps={disabled:!1,className:"",button:void 0,isControlCenterPage:!1},E.defaultProps={className:"",isControlCenterPage:!1,toolBarRef:void 0}}}]);
//# sourceMappingURL=assets_app_utils_meetings_emailEmbed_utils_ts-assets_common_components_ui_rich-text-editor_to-886e4c.chunk.js.map