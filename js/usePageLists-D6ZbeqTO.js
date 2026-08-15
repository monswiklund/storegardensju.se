import{c as m,h as u}from"./index-cGYw8Z6O.js";import{r as c}from"./vendor-MIEccgdF.js";/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=m("Heart",[["path",{d:"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",key:"c3ymky"}]]);function L(n){const[o,i]=c.useState({});return c.useEffect(()=>{let t=!0;u(n).then(r=>{t&&r.found&&i(r.lists)});const a=r=>{var f;const s=((f=r.data)==null?void 0:f.data)||r.data;!t||(s==null?void 0:s.slug)!==n||!Array.isArray(s.contentLists)||i(Object.fromEntries(s.contentLists.filter(e=>typeof(e==null?void 0:e.key)=="string").map(e=>[e.key,Array.isArray(e.items)?e.items:[]])))};return window.addEventListener("message",a),()=>{t=!1,window.removeEventListener("message",a)}},[n]),c.useCallback((t,a=[])=>Object.prototype.hasOwnProperty.call(o,t)?o[t]:a,[o])}export{p as H,L as u};
