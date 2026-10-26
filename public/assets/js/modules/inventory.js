window.InventoryApp = window.InventoryApp || {};

(function(app) {
    'use strict';
    
    var inventoryData = [];
    var inventoryCurrentPage = 1;
    var inventoryItemsPerPage = 10;
    var eventHandlers = new Map();
    var currentSortColumn = null;
    var currentSortDirection = 'asc';
    
    app.initInventory = function(isAdmin) {
        app.destroyInventory();
        
        app.loadInventory().then(function() {
            app.renderInventory(isAdmin);
        });
        
        var inventorySearch = document.getElementById('inventorySearch');
        if (inventorySearch) {
            var searchHandler = function() {
                inventoryCurrentPage = 1;
                app.renderInventory(isAdmin);
            };
            inventorySearch.addEventListener('input', searchHandler);
            eventHandlers.set('inventorySearch', { element: inventorySearch, type: 'input', handler: searchHandler });
        }
        
        if (isAdmin) {
            var addInventoryBtn = document.getElementById('addInventoryBtn');
            if (addInventoryBtn) {
                var addBtnHandler = function() {
                    var modal = document.getElementById('addInventoryModal');
                    if (modal) {
                        modal.classList.remove('hidden');
                    }
                };
                addInventoryBtn.addEventListener('click', addBtnHandler);
                eventHandlers.set('addInventoryBtn', { element: addInventoryBtn, type: 'click', handler: addBtnHandler });
            }
            
            var addInventoryForm = document.getElementById('addInventoryForm');
            if (addInventoryForm) {
                var addFormHandler = function(e) {
                    e.preventDefault();
                    addInventoryItem(isAdmin);
                };
                addInventoryForm.addEventListener('submit', addFormHandler);
                eventHandlers.set('addInventoryForm', { element: addInventoryForm, type: 'submit', handler: addFormHandler });
            }
            
            var editInventoryForm = document.getElementById('editInventoryForm');
            if (editInventoryForm) {
                var editFormHandler = function(e) {
                    e.preventDefault();
                    updateInventoryItem(isAdmin);
                };
                editInventoryForm.addEventListener('submit', editFormHandler);
                eventHandlers.set('editInventoryForm', { element: editInventoryForm, type: 'submit', handler: editFormHandler });
            }
            
            var exportInventoryBtn = document.getElementById('exportInventoryBtn');
            if (exportInventoryBtn) {
                var exportHandler = function() {
                    exportInventoryCSV();
                };
                exportInventoryBtn.addEventListener('click', exportHandler);
                eventHandlers.set('exportInventoryBtn', { element: exportInventoryBtn, type: 'click', handler: exportHandler });
            }
        }

        // Add sort listeners to table headers
        addSortListeners(isAdmin);

        // Listen for refresh event from other modules
        var refreshDisplayHandler = function() {
            app.loadInventory().then(function() {
                app.renderInventory(window.isAdmin || false);
            });
        };
        window.addEventListener('refreshInventoryDisplay', refreshDisplayHandler);
        eventHandlers.set('refreshInventoryDisplay', { element: window, type: 'refreshInventoryDisplay', handler: refreshDisplayHandler });
    };
    
    app.loadInventory = function() {
        return fetch('/api/inventory')
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                inventoryData = data;
                window.inventoryItems = data;
                return data;
            })
            .catch(function(error) {
                console.error('Failed to load inventory:', error);
                return [];
            });
    };
    
    function sortData(data, column, direction) {
        return data.slice().sort(function(a, b) {
            var valueA, valueB;
            
            switch(column) {
                case 'item':
                    valueA = (a.item || '').toLowerCase();
                    valueB = (b.item || '').toLowerCase();
                    break;
                case 'category':
                    valueA = (a.category || '').toLowerCase();
                    valueB = (b.category || '').toLowerCase();
                    break;
                case 'quantity':
                    valueA = parseInt(a.quantity) || 0;
                    valueB = parseInt(b.quantity) || 0;
                    break;
                case 'type':
                    valueA = a.is_consumable == 1 ? 'consumable' : 'returnable';
                    valueB = b.is_consumable == 1 ? 'consumable' : 'returnable';
                    break;
                case 'date_added':
                    valueA = a.date_added || '';
                    valueB = b.date_added || '';
                    break;
                default:
                    return 0;
            }
            
            if (valueA < valueB) return direction === 'asc' ? -1 : 1;
            if (valueA > valueB) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    }
    
    function addSortListeners(isAdmin) {
        var sortableHeaders = [
            { id: 'sortItem', column: 'item' },
            { id: 'sortCategory', column: 'category' },
            { id: 'sortQty', column: 'quantity' },
            { id: 'sortType', column: 'type' },
            { id: 'sortAdded', column: 'date_added' }
        ];
        
        for (var i = 0; i < sortableHeaders.length; i++) {
            var header = sortableHeaders[i];
            var element = document.getElementById(header.id);
            
            if (element) {
                var sortHandler = (function(column) {
                    return function() {
                        if (currentSortColumn === column) {
                            currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
                        } else {
                            currentSortColumn = column;
                            currentSortDirection = 'asc';
                        }
                        
                        inventoryCurrentPage = 1;
                        app.renderInventory(isAdmin);
                        updateSortIndicators();
                    };
                })(header.column);
                
                element.addEventListener('click', sortHandler);
                element.style.cursor = 'pointer';
                element.classList.add('select-none');
                eventHandlers.set('sort' + header.column, { element: element, type: 'click', handler: sortHandler });
            }
        }
    }
    
    function updateSortIndicators() {
        // Remove all indicators first
        var allHeaders = document.querySelectorAll('[id^="sort"]');
        for (var i = 0; i < allHeaders.length; i++) {
            var header = allHeaders[i];
            // Remove existing arrows
            var existingArrow = header.querySelector('.sort-arrow');
            if (existingArrow) {
                existingArrow.remove();
            }
            // Reset opacity
            header.classList.remove('text-gray-900', 'dark:text-white');
            header.classList.add('text-gray-500', 'dark:text-gray-400');
        }
        
        // Add indicator to current sort column
        if (currentSortColumn) {
            var columnMap = {
                'item': 'sortItem',
                'category': 'sortCategory',
                'quantity': 'sortQty',
                'type': 'sortType',
                'date_added': 'sortAdded'
            };
            
            var headerId = columnMap[currentSortColumn];
            var activeHeader = document.getElementById(headerId);
            
            if (activeHeader) {
                activeHeader.classList.remove('text-gray-500', 'dark:text-gray-400');
                activeHeader.classList.add('text-gray-900', 'dark:text-white');
                
                var arrow = document.createElement('span');
                arrow.className = 'sort-arrow ml-1 inline-block text-xs';
                arrow.textContent = currentSortDirection === 'asc' ? ' ▲' : ' ▼';
                activeHeader.appendChild(arrow);
            }
        }
    }
    
    app.renderInventory = function(isAdmin) {
        var searchInput = document.getElementById('inventorySearch');
        var searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        
        var filteredData = inventoryData.filter(function(item) {
            return item.item.toLowerCase().indexOf(searchTerm) !== -1 ||
                   (item.category && item.category.toLowerCase().indexOf(searchTerm) !== -1);
        });
        
        // Sort data if a sort column is active
        if (currentSortColumn) {
            filteredData = sortData(filteredData, currentSortColumn, currentSortDirection);
        }
        
        var totalPages = Math.ceil(filteredData.length / inventoryItemsPerPage);
        var startIndex = (inventoryCurrentPage - 1) * inventoryItemsPerPage;
        var paginatedData = filteredData.slice(startIndex, startIndex + inventoryItemsPerPage);
        
        var tbody = document.getElementById('inventoryTableBody');
        if (!tbody) {
            return;
        }
        
        while (tbody.firstChild) {
            tbody.removeChild(tbody.firstChild);
        }
        
        var colSpan = isAdmin ? 6 : 5;
        
        if (paginatedData.length === 0) {
            var emptyTr = document.createElement('tr');
            emptyTr.innerHTML = '<td colspan="' + colSpan + '" class="px-3 py-4 text-sm text-center text-gray-500">No records found</td>';
            tbody.appendChild(emptyTr);
        } else {
            var fragment = document.createDocumentFragment();
            
            for (var i = 0; i < paginatedData.length; i++) {
                var item = paginatedData[i];
                var typeClass = item.is_consumable == 1 ? 
                    'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : 
                    'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
                var typeLabel = item.is_consumable == 1 ? 'Consumable' : 'Returnable';
                
                // Quantity of 0 (or less, which can happen if a requisition was approved
                // against low stock) is presented as Out of Stock instead of a bare "0".
                var quantity = parseInt(item.quantity, 10);
                if (isNaN(quantity)) quantity = 0;
                var quantityCell = quantity <= 0
                    ? '<span class="px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300">Out of Stock</span>'
                    : '<span class="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">' + quantity + '</span>';
                
                var tr = document.createElement('tr');
                tr.className = 'hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors';
                
                var rowHTML = '<td class="px-3 py-3 text-sm font-medium" data-label="Item">' + app.escapeHtml(item.item) + '</td>' +
                    '<td class="px-3 py-3 text-sm text-gray-500" data-label="Category">' + app.escapeHtml(item.category || '-') + '</td>' +
                    '<td class="px-3 py-3 text-sm" data-label="Quantity">' + quantityCell + '</td>' +
                    '<td class="px-3 py-3 text-sm" data-label="Type"><span class="px-2 py-0.5 rounded-full text-xs font-medium ' + typeClass + '">' + typeLabel + '</span></td>' +
                    '<td class="px-3 py-3 text-sm text-gray-500" data-label="Date Added">' + app.escapeHtml(item.date_added || '-') + '</td>';
                
                if (isAdmin) {
                    rowHTML += '<td class="px-3 py-3 text-sm text-right" data-label="Actions">' +
                        '<button class="p-1.5 rounded-md text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-all cursor-pointer edit-inventory-btn" data-id="' + item.id + '" title="Edit">' +
                        '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>' +
                        '</button>' +
                        '<button class="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer delete-inventory-btn" data-id="' + item.id + '" title="Delete">' +
                        '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>' +
                        '</button>' +
                        '</td>';
                }
                
                tr.innerHTML = rowHTML;
                
                if (isAdmin) {
                    var editBtn = tr.querySelector('.edit-inventory-btn');
                    var deleteBtn = tr.querySelector('.delete-inventory-btn');
                    
                    if (editBtn) {
                        (function(itemId) {
                            editBtn.addEventListener('click', function() {
                                app.editInventory(itemId);
                            });
                        })(item.id);
                    }
                    
                    if (deleteBtn) {
                        (function(itemId) {
                            deleteBtn.addEventListener('click', function() {
                                app.deleteInventory(itemId);
                            });
                        })(item.id);
                    }
                }
                
                fragment.appendChild(tr);
            }
            
            tbody.appendChild(fragment);
        }
        
        app.renderPagination('inventoryPagination', totalPages, inventoryCurrentPage, function(page) {
            inventoryCurrentPage = page;
            app.renderInventory(isAdmin);
        });
        
        // Update sort indicators after rendering
        updateSortIndicators();
    };
    
    app.editInventory = function(id) {
        fetch('/api/inventory/get?id=' + id)
            .then(function(response) {
                return response.json();
            })
            .then(function(item) {
                var editInvId = document.getElementById('editInvId');
                var editInvItem = document.getElementById('editInvItem');
                var editInvCategory = document.getElementById('editInvCategory');
                var editInvQuantity = document.getElementById('editInvQuantity');
                var editInvDateAdded = document.getElementById('editInvDateAdded');
                var editInvIsConsumable = document.getElementById('editInvIsConsumable');
                
                if (editInvId) editInvId.value = item.id;
                if (editInvItem) editInvItem.value = item.item;
                if (editInvCategory) editInvCategory.value = item.category || '';
                if (editInvQuantity) editInvQuantity.value = item.quantity;
                if (editInvDateAdded) editInvDateAdded.value = item.date_added || '';
                if (editInvIsConsumable) editInvIsConsumable.checked = item.is_consumable == 1;
                
                var modal = document.getElementById('editInventoryModal');
                if (modal) modal.classList.remove('hidden');
            })
            .catch(function(error) {
                console.error('Failed to edit inventory item:', error);
            });
    };
    
    app.deleteInventory = function(id) {
        app.confirmDialog('Are you sure?', "You won't be able to revert this!").then(function(result) {
            if (result.isConfirmed) {
                var formData = new FormData();
                formData.append('id', id);
                
                fetch('/api/inventory/delete', {
                    method: 'POST',
                    body: formData
                })
                .then(function(response) {
                    return response.json();
                })
                .then(function(data) {
                    if (data.success) {
                        app.loadInventory().then(function() {
                            app.renderInventory(true);
                            app.showAlert('success', 'Deleted!', 'Item has been deleted.');
                        });
                    }
                });
            }
        });
    };
    
    function addInventoryItem(isAdmin) {
        var invItem = document.getElementById('invItem');
        var invCategory = document.getElementById('invCategory');
        var invQuantity = document.getElementById('invQuantity');
        var invDateAdded = document.getElementById('invDateAdded');
        var invIsConsumable = document.getElementById('invIsConsumable');
        
        var formData = new FormData();
        formData.append('item', invItem ? invItem.value : '');
        formData.append('category', invCategory ? invCategory.value : '');
        formData.append('quantity', invQuantity ? invQuantity.value : '');
        formData.append('date_added', invDateAdded ? invDateAdded.value : '');
        formData.append('is_consumable', invIsConsumable && invIsConsumable.checked ? '1' : '0');
        
        fetch('/api/inventory/add', {
            method: 'POST',
            body: formData
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            if (data.success) {
                var modal = document.getElementById('addInventoryModal');
                var form = document.getElementById('addInventoryForm');
                
                if (modal) modal.classList.add('hidden');
                if (form) form.reset();
                if (invIsConsumable) invIsConsumable.checked = false;
                
                app.loadInventory().then(function() {
                    app.renderInventory(isAdmin);
                    app.showAlert('success', 'Success', 'Item added successfully!');
                });
            } else {
                app.showAlert('error', 'Error', data.message || 'Unable to add the item.');
            }
        })
        .catch(function(error) {
            console.error('Failed to add inventory item:', error);
        });
    }
    
    function updateInventoryItem(isAdmin) {
        var editInvId = document.getElementById('editInvId');
        var editInvItem = document.getElementById('editInvItem');
        var editInvCategory = document.getElementById('editInvCategory');
        var editInvQuantity = document.getElementById('editInvQuantity');
        var editInvDateAdded = document.getElementById('editInvDateAdded');
        var editInvIsConsumable = document.getElementById('editInvIsConsumable');
        
        var formData = new FormData();
        formData.append('id', editInvId ? editInvId.value : '');
        formData.append('item', editInvItem ? editInvItem.value : '');
        formData.append('category', editInvCategory ? editInvCategory.value : '');
        formData.append('quantity', editInvQuantity ? editInvQuantity.value : '');
        formData.append('date_added', editInvDateAdded ? editInvDateAdded.value : '');
        formData.append('is_consumable', editInvIsConsumable && editInvIsConsumable.checked ? '1' : '0');
        
        fetch('/api/inventory/update', {
            method: 'POST',
            body: formData
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            if (data.success) {
                var modal = document.getElementById('editInventoryModal');
                if (modal) modal.classList.add('hidden');
                
                app.loadInventory().then(function() {
                    app.renderInventory(isAdmin);
                    window.dispatchEvent(new CustomEvent('refreshRequisitionHistory'));
                    window.dispatchEvent(new CustomEvent('refreshApprovedRequisitions'));
                    window.dispatchEvent(new CustomEvent('refreshReturns'));
                    app.showAlert('success', 'Success', 'Item updated successfully!');
                });
            } else {
                app.showAlert('error', 'Error', data.message || 'Unable to update the item.');
            }
        })
        .catch(function(error) {
            console.error('Failed to update inventory item:', error);
        });
    }
    
    function exportInventoryCSV() {
        var searchInput = document.getElementById('inventorySearch');
        var searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        
        var filteredData = inventoryData.filter(function(item) {
            return item.item.toLowerCase().indexOf(searchTerm) !== -1 ||
                   (item.date_added && item.date_added.toLowerCase().indexOf(searchTerm) !== -1) ||
                   (item.category && item.category.toLowerCase().indexOf(searchTerm) !== -1);
        });
        
        // Sort exported data if a sort column is active
        if (currentSortColumn) {
            filteredData = sortData(filteredData, currentSortColumn, currentSortDirection);
        }
        
        var csv = 'Item,Category,Quantity,Type,Date Added\n';
        
        for (var i = 0; i < filteredData.length; i++) {
            var item = filteredData[i];
            var type = item.is_consumable == 1 ? 'Consumable' : 'Returnable';
            csv += app.escapeCSV(item.item) + ',' + app.escapeCSV(item.category || '') + ',' + item.quantity + ',' + type + ',' + app.escapeCSV(item.date_added || '') + '\n';
        }
        
        app.downloadCSV(csv, 'inventory');
    }
    
    app.destroyInventory = function() {
        eventHandlers.forEach(function(config, key) {
            if (config && config.element) {
                config.element.removeEventListener(config.type, config.handler);
            }
        });
        eventHandlers.clear();
        
        inventoryData = [];
        inventoryCurrentPage = 1;
        currentSortColumn = null;
        currentSortDirection = 'asc';
    };
    
})(window.InventoryApp);
