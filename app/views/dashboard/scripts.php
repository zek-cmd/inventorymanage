<?php
// Variables available: $isAdmin, $jsVersion, $swalVersion
?>
    </div><?php // Closes the .max-w-full.mx-auto.px-4.sm:px-6.py-6 div from header.php ?>

    <script>
        window.isAdmin = <?php echo $isAdmin ? 'true' : 'false'; ?>;
    </script>
    <script src="assets/local/js/sweetalert2.min.js?v=<?php echo $swalVersion; ?>"></script>
    <script src="assets/js/core/theme.js?v=<?php echo $jsVersion; ?>"></script>
    <script src="assets/js/core/utils.js?v=<?php echo $jsVersion; ?>"></script>
    <script src="assets/js/modules/inventory.js?v=<?php echo $jsVersion; ?>"></script>
    <script src="assets/js/modules/requisition.js?v=<?php echo $jsVersion; ?>"></script>
    <script src="assets/js/modules/returns.js?v=<?php echo $jsVersion; ?>"></script>
    <script src="assets/js/modules/users.js?v=<?php echo $jsVersion; ?>"></script>
    <script src="assets/js/core/navigation.js?v=<?php echo $jsVersion; ?>"></script>
    <script src="assets/js/core/app.js?v=<?php echo $jsVersion; ?>"></script>
</body>
</html>