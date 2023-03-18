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
Flight::route('GET /exists-user-ref/@token/@idref', function ($token,$idref) {
    if($token == TOKEN) {
      $sentencia = Flight::db()->prepare("SELECT COUNT(id_referido) existe FROM referidos WHERE id_referido=$idref");
      $sentencia->execute();
      $dato=$sentencia->fetch();
      Flight::json($dato);
    }
});

//COMPRUEBA SI EL userId EXISTE
Flight::route('GET /exists-user/@token/@iduser', function ($token,$iduser) {
    if($token == TOKEN) {
      $sentencia = Flight::db()->prepare("SELECT COUNT(id_usuario) existe FROM usuarios WHERE id_usuario=$iduser");
      $sentencia->execute();
      $dato=$sentencia->fetch();
      Flight::json($dato);
    }
});

//COMPRUEBA SI EL USERID EXISTE TANTO EN REFERIDOS COMO EN USUARIOS
Flight::route('GET /exists-user-id/@token/@iduser', function ($token,$iduser) {
    if($token == TOKEN) {
      $sentencia = Flight::db()->prepare("SELECT existe FROM (SELECT COUNT(id_referido) existe FROM referidos WHERE id_referido=$iduser UNION SELECT COUNT(id_usuario) existe FROM usuarios WHERE id_usuario=$iduser) AS tablasUser WHERE existe = 1");
      $sentencia->execute();
      $dato=$sentencia->fetch();
      Flight::json($dato);
    }
});

//GUARDA A LA VEZ EL USERID EN LA TABLA USUARIOS Y LA ASOCIACION DE USERREF Y USERID EN LA TABLA DE ASOCIACION
Flight::route('POST /guardar-userid', function(){
  // Obtener las variables por POST
  //var_dump($_POST); // imprimir el contenido del array $_POST para verificar que se está recibiendo el token
//$token = $_POST['token'];
//var_dump($token);
  /*
  $token = $_POST['token'];
  $json = array(
    'error' => 0,
    'msg' => 'Registros insertados correctamente',
    'token' => TOKEN,
    'token2' => $token
  );
  Flight::json($_POST);
*/
header('Content-Type: application/json');
//echo json_encode($_POST);
Flight::json($_POST);

  if($token == TOKEN) {
    $idUser = $_POST['idUser'];
    $nameUser = $_POST['nameUser'];
    $idRef = $_POST['idRef'];
    $fechaActual = date('Y-m-d H:i:s');

    // Conexión a la base de datos
    $pdo = Flight::db();

    // Inicio de la transacción
    $pdo->beginTransaction();

    // Inserción de los registros
    $pdo->exec("INSERT INTO usuarios(id_usuario, nombre_usuario) VALUES ($idUser,'$nameUser')");
    $pdo->exec("INSERT INTO asociacion_referido_usuario(id_referido, id_usuario, fecha_asociacion) VALUES ($idRef,$idUser,'$fechaActual')");

    // Obtención del número de filas afectadas
    $rc = $pdo->query('SELECT ROW_COUNT()')->fetchColumn();

    // Verificación del número de filas afectadas
    if ($rc !== '2') {
      // Si alguna inserción falló, se revoca la transacción
      $pdo->rollback();
      $json = array(
        'error' => 1,
        'msg' => 'No se pudieron insertar los registros'
      );
    } else {
      // Si las dos inserciones tuvieron éxito, se confirma la transacción
      $pdo->commit();
      $json = array(
        'error' => 0,
        'msg' => 'Registros insertados correctamente'
      );
    }
    Flight::json($json);
  }
});




Flight::start();
