<?php
// Variables available: $isAdmin
?>
<div id="inventorySection">
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        
        <div class="flex flex-col sm:flex-row sm:items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
            <div class="relative w-full sm:max-w-xs flex-1">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <input type="text" id="inventorySearch" placeholder="Search items..." class="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all">
            </div>
            <?php if ($isAdmin): ?>
            <div class="flex gap-2 sm:ml-auto">
                <button id="exportInventoryBtn" class="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-700 transition-colors cursor-pointer">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    <span>Export</span>
                </button>
                <button id="addInventoryBtn" class="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer shadow-sm">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                    <span>Add Item</span>
                </button>
            </div>
            <?php endif; ?>
        </div>
        
        
        <div>
            <div class="overflow-x-auto">
                <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-800/60">
    <tr class="border-b border-gray-200 dark:border-gray-800">
        <th id="sortItem" class="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer select-none hover:text-gray-900 dark:hover:text-white transition-colors">
            Item <span class="sort-arrow"></span>
        </th>
        <th id="sortCategory" class="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden xs:table-cell cursor-pointer select-none hover:text-gray-900 dark:hover:text-white transition-colors">
            Category <span class="sort-arrow"></span>
        </th>
        <th id="sortQty" class="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer select-none hover:text-gray-900 dark:hover:text-white transition-colors">
            Qty <span class="sort-arrow"></span>
        </th>
        <th id="sortType" class="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell cursor-pointer select-none hover:text-gray-900 dark:hover:text-white transition-colors">
            Type <span class="sort-arrow"></span>
        </th>
        <th id="sortAdded" class="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell cursor-pointer select-none hover:text-gray-900 dark:hover:text-white transition-colors">
            Added <span class="sort-arrow"></span>
        </th>
        <?php if ($isAdmin): ?>
        <th class="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
        <?php endif; ?>
    </tr>
</thead>
                    <tbody id="inventoryTableBody" class="divide-y divide-gray-100 dark:divide-gray-800"></tbody>
                </table>
            </div>
            
            
            <nav class="px-4 py-3 border-t border-gray-200 dark:border-gray-800">
                <ul class="flex justify-center gap-1" id="inventoryPagination"></ul>
            </nav>
        </div>
    </div>
</div>