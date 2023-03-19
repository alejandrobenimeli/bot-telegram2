<?php

require 'variables.php';
require 'flight/Flight.php';
define('TOKEN', getenv('TOKEN'));
define('DB_PASS', getenv('DB_PASS'));

Flight::register('db', 'PDO', array('mysql:host=localhost;dbname=lmnpmlxd_papeleos','lmnpmlxd_alex',DB_PASS));
/*

//USO: FALSE
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
*/

//USO: TRUE
Flight::map('notFound', function(){
    // Handle not found
    $json = array(
      'error' => 1,
      'msg' => 'Pagina no encontrada'
    );
    Flight::json($json);
});

//USO: TRUE
//SABER QUE ERRORES TENGO
Flight::map('error', function(Exception $ex){
    // Handle error
    $json = array('error' => 1, 'message' => $ex->getMessage(), 'code' => $ex->getCode());
    Flight::json($json);
});

//USO: TRUE
//COMPRUEBA SI EL USER EXISTE
Flight::route('GET /exists-user/@token/@iduser', function ($token,$iduser) {
    if($token == TOKEN) {
      $sentencia = Flight::db()->prepare("SELECT COUNT(id_usuario) existe FROM usuarios WHERE id_usuario = $iduser");
      $sentencia->execute();
      $dato=$sentencia->fetch();
      Flight::json($dato);
    } else {
      $json = array(
        'error' => 1,
        'msg' => 'TOKEN incorrecto'
      );
      Flight::json($json);
    }
});

//USO: TRUE
//SACA EL USUARIO REFERIDO
Flight::route('GET /exists-user-ref/@token/@iduser', function ($token,$iduser) {
    if($token == TOKEN) {
      $db = Flight::db();
      $stmt = $db->prepare("SELECT nombre_usuario FROM usuarios WHERE id_usuario = (SELECT id_user_sin_referido FROM asociacion_referidos WHERE id_user_referido = ?)");
      $stmt->bindParam(1, $iduser, PDO::PARAM_INT);
      $stmt->execute();
      $dato = $stmt->fetch(PDO::FETCH_ASSOC);
      if(!$dato) {
        $json = array(
          'nombre_usuario' => false
        );
        Flight::json($json);
      } else {
        Flight::json($dato);
      }
    }
});

//SACA TODOS LOS AFILIADOS PARA EL USUARIO
Flight::route('GET /get-afiliados/@token/@iduser', function ($token,$iduser) {
    if($token == TOKEN) {
      $db = Flight::db();
      $stmt = $db->prepare("select u.nombre_usuario, a.fecha_asociacion from usuarios u INNER JOIN asociacion_referidos a ON u.id_usuario = a.id_user_sin_referido where a.id_user_sin_referido = ?");
      $stmt->bindParam(1, $iduser, PDO::PARAM_INT);
      $stmt->execute();
      $dato = $stmt->fetchAll(PDO::FETCH_ASSOC);
      if(!$dato) {
        $json = array(
          'nombre_usuario' => false
        );
        Flight::json($json);
      } else {
        Flight::json($dato);
      }
    }
});


//USO: TRUE
//GUARDA A LA VEZ EL TIPO id_user_referido EN LA TABLA USUARIOS Y LA ASOCIACION ENTRE EL
//id_user_sin_referido Y id_user_referido EN LA TABLA DE ASOCIACION
Flight::route('POST /guardar-userid', function(){
  // Obtener las variables por POST
  $token = $_POST['token'];

  if($token == TOKEN) {
    $idUser = $_POST['idUser'];
    $nameUser = $_POST['nameUser'];
    $idRef = $_POST['idRef'];
    $fechaActual = date('Y-m-d H:i:s');

    // Conexión a la base de datos
    $pdo = Flight::db();
    // Inicio de la transacción
    $pdo->beginTransaction();

    //si esta ya en usuarios es porque ya tiene un userRef o es referido de alguien
    // Inserción de los registros. si ya existe el usuario es porque ya tiene un referido asociado, por tanto no se le podrá asignar otro referido
    $stmt1 = $pdo->prepare("INSERT INTO usuarios(id_usuario, nombre_usuario) VALUES (?, ?)");
    $stmt1->execute([$idUser, $nameUser]);

    $stmt2 = $pdo->prepare("INSERT INTO asociacion_referidos(id_user_sin_referido, id_user_referido, fecha_asociacion) VALUES (?,?,?)");
    $stmt2->execute([$idRef, $idUser, $fechaActual]);

    // Obtención del número de filas afectadas
    $rc = $stmt1->rowCount() + $stmt2->rowCount();

    // Verificación del número de filas afectadas
    if ($rc !== 2) {
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

//USO: TRUE
//GUARDA EL USER EN LA TABLA USUARIOS
Flight::route('POST /guardar-user', function(){
  // Obtener las variables por POST
  $token = $_POST['token'];

  if($token == TOKEN) {
    $idUser = $_POST['idUser'];
    $nameUser = $_POST['nameUser'];

    // Conexión a la base de datos
    $pdo = Flight::db();

    // Inserción de los registros. si ya existe el usuario es porque ya tiene un referido asociado, por tanto no se le podrá asignar otro referido
    $stmt1 = $pdo->prepare("INSERT INTO usuarios(id_usuario, nombre_usuario) VALUES (?,?)");
    $stmt1->execute([$idUser, $nameUser]);

    $json = array(
      'error' => 0,
      'msg' => 'Registro insertado correctamente'
    );
    Flight::json($json);
  }
});


Flight::start();

?>
