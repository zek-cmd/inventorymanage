window.InventoryApp = window.InventoryApp || {};

(function(app) {
    'use strict';
    
    var returnData = [];
    var returnCurrentPage = 1;
    var historyItemsPerPage = 5;
    var eventHandlers = new Map();
    var currentSortColumn = null;
    var currentSortDirection = 'asc';
    var activeReturnId = null;
    
    app.initReturns = function() {
        if (!window.isAdmin) {
            return;
        }
        
        app.destroyReturns();
        
        loadReturns();
        
        var returnForm = document.getElementById('returnForm');
        if (returnForm) {
            var formHandler = function(e) {
                e.preventDefault();
                processReturn();
            };
            returnForm.addEventListener('submit', formHandler);
            eventHandlers.set('returnForm', { element: returnForm, type: 'submit', handler: formHandler });
        }
        
        var returnRequisitionSearch = document.getElementById('returnRequisitionSearch');
        if (returnRequisitionSearch) {
            var searchHandler = function() {
                filterRequisitionDropdown(this.value);
            };
            returnRequisitionSearch.addEventListener('input', searchHandler);
            eventHandlers.set('returnRequisitionSearch-input', { element: returnRequisitionSearch, type: 'input', handler: searchHandler });
            
            var focusHandler = function() {
                filterRequisitionDropdown(this.value);
            };
            returnRequisitionSearch.addEventListener('focus', focusHandler);
            eventHandlers.set('returnRequisitionSearch-focus', { element: returnRequisitionSearch, type: 'focus', handler: focusHandler });
        }
        
        var returnSearch = document.getElementById('returnSearch');
        if (returnSearch) {
            var returnSearchHandler = function() {
                returnCurrentPage = 1;
                renderReturns();
            };
            returnSearch.addEventListener('input', returnSearchHandler);
            eventHandlers.set('returnSearch', { element: returnSearch, type: 'input', handler: returnSearchHandler });
        }
        
        var exportReturnsBtn = document.getElementById('exportReturnsBtn');
        if (exportReturnsBtn) {
            var exportHandler = function() {
                exportReturnsCSV();
            };
            exportReturnsBtn.addEventListener('click', exportHandler);
            eventHandlers.set('exportReturnsBtn', { element: exportReturnsBtn, type: 'click', handler: exportHandler });
        }
        
        var clearReturnsBtn = document.getElementById('clearReturnsBtn');
        if (clearReturnsBtn) {
            var clearHandler = function() {
                clearReturns();
            };
            clearReturnsBtn.addEventListener('click', clearHandler);
            eventHandlers.set('clearReturnsBtn', { element: clearReturnsBtn, type: 'click', handler: clearHandler });
        }

        var returnDetailsModal = document.getElementById('returnDetailsModal');
        var closeReturnDetailsBtn = document.getElementById('closeReturnDetails');
        if (closeReturnDetailsBtn) {
            var closeDetailsHandler = function() { closeReturnDetails(); };
            closeReturnDetailsBtn.addEventListener('click', closeDetailsHandler);
            eventHandlers.set('closeReturnDetails', { element: closeReturnDetailsBtn, type: 'click', handler: closeDetailsHandler });
        }
        if (returnDetailsModal) {
            var backdropHandler = function(e) { if (e.target === returnDetailsModal) closeReturnDetails(); };
            returnDetailsModal.addEventListener('click', backdropHandler);
            eventHandlers.set('returnDetailsModal', { element: returnDetailsModal, type: 'click', handler: backdropHandler });
        }
        var detailsEscapeHandler = function(e) {
            var modal = document.getElementById('returnDetailsModal');
            if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
                e.stopImmediatePropagation();
                closeReturnDetails();
            }
        };
        document.addEventListener('keydown', detailsEscapeHandler);
        eventHandlers.set('returnDetailsEscape', { element: document, type: 'keydown', handler: detailsEscapeHandler });

        // Add sort listeners to table headers
        addSortListeners();

        // Listen for events from other modules to refresh return dropdown data
var refreshDropdownHandler = function() {
    var reqIdInput = document.getElementById('returnRequisitionId');
    var reqIdValue = reqIdInput ? reqIdInput.value : '';
    
    if (reqIdValue) {
        // A requisition is selected — reload its items
        loadReturnItems(reqIdValue);
    } else {
        // No requisition selected — clear stale dropdown state
        var dropdown = document.getElementById('returnRequisitionDropdown');
        if (dropdown) {
            dropdown.classList.add('hidden');
            while (dropdown.firstChild) {
                dropdown.removeChild(dropdown.firstChild);
            }
        }
        
        var searchInput = document.getElementById('returnRequisitionSearch');
        if (searchInput) searchInput.value = '';
        
        var itemsContainer = document.getElementById('returnItems');
        if (itemsContainer) {
            itemsContainer.innerHTML = '<div class="text-xs text-gray-500 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">Select a requisition to load items</div>';
        }
    }
};
        window.addEventListener('refreshApprovedRequisitions', refreshDropdownHandler);
        eventHandlers.set('refreshApprovedRequisitions', { element: window, type: 'refreshApprovedRequisitions', handler: refreshDropdownHandler });

        var refreshReturnsHandler = function() {
            loadReturns();
        };
        window.addEventListener('refreshReturns', refreshReturnsHandler);
        eventHandlers.set('refreshReturns', { element: window, type: 'refreshReturns', handler: refreshReturnsHandler });
    };
    
    function sortData(data, column, direction) {
        return data.slice().sort(function(a, b) {
            var valueA, valueB;
            
            switch(column) {
                case 'requisition_id':
                    valueA = parseInt(a.requisition_id) || 0;
                    valueB = parseInt(b.requisition_id) || 0;
                    break;
                case 'name':
                    valueA = (a.name || '').toLowerCase();
                    valueB = (b.name || '').toLowerCase();
                    break;
                case 'item':
                    valueA = (a.item || '').toLowerCase();
                    valueB = (b.item || '').toLowerCase();
                    break;
                case 'quantity_returned':
                    valueA = parseInt(a.quantity_returned) || 0;
                    valueB = parseInt(b.quantity_returned) || 0;
                    break;
                case 'quantity_lost':
                    valueA = parseInt(a.quantity_lost) || 0;
                    valueB = parseInt(b.quantity_lost) || 0;
                    break;
                case 'return_date':
                    valueA = a.return_date || '';
                    valueB = b.return_date || '';
                    break;
                case 'checked_by':
                    valueA = (a.checked_by || '').toLowerCase();
                    valueB = (b.checked_by || '').toLowerCase();
                    break;
                case 'remarks':
                    valueA = (a.remarks || '').toLowerCase();
                    valueB = (b.remarks || '').toLowerCase();
                    break;
                default:
                    return 0;
            }
            
            if (valueA < valueB) return direction === 'asc' ? -1 : 1;
            if (valueA > valueB) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    }
    
    function addSortListeners() {
        var sortableHeaders = [
            { id: 'sortReturnReqId', column: 'requisition_id' },
            { id: 'sortReturnName', column: 'name' },
            { id: 'sortReturnItem', column: 'item' },
            { id: 'sortReturnDate', column: 'return_date' }
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
                        
                        returnCurrentPage = 1;
                        renderReturns();
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
        var allHeaders = document.querySelectorAll('#returnSection [id^="sortReturn"]');
        for (var i = 0; i < allHeaders.length; i++) {
            var header = allHeaders[i];
            var existingArrow = header.querySelector('.sort-arrow');
            if (existingArrow) {
                existingArrow.remove();
            }
            header.classList.remove('text-gray-900', 'dark:text-white');
            header.classList.add('text-gray-500', 'dark:text-gray-400');
        }
        
        if (currentSortColumn) {
            var columnMap = {
                'requisition_id': 'sortReturnReqId',
                'name': 'sortReturnName',
                'item': 'sortReturnItem',
                'quantity_returned': 'sortReturnQty',
                'quantity_lost': 'sortReturnQtyLost',
                'return_date': 'sortReturnDate',
                'checked_by': 'sortReturnCheckedBy',
                'remarks': 'sortReturnRemarks'
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
    
  function filterRequisitionDropdown(query) {
    var dropdown = document.getElementById('returnRequisitionDropdown');
    if (!dropdown) {
        return;
    }
    
    var requisitions = window.approvedRequisitions || [];
    var filtered = requisitions.filter(function(req) {
        if (!req.items || req.items.length === 0) {
            return false;
        }
        
        // Filter to only returnable items
        var returnableItems = req.items.filter(function(item) {
            return parseInt(item.is_consumable) !== 1;
        });
        
        if (returnableItems.length === 0) {
            return false;
        }
        
        var itemNames = returnableItems.map(function(i) {
            return i.item + ' (Qty: ' + i.quantity + ')';
        }).join(', ');
        
        var searchStr = ('#' + req.id + ' - ' + req.name + ' - ' + itemNames).toLowerCase();
        return searchStr.indexOf(query.toLowerCase()) !== -1;
    });
    
    while (dropdown.firstChild) {
        dropdown.removeChild(dropdown.firstChild);
    }
    
    if (filtered.length === 0) {
        var emptyLi = document.createElement('li');
        emptyLi.className = 'px-3 py-2 text-sm text-gray-500 dark:text-gray-400';
        emptyLi.textContent = 'No requisitions found';
        dropdown.appendChild(emptyLi);
    } else {
        var fragment = document.createDocumentFragment();
        
        for (var i = 0; i < filtered.length; i++) {
            var req = filtered[i];
            
            // Filter to only returnable items for display
            var returnableItems = req.items.filter(function(item) {
                return parseInt(item.is_consumable) !== 1;
            });
            
            var itemNames = returnableItems.map(function(item) {
                return item.item + ' (Qty: ' + item.quantity + ')';
            }).join(', ');
            
            var li = document.createElement('li');
            li.className = 'px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-900 dark:text-gray-100 transition-colors';
            li.textContent = '#' + req.id + ' - ' + req.name + ' - ' + itemNames;
            
            (function(reqData, dropdownEl) {
                li.addEventListener('click', function() {
                    var returnRequisitionSearch = document.getElementById('returnRequisitionSearch');
                    var returnRequisitionId = document.getElementById('returnRequisitionId');
                    
                    if (returnRequisitionSearch) returnRequisitionSearch.value = '#' + reqData.id + ' - ' + reqData.name;
                    if (returnRequisitionId) returnRequisitionId.value = reqData.id;
                    
                    loadReturnItems(reqData.id);
                    dropdownEl.classList.add('hidden');
                });
            })(req, dropdown);
            
            fragment.appendChild(li);
        }
        
        dropdown.appendChild(fragment);
    }
    
    dropdown.classList.remove('hidden');
}
    
    function loadReturnItems(requisitionId) {
        fetch('/api/requisitions/items?id=' + requisitionId)
            .then(function(response) {
                return response.json();
            })
            .then(function(items) {
                var container = document.getElementById('returnItems');
                if (!container) {
                    return;
                }
                
                while (container.firstChild) {
                    container.removeChild(container.firstChild);
                }
                
                if (!Array.isArray(items)) {
                    items = [items];
                }
                
                if (items.length === 0) {
                    var emptyDiv = document.createElement('div');
                    emptyDiv.className = 'text-xs text-gray-500 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center';
                    emptyDiv.textContent = 'No items available for return';
                    container.appendChild(emptyDiv);
                    return;
                }
                
                var fragment = document.createDocumentFragment();
                
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    var totalResolved = (parseInt(item.returned_quantity) || 0) + (parseInt(item.quantity_lost) || 0);
                    var remaining = parseInt(item.quantity) - totalResolved;
                    
                    if (remaining > 0 && parseInt(item.is_consumable) !== 1) {
                        var itemRow = document.createElement('div');
                        itemRow.className = 'return-item-row flex flex-col xs:flex-row gap-2 items-stretch xs:items-start bg-gray-50 dark:bg-gray-800 rounded-lg p-2 xs:p-3';
                        itemRow.innerHTML = 
                            '<div class="flex-1">' +
                                '<div class="text-xs xs:text-sm font-medium text-gray-900 dark:text-white mb-1">' + app.escapeHtml(item.item) + '</div>' +
                                '<div class="text-xs text-gray-500 dark:text-gray-400">' +
                                    'Requested: ' + item.quantity + ' | ' +
                                    'Returned: ' + (item.returned_quantity || 0) + ' | ' +
                                    'Lost: ' + (item.quantity_lost || 0) + ' | ' +
                                    '<span class="font-medium text-blue-600 dark:text-blue-400">Remaining: ' + remaining + '</span>' +
                                '</div>' +
                                '<input type="hidden" class="return-item-id" value="' + item.id + '">' +
                                '<input type="hidden" class="return-item-name" value="' + app.escapeHtml(item.item) + '">' +
                                '<input type="hidden" class="return-item-max" value="' + remaining + '">' +
                            '</div>' +
                            '<div class="flex gap-2 items-end">' +
                                '<div>' +
                                    '<label class="block text-xs text-gray-500 dark:text-gray-400 mb-0.5">Returned</label>' +
                                    '<input type="number" min="0" max="' + remaining + '" value="0" class="return-qty w-20 xs:w-24 px-2 xs:px-3 py-1.5 xs:py-2 text-xs xs:text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all">' +
                                '</div>' +
                                '<div>' +
                                    '<label class="block text-xs text-gray-500 dark:text-gray-400 mb-0.5">Lost</label>' +
                                    '<input type="number" min="0" max="' + remaining + '" value="0" class="return-qty-lost w-20 xs:w-24 px-2 xs:px-3 py-1.5 xs:py-2 text-xs xs:text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all">' +
                                '</div>' +
                            '</div>';
                        
                        fragment.appendChild(itemRow);
                    }
                }
                
                if (fragment.children.length === 0) {
                    var allReturnedDiv = document.createElement('div');
                    allReturnedDiv.className = 'text-xs text-gray-500 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center';
                    allReturnedDiv.textContent = 'All items have been fully returned';
                    container.appendChild(allReturnedDiv);
                } else {
                    container.appendChild(fragment);
                    
                    var qtyInputs = container.querySelectorAll('.return-qty, .return-qty-lost');
                    for (var j = 0; j < qtyInputs.length; j++) {
                        qtyInputs[j].addEventListener('input', function() {
                            var row = this.closest('.return-item-row');
                            var maxInput = row.querySelector('.return-item-max');
                            var qtyReturned = parseInt(row.querySelector('.return-qty').value) || 0;
                            var qtyLost = parseInt(row.querySelector('.return-qty-lost').value) || 0;
                            var max = parseInt(maxInput.value) || 0;
                            
                            if ((qtyReturned + qtyLost) > max) {
                                this.value = Math.max(0, max - (this.classList.contains('return-qty') ? qtyLost : qtyReturned));
                            }
                        });
                    }
                }
            })
            .catch(function(error) {
                console.error('Failed to load return items:', error);
            });
    }
    
    function processReturn() {
        var requisitionId = document.getElementById('returnRequisitionId');
        var returnDate = document.getElementById('returnDate');
        var returnCheckedBy = document.getElementById('returnCheckedBy');
        var returnRemarks = document.getElementById('returnRemarks');
        
        var reqIdValue = requisitionId ? requisitionId.value : '';
        
        if (!reqIdValue) {
            app.showAlert('error', 'Error', 'Please select a requisition.');
            return;
        }
        
        var itemRows = document.querySelectorAll('#returnItems .return-item-row');
        var itemsToProcess = [];
        
        for (var i = 0; i < itemRows.length; i++) {
            var row = itemRows[i];
            var itemId = row.querySelector('.return-item-id').value;
            var itemName = row.querySelector('.return-item-name').value;
            var qtyReturned = parseInt(row.querySelector('.return-qty').value) || 0;
            var qtyLost = parseInt(row.querySelector('.return-qty-lost').value) || 0;
            
            if (qtyReturned > 0 || qtyLost > 0) {
                itemsToProcess.push({
                    id: itemId,
                    name: itemName,
                    qty_returned: qtyReturned,
                    qty_lost: qtyLost
                });
            }
        }
        
        if (itemsToProcess.length === 0) {
            app.showAlert('error', 'Error', 'Please enter at least one quantity to return or mark as lost.');
            return;
        }
        
        var formData = new FormData();
        formData.append('requisition_id', reqIdValue);
        formData.append('return_date', returnDate ? returnDate.value : '');
        formData.append('checked_by', returnCheckedBy ? returnCheckedBy.value : '');
        formData.append('remarks', returnRemarks ? returnRemarks.value : '');
        formData.append('items', JSON.stringify(itemsToProcess));
        
        fetch('/api/returns/process', {
            method: 'POST',
            body: formData
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            if (data.success) {
                var returnForm = document.getElementById('returnForm');
                if (returnForm) returnForm.reset();
                
                var returnReqId = document.getElementById('returnRequisitionId');
                var returnReqSearch = document.getElementById('returnRequisitionSearch');
                var returnItems = document.getElementById('returnItems');
                
                if (returnReqId) returnReqId.value = '';
                if (returnReqSearch) returnReqSearch.value = '';
                if (returnItems) {
                    returnItems.innerHTML = '<div class="text-xs text-gray-500 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">Select a requisition to load items</div>';
                }
                
                loadReturns();
                window.dispatchEvent(new CustomEvent('refreshInventoryDisplay'));
                window.dispatchEvent(new CustomEvent('refreshApprovedRequisitions'));
                window.dispatchEvent(new CustomEvent('refreshRequisitionHistory'));
                
                app.showAlert('success', 'Success', 'Items processed successfully!');
            } else {
                app.showAlert('error', 'Error', data.message || 'Return failed');
            }
        })
        .catch(function(error) {
            console.error('Failed to process return:', error);
        });
    }
    
    function loadReturns() {
        if (!window.isAdmin) {
            return;
        }
        
        fetch('/api/returns')
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                returnData = data;
                returnCurrentPage = 1;
                renderReturns();
            })
            .catch(function(error) {
                console.error('Failed to load returns:', error);
            });
    }
    
    function renderReturns() {
        var searchInput = document.getElementById('returnSearch');
        var searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        
        var filteredData = returnData.filter(function(ret) {
            return String(ret.requisition_id).indexOf(searchTerm) !== -1 ||
                   ret.item.toLowerCase().indexOf(searchTerm) !== -1 ||
                   (ret.name && ret.name.toLowerCase().indexOf(searchTerm) !== -1);
        });
        
        if (currentSortColumn) {
            filteredData = sortData(filteredData, currentSortColumn, currentSortDirection);
        }
        
        var totalPages = Math.ceil(filteredData.length / historyItemsPerPage);
        var startIndex = (returnCurrentPage - 1) * historyItemsPerPage;
        var paginatedData = filteredData.slice(startIndex, startIndex + historyItemsPerPage);
        
        var tbody = document.getElementById('returnTableBody');
        if (!tbody) {
            return;
        }
        
        while (tbody.firstChild) {
            tbody.removeChild(tbody.firstChild);
        }
        
        if (paginatedData.length === 0) {
            var emptyTr = document.createElement('tr');
            emptyTr.innerHTML = '<td colspan="5" class="px-3 py-4 text-sm text-center text-gray-500">No records found</td>';
            tbody.appendChild(emptyTr);
        } else {
            var fragment = document.createDocumentFragment();
            
            for (var i = 0; i < paginatedData.length; i++) {
                var ret = paginatedData[i];
                var returnStatus = ret.requisition_status || ((parseInt(ret.quantity_lost) || 0) > 0 ? 'lost' : 'returned');
                var returnStatusClass = returnStatus === 'lost' ? 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' : 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
                var tr = document.createElement('tr');
                tr.className = 'hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer';
                tr.setAttribute('tabindex', '0');
                tr.setAttribute('role', 'button');
                tr.setAttribute('aria-label', 'View return details for ' + (ret.item || 'item'));
                tr.innerHTML = '<td class="px-3 py-3 text-sm font-medium" data-label="Requisition ID">#' + app.escapeHtml(String(ret.requisition_id)) + '</td>' +
                    '<td class="px-3 py-3 text-sm" data-label="Requestor">' + app.escapeHtml(ret.name || 'Deleted Requisition') + '</td>' +
                    '<td class="px-3 py-3 text-sm" data-label="Item">' + app.escapeHtml(ret.item) + ' <span class="text-gray-400">(returned x' + app.escapeHtml(String(ret.quantity_returned || 0)) + ', lost x' + app.escapeHtml(String(ret.quantity_lost || 0)) + ')</span></td>' +
                    '<td class="px-3 py-3 text-sm text-gray-500" data-label="Return Date">' + app.escapeHtml(ret.return_date) + '</td>' +
                    '<td class="px-3 py-3 text-sm" data-label="Status"><span class="px-2 py-0.5 rounded-full text-xs font-medium ' + returnStatusClass + '">' + app.escapeHtml(returnStatus) + '</span></td>';
                (function(row, returnRecord) {
                    row.addEventListener('click', function() { openReturnDetails(returnRecord.id); });
                    row.addEventListener('keydown', function(e) {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            openReturnDetails(returnRecord.id);
                        }
                    });
                })(tr, ret);
                fragment.appendChild(tr);
            }
            
            tbody.appendChild(fragment);
        }
        
        app.renderPagination('returnPagination', totalPages, returnCurrentPage, function(page) {
            returnCurrentPage = page;
            renderReturns();
        });
        
        updateSortIndicators();
    }

    function openReturnDetails(id) {
        var record = null;
        for (var i = 0; i < returnData.length; i++) {
            if (String(returnData[i].id) === String(id)) { record = returnData[i]; break; }
        }
        if (!record) return;
        activeReturnId = id;
        var subtitle = document.getElementById('returnDetailsSubtitle');
        var content = document.getElementById('returnDetailsContent');
        var modal = document.getElementById('returnDetailsModal');
        if (subtitle) subtitle.textContent = (record.name || 'Deleted Requisition') + ' • ' + record.return_date;
        if (content) {
            content.innerHTML = '<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">' +
                returnDetailField('Return record ID', '#' + record.id) +
                returnDetailField('Requisition ID', '#' + (record.requisition_id || '-')) +
                returnDetailField('Requestor', record.name || 'Deleted Requisition') +
                returnDetailField('Request date', record.request_date || '-') +
                returnDetailField('Department', record.department || '-') +
                returnDetailField('Position', record.position || '-') +
                returnDetailField('Item', record.item) +
                returnDetailField('Quantity returned', String(record.quantity_returned || 0)) +
                returnDetailField('Quantity lost', String(record.quantity_lost || 0)) +
                returnDetailField('Return date', record.return_date) +
                returnDetailField('Checked by', record.checked_by || '-') +
                returnDetailField('Recorded at', record.created_at || '-') +
                returnDetailField('Requisition status', record.requisition_status || '-') +
                returnDetailField('Approved by', record.approved_by || '-') +
                returnDetailField('Requisition note', record.requisition_note || '-') +
                returnDetailField('Remarks', record.remarks || '-') + '</div>';
        }
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            document.body.style.overflow = 'hidden';
        }
    }

    function returnDetailField(label, value) {
        return '<div><p class="text-xs font-medium uppercase tracking-wide text-gray-400">' + app.escapeHtml(label) + '</p><p class="mt-1 text-gray-800 dark:text-gray-200 whitespace-pre-wrap">' + app.escapeHtml(value) + '</p></div>';
    }

    function closeReturnDetails() {
        var modal = document.getElementById('returnDetailsModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
        document.body.style.overflow = '';
        activeReturnId = null;
    }
    
    function exportReturnsCSV() {
        var searchInput = document.getElementById('returnSearch');
        var searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        
        var filteredData = returnData.filter(function(ret) {
            return String(ret.requisition_id).indexOf(searchTerm) !== -1 ||
                   ret.item.toLowerCase().indexOf(searchTerm) !== -1 ||
                   (ret.name && ret.name.toLowerCase().indexOf(searchTerm) !== -1);
        });
        
        if (currentSortColumn) {
            filteredData = sortData(filteredData, currentSortColumn, currentSortDirection);
        }
        
        var csv = 'Requisition ID,Requestor,Item,Quantity Returned,Quantity Lost,Return Date,Checked By,Remarks\n';
        
        for (var i = 0; i < filteredData.length; i++) {
            var ret = filteredData[i];
            csv += '#' + ret.requisition_id + ',' +
                app.escapeCSV(ret.name || 'Deleted Requisition') + ',' +
                app.escapeCSV(ret.item) + ',' +
                ret.quantity_returned + ',' +
                (ret.quantity_lost || 0) + ',' +
                app.escapeCSV(ret.return_date) + ',' +
                app.escapeCSV(ret.checked_by || '') + ',' +
                app.escapeCSV(ret.remarks || '') + '\n';
        }
        
        app.downloadCSV(csv, 'returns');
    }
    
    function clearReturns() {
        app.confirmDialog('Clear Return History?', 'This will permanently delete all return records. This action cannot be undone!', 'warning', 'Yes, clear all!', '#ef4444')
            .then(function(result) {
                if (result.isConfirmed) {
                    fetch('/api/returns/clear', {
                        method: 'POST'
                    })
                    .then(function(response) {
                        return response.json();
                    })
                    .then(function(data) {
                        if (data.success) {
                            returnData = [];
                            returnCurrentPage = 1;
                            currentSortColumn = null;
                            currentSortDirection = 'asc';
                            renderReturns();
                            window.dispatchEvent(new CustomEvent('refreshInventoryDisplay'));
                            window.dispatchEvent(new CustomEvent('refreshApprovedRequisitions'));
                            window.dispatchEvent(new CustomEvent('refreshRequisitionHistory'));
                            app.showAlert('success', 'Cleared!', 'All return records have been deleted.');
                        }
                    });
                }
            });
    }
    
    app.destroyReturns = function() {
        eventHandlers.forEach(function(config, key) {
            if (config && config.element) {
                config.element.removeEventListener(config.type, config.handler);
            }
        });
        eventHandlers.clear();
        
        returnData = [];
        returnCurrentPage = 1;
        currentSortColumn = null;
        currentSortDirection = 'asc';
        activeReturnId = null;
    };
    
})(window.InventoryApp);
