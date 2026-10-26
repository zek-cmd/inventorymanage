<?php
class Controller {
    protected function view($view, $data = []) {
        View::render($view, $data);
    }

    protected function json($data) {
        header('Content-Type: application/json');
        echo json_encode($data);
    }

    protected function redirect($url) {
        header('Location: ' . $url);
        exit;
    }

    protected function isAuthenticated() {
        return Session::isLoggedIn();
    }

    protected function isAdmin() {
        return Session::isAdmin();
    }

    protected function requireAuth() {
        if (!$this->isAuthenticated()) {
            $this->redirect('/');
            exit;
        }
    }

    protected function requireAdmin() {
        $this->requireAuth();
        if (!$this->isAdmin()) {
            $this->json(['success' => false, 'message' => 'Unauthorized']);
            exit;
        }
    }
}