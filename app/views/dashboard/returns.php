<?php
// Variables available: $isAdmin
?>
<?php if ($isAdmin): ?>
<div id="returnSection" style="display: none;">
    
    <div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden mb-4 sm:mb-6">
        <div class="px-3 xs:px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 dark:border-gray-800">
            <h5 class="text-sm xs:text-base font-semibold text-gray-900 dark:text-white">Process Return</h5>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 hidden xs:block">Return borrowed items to stock</p>
        </div>
        <div class="p-3 xs:p-4 sm:p-5">
            <form id="returnForm">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                    <div>
                        <label for="returnRequisitionSearch" class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Requisition *</label>
                        <div class="relative">
                            <input type="text" id="returnRequisitionSearch" placeholder="Search..." class="w-full px-3 py-1.5 xs:py-2 pr-8 text-xs xs:text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" autocomplete="off" required>
                            <input type="hidden" id="returnRequisitionId" value="">
                            <svg class="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                            <ul id="returnRequisitionDropdown" class="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto hidden"></ul>
                        </div>
                    </div>
                    <div>
                        <label for="returnDate" class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Return Date *</label>
                        <input type="date" id="returnDate" class="w-full px-3 py-1.5 xs:py-2 text-xs xs:text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" required>
                    </div>
                </div>

                
                <div class="mb-4">
                    <div class="flex items-center justify-between mb-2">
                        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400">Items *</label>
                    </div>
                    <div id="returnItems" class="space-y-2">
                        <div class="text-xs text-gray-500 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            Select a requisition to load items
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                    <div>
                        <label for="returnCheckedBy" class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Checked By</label>
                        <input type="text" id="returnCheckedBy" class="w-full px-3 py-1.5 xs:py-2 text-xs xs:text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all">
                    </div>
                    <div>
                        <label for="returnRemarks" class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Remarks</label>
                        <input type="text" id="returnRemarks" class="w-full px-3 py-1.5 xs:py-2 text-xs xs:text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all">
                    </div>
                </div>

                <button type="submit" class="w-full xs:w-auto px-4 xs:px-6 py-2 xs:py-2.5 text-xs xs:text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-all cursor-pointer shadow-sm">Process Return</button>
            </form>
        </div>
    </div>

    
    <div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div class="flex flex-col sm:flex-row flex-wrap justify-between items-start sm:items-center gap-3 px-3 xs:px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 dark:border-gray-800">
            <div>
                <h5 class="text-sm xs:text-base font-semibold text-gray-900 dark:text-white">Return History</h5>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 hidden xs:block">Track returned items</p>
            </div>
            <div class="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
                <div class="relative w-full xs:w-40 sm:w-48">
                    <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 xs:h-4 xs:w-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    <input type="text" id="returnSearch" placeholder="Search..." class="w-full pl-8 xs:pl-9 pr-3 py-1.5 xs:py-2 text-xs xs:text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all">
                </div>
                <div class="flex gap-2">
                    <button id="exportReturnsBtn" class="flex-1 xs:flex-none px-3 py-1.5 xs:py-2 text-xs xs:text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all cursor-pointer border border-gray-200 dark:border-gray-700">
                        Export
                    </button>
                    <button id="clearReturnsBtn" class="flex-1 xs:flex-none px-3 py-1.5 xs:py-2 text-xs xs:text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all cursor-pointer border border-red-200 dark:border-red-900/30">
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
                            <th id="sortReturnReqId" class="px-2 xs:px-3 py-2 xs:py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                Req ID <span class="sort-arrow"></span>
                            </th>
                            <th id="sortReturnName" class="px-2 xs:px-3 py-2 xs:py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                Requestor <span class="sort-arrow"></span>
                            </th>
                            <th id="sortReturnItem" class="px-2 xs:px-3 py-2 xs:py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                Item <span class="sort-arrow"></span>
                            </th>
                            <th id="sortReturnDate" class="px-2 xs:px-3 py-2 xs:py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                Return Date <span class="sort-arrow"></span>
                            </th>
                            <th class="px-2 xs:px-3 py-2 xs:py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody id="returnTableBody" class="divide-y divide-gray-50 dark:divide-gray-800"></tbody>
                </table>
            </div>
            <nav class="mt-4">
                <ul class="flex justify-center gap-1" id="returnPagination"></ul>
            </nav>
        </div>
    </div>
</div>

<div id="returnDetailsModal" class="requisition-details-overlay fixed inset-0 z-50 hidden items-center justify-center p-3" role="dialog" aria-modal="true" aria-labelledby="returnDetailsTitle">
    <div class="requisition-details-panel w-full overflow-hidden rounded-xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <div>
                <h3 id="returnDetailsTitle" class="text-base font-semibold text-gray-900 dark:text-white">Return Details</h3>
                <p id="returnDetailsSubtitle" class="text-xs text-gray-500 dark:text-gray-400 mt-0.5"></p>
            </div>
            <button type="button" id="closeReturnDetails" class="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-gray-800" aria-label="Close return details">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>
        <div id="returnDetailsContent" class="overflow-y-auto p-4 sm:p-5" style="max-height: calc(92vh - 76px);"></div>
    </div>
</div>
<?php endif; ?>
