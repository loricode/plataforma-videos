# Historias de usuario

Formato: **Como** <rol> **quiero** <acción> **para** <beneficio>.
Criterios de aceptación en Gherkin. Estado: ✅ implementada · 🟡 parcial · ⬜ pendiente.

---

## Épica 1 — Acceso del instructor

### HU-01 · Iniciar sesión ✅
**Como** instructor **quiero** ingresar con mi correo y contraseña **para** administrar mis cursos.
```gherkin
Escenario: Credenciales válidas
  Dado que estoy en la pantalla de login
  Cuando ingreso un correo y contraseña válidos y presiono "Iniciar sesión"
  Entonces veo el dashboard y mi nombre en la barra superior

Escenario: Credenciales inválidas
  Cuando ingreso una contraseña incorrecta
  Entonces veo una notificación de error y permanezco en el login

Escenario: Formulario sin datos precargados
  Dado que abro el login
  Entonces los campos de correo y contraseña están vacíos
```
Specs: `auth` · Tareas: login-page, auth.facade

### HU-02 · Cerrar sesión ✅
**Como** instructor **quiero** cerrar sesión **para** proteger mi cuenta en equipos compartidos.
```gherkin
Escenario: Logout
  Cuando abro el menú de usuario y elijo "Cerrar sesión"
  Entonces se borra el token local y vuelvo al login

Escenario: Token vencido
  Dado que mi token expiró
  Cuando el panel hace una petición y recibe 401
  Entonces soy redirigido al login
```

---

## Épica 2 — Gestión de cursos

### HU-03 · Ver resumen en el dashboard ✅
**Como** instructor **quiero** ver un resumen de mis cursos y videos **para** saber qué requiere atención.
```gherkin
Escenario: Dashboard con datos
  Dado que tengo cursos con lecciones
  Entonces veo el % de videos listos, total de cursos, cursos activos y total de videos
  Y una gráfica de videos subidos en los últimos 7 días con detalle al pasar el mouse
  Y el conteo por estado (listos, procesando, con error, cursos inactivos)
  Y mis 3 cursos con actividad más reciente

Escenario: Sin cursos
  Dado que no tengo cursos
  Entonces veo un estado vacío con el botón "Crear mi primer curso"
```

### HU-04 · Crear curso ✅
**Como** instructor **quiero** crear un curso con título, descripción, portada y estado **para** organizar mis lecciones.
```gherkin
Escenario: Creación exitosa
  Dado que completo el título y selecciono una portada válida
  Cuando presiono "Guardar curso"
  Entonces el curso se crea y soy llevado a la página de lecciones de ese curso

Escenario: Validaciones
  Cuando dejo el título vacío
  Entonces el botón Guardar está deshabilitado y veo "El título es obligatorio"
  Cuando selecciono un archivo que no es imagen o supera 10 MB
  Entonces veo el mensaje de formato o tamaño inválido

Escenario: Vista previa en vivo
  Mientras escribo el título y la descripción
  Entonces la tarjeta de vista previa muestra cómo se verá en el portal
```

### HU-05 · Editar y publicar curso ✅
**Como** instructor **quiero** editar los datos y cambiar entre publicado/borrador **para** controlar qué ven los estudiantes.
```gherkin
Escenario: Despublicar
  Dado un curso publicado
  Cuando desactivo el interruptor y guardo
  Entonces el curso deja de aparecer en el portal del estudiante
```

### HU-06 · Cambiar portada ✅
**Como** instructor **quiero** reemplazar la portada **para** mantener mi curso atractivo.
```gherkin
Escenario: Nueva portada
  Cuando elijo "Portada" en la tarjeta del curso y selecciono una imagen
  Entonces veo la vista previa antes de guardar
  Y al guardar la tarjeta muestra la nueva imagen
```

### HU-07 · Buscar y filtrar mis cursos ✅
**Como** instructor **quiero** buscar por título y filtrar por estado **para** encontrar cursos rápido.
```gherkin
Escenario: Búsqueda desde la barra superior
  Cuando escribo "inglés" en el buscador de la barra y presiono Enter
  Entonces voy a Mis cursos filtrado por "inglés"

Escenario: Filtro
  Cuando elijo "Borradores"
  Entonces solo veo cursos no publicados
```

### HU-08 · Eliminar curso ✅
**Como** instructor **quiero** eliminar un curso **para** retirar contenido obsoleto.
```gherkin
Escenario: Confirmación
  Cuando presiono eliminar en un curso
  Entonces se pide confirmación indicando que se borrarán lecciones y archivos
  Y al confirmar el curso desaparece de la lista
```

---

## Épica 3 — Lecciones (videos)

### HU-09 · Subir lección con progreso ✅
**Como** instructor **quiero** subir un video y ver el avance **para** saber cuánto falta.
```gherkin
Escenario: Subida
  Dado que estoy en las lecciones de un curso
  Cuando arrastro un MP4 de 200 MB y escribo un título
  Y presiono "Subir"
  Entonces veo una barra de progreso en porcentaje
  Y al terminar la lección aparece con estado "En cola" o "Procesando"

Escenario: Archivo inválido
  Cuando selecciono un archivo que no es video o supera 500 MB
  Entonces veo el error y no puedo subir
```

### HU-10 · Seguir el procesamiento ✅
**Como** instructor **quiero** que el estado se actualice solo **para** no recargar la página.
```gherkin
Escenario: Auto-refresco
  Dado que hay lecciones en "Procesando"
  Entonces la lista se actualiza cada 5 segundos
  Y deja de consultar cuando todas están "Listo" o "Error"
```

### HU-11 · Previsualizar lección ✅
**Como** instructor **quiero** reproducir una lección lista **para** verificar la calidad.
```gherkin
Escenario: Ver
  Dada una lección en estado "Listo"
  Cuando presiono el botón ver
  Entonces se abre un reproductor HLS que inicia automáticamente
  Y el botón está deshabilitado si la lección no está lista
```

### HU-12 · Eliminar lección 🟡
**Como** instructor **quiero** eliminar una lección **para** corregir errores.
```gherkin
Escenario: Eliminar
  Cuando confirmo la eliminación
  Entonces la lección desaparece del panel y del portal
  # Pendiente: borrar también los archivos HLS del disco
```

---

## Épica 4 — Portal del estudiante

### HU-13 · Explorar catálogo ✅
**Como** estudiante **quiero** ver cursos disponibles apenas entro **para** descubrir contenido.
```gherkin
Escenario: Catálogo inicial
  Cuando abro el portal
  Entonces veo los cursos publicados sin necesidad de buscar
  Y nunca veo cursos en borrador
```

### HU-14 · Buscar cursos ✅
**Como** estudiante **quiero** buscar por palabras **para** encontrar un tema.
```gherkin
Escenario: Búsqueda
  Cuando escribo "punctuation"
  Entonces tras una breve pausa veo solo los cursos cuyo título o descripción contienen el término
  Y si no hay resultados veo "No encontramos cursos"
```

### HU-15 · Ver un curso ✅
**Como** estudiante **quiero** reproducir las lecciones en orden **para** aprender de forma continua.
```gherkin
Escenario: Reproducción
  Cuando entro a un curso
  Entonces se carga la primera lección en el reproductor
  Y al terminar una lección comienza la siguiente
  Y puedo usar "Anterior" / "Siguiente" o elegir de la lista

Escenario: Curso sin lecciones listas
  Entonces veo "Lecciones en preparación"
```

### HU-16 · Recordar mi progreso 🟡
**Como** estudiante **quiero** ver qué lecciones ya vi **para** continuar donde quedé.
```gherkin
Escenario: Progreso local
  Cuando termino una lección
  Entonces queda marcada como vista y la barra de progreso del curso avanza
  # Pendiente: progreso por cuenta en el servidor (requiere HU de registro de estudiante)
```

---

## Épica 5 — Operación

### HU-17 · Desplegar con Docker ✅
**Como** responsable técnico **quiero** levantar todo con un comando **para** instalar en cualquier servidor.
```gherkin
Escenario: Arranque limpio
  Dado un equipo con Docker
  Cuando copio .env.example a .env y ejecuto "docker compose up -d --build"
  Entonces quedan disponibles el portal (8200), el panel (8300) y la API (5000)
  Y la base de datos se migra sola y se crea el instructor semilla
```

### HU-18 · Seguridad por identidad ⬜
**Como** instructor **quiero** que nadie más pueda modificar mis cursos **para** proteger mi contenido.
```gherkin
Escenario: Propiedad desde el token
  Dado que estoy autenticado
  Cuando creo, edito o elimino un curso
  Entonces la API usa mi id del token y no un id enviado por el cliente
```
