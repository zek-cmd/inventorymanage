<?php
class AuthController extends Controller {
    public function loginForm() {
        if ($this->isAuthenticated()) {
            $this->redirect('/dashboard');
        }
        $cssVersion = filemtime('assets/css/style.css');
        $this->view('login', ['cssVersion' => $cssVersion]);
    }

    public function login() {
        $username = $_POST['username'] ?? '';
        $password = $_POST['password'] ?? '';

        if (empty($username) || empty($password)) {
            $error = 'Please enter username and password.';
            $cssVersion = filemtime('assets/css/style.css');
            $this->view('login', ['error' => $error, 'cssVersion' => $cssVersion]);
            return;
        }

        $userModel = $this->model('User');
        $user = $userModel->findByUsername($username);

        if ($user && password_verify($password, $user['password'])) {
            Session::set('user_id', $user['id']);
            Session::set('username', $user['username']);
            Session::set('name', $user['name']);
            Session::set('role', $user['role']);
            $this->redirect('/dashboard');
        } else {
            $error = 'Invalid username or password.';
            $cssVersion = filemtime('assets/css/style.css');
            $this->view('login', ['error' => $error, 'cssVersion' => $cssVersion]);
        }
    }

    public function logout() {
        Session::destroy();
        $this->redirect('/');
    }

    private function model($name) {
        require_once '../app/models/' . $name . '.php';
        return new $name();
    }
}