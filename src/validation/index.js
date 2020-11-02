import fs from 'fs';
import upath from 'upath';
import { configure, setInteractionMode, extend } from 'vee-validate';
import _ from '../utils';

setInteractionMode("custom", context => {
    return {
        on: ["change", "blur"]
    }
});

extend("integer", {
    validate(value, { min, max }) {
        value = parseInt(value, 10);
        min = parseInt(min, 10);
        max = parseInt(max, 10);

        let message = `Must be an integer`;
        if(_.isNumber(min) && _.isNumber(max)) {
            message += ` between ${min} and ${max}`;
        } else if(_.isNumber(min)) {
            message += ` greater than or equal to ${min}`;
        } else if(_.isNumber(max)) {
            message += ` less than or equal to ${max}`;
        }
        if(!_.isNumber(value)) {
            return message;
        }
        if(_.isNumber(min) && value < min) {
            return message;
        }
        if(_.isNumber(max) && value > max) {
            return message;
        }
        return true;
    },
    params: ['min', 'max']
})

extend('required', {
    validate (value) {
        return {
            required: true,
            valid: ['', null, undefined].indexOf(value) === -1 && !(Array.isArray(value) && value.length === 0)
        };
    },
    message: 'This is required',
    computesRequired: true
});

extend('pathexists', { 
    async validate(value) 
    {
        const exists = await new Promise(resolve => {
            fs.access(value, error => {
                resolve(!error);
            });
        });
        if(exists) {
            return true;
        }
        return {
            valid: false
        }
    },
    message: "Path does not exist"
});

extend('pathunc', {
    validate(value, args) {
        const allowed = typeof args.allowed === "boolean" ? args.allowed : JSON.parse(args.allowed.toLowerCase());
        const path = value.trim();
        const isUnc = path.startsWith("//") || path.startsWith("\\\\");
        return !(isUnc && !allowed)
    },
    params: ['allowed'],
    message: `Path cannot be a UNC path.`
})

extend('pathrelative', {
    validate(value, args) {
        const allowed = typeof args.allowed === "boolean" ? args.allowed : JSON.parse(args.allowed.toLowerCase());
        const path = value.trim();
        if(!allowed) {
            return upath.isAbsolute(path);
        }
        return true;
    },
    params: ['allowed'],
    message: `Path must be absolute.`
})

extend('custom', {
    params: ['fn'],
    validate(value, params) {
        const result = params.fn(value);
        return result.valid ? result.valid : result.message;
    }
});

console.log("Validation imported");
export default { 
    init: () => {
        return Promise.resolve();
    } 
};


// extend("uniq", {
//     validate: async value => {
//       const response = await checkEmail(value);
  
//       if (response.valid) {
//         return true;
//       }
  
//       return {
//         valid: false,
//         data: {
//           // this will be used to interpolate the message.
//           serverMessage: response.errors[0]
//         }
//       };
//     },
//     // same prop as returned in the `data` object.
//     message: `{serverMessage}`
// });

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