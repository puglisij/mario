
var console = {
    log: function() {
        var result = "";
        for(var i = 0; i < arguments.length; ++i) {
            result += arguments[i];
        }
        JsxEvents.dispatch("log", result);
    }
};

this.console = console;