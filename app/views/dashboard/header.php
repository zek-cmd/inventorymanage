<?php
// Variables available from DashboardController:
// $cssVersion, $jsVersion, $customCssVersion, $swalVersion
// $isAdmin, $userName, $userRole
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inventory Management</title>
    <link rel="stylesheet" href="assets/local/css/sweetalert2.min.css?v=<?php echo $swalVersion; ?>">
    <link rel="stylesheet" href="assets/css/style.css?v=<?php echo $cssVersion; ?>">
    <link rel="stylesheet" href="assets/css/custom.css?v=<?php echo $customCssVersion; ?>">
</head>
<body class="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen transition-colors duration-300">

    <div class="flex min-h-screen">

        <!-- Sidebar (desktop and tablet) -->
        <aside class="hidden md:flex md:flex-col md:w-56 lg:w-64 flex-shrink-0 sticky top-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">

            <!-- Brand -->
            <div class="flex items-center gap-3 px-5 h-14 border-b border-gray-200 dark:border-gray-800">
                <div class="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center flex-shrink-0">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                    </svg>
                </div>
                <span class="text-sm font-semibold text-gray-900 dark:text-white tracking-tight">Inventory Management</span>
            </div>

            <!-- Main navigation -->
            <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                <p class="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Menu</p>

                <a href="#"
                   class="nav-link is-active flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                   data-section="inventory">
                    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                    </svg>
                    <span>Inventory</span>
                </a>

                <a href="#"
                   class="nav-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                   data-section="requisition">
                    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                    <span>Requisition</span>
                </a>

                <?php if ($isAdmin): ?>
                <a href="#"
                   class="nav-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                   data-section="return">
                    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z"></path>
                    </svg>
                    <span>Returns</span>
                </a>

                <a href="#"
                   class="nav-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                   data-section="users">
                    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                    </svg>
                    <span>Users</span>
                </a>
                <?php endif; ?>
            </nav>

            <!-- Account and logout -->
            <div class="px-3 py-4 border-t border-gray-200 dark:border-gray-800">
                <div class="px-3 pb-3">
                    <p class="text-[11px] uppercase tracking-wider text-gray-400 dark:text-gray-500">Signed in as</p>
                    <p class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate"><?php echo htmlspecialchars($userName); ?></p>
                </div>
                <a href="/logout"
                   class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                    </svg>
                    <span>Logout</span>
                </a>
            </div>
        </aside>

        <!-- Main column -->
        <div class="flex-1 min-w-0 flex flex-col">

            <!-- Top bar (mobile only) -->
            <header class="md:hidden sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
                <div class="flex items-center justify-between h-14 px-3 xs:px-4">
                    <div class="flex items-center gap-2 min-w-0">
                        <div class="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                            </svg>
                        </div>
                        <span class="text-sm font-bold text-gray-900 dark:text-white truncate">Inventory Management</span>
                    </div>

                    <div class="flex items-center gap-1">
                        <a href="/logout"
                           class="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                           aria-label="Logout">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                            </svg>
                        </a>
                        <button id="mobileMenuBtn"
                                class="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                aria-label="Toggle menu"
                                aria-expanded="false">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- Mobile menu (toggled by mobileMenuBtn) -->
                <div id="mobileMenu" class="hidden border-t border-gray-200 dark:border-gray-800 px-3 xs:px-4 py-2 space-y-1">
                    <a href="#"
                       class="nav-link is-active flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                       data-section="inventory">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                        </svg>
                        Inventory
                    </a>

                    <a href="#"
                       class="nav-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                       data-section="requisition">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                        </svg>
                        Requisition
                    </a>

                    <?php if ($isAdmin): ?>
                    <a href="#"
                       class="nav-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                       data-section="return">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z"></path>
                        </svg>
                        Returns
                    </a>

                    <a href="#"
                       class="nav-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                       data-section="users">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                        </svg>
                        Users
                    </a>
                    <?php endif; ?>

                    <div class="px-3 pt-2 mt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>Signed in as</span>
                        <span class="font-medium text-gray-700 dark:text-gray-300"><?php echo htmlspecialchars($userName); ?></span>
                    </div>
                </div>
            </header>

            <!-- Page content -->
            <main class="flex-1 min-w-0 w-full px-3 xs:px-4 sm:px-6 lg:px-8 py-4 xs:py-5 md:py-6 lg:py-8">
