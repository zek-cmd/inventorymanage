window.InventoryApp = window.InventoryApp || {};

(function(app) {
    'use strict';
    
    var darkModeQuery = null;
    var themeChangeHandler = null;
    
    app.initTheme = function() {
        app.destroyTheme();
        
        darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        themeChangeHandler = function(e) {
            applyTheme(e.matches);
        };
        
        applyTheme(darkModeQuery.matches);
        
        darkModeQuery.addEventListener('change', themeChangeHandler);
    };
    
    function applyTheme(isDark) {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }
    
    app.destroyTheme = function() {
        if (darkModeQuery && themeChangeHandler) {
            darkModeQuery.removeEventListener('change', themeChangeHandler);
            darkModeQuery = null;
            themeChangeHandler = null;
        }
    };
    
})(window.InventoryApp);