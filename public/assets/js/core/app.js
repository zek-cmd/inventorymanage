window.InventoryApp = window.InventoryApp || {};

(function(app) {
    'use strict';
    
    var isInitialized = false;
    var globalClickHandler = null;
    var modalCloseHandlers = [];
    var modalClickHandlers = [];
    var customEventListeners = [];
    
    document.addEventListener('DOMContentLoaded', function() {
        var isAdmin = window.isAdmin || false;
        
        app.initTheme();
        app.initNavigation();
        
        app.initInventory(isAdmin);
        app.initRequisition(isAdmin);
        
        if (isAdmin) {
            app.initReturns();
            app.initUsers();
            initAdminModals();
        }
        
        registerGlobalClickHandler(isAdmin);
        
        isInitialized = true;
    });
    
    function registerGlobalClickHandler(isAdmin) {
        globalClickHandler = function(e) {
            if (!e.target.closest('.item-search') && !e.target.closest('.item-dropdown')) {
                var dropdowns = document.querySelectorAll('.item-dropdown');
                for (var i = 0; i < dropdowns.length; i++) {
                    if (dropdowns[i]) {
                        dropdowns[i].classList.add('hidden');
                    }
                }
            }
            
            if (isAdmin) {
                if (!e.target.closest('#returnRequisitionSearch') && !e.target.closest('#returnRequisitionDropdown')) {
                    var returnDropdown = document.getElementById('returnRequisitionDropdown');
                    if (returnDropdown) {
                        returnDropdown.classList.add('hidden');
                    }
                }
            }
        };
        
        document.addEventListener('click', globalClickHandler);
    }
    
    function initAdminModals() {
        var closeButtons = document.querySelectorAll('.modal-close');
        for (var i = 0; i < closeButtons.length; i++) {
            var btn = closeButtons[i];
            
            var handler = function() {
                var modal = this.closest('.fixed');
                if (modal) {
                    modal.classList.add('hidden');
                    var forms = modal.querySelectorAll('form');
                    for (var j = 0; j < forms.length; j++) {
                        if (forms[j] && forms[j].reset) {
                            forms[j].reset();
                        }
                        var checkboxes = forms[j].querySelectorAll('input[type="checkbox"]');
                        for (var k = 0; k < checkboxes.length; k++) {
                            checkboxes[k].checked = false;
                        }
                    }
                }
            };
            btn.addEventListener('click', handler);
            modalCloseHandlers.push({ element: btn, handler: handler });
        }
        
        var modalIds = ['addInventoryModal', 'editInventoryModal', 'addUserModal', 'editUserModal'];
        for (var m = 0; m < modalIds.length; m++) {
            var modal = document.getElementById(modalIds[m]);
            if (modal) {
                var modalHandler = function(e) {
                    if (e.target === this) {
                        this.classList.add('hidden');
                        var forms = this.querySelectorAll('form');
                        for (var n = 0; n < forms.length; n++) {
                            if (forms[n] && forms[n].reset) {
                                forms[n].reset();
                            }
                            var checkboxes = forms[n].querySelectorAll('input[type="checkbox"]');
                            for (var p = 0; p < checkboxes.length; p++) {
                                checkboxes[p].checked = false;
                            }
                        }
                    }
                };
                modal.addEventListener('click', modalHandler);
                modalClickHandlers.push({ element: modal, handler: modalHandler });
            }
        }
        
        var escapeHandler = function(e) {
            if (e.key === 'Escape') {
                var openModals = document.querySelectorAll('.fixed:not(.hidden)');
                for (var q = 0; q < openModals.length; q++) {
                    var openModal = openModals[q];
                    openModal.classList.add('hidden');
                    var forms = openModal.querySelectorAll('form');
                    for (var r = 0; r < forms.length; r++) {
                        if (forms[r] && forms[r].reset) {
                            forms[r].reset();
                        }
                        var checkboxes = forms[r].querySelectorAll('input[type="checkbox"]');
                        for (var s = 0; s < checkboxes.length; s++) {
                            checkboxes[s].checked = false;
                        }
                    }
                }
            }
        };
        document.addEventListener('keydown', escapeHandler);
        customEventListeners.push({ element: document, type: 'keydown', handler: escapeHandler });
    }
    
    app.destroyApp = function() {
        if (!isInitialized) {
            return;
        }
        
        if (globalClickHandler) {
            document.removeEventListener('click', globalClickHandler);
            globalClickHandler = null;
        }
        
        for (var i = 0; i < modalCloseHandlers.length; i++) {
            var closeItem = modalCloseHandlers[i];
            if (closeItem && closeItem.element) {
                closeItem.element.removeEventListener('click', closeItem.handler);
            }
        }
        modalCloseHandlers = [];
        
        for (var j = 0; j < modalClickHandlers.length; j++) {
            var clickItem = modalClickHandlers[j];
            if (clickItem && clickItem.element) {
                clickItem.element.removeEventListener('click', clickItem.handler);
            }
        }
        modalClickHandlers = [];
        
        for (var k = 0; k < customEventListeners.length; k++) {
            var customItem = customEventListeners[k];
            if (customItem && customItem.element) {
                customItem.element.removeEventListener(customItem.type, customItem.handler);
            }
        }
        customEventListeners = [];
        
        app.destroyUsers();
        app.destroyReturns();
        app.destroyRequisition();
        app.destroyInventory();
        app.destroyNavigation();
        app.destroyTheme();
        
        app.cleanAllPagination();
        
        if (window.inventoryItems) {
            delete window.inventoryItems;
        }
        if (window.approvedRequisitions) {
            delete window.approvedRequisitions;
        }
        
        isInitialized = false;
    };
    
    if (typeof window !== 'undefined') {
        window.addEventListener('beforeunload', function() {
            app.destroyApp();
        });
        
        window.addEventListener('pagehide', function() {
            app.destroyApp();
        });
    }
    
})(window.InventoryApp);