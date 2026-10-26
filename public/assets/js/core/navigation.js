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
        
        var currentLink = document.querySelector('.nav-link.is-active') || navLinks[0];
        if (currentLink) {
            updateActiveNav(currentLink.getAttribute('data-section'));
        }
        
        for (var i = 0; i < navLinks.length; i++) {
            var link = navLinks[i];
            
            var navClickHandler = function(e) {
                e.preventDefault();
                var section = this.getAttribute('data-section');
                if (section) {
                    showSection(section);
                    updateActiveNav(section);
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
    
    var ACTIVE_CLASSES = ['bg-blue-50', 'dark:bg-blue-900/20', 'text-blue-700', 'dark:text-blue-300'];
    var INACTIVE_CLASSES = ['text-gray-600', 'dark:text-gray-400', 'hover:bg-gray-50', 'dark:hover:bg-gray-800', 'hover:text-gray-900', 'dark:hover:text-white'];
    
    // Marks every link for this section as active, in the sidebar AND the mobile menu,
    // so both menus always show the same current page.
    function updateActiveNav(section) {
        var allLinks = document.querySelectorAll('.nav-link');
        for (var i = 0; i < allLinks.length; i++) {
            var l = allLinks[i];
            var isActive = l.getAttribute('data-section') === section;
            l.classList.remove.apply(l.classList, isActive ? INACTIVE_CLASSES : ACTIVE_CLASSES);
            l.classList.add.apply(l.classList, isActive ? ACTIVE_CLASSES : INACTIVE_CLASSES);
            if (isActive) {
                l.classList.add('is-active');
                l.setAttribute('aria-current', 'page');
            } else {
                l.classList.remove('is-active');
                l.removeAttribute('aria-current');
            }
        }
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