<?php
// Variables available: $isAdmin
?>
<?php if ($isAdmin): ?>
<div id="addUserModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 hidden p-3 xs:p-4">
    <div class="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-sm xs:max-w-md border border-gray-200 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
        
        <div class="flex justify-between items-center px-3 xs:px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 rounded-t-xl">
            <h5 class="text-sm xs:text-base font-semibold text-gray-900 dark:text-white">Create Account</h5>
            <button class="modal-close p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer">
                <svg class="w-4 h-4 xs:w-5 xs:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
        
        
        <div class="p-3 xs:p-4 sm:p-5">
            <form id="addUserForm">
                <div class="mb-3 xs:mb-4">
                    <label for="newUsername" class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Username *</label>
                    <input type="text" id="newUsername" class="w-full px-3 py-1.5 xs:py-2 text-xs xs:text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" required>
                </div>
                
                <div class="mb-3 xs:mb-4">
                    <label for="newPassword" class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Password *</label>
                    <input type="password" id="newPassword" class="w-full px-3 py-1.5 xs:py-2 text-xs xs:text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" required>
                </div>
                
                <div class="mb-3 xs:mb-4">
                    <label for="newName" class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Full Name *</label>
                    <input type="text" id="newName" class="w-full px-3 py-1.5 xs:py-2 text-xs xs:text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" required>
                </div>
                
                <div class="mb-3 xs:mb-4">
                    <label for="newRole" class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Role *</label>
                    <select id="newRole" class="w-full px-3 py-1.5 xs:py-2 text-xs xs:text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" required>
                        <option value="employee">Employee</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                
                <button type="submit" class="w-full px-4 py-2 xs:py-2.5 text-xs xs:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-all cursor-pointer shadow-sm">
                    Create Account
                </button>
            </form>
        </div>
    </div>
</div>
<?php endif; ?>