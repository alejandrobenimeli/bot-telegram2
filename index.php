<?php

require 'flight/Flight.php';
define('TOKEN', 'abl248924');


Flight::register('db', 'PDO', array('mysql:host=localhost;dbname=lmnpmlxd_papeleos','lmnpmlxd_alex','&u?*HgV5qBhW'));

Flight::route('/', function () {
    echo 'hello world!';
});

Flight::route('/saludar', function () {
    echo 'Hola colegui porno';
});

//INSERTA EL USUARIO EN LA TABLA USUARIO Y UN REGISTRO EN LA TABLA ASOCIACION_REFERIDOS_USUARIO ASOCIANDO LAS 2 IDS
Flight::route('POST /insert_user', function () {
    $token = Flight::request()->data->token;
    $idUser = Flight::request()->data->id;
    $idRef = Flight::request()->data->idref;
    $name = Flight::request()->data->name;
    if($token == TOKEN) {
      $stmt1  = Flight::db()->prepare("INSERT INTO usuarios (`id_usuario`, `nombre_usuario`) VALUES (?,?)");
      $stmt1 ->execute([$idUser,$name]);

      $fecha_actual = date("Y-m-d H:i:s");
      $stmt2  = Flight::db()->prepare("INSERT INTO asociacion_referido_usuario (`id_referido`, `id_usuario`, `fecha_asociacion`) VALUES (?,?,?)");
      $stmt2 ->execute([$idRef,$idUser,$fecha_actual]);

      $json = array('error' => 0);
      Flight::json($json);
    }
});

Flight::map('notFound', function(){
    // Handle not found
    $json = array(
      'error' => 1,
      'msg' => 'Pagina no encontrada'
    );
    Flight::json($json);
});

Flight::map('error', function(Exception $ex){
    // Handle error
    $json = array('error' => 1);
    Flight::json($json);
});

//COMPRUEBA SI EL userRef EXISTE
Flight::route('GET /exists_user_ref/@token/@idref', function ($token,$idref) {
    if($token == TOKEN) {
      $sentencia = Flight::db()->prepare("SELECT COUNT(id_referido) existe FROM referidos WHERE id_referido=$idref");
      $sentencia->execute();
      $dato=$sentencia->fetch();
      Flight::json($dato);
    }
});

//COMPRUEBA SI EL userId EXISTE
Flight::route('GET /exists_user/@token/@iduser', function ($token,$iduser) {
    if($token == TOKEN) {
      $sentencia = Flight::db()->prepare("SELECT COUNT(id_usuario) existe FROM usuarios WHERE id_usuario=$iduser");
      $sentencia->execute();
      $dato=$sentencia->fetch();
      Flight::json($dato);
    }
});

//COMPRUEBA SI EL USERID EXISTE TANTO EN REFERIDOS COMO EN USUARIOS
Flight::route('GET /exists_user_id/@token/@iduser', function ($token,$iduser) {
    if($token == TOKEN) {
      $sentencia = Flight::db()->prepare("SELECT existe FROM (SELECT COUNT(id_referido) existe FROM referidos WHERE id_referido=$iduser UNION SELECT COUNT(id_usuario) existe FROM usuarios WHERE id_usuario=$iduser) AS tablasUser WHERE existe = 1");
      $sentencia->execute();
      $dato=$sentencia->fetch();
      Flight::json($dato);
    }
});

Flight::start();
