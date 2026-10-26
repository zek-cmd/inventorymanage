window.InventoryApp = window.InventoryApp || {};

(function(app) {
    'use strict';
    
    var userData = [];
    var userCurrentPage = 1;
    var usersPerPage = 10;
    var eventHandlers = new Map();
    var currentSortColumn = null;
    var currentSortDirection = 'asc';
    
    app.initUsers = function() {
        if (!window.isAdmin) {
            return;
        }
        
        app.destroyUsers();
        
        loadUsers();
        
        var addUserBtn = document.getElementById('addUserBtn');
        if (addUserBtn) {
            var addBtnHandler = function() {
                var modal = document.getElementById('addUserModal');
                if (modal) {
                    modal.classList.remove('hidden');
                }
            };
            addUserBtn.addEventListener('click', addBtnHandler);
            eventHandlers.set('addUserBtn', { element: addUserBtn, type: 'click', handler: addBtnHandler });
        }

        var backupSqlBtn = document.getElementById('backupSqlBtn');
        if (backupSqlBtn) {
            var backupHandler = function() { downloadSqlBackup(backupSqlBtn); };
            backupSqlBtn.addEventListener('click', backupHandler);
            eventHandlers.set('backupSqlBtn', { element: backupSqlBtn, type: 'click', handler: backupHandler });
        }
        
        var userSearch = document.getElementById('userSearch');
        if (userSearch) {
            var searchHandler = function() {
                userCurrentPage = 1;
                renderUsers();
            };
            userSearch.addEventListener('input', searchHandler);
            eventHandlers.set('userSearch', { element: userSearch, type: 'input', handler: searchHandler });
        }
        
        var addUserForm = document.getElementById('addUserForm');
        if (addUserForm) {
            var addFormHandler = function(e) {
                e.preventDefault();
                addUser();
            };
            addUserForm.addEventListener('submit', addFormHandler);
            eventHandlers.set('addUserForm', { element: addUserForm, type: 'submit', handler: addFormHandler });
        }
        
        var editUserForm = document.getElementById('editUserForm');
        if (editUserForm) {
            var editFormHandler = function(e) {
                e.preventDefault();
                updateUser();
            };
            editUserForm.addEventListener('submit', editFormHandler);
            eventHandlers.set('editUserForm', { element: editUserForm, type: 'submit', handler: editFormHandler });
        }

        // Add sort listeners to table headers
        addSortListeners();
    };

    function backupFilename() {
        var now = new Date();
        var pad = function(value) { return String(value).padStart(2, '0'); };
        return 'inventory_backup_' + now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate()) + '_' +
            pad(now.getHours()) + pad(now.getMinutes()) + pad(now.getSeconds()) + '.sql';
    }

    async function downloadSqlBackup(button) {
        if (button.disabled) return;
        var status = document.getElementById('backupSqlStatus');
        var originalContent = button.innerHTML;
        var filename = backupFilename();
        var fileHandle = null;

        try {
            if (window.showSaveFilePicker) {
                fileHandle = await window.showSaveFilePicker({
                    suggestedName: filename,
                    types: [{ description: 'SQL backup', accept: { 'application/sql': ['.sql'] } }]
                });
            }

            button.disabled = true;
            button.textContent = 'Preparing...';
            showBackupStatus(status, 'Preparing the inventory SQL backup...', false);

            var response = await fetch('/api/backup/sql', { credentials: 'same-origin' });
            if (!response.ok) throw new Error('The backup could not be generated.');
            var blob = await response.blob();

            if (fileHandle) {
                var writable = await fileHandle.createWritable();
                await writable.write(blob);
                await writable.close();
            } else {
                var url = URL.createObjectURL(blob);
                var link = document.createElement('a');
                link.href = url;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                link.remove();
                setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
            }

            showBackupStatus(status, 'SQL backup saved successfully.', false, true);
        } catch (error) {
            if (error && error.name === 'AbortError') {
                showBackupStatus(status, 'Backup cancelled.', false);
            } else {
                showBackupStatus(status, error.message || 'The backup could not be saved.', true);
            }
        } finally {
            button.disabled = false;
            button.innerHTML = originalContent;
        }
    }

    function showBackupStatus(element, message, isError, isSuccess) {
        if (!element) return;
        element.textContent = message;
        element.className = 'px-4 sm:px-5 py-2 text-xs border-t border-gray-100 dark:border-gray-800 ' +
            (isError ? 'text-red-600 dark:text-red-400' : (isSuccess ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'));
    }
    
    function sortData(data, column, direction) {
        return data.slice().sort(function(a, b) {
            var valueA, valueB;
            
            switch(column) {
                case 'username':
                    valueA = (a.username || '').toLowerCase();
                    valueB = (b.username || '').toLowerCase();
                    break;
                case 'name':
                    valueA = (a.name || '').toLowerCase();
                    valueB = (b.name || '').toLowerCase();
                    break;
                case 'role':
                    valueA = (a.role || '').toLowerCase();
                    valueB = (b.role || '').toLowerCase();
                    break;
                case 'created_at':
                    valueA = a.created_at || '';
                    valueB = b.created_at || '';
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
            { id: 'sortUserUsername', column: 'username' },
            { id: 'sortUserName', column: 'name' },
            { id: 'sortUserRole', column: 'role' },
            { id: 'sortUserCreated', column: 'created_at' }
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
                        
                        userCurrentPage = 1;
                        renderUsers();
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
        var allHeaders = document.querySelectorAll('#usersSection [id^="sortUser"]');
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
                'username': 'sortUserUsername',
                'name': 'sortUserName',
                'role': 'sortUserRole',
                'created_at': 'sortUserCreated'
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
    
    function loadUsers() {
        if (!window.isAdmin) {
            return;
        }
        
        fetch('/api/users')
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                userData = data;
                userCurrentPage = 1;
                renderUsers();
            })
            .catch(function(error) {
                console.error('Failed to load users:', error);
            });
    }
    
    function renderUsers() {
        var searchInput = document.getElementById('userSearch');
        var searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        
        var filteredData = userData.filter(function(user) {
            return user.username.toLowerCase().indexOf(searchTerm) !== -1 ||
                   user.name.toLowerCase().indexOf(searchTerm) !== -1 ||
                   user.role.toLowerCase().indexOf(searchTerm) !== -1;
        });
        
        // Sort data if a sort column is active
        if (currentSortColumn) {
            filteredData = sortData(filteredData, currentSortColumn, currentSortDirection);
        }
        
        var totalPages = Math.ceil(filteredData.length / usersPerPage);
        var startIndex = (userCurrentPage - 1) * usersPerPage;
        var paginatedData = filteredData.slice(startIndex, startIndex + usersPerPage);
        
        var tbody = document.getElementById('userTableBody');
        if (!tbody) {
            return;
        }
        
        while (tbody.firstChild) {
            tbody.removeChild(tbody.firstChild);
        }
        
        if (paginatedData.length === 0) {
            var emptyTr = document.createElement('tr');
            emptyTr.innerHTML = '<td colspan="5" class="px-3 py-4 text-sm text-center text-gray-500">No users found</td>';
            tbody.appendChild(emptyTr);
        } else {
            var fragment = document.createDocumentFragment();
            
            for (var i = 0; i < paginatedData.length; i++) {
                var user = paginatedData[i];
                var roleClass = user.role === 'admin' ? 
                    'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 
                    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
                
                var tr = document.createElement('tr');
                tr.className = 'hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors';
                tr.innerHTML = '<td class="px-3 py-3 text-sm" data-label="Username">' + app.escapeHtml(user.username) + '</td>' +
                    '<td class="px-3 py-3 text-sm" data-label="Name">' + app.escapeHtml(user.name) + '</td>' +
                    '<td class="px-3 py-3 text-sm" data-label="Role"><span class="px-2 py-0.5 rounded-full text-xs font-medium ' + roleClass + '">' + app.escapeHtml(user.role) + '</span></td>' +
                    '<td class="px-3 py-3 text-sm text-gray-500" data-label="Created At">' + app.escapeHtml(user.created_at || '-') + '</td>' +
                    '<td class="px-3 py-3 text-sm text-right" data-label="Actions">' +
                    '<button class="p-1.5 rounded-md text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-all cursor-pointer edit-user-btn" data-id="' + user.id + '" title="Edit">' +
                    '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>' +
                    '</button>' +
                    '<button class="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer delete-user-btn" data-id="' + user.id + '" title="Delete">' +
                    '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>' +
                    '</button>' +
                    '</td>';
                
                var editBtn = tr.querySelector('.edit-user-btn');
                var deleteBtn = tr.querySelector('.delete-user-btn');
                
                if (editBtn) {
                    (function(userId) {
                        editBtn.addEventListener('click', function() {
                            editUser(userId);
                        });
                    })(user.id);
                }
                
                if (deleteBtn) {
                    (function(userId) {
                        deleteBtn.addEventListener('click', function() {
                            deleteUser(userId);
                        });
                    })(user.id);
                }
                
                fragment.appendChild(tr);
            }
            
            tbody.appendChild(fragment);
        }
        
        app.renderPagination('userPagination', totalPages, userCurrentPage, function(page) {
            userCurrentPage = page;
            renderUsers();
        });
        
        // Update sort indicators after rendering
        updateSortIndicators();
    }
    
    function addUser() {
        var newUsername = document.getElementById('newUsername');
        var newPassword = document.getElementById('newPassword');
        var newName = document.getElementById('newName');
        var newRole = document.getElementById('newRole');
        
        var formData = new FormData();
        formData.append('username', newUsername ? newUsername.value : '');
        formData.append('password', newPassword ? newPassword.value : '');
        formData.append('name', newName ? newName.value : '');
        formData.append('role', newRole ? newRole.value : '');
        
        fetch('/api/users/add', {
            method: 'POST',
            body: formData
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            if (data.success) {
                var modal = document.getElementById('addUserModal');
                var form = document.getElementById('addUserForm');
                
                if (modal) modal.classList.add('hidden');
                if (form) form.reset();
                
                loadUsers();
                app.showAlert('success', 'Success', 'User created successfully!');
            } else {
                app.showAlert('error', 'Error', data.message || 'Failed to create user');
            }
        })
        .catch(function(error) {
            console.error('Failed to add user:', error);
        });
    }
    
    function editUser(id) {
        fetch('/api/users/get?id=' + id)
            .then(function(response) {
                return response.json();
            })
            .then(function(user) {
                var editUserId = document.getElementById('editUserId');
                var editUsername = document.getElementById('editUsername');
                var editPassword = document.getElementById('editPassword');
                var editName = document.getElementById('editName');
                var editRole = document.getElementById('editRole');
                
                if (editUserId) editUserId.value = user.id;
                if (editUsername) editUsername.value = user.username;
                if (editPassword) editPassword.value = '';
                if (editName) editName.value = user.name;
                if (editRole) editRole.value = user.role;
                
                var modal = document.getElementById('editUserModal');
                if (modal) modal.classList.remove('hidden');
            })
            .catch(function(error) {
                console.error('Failed to edit user:', error);
            });
    }
    
    function updateUser() {
        var editUserId = document.getElementById('editUserId');
        var editUsername = document.getElementById('editUsername');
        var editPassword = document.getElementById('editPassword');
        var editName = document.getElementById('editName');
        var editRole = document.getElementById('editRole');
        
        var formData = new FormData();
        formData.append('id', editUserId ? editUserId.value : '');
        formData.append('username', editUsername ? editUsername.value : '');
        formData.append('name', editName ? editName.value : '');
        formData.append('role', editRole ? editRole.value : '');
        
        var password = editPassword ? editPassword.value : '';
        if (password) {
            formData.append('password', password);
        }
        
        fetch('/api/users/update', {
            method: 'POST',
            body: formData
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            if (data.success) {
                var modal = document.getElementById('editUserModal');
                if (modal) modal.classList.add('hidden');
                
                loadUsers();
                app.showAlert('success', 'Success', 'User updated successfully!');
            } else {
                app.showAlert('error', 'Error', data.message || 'Failed to update user');
            }
        })
        .catch(function(error) {
            console.error('Failed to update user:', error);
        });
    }
    
    function deleteUser(id) {
        app.confirmDialog('Are you sure?', "You won't be able to revert this!").then(function(result) {
            if (result.isConfirmed) {
                var formData = new FormData();
                formData.append('id', id);
                
                fetch('/api/users/delete', {
                    method: 'POST',
                    body: formData
                })
                .then(function(response) {
                    return response.json();
                })
                .then(function(data) {
                    if (data.success) {
                        loadUsers();
                        app.showAlert('success', 'Deleted!', 'User has been deleted.');
                    } else {
                        app.showAlert('error', 'Error', data.message || 'Failed to delete user');
                    }
                });
            }
        });
    }
    
    app.destroyUsers = function() {
        eventHandlers.forEach(function(config, key) {
            if (config && config.element) {
                config.element.removeEventListener(config.type, config.handler);
            }
        });
        eventHandlers.clear();
        
        userData = [];
        userCurrentPage = 1;
        currentSortColumn = null;
        currentSortDirection = 'asc';
    };
    
})(window.InventoryApp);
