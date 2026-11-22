# Auth Specification

## Purpose
Autenticar instructores y estudiantes, y proteger cada recurso según rol y propiedad.

## Requirements

### Requirement: Roles
El sistema SHALL tener los roles `Instructor` y `Student` (Identity). El JWT SHALL incluir
`NameIdentifier`, `Email`, `Name` y un claim `Role` por rol; expira a las 2 horas.
Al iniciar, los usuarios sin rol SHALL recibir `Instructor` (compatibilidad con datos previos).

### Requirement: Login
`POST /User/Login` SHALL devolver `token`, `userId`, `email`, `userName`, `fullName` y `roles`.

#### Scenario: Credenciales inválidas
- **WHEN** el correo no existe o la clave es incorrecta
- **THEN** responde 404 con el mensaje genérico "Correo o contraseña incorrectos." (no revela qué falló)

#### Scenario: Bloqueo
- **WHEN** hay 5 intentos fallidos
- **THEN** la cuenta se bloquea 10 minutos

#### Scenario: Rate limiting
- **WHEN** una IP supera `RateLimit:AuthPermitPerMinute` (10 por defecto) en login/registro
- **THEN** responde 429 "Demasiados intentos…"

### Requirement: Registro de estudiantes
`POST /User/Register` (anónimo) SHALL crear un usuario `Student`. La contraseña SHALL tener 8+
caracteres, mayúscula, número y símbolo. `POST /User/CreateUser` SHALL requerir rol `Instructor`
y crear otro instructor.

### Requirement: Identidad y propiedad en el servidor
Los controladores `Course` y `Video` SHALL exigir rol `Instructor` (salvo `GET /Course/Search` y
`GET /Video/ListByCourseId`, anónimos). El usuario SHALL tomarse del claim `NameIdentifier`; cualquier
`userId` enviado por el cliente SHALL ignorarse.

#### Scenario: Sin token
- **WHEN** se llama un endpoint protegido sin `Authorization`
- **THEN** responde 401

#### Scenario: Estudiante en endpoint de instructor
- **WHEN** un estudiante llama `GET /Course/List`
- **THEN** responde 403

#### Scenario: Recurso ajeno
- **WHEN** un instructor intenta leer, editar, eliminar, subir video o listar videos de un curso ajeno (aunque envíe el `userId` del dueño)
- **THEN** responde 404 y no modifica datos

### Requirement: Sesión en los portales
- Panel: guarda la sesión en `localStorage`, adjunta `Bearer`, redirige al login ante 401 y SHALL rechazar cuentas sin rol `Instructor`.
- Portal: sesión con *signals* en `localStorage` (`portal.session`) con expiración tomada del JWT; ante 401 cierra sesión sin redirigir (el portal es público). Las redirecciones post-login SHALL ser solo rutas internas.

### Requirement: Usuario semilla
Con `Seed:AdminEmail`/`Seed:AdminPassword`, la API SHALL crear ese instructor si no existe.
