window.InventoryApp = window.InventoryApp || {};

(function(app) {
    'use strict';
    
    var paginationElements = new Map();
    
    app.renderPagination = function(paginationId, totalPages, currentPage, callback) {
        var pagination = document.getElementById(paginationId);
        if (!pagination) {
            return;
        }
        
        cleanupPagination(paginationId);
        
        while (pagination.firstChild) {
            pagination.removeChild(pagination.firstChild);
        }
        
        if (totalPages <= 1) {
            return;
        }
        
        var paginationHandlers = [];
        
        var prevBtn = document.createElement('button');
        prevBtn.className = 'px-3 py-1.5 text-sm rounded-lg transition-all ' + 
            (currentPage === 1 ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer');
        prevBtn.textContent = 'Prev';
        prevBtn.disabled = currentPage === 1;
        
        var prevHandler = function(e) {
            e.preventDefault();
            if (currentPage > 1 && typeof callback === 'function') {
                callback(currentPage - 1);
            }
        };
        prevBtn.addEventListener('click', prevHandler);
        paginationHandlers.push({ element: prevBtn, type: 'click', handler: prevHandler });
        pagination.appendChild(prevBtn);
        
        for (var i = 1; i <= totalPages; i++) {
            var isActive = currentPage === i;
            var pageBtn = document.createElement('button');
            pageBtn.className = 'px-3 py-1.5 text-sm rounded-lg transition-all cursor-pointer ' + 
                (isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800');
            pageBtn.textContent = i;
            
            (function(pageNum) {
                var pageHandler = function(e) {
                    e.preventDefault();
                    if (typeof callback === 'function') {
                        callback(pageNum);
                    }
                };
                pageBtn.addEventListener('click', pageHandler);
                paginationHandlers.push({ element: pageBtn, type: 'click', handler: pageHandler });
            })(i);
            
            pagination.appendChild(pageBtn);
        }
        
        var nextBtn = document.createElement('button');
        nextBtn.className = 'px-3 py-1.5 text-sm rounded-lg transition-all ' + 
            (currentPage === totalPages ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer');
        nextBtn.textContent = 'Next';
        nextBtn.disabled = currentPage === totalPages;
        
        var nextHandler = function(e) {
            e.preventDefault();
            if (currentPage < totalPages && typeof callback === 'function') {
                callback(currentPage + 1);
            }
        };
        nextBtn.addEventListener('click', nextHandler);
        paginationHandlers.push({ element: nextBtn, type: 'click', handler: nextHandler });
        pagination.appendChild(nextBtn);
        
        paginationElements.set(paginationId, paginationHandlers);
    };
    
    function cleanupPagination(paginationId) {
        var handlers = paginationElements.get(paginationId);
        if (handlers && handlers.length > 0) {
            for (var i = 0; i < handlers.length; i++) {
                var item = handlers[i];
                if (item && item.element) {
                    item.element.removeEventListener(item.type, item.handler);
                }
            }
            paginationElements.delete(paginationId);
        }
    }
    
    app.cleanAllPagination = function() {
        var keys = [];
        paginationElements.forEach(function(value, key) {
            keys.push(key);
        });
        for (var i = 0; i < keys.length; i++) {
            cleanupPagination(keys[i]);
        }
        paginationElements.clear();
    };
    
    app.escapeCSV = function(value) {
        if (value === null || value === undefined) {
            return '';
        }
        var str = String(value);
        if (str.indexOf(',') !== -1 || str.indexOf('"') !== -1 || str.indexOf('\n') !== -1) {
            return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
    };
    
    app.downloadCSV = function(csv, prefix) {
        var now = new Date();
        var timestamp = now.getFullYear() +
            String(now.getMonth() + 1).padStart(2, '0') +
            String(now.getDate()).padStart(2, '0') + '_' +
            String(now.getHours()).padStart(2, '0') +
            String(now.getMinutes()).padStart(2, '0') +
            String(now.getSeconds()).padStart(2, '0');
        
        var filename = prefix + '_' + timestamp + '.csv';
        var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setTimeout(function() {
            URL.revokeObjectURL(url);
        }, 100);
    };
    
    app.showAlert = function(type, title, text, timer) {
        if (typeof timer === 'undefined') {
            timer = 2000;
        }
        return Swal.fire({
            icon: type,
            title: title,
            text: text,
            timer: timer,
            showConfirmButton: false
        });
    };
    
app.confirmDialog = function(title, text, icon, confirmText, confirmColor, customHtml, preConfirmFn) {
    if (typeof icon === 'undefined') {
        icon = 'warning';
    }
    if (typeof confirmText === 'undefined') {
        confirmText = 'Yes';
    }
    if (typeof confirmColor === 'undefined') {
        confirmColor = '#d33';
    }
    
    var config = {
        title: title,
        text: text,
        icon: icon,
        showCancelButton: true,
        confirmButtonColor: confirmColor,
        cancelButtonColor: '#3085d6',
        confirmButtonText: confirmText
    };
    
    if (customHtml) {
        config.html = customHtml;
    }
    
    if (preConfirmFn) {
        config.preConfirm = preConfirmFn;
    }
    
    return Swal.fire(config);
};
    
    app.escapeHtml = function(text) {
        if (!text) {
            return '';
        }
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(String(text)));
        return div.innerHTML;
    };
    
})(window.InventoryApp);