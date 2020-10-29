(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-ff8c1068"],{c256:function(e,t,i){},ce2d:function(e,t,i){"use strict";var n=i("c256"),a=i.n(n);a.a},d05b:function(e,t,i){"use strict";i.r(t);var n=function(){var e=this,t=e.$createElement,i=e._self._c||t;return i("validation-observer",{ref:"observer",attrs:{slim:""},scopedSlots:e._u([{key:"default",fn:function(t){var n=t.handleSubmit;return[i("form",{staticClass:"pipelines",attrs:{novalidate:"true"},on:{keydown:function(t){if(!t.type.indexOf("key")&&e._k(t.keyCode,"enter",13,t.key,"Enter"))return null;t.preventDefault()},submit:function(t){return t.preventDefault(),n(e.onConfigurationSubmit)}}},[i("h2",{staticClass:"tab-title"},[e._v("Pipelines"),i("i",{directives:[{name:"show",rawName:"v-show",value:e.needSaved,expression:"needSaved"}]},[e._v("*")])]),i("a-checkbox",{model:{value:e.pauseAfterEveryPipeline,callback:function(t){e.pauseAfterEveryPipeline=t},expression:"pauseAfterEveryPipeline"}},[e._v(" Pause processing after every Pipeline? ")]),i("a-checkbox",{model:{value:e.pauseAfterEveryAction,callback:function(t){e.pauseAfterEveryAction=t},expression:"pauseAfterEveryAction"}},[e._v(" Pause processing after every Pipeline Action? ")]),i("a-checkbox",{model:{value:e.pauseAfterEveryImage,callback:function(t){e.pauseAfterEveryImage=t},expression:"pauseAfterEveryImage"}},[e._v(" Pause processing after every Image? ")]),i("a-checkbox",{model:{value:e.pauseOnExceptions,callback:function(t){e.pauseOnExceptions=t},expression:"pauseOnExceptions"}},[e._v(" Pause processing on errors? ")]),e.isEditorOpen?i("div",[i("h3",{staticClass:"section-title"},[e._v("Actions Editor")]),i("p",{staticClass:"text-highlight mt0"},[e._v("Editing: "+e._s(e.pipelineBeingEdited.name))]),i("draggable",{attrs:{draggable:".action",handle:".action-handle",group:"actions"},model:{value:e.pipelineBeingEdited.actions,callback:function(t){e.$set(e.pipelineBeingEdited,"actions",t)},expression:"pipelineBeingEdited.actions"}},e._l(e.pipelineBeingEdited.actions,(function(t,n){return i("a-pipeline-action",{key:t.id,on:{delete:e.onActionDelete},model:{value:e.pipelineBeingEdited.actions[n],callback:function(t){e.$set(e.pipelineBeingEdited.actions,n,t)},expression:"pipelineBeingEdited.actions[index]"}})})),1)],1):i("div",[i("h3",{staticClass:"section-title"},[e._v("Pipelines")]),i("draggable",{attrs:{draggable:".pipeline",handle:".pipeline-handle",group:"pipelines"},model:{value:e.pipelines,callback:function(t){e.pipelines=t},expression:"pipelines"}},e._l(e.pipelines,(function(t){return i("a-pipeline",{key:t.id,attrs:{id:t.id,name:t.name,sourceNames:t.sourceNames,disabled:t.disabled,collapsed:t.collapsed,pipelines:e.pipelines},on:{"update:id":function(i){return e.$set(t,"id",i)},"update:name":function(i){return e.$set(t,"name",i)},"update:sourceNames":function(i){return e.$set(t,"sourceNames",i)},"update:source-names":function(i){return e.$set(t,"sourceNames",i)},"update:disabled":function(i){return e.$set(t,"disabled",i)},"update:collapsed":function(i){return e.$set(t,"collapsed",i)},"pipeline-delete":e.onPipelineDelete,"pipeline-edit":e.onPipelineEdit,"pipeline-play":e.onPipelinePlay}})})),1)],1),i("div",{staticClass:"pipeline-buttons"},[i("button",{directives:[{name:"show",rawName:"v-show",value:!e.isEditorOpen,expression:"!isEditorOpen"}],staticClass:"topcoat-button--large",attrs:{type:"button"},on:{click:e.onPipelineAdd}},[e._v("Add Pipline")]),i("button",{directives:[{name:"show",rawName:"v-show",value:e.isEditorOpen,expression:"isEditorOpen"}],staticClass:"topcoat-button--large",attrs:{type:"button"},on:{click:e.onActionAdd}},[e._v("Add Action")]),i("button",{directives:[{name:"show",rawName:"v-show",value:e.isEditorOpen,expression:"isEditorOpen"}],staticClass:"topcoat-button--large",attrs:{type:"button"},on:{click:e.onEditorClose}},[e._v("Close")]),i("button",{directives:[{name:"show",rawName:"v-show",value:e.needSaved,expression:"needSaved"}],staticClass:"topcoat-button--large",attrs:{type:"submit"}},[e._v("Save")])])],1)]}}])})},a=[],o=(i("4de4"),i("7db0"),i("4160"),i("b0c0"),i("159b"),i("96cf"),i("1da1")),s=i("b85c"),l=i("7bb1"),r=i("310e"),c=i.n(r),u=i("025e"),p=i("4360"),d=i("0c12"),m=i("e70e"),h=function(){var e=this,t=e.$createElement,i=e._self._c||t;return i("div",{staticClass:"pipeline",class:{disabled:e.disabled,collapsed:e.collapsed}},[i("div",{staticClass:"pipeline-head"},[i("span",{staticClass:"pipeline-handle",attrs:{title:"Drag to re-order"}},[e._v("☰")]),e.collapsed?i("button",{staticClass:"topcoat-button--large--quiet mx1",attrs:{type:"button",title:"Run this pipeline with its configured source(s)",disabled:e.disabled_},on:{click:e.onPlay}},[e._v("▶")]):e._e(),e.collapsed_?i("span",[e._v(e._s(e.name_))]):e._e(),i("button",{staticClass:"topcoat-button--large--quiet expand right",class:{open:!e.collapsed},on:{click:function(t){e.collapsed_=!e.collapsed_}}},[i("i",[e._v("❱")])])]),e.collapsed_?e._e():i("div",{staticClass:"pipeline-body"},[i("validation-provider",{attrs:{tag:"label",rules:{required:!0,custom:{fn:e.validateName}}},scopedSlots:e._u([{key:"default",fn:function(t){var n=t.errors;return[i("div",{staticClass:"label"},[e._v("Name")]),i("input",{directives:[{name:"model",rawName:"v-model",value:e.name_,expression:"name_"}],staticClass:"topcoat-text-input full-width",attrs:{type:"text",title:"A unique name for the pipeline.",placeholder:"my-pipeline-name"},domProps:{value:e.name_},on:{input:function(t){t.target.composing||(e.name_=t.target.value)}}}),n.length?i("span",{staticClass:"topcoat-notification error"},[e._v(e._s(n[0]))]):e._e()]}}],null,!1,2456396026)}),i("validation-provider",{attrs:{tag:"label",rules:{custom:{fn:e.validateSourceNames}}},scopedSlots:e._u([{key:"default",fn:function(t){var n=t.errors;return[i("div",{staticClass:"label"},[e._v("File Source(s)")]),i("a-array-input",{staticClass:"topcoat-text-input full-width",attrs:{title:"The file source(s) to use for inputs to this pipeline. Comma delimited.",placeholder:"my-file-source-name"},model:{value:e.sourceNames_,callback:function(t){e.sourceNames_=t},expression:"sourceNames_"}}),n.length?i("span",{staticClass:"topcoat-notification error"},[e._v(e._s(n[0]))]):e._e()]}}],null,!1,1872742142)}),i("a-checkbox",{model:{value:e.disabled_,callback:function(t){e.disabled_=t},expression:"disabled_"}},[e._v(" Disabled ")]),i("button",{staticClass:"topcoat-button--large--quiet",attrs:{type:"button",title:"Run this pipeline with its configured source(s)",disabled:e.disabled_},on:{click:e.onPlay,disabled:e.disabled_}},[e._v("▶")]),i("button",{staticClass:"topcoat-button--large--quiet",attrs:{type:"button"},on:{click:e.onEdit}},[e._v("Edit")]),i("button",{staticClass:"topcoat-button--large--quiet",attrs:{type:"button",title:"Delete this pipeline"},on:{click:e.onDelete}},[e._v("X")])],1)])},f=[],v=(i("498a"),i("9b0a")),b={name:"APipeline",components:{ValidationProvider:l["b"],ACheckbox:m["a"],AArrayInput:v["a"]},props:{id:{type:String,required:!0},name:{type:String,required:!0},sourceNames:{type:Array,required:!0},disabled:{type:Boolean,required:!0},collapsed:{type:Boolean,required:!0},pipelines:{type:Array,required:!0}},computed:{name_:{get:function(){return this.name},set:function(e){this.$emit("update:name",e)}},sourceNames_:{get:function(){return u["b"].simpleDeepClone(this.sourceNames)},set:function(e){this.$emit("update:sourceNames",e)}},disabled_:{get:function(){return this.disabled},set:function(e){this.$emit("update:disabled",e)}},collapsed_:{get:function(){return this.collapsed},set:function(e){this.$emit("update:collapsed",e)}}},methods:{validateName:function(e){var t=e.trim();this._name=t;var i=this.pipelines.filter((function(e){return e.name==t})).length;return{valid:1===i,message:"Pipeline name must be unique"}},validateSourceNames:function(e){var t=e.filter((function(e){return!p["a"].general.fileSources.find((function(t){return t.name===e}))}));return{valid:0===t.length,message:"A file source by name '".concat(t.pop(),"' does not exist.")}},onEdit:function(){this.$emit("pipeline-edit",this.id)},onPlay:function(){this.$emit("pipeline-play",this.id)},onDelete:function(){this.$emit("pipeline-delete",this.id)}}},g=b,y=i("2877"),_=Object(y["a"])(g,h,f,!1,null,null,null),A=_.exports,P=function(){var e=this,t=e.$createElement,i=e._self._c||t;return i("div",{staticClass:"action"},[i("span",{staticClass:"action-handle",attrs:{title:"Drag to re-order"}},[e._v("☰")]),i("div",{staticClass:"action-data"},[i("div",{staticClass:"action-name"},[i("input",{directives:[{name:"model",rawName:"v-model",value:e.localAction.actionName,expression:"localAction.actionName"}],staticClass:"topcoat-text-input mr1",attrs:{type:"text",placeholder:"the action function name (e.g. 'action.saveDocument')",title:"The action function name as given in the jsx. Case sensitive."},domProps:{value:e.localAction.actionName},on:{input:function(t){t.target.composing||e.$set(e.localAction,"actionName",t.target.value)}}}),i("button",{staticClass:"topcoat-button--large--quiet",attrs:{type:"button",title:"Delete this action"},on:{click:e.onActionDelete}},[e._v("X")]),i("button",{staticClass:"topcoat-button--large--quiet expand ml1",class:{open:e.showParameters},attrs:{title:(e.showParameters?"Hide":"Show")+" Parameters"},on:{click:e.toggleParameters}},[i("i",[e._v("❱")])])]),e.showParameters?i("div",{staticClass:"action-parameters"},[i("h3",[e._v("Parameters")]),e._l(e.localAction.parameters,(function(t,n){return i("a-pipeline-action-parameter",{key:n,attrs:{id:n,name:t.name,value:t.value,disableName:e.hasSingleParameter},on:{change:e.onParameterChange,delete:e.onParameterDelete}})})),e.hasParameters?e._e():i("button",{staticClass:"topcoat-button",attrs:{type:"button",title:"Single parameters are passed as a single parameter, literal value, to the action function."},on:{click:e.onParameterAddSingle}},[e._v(" Add Single ")]),e.hasParameters&&e.hasSingleParameter?e._e():i("button",{staticClass:"topcoat-button",attrs:{type:"button",title:"Multiple parameters are passed as an object of key value pairs to the action function."},on:{click:e.onParameterAddMultiple}},[e._v(" "+e._s(e.hasParameters?"Add":"Add Multiple")+" ")])],2):e._e()])])},C=[],E=(i("4fad"),i("b64b"),i("3835")),x=i("ade3"),N=function(){var e=this,t=e.$createElement,i=e._self._c||t;return i("div",{staticClass:"action-parameter"},[i("select",{directives:[{name:"model",rawName:"v-model",value:e.type,expression:"type"}],staticClass:"topcoat-text-input mr2",on:{change:[function(t){var i=Array.prototype.filter.call(t.target.options,(function(e){return e.selected})).map((function(e){var t="_value"in e?e._value:e.value;return t}));e.type=t.target.multiple?i:i[0]},e.onType]}},e._l(e.types,(function(t){return i("option",{key:t,domProps:{value:t}},[e._v(e._s(t))])})),0),i("div",{staticClass:"action-parameter__input mr2"},[i("input",{directives:[{name:"model",rawName:"v-model",value:e.localName,expression:"localName"}],staticClass:"topcoat-text-input",attrs:{type:"text",placeholder:"name",disabled:e.disableName},domProps:{value:e.localName},on:{input:function(t){t.target.composing||(e.localName=t.target.value)}}})]),i("a-checkbox",{directives:[{name:"show",rawName:"v-show",value:e.isBoolean,expression:"isBoolean"}],staticClass:"action-parameter__input mr2",attrs:{checked:e.localValue},on:{change:e.onCheckboxValue}}),i("div",{staticClass:"action-parameter__input mr2"},[i("input",{directives:[{name:"show",rawName:"v-show",value:!e.isBoolean,expression:"!isBoolean"}],staticClass:"topcoat-text-input",attrs:{type:"text",placeholder:"value"},domProps:{value:e.localValue},on:{change:e.onTextValue}})]),i("button",{staticClass:"topcoat-button--large--quiet",attrs:{type:"button",title:"Delete this parameter"},on:{click:e.onDelete}},[e._v("X")])],1)},k=[],w=(i("99af"),i("a9e3"),"String"),S="Number",$="Boolean",O="Unknown",D=[w,S,$],B={name:"APipelineActionParameter",components:{ACheckbox:m["a"]},props:{id:{type:String,required:!0},disableName:Boolean,name:String,value:null},data:function(){var e=this.getType(this.value);return console.log("parameter data() type: ".concat(e," name: ").concat(this.name," rawValue: ").concat(this.value)),{type:e,localValue:e===O?null:this.value,localName:this.name}},computed:{types:function(){return D},isBoolean:function(){return this.type===$},isNumber:function(){return this.type===S},isString:function(){return this.type===w}},watch:{localName:function(){this.emitChange()},localValue:function(){this.emitChange()}},methods:{emitChange:function(){this.$emit("change",this.id,this.localName,this.localValue)},getType:function(e){return u["b"].isBoolean(e)?$:u["b"].isNumber(e)?S:(u["b"].isString(e),w)},forceType:function(e){return this.isBoolean?Boolean(e):this.isNumber?isNaN(e)?0:Number(e):this.isString?""+e:void 0},onType:function(){this.localValue=this.forceType(this.localValue)},onCheckboxValue:function(e){this.localValue=e},onTextValue:function(){this.localValue=this.forceType(event.target.value)},onDelete:function(){this.$emit("delete",this.id)}}},j=B,q=Object(y["a"])(j,N,k,!1,null,null,null),V=q.exports,T="SINGLE",I={name:"APipelineAction",components:{APipelineActionParameter:V},model:{prop:"action",event:"change"},props:{action:Object},data:function(){return{localAction:this.toLocalAction(this.action),showParameters:!1}},computed:{hasParameters:function(){return Object.keys(this.localAction.parameters).length},hasSingleParameter:function(){return 1===Object.keys(this.localAction.parameters).length&&u["b"].first(this.localAction.parameters).name===T}},methods:{emitChange:function(){var e=this.toRawAction(this.localAction);this.$emit("change",e)},toLocalAction:function(e){for(var t=e.actionName,i=e.parameters,n=u["b"].isBoolean(i)||u["b"].isNumber(i)||u["b"].isString(i)||u["b"].isNull(i)?Object(x["a"])({},T,i):i,a={actionName:t,parameters:{}},o=0,s=Object.entries(n||{});o<s.length;o++){var l=Object(E["a"])(s[o],2),r=l[0],c=l[1],p=u["b"].guid();a.parameters[p]={name:r,value:c}}return a},toRawAction:function(e){var t={id:this.action.id,actionName:e.actionName};if(this.hasParameters)if(this.hasSingleParameter)t.parameters=u["b"].first(e.parameters).value;else{t.parameters={};for(var i=0,n=Object.entries(e.parameters);i<n.length;i++){var a=Object(E["a"])(n[i],2),o=(a[0],a[1]);t.parameters[o.name]=o.value}}return t},onActionDelete:function(){this.$emit("delete",this.action.id),this.emitChange()},toggleParameters:function(){this.showParameters=!this.showParameters},onParameterChange:function(e,t,i){this.localAction.parameters[e].name=t,this.localAction.parameters[e].value=i,this.emitChange()},onParameterAddSingle:function(){var e=u["b"].guid();this.$set(this.localAction.parameters,e,{name:T,value:""}),this.emitChange()},onParameterAddMultiple:function(){var e=u["b"].guid();this.$set(this.localAction.parameters,e,{name:"name",value:""}),this.emitChange()},onParameterDelete:function(e){console.log("Deleting parameter: "+e),this.$delete(this.localAction.parameters,e),this.emitChange()}}},R=I,L=Object(y["a"])(R,P,C,!1,null,null,null),M=L.exports,X=function(){var e=this,t=e.$createElement,i=e._self._c||t;return i("div",{staticClass:"modal-root"},[i("header",{staticClass:"modal-header"},[e._v(" Select an Action ")]),i("section",{staticClass:"modal-body"},[null!=e.actionTree?i("select-pipeline-action-node",{attrs:{node:e.actionTree,expand:!0},on:{"on-select":e.onSelect}}):e._e()],1),i("footer",{staticClass:"modal-footer"},[i("button",{staticClass:"topcoat-button--large",attrs:{type:"button"},on:{click:e.onCancel}},[e._v(" Cancel ")])])])},F=[],J=i("af82"),Y=function(){var e=this,t=e.$createElement,i=e._self._c||t;return i("div",{style:e.indent},[i("div",{staticClass:"tree-node",class:{expanded:e.isExpanded,directory:e.node.isDirectory},on:{click:e.select}},[e.node.isDirectory?i("button",{staticClass:"tree-node__expand topcoat-icon-button--quiet"},[i("i",[e._v("▶")])]):e._e(),e.node.isDirectory?i("i",[e._v("🖿")]):e._e(),i("span",[e._v(e._s(e.name))])]),e._l(e.children,(function(t,n){return i("select-pipeline-action-node",{key:e.getName(e.children[n]),attrs:{node:e.children[n],depth:1},on:{"on-select":function(t){return e.$emit("on-select",t)}}})}))],2)},G=[],H=(i("a15b"),i("524a")),U={name:"SelectPipelineActionNode",props:{node:{type:Object,required:!0,validator:function(e){return e instanceof H["a"]}},depth:{type:Number,default:0},expand:{type:Boolean,default:!1}},data:function(){return{isExpanded:this.expand,name:this.getName(this.node)}},computed:{children:function(){return this.isExpanded?this.node.children:[]},indent:function(){return{transform:"translateX(".concat(44*this.depth,"px)")}}},methods:{getName:function(e){return e.getNamePath().join(".")},select:function(){this.node.isDirectory?this.isExpanded=!this.isExpanded:this.$emit("on-select",this.name)}}},z=U,K=Object(y["a"])(z,Y,G,!1,null,null,null),Q=K.exports,W={name:"SelectPipelineAction",components:{SelectPipelineActionNode:Q},data:function(){return{actionTree:J["a"].actions.getAllActions()}},created:function(){},methods:{onCancel:function(){this.$emit("onClose")},onSelect:function(e){var t=this;J["a"].actions.getActionDescriptorByName(e).then((function(e){t.$emit("onSelect",e),t.$emit("onClose")}))}}},Z=W,ee=(i("ce2d"),Object(y["a"])(Z,X,F,!1,null,null,null)),te=ee.exports,ie={name:"ThePipelines",components:{ValidationObserver:l["a"],Draggable:c.a,ACheckbox:m["a"],APipeline:A,APipelineAction:M},data:function(){return{pauseAfterEveryPipeline:p["a"].general.pauseAfterEveryPipeline,pauseAfterEveryAction:p["a"].general.pauseAfterEveryAction,pauseAfterEveryImage:p["a"].general.pauseAfterEveryImage,pauseOnExceptions:p["a"].general.pauseOnExceptions,pipelines:this.toLocalPipelines(p["a"].pipelines.pipelines),needSaved:!1,pipelineBeingEdited:{}}},computed:{isEditorOpen:function(){return!u["b"].isEmptyObject(this.pipelineBeingEdited)}},watch:{pauseAfterEveryPipeline:function(e){p["a"].general.pauseAfterEveryPipeline=e},pauseAfterEveryAction:function(e){p["a"].general.pauseAfterEveryAction=e},pauseAfterEveryImage:function(e){p["a"].general.pauseAfterEveryImage=e},pauseOnExceptions:function(e){p["a"].general.pauseOnExceptions=e},pipelines:{deep:!0,handler:function(e){this.needSaved=!0}}},created:function(){var e=this;d["a"].$on("filesource-update",(function(){e.refreshPipelineSourcesFromStorage()}))},methods:{toLocalPipelines:function(e){var t,i=u["b"].simpleDeepClone(e),n=Object(s["a"])(i);try{for(n.s();!(t=n.n()).done;){var a=t.value;a.id=a.id||u["b"].guid();var o,l=Object(s["a"])(a.actions);try{for(l.s();!(o=l.n()).done;){var r=o.value;r.id=r.id||u["b"].guid()}}catch(c){l.e(c)}finally{l.f()}}}catch(c){n.e(c)}finally{n.f()}return i},onConfigurationSubmit:function(){p["a"].pipelines.pipelines=this.pipelines,p["a"].pipelines.save(),this.needSaved=!1},refreshPipelineSourcesFromStorage:function(){var e=this;p["a"].pipelines.pipelines.forEach((function(t){var i=e.getPipeline(t.id);e.$set(i,"sourceNames",t.sourceNames)}))},getPipeline:function(e){return this.pipelines.find((function(t){return t.id==e}))},onPipelineAdd:function(){this.pipelines.push({id:u["b"].guid(),name:"",sourceNames:[],disabled:!1,collapsed:!1,actions:[]})},onPipelineEdit:function(e){this.openEditor(e)},onPipelinePlay:function(e){var t=this;return Object(o["a"])(regeneratorRuntime.mark((function i(){var n;return regeneratorRuntime.wrap((function(i){while(1)switch(i.prev=i.next){case 0:return i.next=2,t.$refs.observer.validate();case 2:n=i.sent,n&&d["a"].$emit("pipeline-play",t.getPipeline(e).name);case 4:case"end":return i.stop()}}),i)})))()},onPipelineDelete:function(e){var t=this;this.$dialog.openConfirm({name:"confirm",message:"Delete this pipeline?",onYes:function(){t.isEditorOpen&&t.pipelineBeingEdited.id===e&&t.closeEditor(),t.pipelines=t.pipelines.filter((function(t){return t.id!==e}))}})},onEditorClose:function(){this.closeEditor()},openEditor:function(e){var t=this.getPipeline(e);this.pipelineBeingEdited=t},closeEditor:function(){this.pipelineBeingEdited={}},onActionAdd:function(e){var t=this;this.$dialog.open({component:te,listeners:{onSelect:function(e){t.pipelineBeingEdited.actions.push({id:u["b"].guid(),actionName:e.name,parameters:void 0})}}})},onActionDelete:function(e){var t=this;this.$dialog.openConfirm({name:"confirm",message:"Delete this action?",onYes:function(){var i=t.pipelineBeingEdited.actions.filter((function(t){return t.id!==e}));t.pipelineBeingEdited.actions=i}})}}},ne=ie,ae=Object(y["a"])(ne,n,a,!1,null,null,null);t["default"]=ae.exports}}]);
//# sourceMappingURL=chunk-ff8c1068.ace68c1e.js.map