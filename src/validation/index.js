import fs from 'fs';
import { configure, setInteractionMode, extend } from 'vee-validate';

setInteractionMode("eager");

extend('required', {
    validate (value) {
        return {
            required: true,
            valid: ['', null, undefined].indexOf(value) === -1
        };
    },
    message: 'This is required',
    computesRequired: true
});

extend('pathexists', {
    validate(value) {
        return new Promise(resolve => fs.exists(value, resolve));
    },
    message: 'This path does not exist.'
});

extend('custom', {
    params: ['fn'],
    validate(value, params) {
        const result = params.fn(value);
        return result.valid ? result.valid : result.message;
    }
});

// /**
//  * Master validation instance. Keeps track of validation components and their validity. 
//  * Should be imported at root <form> component and instance passed down to child components.
//  */
// class Validation
// {
//     constructor(root) {
//         this.root = root;
//         this.validatorComponents = [];
//     }
//     register(validator) 
//     {
//         this.validatorComponents.push(validator);
//     }
//     unregister(validator) 
//     {
//         this.validatorComponents = this.validatorComponents.filter(c => c !== validator);
//     }
//     isValid() {
//         return this.validatorComponents.every(c => c.isValid());
//     }
// }
// Validation.mixin = {
//     directives: {
//         "errors": {
//             bind: function(el, binding, vnode) {
//                 var s = JSON.stringify
//                 el.innerHTML =
//                 'name: '       + s(binding.name) + '<br>' +
//                 'value: '      + s(binding.value) + '<br>' +
//                 'expression: ' + s(binding.expression) + '<br>' +
//                 'argument: '   + s(binding.arg) + '<br>' +
//                 'modifiers: '  + s(binding.modifiers) + '<br>' +
//                 'vnode keys: ' + Object.keys(vnode).join(', ')
//             }
//         }
//     },
//     props: {
//         validation: Object
//     },
//     data() {
//         return {
//             errors: {}
//         }
//     },
//     beforeCreate() { 
//         // Make errors observable
//         this.$validator = new Validator(this.errors);  

//         // Register with Master 
//         this.validation = this.validation || new Validation();
//         this.validation.register(this.$validator);
//     },
//     beforeDestroy() {
//         // Un-Register with Master 
//         this.validation.unregister(this.$validate);
//     }
// }
// /**
//  * Holds current component errors. An instance is created on each component using the Validation.mixin
//  */
// class Validator
// {
//     constructor(validationErrors) {
//         this._validationErrors = validationErrors;
//     }
//     /**
//      * Set the validity/message of a given field
//      * @param {string} key the name of the form field 
//      * @param {*} message the validation message or empty if valid
//      */
//     pushError(key, message) 
//     {
//         this._validationErrors[key] = message;
//     }
//     isValid() 
//     {
//         return Object.values(this._validationErrors).filter(error => !!error).length == 0;
//     }
// }

// export default Validation;  





// Vue.directive("demo", {
//     bind: function(el, binding, vnode) {
//         var s = JSON.stringify
//         el.innerHTML =
//         'name: '       + s(binding.name) + '<br>' +
//         'value: '      + s(binding.value) + '<br>' +
//         'expression: ' + s(binding.expression) + '<br>' +
//         'argument: '   + s(binding.arg) + '<br>' +
//         'modifiers: '  + s(binding.modifiers) + '<br>' +
//         'vnode keys: ' + Object.keys(vnode).join(', ')
//     }
// });