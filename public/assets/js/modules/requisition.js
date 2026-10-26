window.InventoryApp = window.InventoryApp || {};

(function(app) {
    'use strict';
    
    var requisitionData = [];
    var requisitionCurrentPage = 1;
    var historyItemsPerPage = 5;
    var eventHandlers = new Map();
    var currentSortColumn = null;
    var currentSortDirection = 'asc';
    var selectedRequisitionIds = {};
    var activeDetailsRequisitionId = null;
    
    app.initRequisition = function(isAdmin) {
        app.destroyRequisition();
        
        loadRequisitionItems();
        
        var requisitionForm = document.getElementById('requisitionForm');
        if (requisitionForm) {
            var formHandler = function(e) {
                e.preventDefault();
                submitRequisition(isAdmin);
            };
            requisitionForm.addEventListener('submit', formHandler);
            eventHandlers.set('requisitionForm', { element: requisitionForm, type: 'submit', handler: formHandler });
        }
        
        var addItemRowBtn = document.getElementById('addItemRow');
        if (addItemRowBtn) {
            var addRowHandler = function() {
                addItemRow();
            };
            addItemRowBtn.addEventListener('click', addRowHandler);
            eventHandlers.set('addItemRow', { element: addItemRowBtn, type: 'click', handler: addRowHandler });
        }
        
        var requisitionItems = document.getElementById('requisitionItems');
        if (requisitionItems) {
            var removeHandler = function(e) {
                if (e.target.closest('.remove-item')) {
                    var rows = document.querySelectorAll('#requisitionItems .item-row');
                    if (rows.length > 1) {
                        var row = e.target.closest('.item-row');
                        if (row) {
                            row.remove();
                        }
                    }
                }
            };
            requisitionItems.addEventListener('click', removeHandler);
            eventHandlers.set('requisitionItems-click', { element: requisitionItems, type: 'click', handler: removeHandler });
            
            var inputHandler = function(e) {
                if (e.target.classList.contains('item-search')) {
                    filterItemDropdownForRow(e.target);
                }
            };
            requisitionItems.addEventListener('input', inputHandler);
            eventHandlers.set('requisitionItems-input', { element: requisitionItems, type: 'input', handler: inputHandler });
            
            var focusHandler = function(e) {
                if (e.target.classList.contains('item-search')) {
                    filterItemDropdownForRow(e.target);
                }
            };
            requisitionItems.addEventListener('focus', focusHandler, true);
            eventHandlers.set('requisitionItems-focus', { element: requisitionItems, type: 'focus', handler: focusHandler, useCapture: true });
        }
        
        if (isAdmin) {
            loadRequisitions();
            loadApprovedRequisitions();
            
            var requisitionSearch = document.getElementById('requisitionSearch');
            if (requisitionSearch) {
                var searchHandler = function() {
                    requisitionCurrentPage = 1;
                    renderRequisitions();
                };
                requisitionSearch.addEventListener('input', searchHandler);
                eventHandlers.set('requisitionSearch', { element: requisitionSearch, type: 'input', handler: searchHandler });
            }

            var selectAllRequisitions = document.getElementById('selectAllRequisitions');
            if (selectAllRequisitions) {
                var selectAllHandler = function() {
                    var visibleCheckboxes = document.querySelectorAll('.requisition-select-checkbox');
                    for (var i = 0; i < visibleCheckboxes.length; i++) {
                        var checkbox = visibleCheckboxes[i];
                        checkbox.checked = selectAllRequisitions.checked;
                        if (selectAllRequisitions.checked) {
                            selectedRequisitionIds[checkbox.value] = true;
                        } else {
                            delete selectedRequisitionIds[checkbox.value];
                        }
                    }
                    syncSelectAllRequisitions();
                };
                selectAllRequisitions.addEventListener('change', selectAllHandler);
                eventHandlers.set('selectAllRequisitions', { element: selectAllRequisitions, type: 'change', handler: selectAllHandler });
            }

            var generateReportBtn = document.getElementById('generateRequisitionReportBtn');
            if (generateReportBtn) {
                var reportHandler = function() {
                    showRequisitionReportModal();
                };
                generateReportBtn.addEventListener('click', reportHandler);
                eventHandlers.set('generateRequisitionReportBtn', { element: generateReportBtn, type: 'click', handler: reportHandler });
            }
            
            var exportRequisitionsBtn = document.getElementById('exportRequisitionsBtn');
            if (exportRequisitionsBtn) {
                var exportHandler = function() {
                    exportRequisitionsCSV();
                };
                exportRequisitionsBtn.addEventListener('click', exportHandler);
                eventHandlers.set('exportRequisitionsBtn', { element: exportRequisitionsBtn, type: 'click', handler: exportHandler });
            }
            
            var clearRequisitionsBtn = document.getElementById('clearRequisitionsBtn');
            if (clearRequisitionsBtn) {
                var clearHandler = function() {
                    clearRequisitions();
                };
                clearRequisitionsBtn.addEventListener('click', clearHandler);
                eventHandlers.set('clearRequisitionsBtn', { element: clearRequisitionsBtn, type: 'click', handler: clearHandler });
            }

            var detailsModal = document.getElementById('requisitionDetailsModal');
            var closeDetailsBtn = document.getElementById('closeRequisitionDetails');
            if (closeDetailsBtn) {
                var closeDetailsHandler = function() { closeRequisitionDetails(); };
                closeDetailsBtn.addEventListener('click', closeDetailsHandler);
                eventHandlers.set('closeRequisitionDetails', { element: closeDetailsBtn, type: 'click', handler: closeDetailsHandler });
            }
            if (detailsModal) {
                var detailsBackdropHandler = function(e) {
                    if (e.target === detailsModal) closeRequisitionDetails();
                };
                detailsModal.addEventListener('click', detailsBackdropHandler);
                eventHandlers.set('requisitionDetailsModal', { element: detailsModal, type: 'click', handler: detailsBackdropHandler });
            }
            var detailsEscapeHandler = function(e) {
                var modal = document.getElementById('requisitionDetailsModal');
                if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
                    e.stopImmediatePropagation();
                    closeRequisitionDetails();
                }
            };
            document.addEventListener('keydown', detailsEscapeHandler);
            eventHandlers.set('requisitionDetailsEscape', { element: document, type: 'keydown', handler: detailsEscapeHandler });

            // Add sort listeners to table headers
            addSortListeners();

            // Listen for refresh events from other modules
            var refreshHistoryHandler = function() {
                loadRequisitions();
            };
            window.addEventListener('refreshRequisitionHistory', refreshHistoryHandler);
            eventHandlers.set('refreshRequisitionHistory', { element: window, type: 'refreshRequisitionHistory', handler: refreshHistoryHandler });

            var refreshApprovedHandler = function() {
                loadApprovedRequisitions();
            };
            window.addEventListener('refreshApprovedRequisitions', refreshApprovedHandler);
            eventHandlers.set('refreshApprovedRequisitions-event', { element: window, type: 'refreshApprovedRequisitions', handler: refreshApprovedHandler });
        }
    };
    
    function sortData(data, column, direction) {
        return data.slice().sort(function(a, b) {
            var valueA, valueB;
            
            switch(column) {
                case 'name':
                    valueA = (a.name || '').toLowerCase();
                    valueB = (b.name || '').toLowerCase();
                    break;
                case 'date':
                    valueA = a.date || '';
                    valueB = b.date || '';
                    break;
                case 'department':
                    valueA = (a.department || '').toLowerCase();
                    valueB = (b.department || '').toLowerCase();
                    break;
                case 'position':
                    valueA = (a.position || '').toLowerCase();
                    valueB = (b.position || '').toLowerCase();
                    break;
                case 'items':
                    valueA = (a.item_summary || '').toLowerCase();
                    valueB = (b.item_summary || '').toLowerCase();
                    break;
                case 'note':
                    valueA = (a.note || '').toLowerCase();
                    valueB = (b.note || '').toLowerCase();
                    break;
                case 'date_returned':
                    valueA = a.date_returned || '';
                    valueB = b.date_returned || '';
                    break;
                case 'status':
                    valueA = (a.status || '').toLowerCase();
                    valueB = (b.status || '').toLowerCase();
                    break;
                case 'approved_by':
                    valueA = (a.approved_by || '').toLowerCase();
                    valueB = (b.approved_by || '').toLowerCase();
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
            { id: 'sortReqName', column: 'name' },
            { id: 'sortReqDate', column: 'date' },
            { id: 'sortReqDept', column: 'department' },
            { id: 'sortReqPosition', column: 'position' },
            { id: 'sortReqItems', column: 'items' },
            { id: 'sortReqNote', column: 'note' },
            { id: 'sortReqReturned', column: 'date_returned' },
            { id: 'sortReqStatus', column: 'status' },
            { id: 'sortReqApprovedBy', column: 'approved_by' }
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
                        
                        requisitionCurrentPage = 1;
                        renderRequisitions();
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
        var allHeaders = document.querySelectorAll('#requisitionSection [id^="sortReq"]');
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
                'name': 'sortReqName',
                'date': 'sortReqDate',
                'department': 'sortReqDept',
                'position': 'sortReqPosition',
                'items': 'sortReqItems',
                'note': 'sortReqNote',
                'date_returned': 'sortReqReturned',
                'status': 'sortReqStatus',
                'approved_by': 'sortReqApprovedBy'
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
    
    function addItemRow() {
        var container = document.getElementById('requisitionItems');
        if (!container) {
            return;
        }
        
        var row = document.createElement('div');
        row.className = 'item-row flex flex-col xs:flex-row gap-2 items-stretch xs:items-start bg-gray-50 dark:bg-gray-800 rounded-lg p-2 xs:p-3';
        row.innerHTML = '<div class="flex-1">' +
            '<div class="relative">' +
            '<input type="text" placeholder="Search item..." class="item-search w-full px-3 py-1.5 xs:py-2 pr-8 text-xs xs:text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" autocomplete="off" required>' +
            '<input type="hidden" class="item-value" value="">' +
            '<input type="hidden" class="item-consumable" value="0">' +
            '<svg class="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>' +
            '<ul class="item-dropdown absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-40 overflow-y-auto hidden"></ul>' +
            '</div>' +
            '</div>' +
            '<div class="flex gap-2">' +
            '<div class="w-20 xs:w-24">' +
            '<input type="number" min="1" placeholder="Qty" class="item-quantity w-full px-2 xs:px-3 py-1.5 xs:py-2 text-xs xs:text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" required>' +
            '</div>' +
            '<button type="button" class="remove-item p-1.5 xs:p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all cursor-pointer flex-shrink-0" title="Remove">' +
            '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>' +
            '</button>' +
            '</div>';
        container.appendChild(row);
    }
    
    function filterItemDropdownForRow(input) {
        var parentElement = input.parentElement;
        if (!parentElement) {
            return;
        }
        
        var dropdown = parentElement.querySelector('.item-dropdown');
        if (!dropdown) {
            return;
        }
        
        var items = window.inventoryItems || [];
        var query = input.value.toLowerCase();
        var filtered = items.filter(function(item) {
            return item.item.toLowerCase().indexOf(query) !== -1;
        });
        
        while (dropdown.firstChild) {
            dropdown.removeChild(dropdown.firstChild);
        }
        
        if (filtered.length === 0) {
            var emptyLi = document.createElement('li');
            emptyLi.className = 'px-3 py-2 text-sm text-gray-500 dark:text-gray-400';
            emptyLi.textContent = 'No items found';
            dropdown.appendChild(emptyLi);
        } else {
            var fragment = document.createDocumentFragment();
            
            for (var i = 0; i < filtered.length; i++) {
                var item = filtered[i];
                var typeLabel = item.is_consumable == 1 ? 'Consumable' : 'Returnable';
                var li = document.createElement('li');
                li.className = 'px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-gray-900 dark:text-gray-100 transition-colors';
                li.textContent = item.item + ' (Stock: ' + item.quantity + ') - ' + typeLabel;
                
                (function(itemData, inputEl, parentEl, dropdownEl) {
                    li.addEventListener('click', function() {
                        inputEl.value = itemData.item;
                        
                        var itemValue = parentEl.querySelector('.item-value');
                        var itemConsumable = parentEl.querySelector('.item-consumable');
                        
                        if (itemValue) itemValue.value = itemData.item;
                        if (itemConsumable) itemConsumable.value = itemData.is_consumable;
                        
                        dropdownEl.classList.add('hidden');
                    });
                })(item, input, parentElement, dropdown);
                
                fragment.appendChild(li);
            }
            
            dropdown.appendChild(fragment);
        }
        
        var allDropdowns = document.querySelectorAll('.item-dropdown');
        for (var j = 0; j < allDropdowns.length; j++) {
            allDropdowns[j].classList.add('hidden');
        }
        
        dropdown.classList.remove('hidden');
    }
    
    function submitRequisition(isAdmin) {
        var items = [];
        var rows = document.querySelectorAll('#requisitionItems .item-row');
        var hasError = false;
        
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var itemValue = row.querySelector('.item-value');
            var itemQuantity = row.querySelector('.item-quantity');
            var itemConsumable = row.querySelector('.item-consumable');
            
            var value = itemValue ? itemValue.value : '';
            var quantity = itemQuantity ? parseInt(itemQuantity.value) : 0;
            var isConsumable = itemConsumable ? itemConsumable.value : '0';
            
            if (value && quantity) {
                var inventoryItem = (window.inventoryItems || []).find(function(inv) {
                    return inv.item === value;
                });
                
                if (inventoryItem && quantity > inventoryItem.quantity) {
                    app.showAlert('error', 'Insufficient Stock', 
                        value + ' only has ' + inventoryItem.quantity + ' available. You requested ' + quantity + '.');
                    hasError = true;
                    return;
                }
                
              items.push({
    item: value,
    quantity: quantity,
    is_consumable: isConsumable
});
            }
        }
        
        if (hasError) {
            return;
        }
        
        if (items.length === 0) {
            app.showAlert('error', 'Error', 'Please add at least one item.');
            return;
        }
        
        var formData = new FormData();
        var reqName = document.getElementById('reqName');
        var reqDate = document.getElementById('reqDate');
        var reqDepartment = document.getElementById('reqDepartment');
        var reqPosition = document.getElementById('reqPosition');
        var reqNote = document.getElementById('reqNote');
        
        formData.append('name', reqName ? reqName.value : '');
        formData.append('date', reqDate ? reqDate.value : '');
        formData.append('department', reqDepartment ? reqDepartment.value : '');
        formData.append('position', reqPosition ? reqPosition.value : '');
        formData.append('note', reqNote ? reqNote.value : '');
        formData.append('items', JSON.stringify(items));
        
        fetch('/api/requisitions/submit', {
            method: 'POST',
            body: formData
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            if (data.success) {
                var form = document.getElementById('requisitionForm');
                if (form) form.reset();
                
                var requisitionItems = document.getElementById('requisitionItems');
                if (requisitionItems) {
                    requisitionItems.innerHTML = '<div class="item-row flex flex-col xs:flex-row gap-2 items-stretch xs:items-start bg-gray-50 dark:bg-gray-800 rounded-lg p-2 xs:p-3">' +
                        '<div class="flex-1">' +
                        '<div class="relative">' +
                        '<input type="text" placeholder="Search item..." class="item-search w-full px-3 py-1.5 xs:py-2 pr-8 text-xs xs:text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" autocomplete="off" required>' +
                        '<input type="hidden" class="item-value" value="">' +
                        '<input type="hidden" class="item-consumable" value="0">' +
                        '<svg class="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>' +
                        '<ul class="item-dropdown absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-40 overflow-y-auto hidden"></ul>' +
                        '</div>' +
                        '</div>' +
                        '<div class="flex gap-2">' +
                        '<div class="w-20 xs:w-24">' +
                        '<input type="number" min="1" placeholder="Qty" class="item-quantity w-full px-2 xs:px-3 py-1.5 xs:py-2 text-xs xs:text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" required>' +
                        '</div>' +
                        '<button type="button" class="remove-item p-1.5 xs:p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all cursor-pointer flex-shrink-0" title="Remove">' +
                        '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>' +
                        '</button>' +
                        '</div>' +
                        '</div>';
                }
                
                if (isAdmin) {
                    loadRequisitions();
                    loadApprovedRequisitions();
                }
                loadRequisitionItems();
                
                app.showAlert('success', 'Success', 'Requisition submitted successfully!');
            }
        })
        .catch(function(error) {
            console.error('Failed to submit requisition:', error);
        });
    }
    
    function loadRequisitions(onLoaded, preserveCurrentPage) {
        if (!window.isAdmin) {
            return;
        }
        
        fetch('/api/requisitions')
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                requisitionData = data;
                if (!preserveCurrentPage) {
                    requisitionCurrentPage = 1;
                }
                renderRequisitions();
                if (typeof onLoaded === 'function') onLoaded();
            })
            .catch(function(error) {
                console.error('Failed to load requisitions:', error);
            });
    }

 function renderItemToggles(req) {
    if (!req.items || req.items.length === 0) {
        return '-';
    }
    
    var html = '<div class="space-y-1.5">';
    
    for (var i = 0; i < req.items.length; i++) {
        var item = req.items[i];
        var isConsumable = parseInt(item.is_consumable) === 1;
        var resolved = (parseInt(item.returned_quantity) || 0) + (parseInt(item.quantity_lost) || 0);
        var isFullyResolved = resolved >= parseInt(item.quantity);
        var label = isConsumable ? 'Consumable' : 'Returnable';
        
        html += '<div class="flex items-center justify-between gap-2">';
        html += '<span class="text-xs text-gray-700 dark:text-gray-300">' + app.escapeHtml(item.item) + ' <span class="text-gray-400">(x' + item.quantity + ')</span></span>';
        
        if (!isFullyResolved && (req.status === 'approved' || req.status === 'returned' || req.status === 'lost' || req.is_consumed)) {
            var toggleClass = isConsumable ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600';
            var knobClass = isConsumable ? 'translate-x-5' : 'translate-x-0';
            
            html += '<button type="button" class="toggle-consumable relative inline-flex h-5 w-10 items-center rounded-full transition-colors cursor-pointer ' + toggleClass + '" data-item-id="' + item.id + '" data-current="' + item.is_consumable + '" title="Toggle consumable/returnable">';
            html += '<span class="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ' + knobClass + '"></span>';
            html += '</button>';
        } else {
            var badgeClass = isConsumable ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
            html += '<span class="px-2 py-0.5 rounded-full text-xs font-medium ' + badgeClass + '">' + label + '</span>';
        }
        
        html += '</div>';
    }
    
    html += '</div>';
    return html;
}

    function renderItemSummary(req) {
        if (!req.items || req.items.length === 0) return '-';
        var parts = [];
        for (var i = 0; i < req.items.length; i++) {
            parts.push(app.escapeHtml(req.items[i].item) + ' <span class="text-gray-400">(x' + app.escapeHtml(req.items[i].quantity) + ')</span>');
        }
        return parts.join('<br>');
    }

    function findRequisition(id) {
        for (var i = 0; i < requisitionData.length; i++) {
            if (String(requisitionData[i].id) === String(id)) return requisitionData[i];
        }
        return null;
    }

    function openRequisitionDetails(id) {
        activeDetailsRequisitionId = id;
        renderRequisitionDetails();
        var modal = document.getElementById('requisitionDetailsModal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeRequisitionDetails() {
        var modal = document.getElementById('requisitionDetailsModal');
        if (!modal) return;
        var changedNote = modal.querySelector('.detail-general-note');
        if (changedNote && changedNote.value !== changedNote.defaultValue) {
                var subtitle = document.getElementById('requisitionDetailsSubtitle');
                if (subtitle) {
                    subtitle.textContent = 'Save or undo the edited general note before closing.';
                    subtitle.className = 'text-xs text-red-600 dark:text-red-400 mt-0.5';
                }
                changedNote.focus();
                return;
        }
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = '';
        activeDetailsRequisitionId = null;
    }

    function renderRequisitionDetails() {
        var req = findRequisition(activeDetailsRequisitionId);
        var content = document.getElementById('requisitionDetailsContent');
        var subtitle = document.getElementById('requisitionDetailsSubtitle');
        if (!req || !content) return;

        if (subtitle) {
            subtitle.textContent = req.name + ' • ' + req.date;
            subtitle.className = 'text-xs text-gray-500 dark:text-gray-400 mt-0.5';
        }

        var displayStatus = req.is_consumed ? 'consumed' : req.status;
        var html = '<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 text-sm">' +
            detailField('Name', req.name) + detailField('Request date', req.date) +
            detailField('Department', req.department) + detailField('Position', req.position) +
            detailField('Status', displayStatus) + detailField('Approved by', req.approved_by || '-') +
            detailField('Date returned', req.date_returned || '-') + detailField('Created at', req.created_at || '-') +
            '</div>';

        html += '<div class="mb-5"><label class="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">General note</label>' +
            '<textarea maxlength="2000" rows="3" class="detail-general-note w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">' + app.escapeHtml(req.note || '') + '</textarea>' +
            '<div class="flex items-center justify-between mt-2"><span class="detail-general-note-status text-xs text-gray-500" aria-live="polite"></span>' +
            '<button type="button" class="save-general-note px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Save note</button></div></div>';

        if (req.status === 'pending') {
            html += '<div class="flex gap-2 mb-5"><button type="button" class="detail-approve px-3 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg">Approve</button>' +
                '<button type="button" class="detail-reject px-3 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg">Reject</button></div>';
        }

        html += '<h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-2">Requisition items</h4><div class="space-y-3">';
        for (var i = 0; i < (req.items || []).length; i++) {
            var item = req.items[i];
            var isConsumable = parseInt(item.is_consumable) === 1;
            var toggleClass = isConsumable ? 'bg-amber-500' : 'bg-blue-500';
            var knobClass = isConsumable ? 'translate-x-5' : 'translate-x-0';
            var resolved = (parseInt(item.returned_quantity) || 0) + (parseInt(item.quantity_lost) || 0);
            var canToggle = resolved < parseInt(item.quantity) && (req.status === 'approved' || req.status === 'returned' || req.status === 'lost' || req.is_consumed);
            html += '<section class="rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">' +
                '<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">' +
                '<div><p class="text-sm font-semibold text-gray-900 dark:text-white">' + app.escapeHtml(item.item) + '</p>' +
                '<p class="text-xs text-gray-500 dark:text-gray-400">Requested: ' + app.escapeHtml(item.quantity) +
                ' • Returned: ' + app.escapeHtml(String(item.returned_quantity || 0)) + ' • Lost: ' + app.escapeHtml(String(item.quantity_lost || 0)) +
                ' • Received: ' + app.escapeHtml(item.date_received || '-') + ' • Added: ' + app.escapeHtml(item.created_at || '-') + '</p></div>' +
                '<div class="flex items-center gap-2"><span class="detail-type-label text-xs font-medium">' + (isConsumable ? 'Consumable' : 'Returnable') + '</span>' +
                (canToggle ? '<button type="button" class="detail-type-toggle relative inline-flex h-5 w-10 items-center rounded-full transition-colors ' + toggleClass + '" data-item-id="' + app.escapeHtml(item.id) + '" data-current="' + (isConsumable ? '1' : '0') + '" aria-label="Toggle consumable or returnable"><span class="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ' + knobClass + '"></span></button>' : '') + '</div></div>' +
                '</section>';
        }
        html += '</div>';
        content.innerHTML = html;

        var generalNote = content.querySelector('.detail-general-note');
        if (generalNote) generalNote.defaultValue = generalNote.value;

        var approve = content.querySelector('.detail-approve');
        var reject = content.querySelector('.detail-reject');
        if (approve) approve.addEventListener('click', function() { updateRequisitionStatus(req.id, 'approved'); });
        if (reject) reject.addEventListener('click', function() { updateRequisitionStatus(req.id, 'rejected'); });

        var toggles = content.querySelectorAll('.detail-type-toggle');
        for (var t = 0; t < toggles.length; t++) {
            toggles[t].addEventListener('click', function() { updateDetailItemType(this); });
        }
        var saveNoteButton = content.querySelector('.save-general-note');
        if (saveNoteButton) saveNoteButton.addEventListener('click', function() { saveGeneralNote(this); });
    }

    function detailField(label, value) {
        return '<div><p class="text-xs font-medium uppercase tracking-wide text-gray-400">' + app.escapeHtml(label) + '</p><p class="mt-1 text-gray-800 dark:text-gray-200 whitespace-pre-wrap">' + app.escapeHtml(value) + '</p></div>';
    }

    function updateDetailItemType(button) {
        if (button.disabled) return;
        var newValue = button.getAttribute('data-current') === '1' ? '0' : '1';
        var formData = new FormData();
        formData.append('item_id', button.getAttribute('data-item-id'));
        formData.append('is_consumable', newValue);
        button.disabled = true;
        button.classList.add('opacity-60');

        fetch('/api/requisitions/toggle-item', { method: 'POST', body: formData })
            .then(function(response) { return response.json(); })
            .then(function(data) {
                if (!data.success) throw new Error(data.message || 'Unable to update item type.');
                var req = findRequisition(activeDetailsRequisitionId);
                if (req) {
                    for (var i = 0; i < req.items.length; i++) {
                        if (String(req.items[i].id) === button.getAttribute('data-item-id')) req.items[i].is_consumable = newValue;
                    }
                }
                renderRequisitionDetails();
                loadRequisitions(function() {
                    if (activeDetailsRequisitionId) renderRequisitionDetails();
                }, true);
                loadApprovedRequisitions();
                loadRequisitionItems();
                window.dispatchEvent(new CustomEvent('refreshInventoryDisplay'));
                window.dispatchEvent(new CustomEvent('refreshApprovedRequisitions'));
            })
            .catch(function(error) {
                button.disabled = false;
                button.classList.remove('opacity-60');
                var label = button.parentElement.querySelector('.detail-type-label');
                if (label) label.textContent = error.message;
            });
    }

    function saveGeneralNote(button) {
        if (button.disabled) return;
        var content = document.getElementById('requisitionDetailsContent');
        var textarea = content ? content.querySelector('.detail-general-note') : null;
        var status = content ? content.querySelector('.detail-general-note-status') : null;
        if (!textarea) return;
        var formData = new FormData();
        formData.append('requisition_id', activeDetailsRequisitionId);
        formData.append('note', textarea.value.trim());
        button.disabled = true;
        button.textContent = 'Saving...';
        if (status) status.textContent = '';

        fetch('/api/requisitions/note', { method: 'POST', body: formData })
            .then(function(response) { return response.json(); })
            .then(function(data) {
                if (!data.success) throw new Error(data.message || 'Unable to save note.');
                textarea.value = data.note || '';
                textarea.defaultValue = textarea.value;
                var req = findRequisition(activeDetailsRequisitionId);
                if (req) req.note = textarea.value;
                if (status) {
                    status.textContent = 'Saved';
                    status.className = 'detail-general-note-status text-xs text-emerald-600 dark:text-emerald-400';
                }
            })
            .catch(function(error) {
                if (status) {
                    status.textContent = error.message;
                    status.className = 'detail-general-note-status text-xs text-red-600 dark:text-red-400';
                }
            })
            .then(function() {
                button.disabled = false;
                button.textContent = 'Save note';
            });
    }
    
    function renderRequisitions() {
    var searchInput = document.getElementById('requisitionSearch');
    var searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    
    var filteredData = requisitionData.filter(function(req) {
        var summary = req.item_summary || '';
        return req.name.toLowerCase().indexOf(searchTerm) !== -1 ||
               summary.toLowerCase().indexOf(searchTerm) !== -1;
    });
    
    // Sort data if a sort column is active
    if (currentSortColumn) {
        filteredData = sortData(filteredData, currentSortColumn, currentSortDirection);
    }
    
    var totalPages = Math.ceil(filteredData.length / historyItemsPerPage);
    var startIndex = (requisitionCurrentPage - 1) * historyItemsPerPage;
    var paginatedData = filteredData.slice(startIndex, startIndex + historyItemsPerPage);
    
    var tbody = document.getElementById('requisitionTableBody');
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
            var req = paginatedData[i];
            var statusClass = '';
           if (req.is_consumed) {
    statusClass = 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
} else if (req.status === 'pending') statusClass = 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
else if (req.status === 'approved') statusClass = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
else if (req.status === 'rejected') statusClass = 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300';
else if (req.status === 'returned') statusClass = 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
else if (req.status === 'lost') statusClass = 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300';
            
            var tr = document.createElement('tr');
            tr.className = 'requisition-history-row hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer';
            tr.setAttribute('tabindex', '0');
            tr.setAttribute('role', 'button');
            tr.setAttribute('aria-label', 'View requisition details for ' + req.name);
            
            var isSelected = !!selectedRequisitionIds[req.id];
            tr.innerHTML = '<td class="px-2 py-3 text-center"><input type="checkbox" class="requisition-select-checkbox h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" value="' + app.escapeHtml(req.id) + '" ' + (isSelected ? 'checked' : '') + ' aria-label="Select requisition"></td>' +
                '<td class="px-3 py-3 text-sm" data-label="Name">' + app.escapeHtml(req.name) + '</td>' +
                '<td class="px-3 py-3 text-sm text-gray-500" data-label="Date">' + app.escapeHtml(req.date) + '</td>' +
                '<td class="px-3 py-3 text-sm font-medium" data-label="Items">' + renderItemSummary(req) + '</td>' +
                '<td class="px-3 py-3 text-sm" data-label="Status"><span class="px-2 py-0.5 rounded-full text-xs font-medium ' + statusClass + '">' + app.escapeHtml(req.is_consumed ? 'consumed' : req.status) + '</span></td>';

            var selectionCheckbox = tr.querySelector('.requisition-select-checkbox');
            if (selectionCheckbox) {
                selectionCheckbox.addEventListener('click', function(e) { e.stopPropagation(); });
                selectionCheckbox.addEventListener('change', function() {
                    if (this.checked) {
                        selectedRequisitionIds[this.value] = true;
                    } else {
                        delete selectedRequisitionIds[this.value];
                    }
                    syncSelectAllRequisitions();
                });
            }

            (function(row, requisition) {
                row.addEventListener('click', function() { openRequisitionDetails(requisition.id); });
                row.addEventListener('keydown', function(e) {
                    if (e.target && e.target.classList.contains('requisition-select-checkbox')) return;
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openRequisitionDetails(requisition.id);
                    }
                });
            })(tr, req);
            
            fragment.appendChild(tr);
        }
        
        tbody.appendChild(fragment);
    }
    
    app.renderPagination('requisitionPagination', totalPages, requisitionCurrentPage, function(page) {
        requisitionCurrentPage = page;
        renderRequisitions();
    });
    
    // Update sort indicators after rendering
    updateSortIndicators();
    syncSelectAllRequisitions();
}

    function syncSelectAllRequisitions() {
        var selectAll = document.getElementById('selectAllRequisitions');
        var visibleCheckboxes = document.querySelectorAll('.requisition-select-checkbox');
        if (!selectAll) {
            return;
        }
        if (visibleCheckboxes.length === 0) {
            selectAll.checked = false;
            selectAll.indeterminate = false;
            return;
        }
        var selectedCount = 0;
        for (var i = 0; i < visibleCheckboxes.length; i++) {
            if (visibleCheckboxes[i].checked) {
                selectedCount++;
            }
        }
        selectAll.checked = selectedCount === visibleCheckboxes.length;
        selectAll.indeterminate = selectedCount > 0 && selectedCount < visibleCheckboxes.length;
    }
    
    function updateRequisitionStatus(id, status) {
        var actionText = status === 'approved' ? 'approve' : 'reject';
        
        app.confirmDialog('Are you sure?', 'You want to ' + actionText + ' this requisition?', 'question', 'Yes, ' + actionText + ' it!', status === 'approved' ? '#10b981' : '#ef4444')
            .then(function(result) {
                if (result.isConfirmed) {
                    var formData = new FormData();
                    formData.append('id', id);
                    formData.append('status', status);
                    
                    fetch('/api/requisitions/status', {
                        method: 'POST',
                        body: formData
                    })
                    .then(function(response) {
                        return response.json();
                    })
                    .then(function(data) {
                        if (data.success) {
                            if (String(activeDetailsRequisitionId) === String(id)) closeRequisitionDetails();
                            loadRequisitions();
                            if (status === 'approved') {
                                window.dispatchEvent(new CustomEvent('refreshInventoryDisplay'));
                                loadApprovedRequisitions();
                            }
                            loadRequisitionItems();
                            app.showAlert('success', 'Updated!', 'Requisition ' + status + ' successfully!');
                        } else {
                            app.showAlert('error', 'Error', data.message || 'Operation failed');
                        }
                    });
                }
            });
    }

    function toggleItemConsumable(button) {
    var itemId = button.getAttribute('data-item-id');
    var current = button.getAttribute('data-current');
    var newValue = current === '1' ? '0' : '1';
    var actionText = newValue === '1' ? 'consumable' : 'returnable';
    
    app.confirmDialog(
        'Change item type?',
        'Convert this item to ' + actionText + '?',
        'question',
        'Yes, convert it!',
        '#f59e0b'
    ).then(function(result) {
        if (result.isConfirmed) {
            var formData = new FormData();
            formData.append('item_id', itemId);
            formData.append('is_consumable', newValue);
            
            fetch('/api/requisitions/toggle-item', {
                method: 'POST',
                body: formData
            })
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                if (data.success) {
                    loadRequisitions();
                    loadApprovedRequisitions();
                    loadRequisitionItems();
                    window.dispatchEvent(new CustomEvent('refreshInventoryDisplay'));
                    window.dispatchEvent(new CustomEvent('refreshApprovedRequisitions'));
                    app.showAlert('success', 'Updated!', 'Item converted to ' + actionText + ' successfully!');
                } else {
                    app.showAlert('error', 'Error', data.message || 'Operation failed');
                }
            });
        }
    });
}
    
    function loadRequisitionItems() {
        fetch('/api/inventory')
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                window.inventoryItems = data;
            })
            .catch(function(error) {
                console.error('Failed to load requisition items:', error);
            });
    }
    
    function loadApprovedRequisitions() {
        if (!window.isAdmin) {
            return;
        }
        
        fetch('/api/requisitions/approved')
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                window.approvedRequisitions = data;
            })
            .catch(function(error) {
                console.error('Failed to load approved requisitions:', error);
            });
    }
    
    function exportRequisitionsCSV() {
    var searchInput = document.getElementById('requisitionSearch');
    var searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    
    var filteredData = requisitionData.filter(function(req) {
        var summary = req.item_summary || '';
        return req.name.toLowerCase().indexOf(searchTerm) !== -1 ||
               summary.toLowerCase().indexOf(searchTerm) !== -1;
    });
    
    if (currentSortColumn) {
        filteredData = sortData(filteredData, currentSortColumn, currentSortDirection);
    }
    
    var csv = 'Name,Date,Department,Position,Items,Note,Date Returned,Status,Approved By\n';
    
    for (var i = 0; i < filteredData.length; i++) {
        var req = filteredData[i];
        var displayStatus = req.is_consumed ? 'consumed' : req.status;
        
        csv += app.escapeCSV(req.name) + ',' +
            app.escapeCSV(req.date) + ',' +
            app.escapeCSV(req.department) + ',' +
            app.escapeCSV(req.position) + ',' +
            app.escapeCSV(req.item_summary || '') + ',' +
            app.escapeCSV(req.note || '') + ',' +
            app.escapeCSV(req.date_returned || '') + ',' +
            app.escapeCSV(displayStatus) + ',' +
            app.escapeCSV(req.approved_by || '') + '\n';
    }
    
    app.downloadCSV(csv, 'requisitions');
}

    function showRequisitionReportModal() {
        var today = new Date().toISOString().split('T')[0];
        var firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
        var selectedIds = Object.keys(selectedRequisitionIds);
        var selectedOption = selectedIds.length > 0
            ? '<label style="color:#374151;cursor:pointer;font-size:14px;"><input type="radio" name="reportSource" value="selected"> Selected requisitions (' + selectedIds.length + ')</label>'
            : '<p style="color:#6b7280;font-size:13px;line-height:1.35;margin:0;">Select requisitions from the history table to enable selected-record reporting.</p>';

        Swal.fire({
            title: 'Generate Requisition Report',
            icon: 'question',
            width: '560px',
            padding: '1.25rem',
            heightAuto: false,
            showCancelButton: true,
            confirmButtonColor: '#2563eb',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Generate Report',
            html: '<div style="color:#374151;text-align:left;">' +
                '<p style="color:#4b5563;font-size:14px;line-height:1.4;margin:0 0 14px;">Choose the report source and enter the name of the person who prepared the report.</p>' +
                '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px;">' +
                '<label style="color:#374151;cursor:pointer;font-size:14px;"><input type="radio" name="reportSource" value="date" checked> Date range</label>' + selectedOption + '</div>' +
                '<div id="reportDateRange" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px;">' +
                '<div><label for="reportFromDate" style="color:#374151;display:block;font-size:14px;font-weight:600;margin-bottom:5px;">From date</label>' +
                '<input id="reportFromDate" type="date" value="' + firstDay + '" max="' + today + '" class="swal2-input" style="color:#111827;margin:0;width:100%;"></div>' +
                '<div><label for="reportToDate" style="color:#374151;display:block;font-size:14px;font-weight:600;margin-bottom:5px;">To date</label>' +
                '<input id="reportToDate" type="date" value="' + today + '" max="' + today + '" class="swal2-input" style="color:#111827;margin:0;width:100%;"></div></div>' +
                '<div><label for="reportPreparedBy" style="color:#374151;display:block;font-size:14px;font-weight:600;margin-bottom:5px;">Prepared By</label>' +
                '<input id="reportPreparedBy" type="text" class="swal2-input" style="color:#111827;margin:0;width:100%;" maxlength="100"></div>' +
            '</div>',
            didOpen: function(popup) {
                prepareCompactSweetAlert(popup);
                var dateRange = document.getElementById('reportDateRange');
                var sourceOptions = document.querySelectorAll('input[name="reportSource"]');
                var updateSource = function() {
                    var selectedSource = document.querySelector('input[name="reportSource"]:checked').value;
                    dateRange.style.display = selectedSource === 'selected' ? 'none' : 'grid';
                };
                for (var i = 0; i < sourceOptions.length; i++) {
                    sourceOptions[i].addEventListener('change', updateSource);
                }
                updateSource();
            },
            preConfirm: function() {
                var source = document.querySelector('input[name="reportSource"]:checked').value;
                var fromDate = document.getElementById('reportFromDate').value;
                var toDate = document.getElementById('reportToDate').value;
                var preparedBy = document.getElementById('reportPreparedBy').value.trim();

                if (source === 'date' && (!fromDate || !toDate || fromDate > toDate)) {
                    Swal.showValidationMessage('Please choose a valid date range.');
                    return false;
                }
                if (!preparedBy) {
                    Swal.showValidationMessage('Please enter the Prepared By name.');
                    return false;
                }
                return { source: source, fromDate: fromDate, toDate: toDate, preparedBy: preparedBy };
            }
        }).then(function(result) {
            if (!result.isConfirmed || !result.value) {
                return;
            }
            var params = new URLSearchParams({ prepared_by: result.value.preparedBy });
            if (result.value.source === 'selected') {
                params.set('ids', Object.keys(selectedRequisitionIds).join(','));
            } else {
                params.set('from_date', result.value.fromDate);
                params.set('to_date', result.value.toDate);
            }
            window.location.href = '/api/requisitions/report?' + params.toString();
        });
    }

    function prepareCompactSweetAlert(popup) {
        var htmlContainer = popup.querySelector('.swal2-html-container');
        popup.style.maxHeight = 'none';
        popup.style.overflow = 'visible';
        if (htmlContainer) {
            htmlContainer.style.maxHeight = 'none';
            htmlContainer.style.overflow = 'visible';
            htmlContainer.style.margin = '0.75rem 0 0';
        }
    }
    
   function clearRequisitions() {
    Swal.fire({
        title: 'Clear Requisition History?',
        icon: 'warning',
        width: '440px',
        padding: '1.25rem',
        heightAuto: false,
        showCancelButton: true,
        confirmButtonText: 'Clear Selected',
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        html: '<div style="color:#374151;text-align:left;">' +
            '<p style="color:#4b5563;font-size:14px;line-height:1.4;margin:0 0 14px;">Select which type of records to clear. This cannot be undone.</p>' +
            '<label for="clearTypeSelect" style="color:#374151;display:block;font-size:14px;font-weight:600;margin-bottom:5px;">Requisition type</label>' +
            '<select id="clearTypeSelect" class="swal2-select" style="color:#111827;margin:0;width:100%;">' +
                '<option value="">Select type...</option>' +
                '<option value="returned">Returned</option>' +
                '<option value="consumed">Consumed</option>' +
            '</select></div>',
        didOpen: prepareCompactSweetAlert,
        preConfirm: function() {
            var selectedType = document.getElementById('clearTypeSelect').value;
            if (!selectedType) {
                Swal.showValidationMessage('Please select a type.');
                return false;
            }
            return selectedType;
        }
    }).then(function(result) {
        if (result.isConfirmed) {
            var selectedType = result.value;
            
            var formData = new FormData();
            formData.append('type', selectedType);
            
            fetch('/api/requisitions/clear-by-type', {
                method: 'POST',
                body: formData
            })
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                if (data.success) {
                    requisitionData = [];
                    requisitionCurrentPage = 1;
                    currentSortColumn = null;
                    currentSortDirection = 'asc';
                    loadRequisitions();
                    loadApprovedRequisitions();
                    loadRequisitionItems();
                    window.dispatchEvent(new CustomEvent('refreshInventoryDisplay'));
                    window.dispatchEvent(new CustomEvent('refreshApprovedRequisitions'));
                    app.showAlert('success', 'Cleared!', 'Selected records have been deleted.');
                } else {
                    app.showAlert('error', 'Error', data.message || 'Operation failed');
                }
            });
        }
    });
}
    
    app.destroyRequisition = function() {
        eventHandlers.forEach(function(config, key) {
            if (config && config.element) {
                if (config.useCapture) {
                    config.element.removeEventListener(config.type, config.handler, true);
                } else {
                    config.element.removeEventListener(config.type, config.handler);
                }
            }
        });
        eventHandlers.clear();
        
        requisitionData = [];
        requisitionCurrentPage = 1;
        currentSortColumn = null;
        currentSortDirection = 'asc';
        selectedRequisitionIds = {};
    };
    
})(window.InventoryApp);
