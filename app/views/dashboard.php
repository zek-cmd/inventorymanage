<?php
// Entry point that includes all partials in order.
// Called from DashboardController@index via View::render('dashboard', $data)
// Variables available: $cssVersion, $jsVersion, $customCssVersion, $swalVersion,
// $isAdmin, $userName, $userRole
?>
<?php require __DIR__ . '/dashboard/header.php'; ?>
<?php require __DIR__ . '/dashboard/inventory.php'; ?>
<?php require __DIR__ . '/dashboard/requisition.php'; ?>
<?php require __DIR__ . '/dashboard/returns.php'; ?>
<?php require __DIR__ . '/dashboard/users.php'; ?>
<?php require __DIR__ . '/dashboard/modals/inventory_add.php'; ?>
<?php require __DIR__ . '/dashboard/modals/inventory_edit.php'; ?>
<?php require __DIR__ . '/dashboard/modals/user_add.php'; ?>
<?php require __DIR__ . '/dashboard/modals/user_edit.php'; ?>
<?php require __DIR__ . '/dashboard/scripts.php'; ?>