
function simpleDeepClone(obj)
{
    return JSON.parse(JSON.stringify(obj));
}

export default {
    simpleDeepClone
}