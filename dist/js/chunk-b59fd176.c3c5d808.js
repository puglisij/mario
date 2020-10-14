(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-b59fd176"],{"4fad":function(e,t,n){var i=n("23e7"),a=n("6f53").entries;i({target:"Object",stat:!0},{entries:function(e){return a(e)}})},"6f53":function(e,t,n){var i=n("83ab"),a=n("df75"),o=n("fc6a"),s=n("d1e7").f,l=function(e){return function(t){var n,l=o(t),r=a(l),c=r.length,u=0,p=[];while(c>u)n=r[u++],i&&!s.call(l,n)||p.push(e?[n,l[n]]:l[n]);return p}};e.exports={entries:l(!0),values:l(!1)}},c256:function(e,t,n){},ce2d:function(e,t,n){"use strict";var i=n("c256"),a=n.n(i);a.a},d05b:function(e,t,n){"use strict";n.r(t);var i=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("validation-observer",{ref:"observer",attrs:{slim:""},scopedSlots:e._u([{key:"default",fn:function(t){var i=t.handleSubmit;return[n("form",{staticClass:"pipelines",attrs:{novalidate:"true"},on:{keydown:function(t){if(!t.type.indexOf("key")&&e._k(t.keyCode,"enter",13,t.key,"Enter"))return null;t.preventDefault()},submit:function(t){return t.preventDefault(),i(e.onConfigurationSubmit)}}},[n("h2",{staticClass:"tab-title"},[e._v("Pipelines"),n("i",{directives:[{name:"show",rawName:"v-show",value:e.needSaved,expression:"needSaved"}]},[e._v("*")])]),n("a-checkbox",{model:{value:e.pauseAfterEveryPipeline,callback:function(t){e.pauseAfterEveryPipeline=t},expression:"pauseAfterEveryPipeline"}},[e._v(" Pause processing after every Pipeline? ")]),n("a-checkbox",{model:{value:e.pauseAfterEveryAction,callback:function(t){e.pauseAfterEveryAction=t},expression:"pauseAfterEveryAction"}},[e._v(" Pause processing after every Pipeline Action? ")]),n("a-checkbox",{model:{value:e.pauseAfterEveryImage,callback:function(t){e.pauseAfterEveryImage=t},expression:"pauseAfterEveryImage"}},[e._v(" Pause processing after every Image? ")]),n("a-checkbox",{model:{value:e.pauseOnExceptions,callback:function(t){e.pauseOnExceptions=t},expression:"pauseOnExceptions"}},[e._v(" Pause processing on errors? ")]),e.isEditorOpen?n("div",[n("h3",{staticClass:"section-title"},[e._v("Actions Editor")]),n("p",{staticClass:"text-highlight mt0"},[e._v("Editing: "+e._s(e.pipelineBeingEdited.name))]),n("draggable",{attrs:{draggable:".action",handle:".action-handle",group:"actions"},model:{value:e.pipelineBeingEdited.actions,callback:function(t){e.$set(e.pipelineBeingEdited,"actions",t)},expression:"pipelineBeingEdited.actions"}},e._l(e.pipelineBeingEdited.actions,(function(t,i){return n("a-pipeline-action",{key:t.id,on:{delete:e.onActionDelete},model:{value:e.pipelineBeingEdited.actions[i],callback:function(t){e.$set(e.pipelineBeingEdited.actions,i,t)},expression:"pipelineBeingEdited.actions[index]"}})})),1)],1):n("div",[n("h3",{staticClass:"section-title"},[e._v("Pipelines")]),n("draggable",{attrs:{draggable:".pipeline",handle:".pipeline-handle",group:"pipelines"},model:{value:e.pipelines,callback:function(t){e.pipelines=t},expression:"pipelines"}},e._l(e.pipelines,(function(t){return n("a-pipeline",{key:t.id,attrs:{id:t.id,name:t.name,sourceNames:t.sourceNames,disabled:t.disabled,collapsed:t.collapsed,pipelines:e.pipelines},on:{"update:id":function(n){return e.$set(t,"id",n)},"update:name":function(n){return e.$set(t,"name",n)},"update:sourceNames":function(n){return e.$set(t,"sourceNames",n)},"update:source-names":function(n){return e.$set(t,"sourceNames",n)},"update:disabled":function(n){return e.$set(t,"disabled",n)},"update:collapsed":function(n){return e.$set(t,"collapsed",n)},"pipeline-delete":e.onPipelineDelete,"pipeline-edit":e.onPipelineEdit,"pipeline-play":e.onPipelinePlay}})})),1)],1),n("div",{staticClass:"pipeline-buttons"},[n("button",{directives:[{name:"show",rawName:"v-show",value:!e.isEditorOpen,expression:"!isEditorOpen"}],staticClass:"topcoat-button--large",attrs:{type:"button"},on:{click:e.onPipelineAdd}},[e._v("Add Pipline")]),n("button",{directives:[{name:"show",rawName:"v-show",value:e.isEditorOpen,expression:"isEditorOpen"}],staticClass:"topcoat-button--large",attrs:{type:"button"},on:{click:e.onActionAdd}},[e._v("Add Action")]),n("button",{directives:[{name:"show",rawName:"v-show",value:e.isEditorOpen,expression:"isEditorOpen"}],staticClass:"topcoat-button--large",attrs:{type:"button"},on:{click:e.onEditorClose}},[e._v("Close")]),n("button",{directives:[{name:"show",rawName:"v-show",value:e.needSaved,expression:"needSaved"}],staticClass:"topcoat-button--large",attrs:{type:"submit"}},[e._v("Save")])])],1)]}}])})},a=[],o=(n("4de4"),n("7db0"),n("4160"),n("b0c0"),n("159b"),n("96cf"),n("1da1")),s=n("b85c"),l=n("7bb1"),r=n("310e"),c=n.n(r),u=n("025e"),p=n("4360"),d=n("0c12"),m=n("e70e"),h=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{staticClass:"pipeline",class:{disabled:e.disabled,collapsed:e.collapsed}},[n("div",{staticClass:"pipeline-head"},[n("span",{staticClass:"pipeline-handle",attrs:{title:"Drag to re-order"}},[e._v("☰")]),e.collapsed?n("button",{staticClass:"topcoat-button--large--quiet mx1",attrs:{type:"button",title:"Run this pipeline with its configured source(s)",disabled:e.disabled_},on:{click:e.onPlay}},[e._v("▶")]):e._e(),e.collapsed_?n("span",[e._v(e._s(e.name_))]):e._e(),n("button",{staticClass:"topcoat-button--large--quiet expand right",class:{open:!e.collapsed},on:{click:function(t){e.collapsed_=!e.collapsed_}}},[n("i",[e._v("❱")])])]),e.collapsed_?e._e():n("div",{staticClass:"pipeline-body"},[n("validation-provider",{attrs:{tag:"label",rules:{required:!0,custom:{fn:e.validateName}}},scopedSlots:e._u([{key:"default",fn:function(t){var i=t.errors;return[n("div",{staticClass:"label"},[e._v("Name")]),n("input",{directives:[{name:"model",rawName:"v-model",value:e.name_,expression:"name_"}],staticClass:"topcoat-text-input full-width",attrs:{type:"text",title:"A unique name for the pipeline.",placeholder:"my-pipeline-name"},domProps:{value:e.name_},on:{input:function(t){t.target.composing||(e.name_=t.target.value)}}}),i.length?n("span",{staticClass:"topcoat-notification error"},[e._v(e._s(i[0]))]):e._e()]}}],null,!1,2456396026)}),n("validation-provider",{attrs:{tag:"label",rules:{custom:{fn:e.validateSourceNames}}},scopedSlots:e._u([{key:"default",fn:function(t){var i=t.errors;return[n("div",{staticClass:"label"},[e._v("File Source(s)")]),n("a-array-input",{staticClass:"topcoat-text-input full-width",attrs:{title:"The file source(s) to use for inputs to this pipeline. Comma delimited.",placeholder:"my-file-source-name"},model:{value:e.sourceNames_,callback:function(t){e.sourceNames_=t},expression:"sourceNames_"}}),i.length?n("span",{staticClass:"topcoat-notification error"},[e._v(e._s(i[0]))]):e._e()]}}],null,!1,1872742142)}),n("a-checkbox",{model:{value:e.disabled_,callback:function(t){e.disabled_=t},expression:"disabled_"}},[e._v(" Disabled ")]),n("button",{staticClass:"topcoat-button--large--quiet",attrs:{type:"button",title:"Run this pipeline with its configured source(s)",disabled:e.disabled_},on:{click:e.onPlay,disabled:e.disabled_}},[e._v("▶")]),n("button",{staticClass:"topcoat-button--large--quiet",attrs:{type:"button"},on:{click:e.onEdit}},[e._v("Edit")]),n("button",{staticClass:"topcoat-button--large--quiet",attrs:{type:"button",title:"Delete this pipeline"},on:{click:e.onDelete}},[e._v("X")])],1)])},f=[],v=(n("498a"),n("9b0a")),b={name:"APipeline",components:{ValidationProvider:l["b"],ACheckbox:m["a"],AArrayInput:v["a"]},props:{id:{type:String,required:!0},name:{type:String,required:!0},sourceNames:{type:Array,required:!0},disabled:{type:Boolean,required:!0},collapsed:{type:Boolean,required:!0},pipelines:{type:Array,required:!0}},computed:{name_:{get:function(){return this.name},set:function(e){this.$emit("update:name",e)}},sourceNames_:{get:function(){return u["b"].simpleDeepClone(this.sourceNames)},set:function(e){this.$emit("update:sourceNames",e)}},disabled_:{get:function(){return this.disabled},set:function(e){this.$emit("update:disabled",e)}},collapsed_:{get:function(){return this.collapsed},set:function(e){this.$emit("update:collapsed",e)}}},methods:{validateName:function(e){var t=e.trim();this._name=t;var n=this.pipelines.filter((function(e){return e.name==t})).length;return{valid:1===n,message:"Pipeline name must be unique"}},validateSourceNames:function(e){var t=e.filter((function(e){return!p["a"].general.fileSources.find((function(t){return t.name===e}))}));return{valid:0===t.length,message:"A file source by name '".concat(t.pop(),"' does not exist.")}},onEdit:function(){this.$emit("pipeline-edit",this.id)},onPlay:function(){this.$emit("pipeline-play",this.id)},onDelete:function(){this.$emit("pipeline-delete",this.id)}}},g=b,y=n("2877"),_=Object(y["a"])(g,h,f,!1,null,null,null),A=_.exports,P=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{staticClass:"action"},[n("span",{staticClass:"action-handle",attrs:{title:"Drag to re-order"}},[e._v("☰")]),n("div",{staticClass:"action-data"},[n("div",{staticClass:"action-name"},[n("input",{directives:[{name:"model",rawName:"v-model",value:e.localAction.actionName,expression:"localAction.actionName"}],staticClass:"topcoat-text-input mr1",attrs:{type:"text",placeholder:"the action function name (e.g. 'action.saveDocument')",title:"The action function name as given in the jsx. Case sensitive."},domProps:{value:e.localAction.actionName},on:{input:function(t){t.target.composing||e.$set(e.localAction,"actionName",t.target.value)}}}),n("button",{staticClass:"topcoat-button--large--quiet",attrs:{type:"button",title:"Delete this action"},on:{click:e.onActionDelete}},[e._v("X")]),n("button",{staticClass:"topcoat-button--large--quiet expand ml1",class:{open:e.showParameters},attrs:{title:(e.showParameters?"Hide":"Show")+" Parameters"},on:{click:e.toggleParameters}},[n("i",[e._v("❱")])])]),e.showParameters?n("div",{staticClass:"action-parameters"},[n("h3",[e._v("Parameters")]),e._l(e.localAction.parameters,(function(t,i){return n("a-pipeline-action-parameter",{key:i,attrs:{id:i,name:t.name,value:t.value,disableName:e.hasSingleParameter},on:{change:e.onParameterChange,delete:e.onParameterDelete}})})),e.hasParameters?e._e():n("button",{staticClass:"topcoat-button",attrs:{type:"button",title:"Single parameters are passed as a single parameter, literal value, to the action function."},on:{click:e.onParameterAddSingle}},[e._v(" Add Single ")]),e.hasParameters&&e.hasSingleParameter?e._e():n("button",{staticClass:"topcoat-button",attrs:{type:"button",title:"Multiple parameters are passed as an object of key value pairs to the action function."},on:{click:e.onParameterAddMultiple}},[e._v(" "+e._s(e.hasParameters?"Add":"Add Multiple")+" ")])],2):e._e()])])},C=[],E=(n("4fad"),n("b64b"),n("3835")),x=n("ade3"),N=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{staticClass:"action-parameter"},[n("select",{directives:[{name:"model",rawName:"v-model",value:e.type,expression:"type"}],staticClass:"topcoat-text-input mr2",on:{change:[function(t){var n=Array.prototype.filter.call(t.target.options,(function(e){return e.selected})).map((function(e){var t="_value"in e?e._value:e.value;return t}));e.type=t.target.multiple?n:n[0]},e.onType]}},e._l(e.types,(function(t){return n("option",{key:t,domProps:{value:t}},[e._v(e._s(t))])})),0),n("div",{staticClass:"action-parameter__input mr2"},[n("input",{directives:[{name:"model",rawName:"v-model",value:e.localName,expression:"localName"}],staticClass:"topcoat-text-input",attrs:{type:"text",placeholder:"name",disabled:e.disableName},domProps:{value:e.localName},on:{input:function(t){t.target.composing||(e.localName=t.target.value)}}})]),n("a-checkbox",{directives:[{name:"show",rawName:"v-show",value:e.isBoolean,expression:"isBoolean"}],staticClass:"action-parameter__input mr2",attrs:{checked:e.localValue},on:{change:e.onCheckboxValue}}),n("div",{staticClass:"action-parameter__input mr2"},[n("input",{directives:[{name:"show",rawName:"v-show",value:!e.isBoolean,expression:"!isBoolean"}],staticClass:"topcoat-text-input",attrs:{type:"text",placeholder:"value"},domProps:{value:e.localValue},on:{change:e.onTextValue}})]),n("button",{staticClass:"topcoat-button--large--quiet",attrs:{type:"button",title:"Delete this parameter"},on:{click:e.onDelete}},[e._v("X")])],1)},k=[],w=(n("99af"),n("a9e3"),"String"),S="Number",$="Boolean",O="Unknown",D=[w,S,$],B={name:"APipelineActionParameter",components:{ACheckbox:m["a"]},props:{id:{type:String,required:!0},disableName:Boolean,name:String,value:null},data:function(){var e=this.getType(this.value);return console.log("parameter data() type: ".concat(e," name: ").concat(this.name," rawValue: ").concat(this.value)),{type:e,localValue:e===O?null:this.value,localName:this.name}},computed:{types:function(){return D},isBoolean:function(){return this.type===$},isNumber:function(){return this.type===S},isString:function(){return this.type===w}},watch:{localName:function(){this.emitChange()},localValue:function(){this.emitChange()}},methods:{emitChange:function(){this.$emit("change",this.id,this.localName,this.localValue)},getType:function(e){return u["b"].isBoolean(e)?$:u["b"].isNumber(e)?S:(u["b"].isString(e),w)},forceType:function(e){return this.isBoolean?Boolean(e):this.isNumber?isNaN(e)?0:Number(e):this.isString?""+e:void 0},onType:function(){this.localValue=this.forceType(this.localValue)},onCheckboxValue:function(e){this.localValue=e},onTextValue:function(){this.localValue=this.forceType(event.target.value)},onDelete:function(){this.$emit("delete",this.id)}}},j=B,q=Object(y["a"])(j,N,k,!1,null,null,null),V=q.exports,T="SINGLE",I={name:"APipelineAction",components:{APipelineActionParameter:V},model:{prop:"action",event:"change"},props:{action:Object},data:function(){return{localAction:this.toLocalAction(this.action),showParameters:!1}},computed:{hasParameters:function(){return Object.keys(this.localAction.parameters).length},hasSingleParameter:function(){return 1===Object.keys(this.localAction.parameters).length&&u["b"].first(this.localAction.parameters).name===T}},methods:{emitChange:function(){var e=this.toRawAction(this.localAction);this.$emit("change",e)},toLocalAction:function(e){for(var t=e.actionName,n=e.parameters,i=u["b"].isBoolean(n)||u["b"].isNumber(n)||u["b"].isString(n)||u["b"].isNull(n)?Object(x["a"])({},T,n):n,a={actionName:t,parameters:{}},o=0,s=Object.entries(i||{});o<s.length;o++){var l=Object(E["a"])(s[o],2),r=l[0],c=l[1],p=u["b"].guid();a.parameters[p]={name:r,value:c}}return a},toRawAction:function(e){var t={id:this.action.id,actionName:e.actionName};if(this.hasParameters)if(this.hasSingleParameter)t.parameters=u["b"].first(e.parameters).value;else{t.parameters={};for(var n=0,i=Object.entries(e.parameters);n<i.length;n++){var a=Object(E["a"])(i[n],2),o=(a[0],a[1]);t.parameters[o.name]=o.value}}return t},onActionDelete:function(){this.$emit("delete",this.action.id),this.emitChange()},toggleParameters:function(){this.showParameters=!this.showParameters},onParameterChange:function(e,t,n){this.localAction.parameters[e].name=t,this.localAction.parameters[e].value=n,this.emitChange()},onParameterAddSingle:function(){var e=u["b"].guid();this.$set(this.localAction.parameters,e,{name:T,value:""}),this.emitChange()},onParameterAddMultiple:function(){var e=u["b"].guid();this.$set(this.localAction.parameters,e,{name:"name",value:""}),this.emitChange()},onParameterDelete:function(e){console.log("Deleting parameter: "+e),this.$delete(this.localAction.parameters,e),this.emitChange()}}},R=I,L=Object(y["a"])(R,P,C,!1,null,null,null),M=L.exports,X=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{staticClass:"modal-root"},[n("header",{staticClass:"modal-header"},[e._v(" Select an Action ")]),n("section",{staticClass:"modal-body"},[null!=e.actionTree?n("select-pipeline-action-node",{attrs:{node:e.actionTree,expand:!0},on:{"on-select":e.onSelect}}):e._e()],1),n("footer",{staticClass:"modal-footer"},[n("button",{staticClass:"topcoat-button--large",attrs:{type:"button"},on:{click:e.onCancel}},[e._v(" Cancel ")])])])},F=[],J=n("af82"),Y=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{style:e.indent},[n("div",{staticClass:"tree-node",class:{expanded:e.isExpanded,directory:e.node.isDirectory},on:{click:e.select}},[e.node.isDirectory?n("button",{staticClass:"tree-node__expand topcoat-icon-button--quiet"},[n("i",[e._v("▶")])]):e._e(),e.node.isDirectory?n("i",[e._v("🖿")]):e._e(),n("span",[e._v(e._s(e.name))])]),e._l(e.children,(function(t,i){return n("select-pipeline-action-node",{key:e.getName(e.children[i]),attrs:{node:e.children[i],depth:1},on:{"on-select":function(t){return e.$emit("on-select",t)}}})}))],2)},G=[],H=(n("a15b"),n("524a")),U={name:"SelectPipelineActionNode",props:{node:{type:Object,required:!0,validator:function(e){return e instanceof H["a"]}},depth:{type:Number,default:0},expand:{type:Boolean,default:!1}},data:function(){return{isExpanded:this.expand,name:this.getName(this.node)}},computed:{children:function(){return this.isExpanded?this.node.children:[]},indent:function(){return{transform:"translateX(".concat(44*this.depth,"px)")}}},methods:{getName:function(e){return e.getNamePath().join(".")},select:function(){this.node.isDirectory?this.isExpanded=!this.isExpanded:this.$emit("on-select",this.name)}}},z=U,K=Object(y["a"])(z,Y,G,!1,null,null,null),Q=K.exports,W={name:"SelectPipelineAction",components:{SelectPipelineActionNode:Q},data:function(){return{actionTree:J["a"].actions.getAllActions()}},created:function(){},methods:{onCancel:function(){this.$emit("onClose")},onSelect:function(e){var t=this;J["a"].actions.getActionDescriptorByName(e).then((function(e){t.$emit("onSelect",e),t.$emit("onClose")}))}}},Z=W,ee=(n("ce2d"),Object(y["a"])(Z,X,F,!1,null,null,null)),te=ee.exports,ne={name:"ThePipelines",components:{ValidationObserver:l["a"],Draggable:c.a,ACheckbox:m["a"],APipeline:A,APipelineAction:M},data:function(){return{pauseAfterEveryPipeline:p["a"].general.pauseAfterEveryPipeline,pauseAfterEveryAction:p["a"].general.pauseAfterEveryAction,pauseAfterEveryImage:p["a"].general.pauseAfterEveryImage,pauseOnExceptions:p["a"].general.pauseOnExceptions,pipelines:this.toLocalPipelines(p["a"].pipelines.pipelines),needSaved:!1,pipelineBeingEdited:{}}},computed:{isEditorOpen:function(){return!u["b"].isEmptyObject(this.pipelineBeingEdited)}},watch:{pauseAfterEveryPipeline:function(e){p["a"].general.pauseAfterEveryPipeline=e},pauseAfterEveryAction:function(e){p["a"].general.pauseAfterEveryAction=e},pauseAfterEveryImage:function(e){p["a"].general.pauseAfterEveryImage=e},pauseOnExceptions:function(e){p["a"].general.pauseOnExceptions=e},pipelines:{deep:!0,handler:function(e){this.needSaved=!0}}},created:function(){var e=this;d["a"].$on("filesource-update",(function(){e.refreshPipelineSourcesFromStorage()}))},methods:{toLocalPipelines:function(e){var t,n=u["b"].simpleDeepClone(e),i=Object(s["a"])(n);try{for(i.s();!(t=i.n()).done;){var a=t.value;a.id=a.id||u["b"].guid();var o,l=Object(s["a"])(a.actions);try{for(l.s();!(o=l.n()).done;){var r=o.value;r.id=r.id||u["b"].guid()}}catch(c){l.e(c)}finally{l.f()}}}catch(c){i.e(c)}finally{i.f()}return n},onConfigurationSubmit:function(){p["a"].pipelines.pipelines=this.pipelines,this.needSaved=!1},refreshPipelineSourcesFromStorage:function(){var e=this;p["a"].pipelines.pipelines.forEach((function(t){var n=e.getPipeline(t.id);e.$set(n,"sourceNames",t.sourceNames)}))},getPipeline:function(e){return this.pipelines.find((function(t){return t.id==e}))},onPipelineAdd:function(){this.pipelines.push({id:u["b"].guid(),name:"",sourceNames:[],disabled:!1,collapsed:!1,actions:[]})},onPipelineEdit:function(e){this.openEditor(e)},onPipelinePlay:function(e){var t=this;return Object(o["a"])(regeneratorRuntime.mark((function n(){var i;return regeneratorRuntime.wrap((function(n){while(1)switch(n.prev=n.next){case 0:return n.next=2,t.$refs.observer.validate();case 2:i=n.sent,i&&d["a"].$emit("pipeline-play",t.getPipeline(e).name);case 4:case"end":return n.stop()}}),n)})))()},onPipelineDelete:function(e){var t=this;this.$dialog.openConfirm({name:"confirm",message:"Delete this pipeline?",onYes:function(){t.isEditorOpen&&t.pipelineBeingEdited.id===e&&t.closeEditor(),t.pipelines=t.pipelines.filter((function(t){return t.id!==e}))}})},onEditorClose:function(){this.closeEditor()},openEditor:function(e){var t=this.getPipeline(e);this.pipelineBeingEdited=t},closeEditor:function(){this.pipelineBeingEdited={}},onActionAdd:function(e){var t=this;this.$dialog.open({component:te,listeners:{onSelect:function(e){t.pipelineBeingEdited.actions.push({id:u["b"].guid(),actionName:e.name,parameters:void 0})}}})},onActionDelete:function(e){var t=this;this.$dialog.openConfirm({name:"confirm",message:"Delete this action?",onYes:function(){var n=t.pipelineBeingEdited.actions.filter((function(t){return t.id!==e}));t.pipelineBeingEdited.actions=n}})}}},ie=ne,ae=Object(y["a"])(ie,i,a,!1,null,null,null);t["default"]=ae.exports}}]);
//# sourceMappingURL=chunk-b59fd176.c3c5d808.js.map