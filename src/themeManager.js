const themeManager = (function () 
{
    'use strict';
    const csInterface = new CSInterface();

    /**
     * Update theme with AppSkinInfo from Host Product
     */
    function updateThemeWithAppSkinInfo(appSkinInfo) 
    {
        let sentinelColor = appSkinInfo.panelBackgroundColor.color.red;
        let themeIsLight = sentinelColor > 128;
        
        if (themeIsLight) {
            document.body.classList.remove("dark");
            document.body.classList.add("light");
            document.getElementById("theme").href = "css/topcoat-desktop-light.css";
        } else {
            document.body.classList.remove("light");
            document.body.classList.add("dark");
            document.getElementById("theme").href = "css/topcoat-desktop-dark.css";
        }
        
        document.body.style.background = "#" + toHex(appSkinInfo.panelBackgroundColor.color);
    }

    function toHex(color) 
    {
        function computeValue(rgb) { 
            let hex = Number(rgb).toString(16);
            if (hex.length < 2) { hex = "0" + hex }
            return hex;
        };
        let hex = "";
        if (color) {
            hex = computeValue(color.red) + 
                    computeValue(color.green) + 
                    computeValue(color.blue);
        }
        return hex;
    }
  
    function onAppThemeColorChanged(event) 
    {
        let appSkinInfo = csInterface.getHostEnvironment().appSkinInfo;
        updateThemeWithAppSkinInfo(appSkinInfo);
    }
  
    function init() 
    {
        let appSkinInfo = csInterface.getHostEnvironment().appSkinInfo;
        updateThemeWithAppSkinInfo(appSkinInfo);
        csInterface.addEventListener(CSInterface.THEME_COLOR_CHANGED_EVENT, onAppThemeColorChanged);
    }
  
    return {
        init: init
    };
  
  }());

  export default themeManager;