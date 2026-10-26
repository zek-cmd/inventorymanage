<?php
class DashboardController extends Controller {
    public function index() {
        $this->requireAuth();
        
        $cssVersion = filemtime('assets/css/style.css');
        $jsVersion = filemtime('assets/js/core/app.js');
        $customCssVersion = filemtime('assets/css/custom.css');
        $swalVersion = filemtime('assets/local/js/sweetalert2.min.js');
        $isAdmin = $this->isAdmin();
        $userName = Session::get('name');
        $userRole = Session::get('role');

        $this->view('dashboard', [
            'cssVersion' => $cssVersion,
            'jsVersion' => $jsVersion,
            'customCssVersion' => $customCssVersion,
            'swalVersion' => $swalVersion,
            'isAdmin' => $isAdmin,
            'userName' => $userName,
            'userRole' => $userRole
        ]);
    }
}