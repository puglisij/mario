export default class Webhook {
    /**
     * Configuration for application event Webhook
     * @param {string} event the application event name to hook into
     * @param {string} url the url that the webhook message is posted to
     */
    constructor(
        event = "",
        url = "")
    {
        this.event = event;
        this.url = url;
    }
    static fromObject(object)
    {
        let webHook = new Webhook();
        for(const key of Object.getOwnPropertyNames(object)) {
            if(webHook.hasOwnProperty(key)) {
                webHook[key] = object[key];
            }
        }
        return webHook;
    }
}