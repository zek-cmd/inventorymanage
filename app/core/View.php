<?php
class View {
    public static function render($view, $data = []) {
        extract($data);
        $viewPath = '../app/views/' . $view . '.php';
        if (file_exists($viewPath)) {
            require $viewPath;
        } else {
            echo "View '$view' not found";
        }
    }
}