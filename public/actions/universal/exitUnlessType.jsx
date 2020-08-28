/**
* Exit this pipeline if the 'type' JSON property does not match the given value
* @param {string} type the type for this pipeline
*/
action.universal.exitUnlessType = function exitUnlessType(type)
{
    if(IMAGE.data("type") != type) {
        return "EXIT";
    }
}