<?php
// Variables available: $isAdmin
?>
<?php if ($isAdmin): ?>
<div id="usersSection" style="display: none;">
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
            <div>
                <h2 class="text-sm font-semibold text-gray-900 dark:text-white">Users</h2>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Manage system accounts</p>
            </div>
            <div class="flex flex-col xs:flex-row xs:items-center sm:justify-end gap-2 w-full sm:w-auto sm:ml-auto">
                <div class="relative w-full xs:w-40 sm:w-48">
                    <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 xs:h-4 xs:w-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    <input type="text" id="userSearch" placeholder="Search..." class="w-full pl-8 xs:pl-9 pr-3 py-1.5 xs:py-2 text-xs xs:text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all">
                </div>
                <button id="backupSqlBtn" type="button" class="w-full xs:w-auto px-3 xs:px-4 py-1.5 xs:py-2 text-xs xs:text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-800 transition-all cursor-pointer shadow-sm">
                    <span class="inline-flex items-center justify-center gap-1.5">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M8 12l4 4m0 0l4-4m-4 4V4"></path></svg>
                        Backup SQL
                    </span>
                </button>
                <button id="addUserBtn" class="w-full xs:w-auto px-3 xs:px-4 py-1.5 xs:py-2 text-xs xs:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all cursor-pointer shadow-sm">
                    <span class="hidden xs:inline">+ Create Account</span>
                    <span class="xs:hidden">+ Add User</span>
                </button>
            </div>
        </div>
        <div id="backupSqlStatus" class="hidden px-4 sm:px-5 py-2 text-xs border-t border-gray-100 dark:border-gray-800" role="status" aria-live="polite"></div>
        <div class="w-full xs:w-auto">
            <div class="overflow-x-auto">
                <table class="w-full">
             <thead class="bg-gray-50 dark:bg-gray-800/60">
    <tr class="border-b border-gray-100 dark:border-gray-800">
        <th id="sortUserUsername" class="px-2 xs:px-3 py-2 xs:py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Username <span class="sort-arrow"></span>
        </th>
        <th id="sortUserName" class="px-2 xs:px-3 py-2 xs:py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden xs:table-cell hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Name <span class="sort-arrow"></span>
        </th>
        <th id="sortUserRole" class="px-2 xs:px-3 py-2 xs:py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Role <span class="sort-arrow"></span>
        </th>
        <th id="sortUserCreated" class="px-2 xs:px-3 py-2 xs:py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Created <span class="sort-arrow"></span>
        </th>
        <th class="px-2 xs:px-3 py-2 xs:py-2.5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
    </tr>
</thead>
                    <tbody id="userTableBody" class="divide-y divide-gray-50 dark:divide-gray-800"></tbody>
                </table>
            </div>
            <nav class="mt-4">
                <ul class="flex justify-center gap-1" id="userPagination"></ul>
            </nav>
        </div>
    </div>
</div>
<?php endif; ?>
