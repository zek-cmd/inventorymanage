<?php
require_once '../config/database.php';
require_once '../app/core/Router.php';
require_once '../app/core/Controller.php';
require_once '../app/core/Model.php';
require_once '../app/core/View.php';
require_once '../app/helpers/Session.php';

$router = new Router();

$router->get('/', 'AuthController@loginForm');
$router->post('/login', 'AuthController@login');
$router->get('/logout', 'AuthController@logout');
$router->get('/dashboard', 'DashboardController@index');

$router->get('/api/inventory', 'InventoryController@index');
$router->get('/api/inventory/get', 'InventoryController@get');
$router->post('/api/inventory/add', 'InventoryController@add');
$router->post('/api/inventory/update', 'InventoryController@update');
$router->post('/api/inventory/delete', 'InventoryController@delete');

$router->get('/api/requisitions', 'RequisitionController@index');
$router->get('/api/requisitions/approved', 'RequisitionController@approved');
$router->post('/api/requisitions/submit', 'RequisitionController@submit');
$router->post('/api/requisitions/status', 'RequisitionController@status');
$router->get('/api/requisitions/items', 'RequisitionController@items');
$router->get('/api/requisitions/report', 'RequisitionController@report');
$router->post('/api/requisitions/clear', 'RequisitionController@clear');
$router->post('/api/requisitions/toggle-item', 'RequisitionController@toggleItem');
$router->post('/api/requisitions/note', 'RequisitionController@updateNote');
$router->post('/api/requisitions/clear-by-type', 'RequisitionController@clearByType');

$router->get('/api/returns', 'ReturnController@index');
$router->post('/api/returns/process', 'ReturnController@process');
$router->post('/api/returns/clear', 'ReturnController@clear');

$router->get('/api/users', 'UserController@index');
$router->get('/api/users/get', 'UserController@get');
$router->post('/api/users/add', 'UserController@add');
$router->post('/api/users/update', 'UserController@update');
$router->post('/api/users/delete', 'UserController@delete');
$router->get('/api/backup/sql', 'BackupController@download');

$router->dispatch();
