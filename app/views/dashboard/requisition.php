<?php
// Variables available: $isAdmin
?>
<div id="requisitionSection" style="display: none;">
    
    <div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden mb-4 sm:mb-6">
        <div class="px-3 xs:px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 dark:border-gray-800">
            <h5 class="text-sm xs:text-base font-semibold text-gray-900 dark:text-white">New Requisition</h5>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 hidden xs:block">Submit a new item request</p>
        </div>
        <div class="p-3 xs:p-4 sm:p-5">
            <form id="requisitionForm">
                <div class="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
                    <div>
                        <label for="reqName" class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Name *</label>
                        <input type="text" id="reqName" class="w-full px-3 py-1.5 xs:py-2 text-xs xs:text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" required>
                    </div>
                    <div>
                        <label for="reqDate" class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Date *</label>
                        <input type="date" id="reqDate" class="w-full px-3 py-1.5 xs:py-2 text-xs xs:text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" required>
                    </div>
                    <div>
                        <label for="reqDepartment" class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Department *</label>
                        <input type="text" id="reqDepartment" class="w-full px-3 py-1.5 xs:py-2 text-xs xs:text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" required>
                    </div>
                    <div>
                        <label for="reqPosition" class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Position *</label>
                        <input type="text" id="reqPosition" class="w-full px-3 py-1.5 xs:py-2 text-xs xs:text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" required>
                    </div>
                </div>
    
                <div class="mb-4">
                    <div class="flex items-center justify-between mb-2">
                        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400">Items *</label>
                        <button type="button" id="addItemRow" class="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer flex items-center gap-1">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                            Add Item
                        </button>
                    </div>
                    <div id="requisitionItems" class="space-y-2">
                        <div class="item-row flex flex-col xs:flex-row gap-2 items-stretch xs:items-start bg-gray-50 dark:bg-gray-800 rounded-lg p-2 xs:p-3">
                            <div class="flex-1">
                                <div class="relative">
                                    <input type="text" placeholder="Search item..." class="item-search w-full px-3 py-1.5 xs:py-2 pr-8 text-xs xs:text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" autocomplete="off" required>
                                    <input type="hidden" class="item-value" value="">
                                    <input type="hidden" class="item-consumable" value="0">
                                    <svg class="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                                    <ul class="item-dropdown absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-40 overflow-y-auto hidden"></ul>
                                </div>
                            </div>
                            <div class="flex gap-2">
                                <div class="w-20 xs:w-24">
                                    <input type="number" min="1" placeholder="Qty" class="item-quantity w-full px-2 xs:px-3 py-1.5 xs:py-2 text-xs xs:text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" required>
                                </div>
                                <button type="button" class="remove-item p-1.5 xs:p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all cursor-pointer flex-shrink-0" title="Remove">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
    
                <div class="mb-4">
                    <label for="reqNote" class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Note</label>
                    <input type="text" id="reqNote" class="w-full px-3 py-1.5 xs:py-2 text-xs xs:text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all">
                </div>
                <button type="submit" class="w-full xs:w-auto px-4 xs:px-6 py-2 xs:py-2.5 text-xs xs:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all cursor-pointer shadow-sm">Submit Requisition</button>
            </form>
        </div>
    </div>

    <?php if ($isAdmin): ?>
    
    <div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div class="flex flex-col sm:flex-row flex-wrap justify-between items-start sm:items-center gap-3 px-3 xs:px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 dark:border-gray-800">
            <div>
                <h5 class="text-sm xs:text-base font-semibold text-gray-900 dark:text-white">Requisition History</h5>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 hidden xs:block">View and manage requests</p>
            </div>
            <div class="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
                <div class="relative w-full xs:w-40 sm:w-48">
                    <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 xs:h-4 xs:w-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    <input type="text" id="requisitionSearch" placeholder="Search..." class="w-full pl-8 xs:pl-9 pr-3 py-1.5 xs:py-2 text-xs xs:text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all">
                </div>
                <div class="flex gap-2">
                    <button id="generateRequisitionReportBtn" class="flex-1 xs:flex-none px-3 py-1.5 xs:py-2 text-xs xs:text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all cursor-pointer border border-blue-200 dark:border-blue-900/30">
                        Generate Report
                    </button>
                    <button id="exportRequisitionsBtn" class="flex-1 xs:flex-none px-3 py-1.5 xs:py-2 text-xs xs:text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all cursor-pointer border border-gray-200 dark:border-gray-700">
                        Export
                    </button>
                    <button id="clearRequisitionsBtn" class="flex-1 xs:flex-none px-3 py-1.5 xs:py-2 text-xs xs:text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all cursor-pointer border border-red-200 dark:border-red-900/30">
                        Clear
                    </button>
                </div>
            </div>
        </div>
        <div class="p-3 xs:p-4 sm:p-5">
            <div class="overflow-x-auto">
                <table class="w-full">
              <thead>
    <tr class="border-b border-gray-100 dark:border-gray-800">
        <th class="px-2 xs:px-3 py-2 xs:py-2.5 text-center">
            <input id="selectAllRequisitions" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" title="Select visible requisitions">
        </th>
        <th id="sortReqName" class="px-2 xs:px-3 py-2 xs:py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Name <span class="sort-arrow"></span>
        </th>
        <th id="sortReqDate" class="px-2 xs:px-3 py-2 xs:py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Date <span class="sort-arrow"></span>
        </th>
        <th id="sortReqItems" class="px-2 xs:px-3 py-2 xs:py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Items <span class="sort-arrow"></span>
        </th>
        <th id="sortReqStatus" class="px-2 xs:px-3 py-2 xs:py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Status <span class="sort-arrow"></span>
        </th>
    </tr>
</thead>
                    <tbody id="requisitionTableBody" class="divide-y divide-gray-50 dark:divide-gray-800"></tbody>
                </table>
            </div>
            <nav class="mt-4">
                <ul class="flex justify-center gap-1" id="requisitionPagination"></ul>
            </nav>
        </div>
    </div>
    <?php endif; ?>
</div>

<?php if ($isAdmin): ?>
<div id="requisitionDetailsModal" class="requisition-details-overlay fixed inset-0 z-50 hidden items-center justify-center p-3" role="dialog" aria-modal="true" aria-labelledby="requisitionDetailsTitle">
    <div class="requisition-details-panel w-full overflow-hidden rounded-xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <div>
                <h3 id="requisitionDetailsTitle" class="text-base font-semibold text-gray-900 dark:text-white">Requisition Details</h3>
                <p id="requisitionDetailsSubtitle" class="text-xs text-gray-500 dark:text-gray-400 mt-0.5"></p>
            </div>
            <button type="button" id="closeRequisitionDetails" class="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-gray-800" aria-label="Close requisition details">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>
        <div id="requisitionDetailsContent" class="overflow-y-auto p-4 sm:p-5" style="max-height: calc(92vh - 76px);"></div>
    </div>
</div>
<?php endif; ?>
