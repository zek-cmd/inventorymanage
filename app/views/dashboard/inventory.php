<?php
// Variables available: $isAdmin
?>
<div id="inventorySection">
    <div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        
        <div class="flex flex-col sm:flex-row flex-wrap justify-between items-start sm:items-center gap-3 px-3 xs:px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 dark:border-gray-800">
            <div>
                <h5 class="text-sm xs:text-base font-semibold text-gray-900 dark:text-white">Inventory</h5>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 hidden xs:block">Manage your stock items</p>
            </div>
            <div class="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
                <div class="relative w-full xs:w-40 sm:w-48 md:w-56">
                    <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 xs:h-4 xs:w-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    <input type="text" id="inventorySearch" placeholder="Search items..." class="w-full pl-8 xs:pl-9 pr-3 py-1.5 xs:py-2 text-xs xs:text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all">
                </div>
                <?php if ($isAdmin): ?>
                <div class="flex gap-2">
                    <button id="exportInventoryBtn" class="flex-1 xs:flex-none px-3 py-1.5 xs:py-2 text-xs xs:text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all cursor-pointer border border-gray-200 dark:border-gray-700">
                        <span class="hidden xs:inline">Export</span>
                        <svg class="xs:hidden w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                    </button>
                    <button id="addInventoryBtn" class="flex-1 xs:flex-none px-3 xs:px-4 py-1.5 xs:py-2 text-xs xs:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all cursor-pointer shadow-sm">
                        <span class="hidden xs:inline">+ Add Item</span>
                        <span class="xs:hidden">+ Add</span>
                    </button>
                </div>
                <?php endif; ?>
            </div>
        </div>
        
        
        <div class="p-3 xs:p-4 sm:p-5">
            <div class="overflow-x-auto">
                <table class="w-full">
            <thead>
    <tr class="border-b border-gray-100 dark:border-gray-800">
        <th id="sortItem" class="px-2 xs:px-3 py-2 xs:py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-tl-lg">
            Item <span class="sort-arrow"></span>
        </th>
        <th id="sortCategory" class="px-2 xs:px-3 py-2 xs:py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden xs:table-cell hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Category <span class="sort-arrow"></span>
        </th>
        <th id="sortQty" class="px-2 xs:px-3 py-2 xs:py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Qty <span class="sort-arrow"></span>
        </th>
        <th id="sortType" class="px-2 xs:px-3 py-2 xs:py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Type <span class="sort-arrow"></span>
        </th>
        <th id="sortAdded" class="px-2 xs:px-3 py-2 xs:py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Added <span class="sort-arrow"></span>
        </th>
        <?php if ($isAdmin): ?>
        <th class="px-2 xs:px-3 py-2 xs:py-2.5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider rounded-tr-lg">Actions</th>
        <?php endif; ?>
    </tr>
</thead>
                    <tbody id="inventoryTableBody" class="divide-y divide-gray-50 dark:divide-gray-800"></tbody>
                </table>
            </div>
            
            
            <nav class="mt-4">
                <ul class="flex justify-center gap-1" id="inventoryPagination"></ul>
            </nav>
        </div>
    </div>
</div>