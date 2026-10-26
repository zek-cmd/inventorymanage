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
    
    
    <nav class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div class="max-w-full mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
            
            
            <div class="flex items-center justify-between h-12 xs:h-14 sm:h-14 md:h-16">
                
                
                <div class="flex items-center gap-2 xs:gap-3">
                    
                    <div class="w-7 h-7 xs:w-8 xs:h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg class="w-4 h-4 xs:w-5 xs:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                        </svg>
                    </div>
                    
                    
                    <span class="text-sm xs:text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                        
                        <span class="hidden xs:inline">Inventory Management</span>
                        <span class="xs:hidden">IMS</span>
                    </span>
                </div>

                
                <div class="hidden md:flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                    <a href="#" 
                       class="nav-link px-3 lg:px-4 py-1.5 md:py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white" 
                       data-section="inventory">
                        <span class="hidden lg:inline">Inventory</span>
                        <span class="lg:hidden">Inv</span>
                    </a>
                    
                    <a href="#" 
                       class="nav-link px-3 lg:px-4 py-1.5 md:py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white" 
                       data-section="requisition">
                        <span class="hidden lg:inline">Requisition</span>
                        <span class="lg:hidden">Req</span>
                    </a>
                    
                    <?php if ($isAdmin): ?>
                    <a href="#" 
                       class="nav-link px-3 lg:px-4 py-1.5 md:py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white" 
                       data-section="return">
                        <span class="hidden lg:inline">Returns</span>
                        <span class="lg:hidden">Ret</span>
                    </a>
                    
                    <a href="#" 
                       class="nav-link px-3 lg:px-4 py-1.5 md:py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white" 
                       data-section="users">
                        <span class="hidden lg:inline">Users</span>
                        <span class="lg:hidden">Usr</span>
                    </a>
                    <?php endif; ?>
                </div>

                
                <div class="flex items-center gap-2 xs:gap-3 sm:gap-4">
                    
                    <span class="hidden xs:inline text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate max-w-[100px] sm:max-w-[150px] md:max-w-[200px] lg:max-w-none">
                        <?php echo htmlspecialchars($userName); ?>
                    </span>
                    
                    
                    <a href="/logout" 
                       class="flex items-center gap-1 text-xs sm:text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors whitespace-nowrap p-1.5 xs:p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                        
                        <svg class="w-4 h-4 xs:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                        </svg>
                        
                        <span class="hidden xs:inline">Logout</span>
                    </a>
                    
                    
                    <button id="mobileMenuBtn" 
                            class="md:hidden p-1.5 xs:p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
                            aria-label="Toggle menu"
                            aria-expanded="false">
                        
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
            
            
            <div id="mobileMenu" 
                 class="hidden md:hidden py-2 space-y-1 border-t border-gray-200 dark:border-gray-800 mt-1 xs:mt-2 transition-all duration-200">
                
                <a href="#" 
                   class="nav-link block px-3 xs:px-4 py-2 xs:py-2.5 rounded-md text-sm sm:text-base font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" 
                   data-section="inventory">
                    <div class="flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                        </svg>
                        Inventory
                    </div>
                </a>
                
                <a href="#" 
                   class="nav-link block px-3 xs:px-4 py-2 xs:py-2.5 rounded-md text-sm sm:text-base font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors" 
                   data-section="requisition">
                    <div class="flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                        </svg>
                        Requisition
                    </div>
                </a>
                
                <?php if ($isAdmin): ?>
                <a href="#" 
                   class="nav-link block px-3 xs:px-4 py-2 xs:py-2.5 rounded-md text-sm sm:text-base font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors" 
                   data-section="return">
                    <div class="flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z"></path>
                        </svg>
                        Returns
                    </div>
                </a>
                
                <a href="#" 
                   class="nav-link block px-3 xs:px-4 py-2 xs:py-2.5 rounded-md text-sm sm:text-base font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors" 
                   data-section="users">
                    <div class="flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                        </svg>
                        Users
                    </div>
                </a>
                <?php endif; ?>
                
                
                <div class="px-3 xs:px-4 pt-2 mt-2 border-t border-gray-100 dark:border-gray-800">
                    <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>Signed in as</span>
                        <span class="font-medium text-gray-700 dark:text-gray-300"><?php echo htmlspecialchars($userName); ?></span>
                    </div>
                </div>
            </div>
        </div>
    </nav>

    
    <div class="max-w-full mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-3 xs:py-4 sm:py-5 md:py-6 lg:py-8">