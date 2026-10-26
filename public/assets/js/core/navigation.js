window.InventoryApp = window.InventoryApp || {};

(function(app) {
    'use strict';
    
    var navLinks = null;
    var mobileMenuBtn = null;
    var mobileMenu = null;
    var navigationClickHandlers = new Map();
    
    app.initNavigation = function() {
        app.destroyNavigation();
        
        mobileMenuBtn = document.getElementById('mobileMenuBtn');
        mobileMenu = document.getElementById('mobileMenu');
        
        if (mobileMenuBtn && mobileMenu) {
            var mobileMenuHandler = function() {
                mobileMenu.classList.toggle('hidden');
            };
            mobileMenuBtn.addEventListener('click', mobileMenuHandler);
            navigationClickHandlers.set(mobileMenuBtn, { type: 'click', handler: mobileMenuHandler });
        }
        
        navLinks = document.querySelectorAll('.nav-link');
        for (var i = 0; i < navLinks.length; i++) {
            var link = navLinks[i];
            
            var navClickHandler = function(e) {
                e.preventDefault();
                var section = this.getAttribute('data-section');
                if (section) {
                    showSection(section);
                    updateActiveNav(this);
                    if (mobileMenu) {
                        mobileMenu.classList.add('hidden');
                    }
                }
            };
            link.addEventListener('click', navClickHandler);
            navigationClickHandlers.set(link, { type: 'click', handler: navClickHandler });
        }
    };
    
    function showSection(section) {
        var sections = {
            inventory: document.getElementById('inventorySection'),
            requisition: document.getElementById('requisitionSection'),
            return: document.getElementById('returnSection'),
            users: document.getElementById('usersSection')
        };
        
        var sectionKeys = Object.keys(sections);
        for (var i = 0; i < sectionKeys.length; i++) {
            var el = sections[sectionKeys[i]];
            if (el) {
                el.style.display = 'none';
            }
        }
        
        var targetSection = sections[section];
        if (targetSection) {
            targetSection.style.display = 'block';
        }
    }
    
    function updateActiveNav(activeLink) {
        var allLinks = document.querySelectorAll('.nav-link');
        for (var i = 0; i < allLinks.length; i++) {
            var l = allLinks[i];
            l.classList.remove('bg-white', 'dark:bg-gray-700', 'shadow-sm', 'text-gray-900', 'dark:text-white');
            l.classList.add('text-gray-600', 'dark:text-gray-400');
        }
        
        activeLink.classList.remove('text-gray-600', 'dark:text-gray-400');
        activeLink.classList.add('bg-white', 'dark:bg-gray-700', 'shadow-sm', 'text-gray-900', 'dark:text-white');
    }
    
    app.destroyNavigation = function() {
        navigationClickHandlers.forEach(function(config, element) {
            if (element && config) {
                element.removeEventListener(config.type, config.handler);
            }
        });
        
        navigationClickHandlers.clear();
        
        navLinks = null;
        mobileMenuBtn = null;
        mobileMenu = null;
    };
    
})(window.InventoryApp);