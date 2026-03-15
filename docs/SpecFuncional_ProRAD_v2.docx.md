**EDITOR DE INTERFACES PRO-RAD**

*Especificación Funcional — Versión 2.0*

Editor Visual de Especificación de Proyectos para IA

Revisado: Marzo 2026

# **0\. Cambios Clave Respecto a la Versión 1.0**

Esta versión reenfoca completamente el sistema. Se elimina la generación de código y se establece la misión central:

| Aspecto | V1.0 (anterior) | V2.0 (esta especificación) |
| :---- | :---- | :---- |
| Objetivo | Generar código PHP desde el editor | Generar especificación JSON \+ Markdown para IA |
| Modelo de eventos | OnClick, OnLoad definidos | Eliminado — no requerido |
| JSON schema | Truncado / incompleto | Schema completo derivado del análisis del .ccs real |
| Exportación | Archivos PHP en servidor | Descarga de .json y .md para prompting de IA |
| Seguridad API | No definida | api.php con token simple \+ .htaccess |
| Flujo de usuario | No definido | Incluido en §6 |
| Reglas de negocio | Ausentes | Editor de reglas por formulario y por campo |
| Componentes | Lista básica | Biblioteca rica con todos los tipos del .ccs analizado |

# **1\. Misión del Sistema**

El Editor de Interfaces Pro-RAD es una herramienta de diseño visual acelerado que permite a equipos de producto especificar sistemas completos — páginas, formularios, campos, reglas de negocio y flujos de datos — y exportar esa especificación en formatos estructurados que la IA puede consumir directamente para generar código validado, arquitectura y planes de desarrollo.

**El sistema NO genera código. Su entregable es la especificación.**

| Objetivo | Descripción |
| :---- | :---- |
| 1\. Visibilidad rápida | El usuario puede ver en minutos la funcionalidad completa del sistema vía el árbol de páginas, formularios y campos |
| 2\. Exportación para IA | Genera un .json estructurado y un .md narrativo listos para ser dados a una IA como plan de desarrollo validado |
| 3\. JSON útil y procesable | El formato JSON sigue un schema completo, versionado y consistente, apto para parseo automático por cualquier herramienta |

# **2\. Arquitectura del Sistema**

## **2.1 Stack Tecnológico**

| Capa | Tecnología | Responsabilidad |
| :---- | :---- | :---- |
| Frontend | React (Vite) \+ Tailwind CSS \+ Lucide Icons | Editor visual interactivo, árbol de componentes, inspector |
| Backend | PHP puro (api.php) | CRUD de proyectos en disco (lectura/escritura de JSON) |
| Persistencia | Archivos .json en servidor | Un archivo por proyecto, schema v2.0 definido en §5 |
| Exportación | Generación client-side | Descarga de .json y .md desde el browser, sin dependencias |
| Entorno target | Apache/Nginx local (XAMPP/Laragon) | Sin Node.js en producción para el usuario final |

## **2.2 Seguridad del Backend**

El api.php implementa protección mínima pero efectiva:

* Token estático en cabecera HTTP X-RAD-Token validado en cada request

* .htaccess deniega acceso directo a los archivos .json desde el browser

* Sanitización de rutas para prevenir path traversal (../../../)

* Las credenciales de BD en el JSON son opcionales y se marcan como 'solo para referencia de especificación'

# **3\. Interfaz del Editor Visual (Layout de 3 Paneles)**

## **3.1 Estructura General**

La interfaz se organiza en tres zonas permanentes más una barra de herramientas superior:

| Zona | Nombre | Contenido principal |
| :---- | :---- | :---- |
| Barra superior | Toolbar | Logo, nombre del proyecto, botones Guardar / Exportar JSON / Exportar MD / Deshacer-Rehacer |
| Columna izquierda (280px) | Panel de Estructura | Árbol jerárquico: Proyecto → Páginas → Formularios → Campos. Búsqueda rápida, drag-and-drop para reordenar |
| Área central (flexible) | Work Area | Dos modos: Editor (canvas interactivo) y Vista Previa (render simulado del formulario) |
| Columna derecha (320px) | Inspector | Panel dinámico según el elemento seleccionado: propiedades, reglas, validaciones, lookup |

## **3.2 Panel de Estructura (Columna Izquierda)**

* Árbol colapsable con iconos por tipo de nodo (página, formulario tipo record/grid/menu, campo)

* Click para seleccionar un nodo y abrirlo en el Inspector

* Doble click para renombrar inline

* Botón '+' contextual: agrega el siguiente elemento lógico (página a proyecto, formulario a página, campo a formulario)

* Drag-and-drop para reordenar campos dentro de un formulario o formularios dentro de una página

* Indicador visual de campos requeridos, PK, y campos con reglas activas

## **3.3 Work Area (Área Central)**

### **Modo Editor**

* Visualización del formulario seleccionado como canvas interactivo

* Cada campo se muestra como un bloque con: etiqueta, control visual, badge de tipo

* Click en un campo lo selecciona y abre su inspector en la columna derecha

* Drag-and-drop para reordenar campos dentro del canvas

* Botón flotante '+ Agregar Campo' al final del canvas

* Indicador de estado: campos con reglas, campos con lookup, campos ocultos

### **Modo Vista Previa**

* Render simulado del formulario usando Tailwind CSS

* Muestra datos de ejemplo generados automáticamente según el tipo de campo

* Los campos tipo listbox muestran las opciones del LOV o una indicación de 'datos desde BD'

* Toggle para simular mobile / tablet / desktop

## **3.4 Inspector de Propiedades (Columna Derecha)**

El inspector es contextual y cambia según el nodo seleccionado en el árbol:

| Nodo seleccionado | Secciones del Inspector |
| :---- | :---- |
| Proyecto | Metadata, Conexión BD, Configuración global, Reglas globales, Navegación |
| Página | Propiedades básicas, Seguridad/Roles, Reglas de página, Layout |
| Formulario | Tipo y fuente de datos, Operaciones permitidas, Paginación, Parámetros, Reglas de formulario |
| Campo | Identificación, Tipo de campo, Fuente de datos, Validaciones, Lookup, Reglas de display, Ayuda |

# **4\. Biblioteca de Tipos de Campo (Análisis del .ccs Real)**

El análisis del archivo SIEPPE.ccs (8,435 líneas, 35+ páginas, sistema real Oracle/JSP) reveló los siguientes tipos de campo que el editor debe soportar nativamente:

## **4.1 Tipos de Campo Básicos**

| Tipo | Equivalente CCS | Descripción | Propiedades especiales |
| :---- | :---- | :---- | :---- |
| text | Text | Campo de texto de una línea | max\_length, placeholder, format |
| textarea | Memo | Área de texto multilínea | rows, max\_length |
| number | Text+Number format | Numérico entero o decimal | min, max, decimals |
| currency | Text+Currency | Moneda con formato regional | currency\_code, decimals |
| percentage | Text+Percentage | Porcentaje con símbolo % | min (0), max (100) |
| email | Text | Email con validación automática | \- |
| password | Text+IsPassword=True | Texto enmascarado | confirm\_field |
| date | Text+Date format | Selector de fecha | min\_date, max\_date, format\_sql |
| datetime | Text+DateTime | Fecha y hora | timezone |
| hidden | Hidden | Campo oculto, no visible al usuario | value\_origin: session/url/fixed |
| label | Label | Texto estático no editable | html\_allowed |
| richtext | \- | Editor de texto enriquecido (WYSIWYG) | toolbar\_config |

## **4.2 Tipos de Campo de Selección**

| Tipo | Equivalente CCS | Descripción | Config de lookup |
| :---- | :---- | :---- | :---- |
| listbox | ListBox | Dropdown de selección única | lookup.sql, lookup.lov, lookup.table |
| multiselect | ListBox+multiple | Dropdown de selección múltiple | lookup.sql, separator |
| radio | RadioButton | Grupo de opciones excluyentes | lookup.lov, orientation: horizontal/vertical |
| checkbox | CheckBox | Casilla verdadero/falso | checked\_value, unchecked\_value |
| checkbox\_group | CheckBox+multiple | Grupo de checkboxes múltiples | lookup.lov |

## **4.3 Tipos de Campo de Acción / Navegación**

| Tipo | Equivalente CCS | Descripción |
| :---- | :---- | :---- |
| url\_link | URL | Enlace a otra página del proyecto con parámetros de tránsito |
| button | Button | Botón de acción dentro del formulario (submit, navigate, custom) |
| image | Image | Imagen estática o dinámica desde BD |
| file | File | Campo de carga de archivo (especificación de tipo y tamaño máximo) |

## **4.4 Tipos de Formulario**

| Tipo | Equivalente CCS | Descripción | Características |
| :---- | :---- | :---- | :---- |
| record | Record | Formulario de un solo registro (CRUD) | Pestañas: Editar / Nuevo / Ver |
| grid | Grid/Tabular | Tabla de registros con paginación | Columnas ordenables, búsqueda integrada, acciones por fila |
| menu | Menu | Lista de enlaces de navegación | Puede tener submenús anidados |
| search | \- | Formulario de búsqueda \+ resultados en grid | Combina campos de filtro con un grid de resultados |
| report | \- | Vista de solo lectura con totales/subtotales | Export a CSV/PDF especificable |

# **5\. Schema JSON Completo (v2.0)**

El siguiente schema es la estructura canónica de un archivo de especificación. Fue diseñado a partir del análisis directo del archivo SIEPPE.ccs (CodeCharge Studio 2.0.7, Oracle, 35+ páginas, sistema real de gobierno mexicano).

**Convenciones de notación en el schema:**

* "string  // comentario" — el valor es string, el comentario es la descripción

* "type1 | type2" — valor enumerado, solo una opción válida

* \[...\] — array, puede estar vacío

* "any" — el tipo depende del contexto

  {

    "schema\_version": "2.0",

    "meta": {

      "spec\_id":    "string  // UUID único del proyecto",

      "name":       "string  // Nombre del sistema/aplicación",

      "version":    "string  // Semver: 1.0.0",

      "author":     "string",

      "description":"string  // Descripción funcional de alto nivel",

      "created\_at": "ISO8601",

      "updated\_at": "ISO8601",

      "tags":       \["array de strings para categorización"\]

    },

    "database": {

      "type":   "oracle | mysql | postgres | mssql | sqlite",

      "host":   "string",

      "port":   "number",

      "name":   "string  // Nombre de la base de datos",

      "schema": "string  // Schema/owner (ej. SIEPPE en Oracle)"

    },

    "global\_rules": \[

      {

        "id":          "string",

        "rule\_type":   "security | naming | ui | data\_validation | workflow",

        "description": "string",

        "applies\_to":  "all | page | form | field",

        "value":       "any  // El valor/config de la regla"

      }

    \],

    "navigation": {

      "login\_page":  "string  // page.id de la página de login",

      "home\_page":   "string  // page.id del home",

      "header\_page": "string  // page.id del encabezado global",

      "footer\_page": "string  // page.id del pie global",

      "menu\_structure": \[

        { "label": "string", "page\_id": "string", "children": \[\] }

      \]

    },

    "pages": \[

      {

        "id":             "string  // slug único: menu\_principal",

        "title":          "string  // Título visible",

        "description":    "string  // Propósito funcional de la página",

        "layout":         "simple | two\_column | dashboard",

        "security\_level": "number  // 0=público, 1=usuario, 2=admin",

        "roles\_allowed":  \["admin", "usuario", "invitado"\],

        "is\_generated":   "boolean",

        "forms": \[

          {

            "id":          "string  // slug: form\_actividades",

            "title":       "string",

            "description": "string  // Qué hace este formulario",

            "type":        "record | grid | menu | search | report",

            "order":       "number  // Orden de render en la página",

            "data\_source": {

              "table":       "string  // Tabla principal de BD",

              "sql\_custom":  "string | null  // SQL personalizado",

              "order\_field": "string",

              "order\_dir":   "asc | desc",

              "where":       "string  // Condición WHERE base"

            },

            "operations": {

              "allow\_insert": "boolean",

              "allow\_update": "boolean",

              "allow\_delete": "boolean",

              "allow\_search": "boolean",

              "allow\_export": "boolean"

            },

            "pagination": {

              "enabled":          "boolean",

              "records\_per\_page": "number",

              "show\_prev\_next":   "boolean",

              "show\_page\_numbers":"boolean"

            },

            "layout": {

              "orientation": "horizontal | vertical",

              "grid\_type":   "tabular | card | timeline"

            },

            "parameters": \[

              {

                "name":         "string  // Ej: S\_CCT",

                "data\_source":  "string  // Campo de BD que mapea",

                "origin":       "session | url | post | cookie",

                "required":     "boolean",

                "data\_type":    "text | number | date | boolean",

                "default\_value":"any"

              }

            \],

            "fields": \[

              {

                "id":           "string",

                "name":         "string  // Nombre técnico del campo",

                "caption":      "string  // Etiqueta visible al usuario",

                "description":  "string  // Descripción funcional",

                "type":         "text | textarea | number | email | password |

                                 date | datetime | listbox | radio | checkbox |

                                 hidden | label | url\_link | image | file |

                                 currency | percentage | richtext",

                "data\_source":  "string  // Columna de BD (ej: SAC\_DESCRIPCION)",

                "is\_pk":        "boolean",

                "required":     "boolean",

                "unique":       "boolean",

                "format":       "text | number | date | currency | percentage",

                "size":         "number  // Ancho visual en %",

                "max\_length":   "number",

                "rows":         "number  // Para textarea: filas visibles",

                "default\_value":"any",

                "placeholder":  "string",

                "help\_text":    "string  // Ayuda contextual",

                "lookup": {

                  "table":      "string",

                  "id\_field":   "string",

                  "name\_field": "string",

                  "sql":        "string  // SQL para poblar el listbox",

                  "lov":        "string  // Lista estática val1=label1;val2=label2"

                },

                "validations": \[

                  {

                    "rule":    "min\_length | max\_length | regex | range |

                                email | numeric | date\_range | custom",

                    "value":   "any",

                    "message": "string  // Mensaje de error al usuario"

                  }

                \],

                "display\_rules": \[

                  {

                    "condition": "string  // ej: field:CVE\_PROCESO \!= ''",

                    "action":    "show | hide | enable | disable | required"

                  }

                \]

              }

            \],

            "rules": \[

              {

                "id":          "string",

                "description": "string  // Descripción de la regla de negocio",

                "type":        "business | ui | security | data",

                "detail":      "string  // Explicación detallada para la IA"

              }

            \]

          }

        \],

        "page\_rules": \[

          {

            "id":          "string",

            "description": "string",

            "detail":      "string"

          }

        \]

      }

    \],

    "components\_library": \[

      {

        "id":          "string  // Identificador reutilizable",

        "name":        "string",

        "description": "string",

        "type":        "login\_block | menu\_builder | data\_table | date\_picker |

                        smart\_form | report\_viewer | file\_uploader",

        "config":      "object  // Configuración específica del componente"

      }

    \],

    "export\_meta": {

      "ai\_context":   "string  // Resumen ejecutivo para la IA",

      "tech\_stack":   \["React", "PHP", "Oracle"\],

      "conventions":  \["string"\],

      "open\_issues":  \["string  // Puntos pendientes de definir"\]

    }

  }

# **6\. Flujo de Usuario (UX Flow)**

## **6.1 Pantalla de Inicio**

* Lista de proyectos recientes con nombre, fecha de última edición y badge de cantidad de páginas

* Botón 'Nuevo Proyecto': abre el wizard de configuración inicial

* Botón 'Abrir': selector de archivo .json para importar un proyecto existente

* Botón 'Importar .ccs': parser que convierte archivos CodeCharge al nuevo formato (funcionalidad avanzada post-MVP)

## **6.2 Wizard de Nuevo Proyecto (3 pasos)**

| Paso | Campos | Acción |
| :---- | :---- | :---- |
| 1\. Identidad | Nombre, descripción, autor, versión, tags | Valida nombre único, continua |
| 2\. Base de datos | Tipo BD, host, puerto, nombre BD, schema/owner (opcional) | Guarda config de BD, puede omitirse |
| 3\. Primer página | Nombre de la primera página, tipo de layout, nivel de seguridad | Crea el proyecto y la primera página, abre el editor |

## **6.3 Flujo Principal de Trabajo**

* Usuario selecciona o crea una página en el árbol

* Agrega un formulario a la página desde el panel izquierdo o el botón flotante

* Configura el formulario en el Inspector: tipo, tabla, operaciones permitidas, paginación

* Agrega campos al formulario: click en '+' o drag desde la toolbox de tipos de campo

* Configura cada campo en el Inspector: tipo, fuente, lookup, validaciones, reglas de display

* Agrega reglas de negocio al formulario o campo usando el Editor de Reglas

* Revisa en Modo Vista Previa

* Exporta cuando la especificación está completa

## **6.4 Flujo de Exportación**

El botón 'Exportar' despliega un panel modal con tres opciones:

| Opción | Formato | Contenido | Uso |
| :---- | :---- | :---- | :---- |
| Especificación técnica | .json | El archivo completo según schema v2.0 | Parseo por IA o herramientas de generación de código |
| Documento narrativo | .md | Markdown con todas las páginas, formularios, campos y reglas en lenguaje natural | Prompting directo a IA para explicación y planificación |
| Resumen ejecutivo | .md | Una página con el inventario del sistema: N páginas, N formularios, N campos, reglas clave | Revisión rápida con stakeholders |

# **7\. Editor de Reglas y Propiedades**

Una sección crítica ausente en v1.0. Las reglas son el componente que da valor real a la especificación para la IA: describen el COMPORTAMIENTO, no solo la estructura.

## **7.1 Niveles de Reglas**

| Nivel | Alcance | Ejemplos |
| :---- | :---- | :---- |
| Global | Todo el proyecto | Convención de nomenclatura de campos, política de seguridad, reglas de accesibilidad |
| Página | Una página específica | Esta página requiere autenticación, redirige a login si sesión expiró |
| Formulario | Un formulario específico | El formulario de actividades solo muestra si la fórmula seleccionada es tipo 3 o 4 |
| Campo | Un campo específico | El campo CVE\_SUBPROCESO se habilita solo si CVE\_PROCESO tiene valor; el campo ANIO solo muestra años con SPE\_FECHA\_INICIO \< HOY |

## **7.2 Tipos de Regla**

| Tipo | Descripción | Campos del editor |
| :---- | :---- | :---- |
| business | Regla de negocio funcional | Descripción, detalle narrativo para IA, prioridad |
| ui | Comportamiento de interfaz | Condición (campo:valor operador), acción: show/hide/enable/disable/required |
| security | Control de acceso | Roles permitidos, condición, redirección en caso de fallo |
| data | Transformación o derivación de datos | Campo origen, operación, campo destino, descripción |
| validation | Validación de datos del campo | Regla (tipo), valor de comparación, mensaje de error al usuario |

## **7.3 UI del Editor de Reglas**

* Accesible desde el Inspector al seleccionar cualquier nodo

* Lista de reglas existentes con badge de tipo y descripción corta

* Botón 'Agregar Regla' abre un formulario inline dentro del inspector

* Para reglas de tipo 'ui': selector visual de campo fuente \+ operador \+ valor, selector de acción

* Para reglas de tipo 'business' y 'data': campo de texto largo (descripción narrativa para IA)

* Las reglas se exportan tanto al JSON como al Markdown narrativo

# **8\. Generación del Documento Markdown**

El archivo .md generado sigue una estructura estándar diseñada para ser leída por una IA como contexto de proyecto completo:

| Sección del .md | Contenido |
| :---- | :---- |
| \# Proyecto: \[Nombre\] | Descripción, stack tecnológico, base de datos, fecha |
| \#\# Reglas Globales | Lista de todas las reglas de nivel proyecto en lenguaje natural |
| \#\# Navegación | Mapa del sitio: páginas y su jerarquía de menú |
| \#\# Página: \[Nombre\] | Una sección por página con: descripción, nivel de seguridad, roles |
| \#\#\# Formulario: \[Nombre\] (\[tipo\]) | Fuente de datos, operaciones, paginación, parámetros de entrada |
| \#\#\#\# Campos | Tabla de campos: nombre, tipo, fuente BD, requerido, lookup, validaciones |
| \#\#\#\# Reglas de negocio | Lista numerada de reglas con descripción detallada |
| \#\# Puntos Abiertos | Lista de ítems marcados como 'pendiente de definir' en el proyecto |
| \#\# Contexto para IA | El campo export\_meta.ai\_context del JSON, redactado por el usuario |

# **9\. Biblioteca de Componentes Reutilizables**

Los componentes son plantillas de formulario pre-configuradas que el usuario puede instanciar en cualquier página y personalizar. Reducen el tiempo de especificación para patrones comunes.

| Componente | Basado en CCS | Qué genera | Config clave |
| :---- | :---- | :---- | :---- |
| Login Block | Page 'login' del SIEPPE | Formulario con campos usuario/password, validación de sesión, redirección post-login | Tabla de usuarios, campo login, campo password, página home |
| Menu Builder | Form Type='Menu' del SIEPPE | Formulario tipo menu con URL links a páginas del proyecto, soporte de submenús | Lista de páginas, profundidad máxima, estilo: sidebar/topbar |
| Smart Form | Form Type='Record' del SIEPPE | Formulario CRUD completo con detección automática de tipos de campo según el nombre de columna BD | Tabla BD, operaciones, mapeo automático tipo-campo |
| Data Grid | Form Type='Grid/Tabular' | Tabla paginada con búsqueda, ordenación y acciones por fila (ver, editar, eliminar) | Tabla BD, columnas visibles, registros por página, acciones |
| Date Picker Field | Field Type='Text'+Date format | Campo de fecha con calendario desplegable, formatos SQL compatibles (ORACLE/MySQL/PG) | formato\_output: DATE/DATETIME/ISO |
| Cascading Listbox | Fields S\_CCT → anio → trimestre | Par de listboxes donde el segundo filtra según el valor del primero (patrón del SIEPPE real) | Campo padre, campo hijo, SQL dependiente |
| File Uploader | \- | Campo de carga de archivo con especificación: tipos permitidos, tamaño máximo, destino | allowed\_types, max\_size\_mb, storage\_path |
| Report Viewer | Form Type='Grid' readonly | Vista de solo lectura con agrupación, subtotales y botón de exportación a CSV | SQL, campos de agrupación, campos de suma |

# **10\. Requisitos del MVP — Definition of Done**

## **10.1 Stack del MVP**

* Frontend: React (Vite) \+ Tailwind CSS \+ Lucide Icons \+ @hello-pangea/dnd (drag-and-drop)

* Backend: api.php — GET para cargar proyecto, POST para guardar JSON, con token header

* Entorno: Apache local (XAMPP/Laragon), sin Node.js en runtime de usuario final

## **10.2 Criterios de Completitud del MVP**

El MVP está completo cuando un usuario puede realizar el siguiente flujo sin errores:

| \# | Criterio | Resultado esperado |
| :---- | :---- | :---- |
| 1 | Crear nuevo proyecto desde el wizard | Proyecto guardado en JSON en servidor |
| 2 | Agregar 3 páginas al proyecto | Árbol muestra las 3 páginas |
| 3 | Agregar un formulario tipo 'record' a una página | Formulario visible en árbol y en canvas |
| 4 | Agregar 5 campos de tipos distintos al formulario | Campos visibles en canvas con sus controles visuales |
| 5 | Configurar un campo listbox con LookupSQL | Inspector muestra los campos de lookup correctamente |
| 6 | Agregar una regla de negocio a un formulario | Regla visible en inspector y en exportación |
| 7 | Exportar a .json | Archivo descargable, válido según schema v2.0 |
| 8 | Exportar a .md | Documento Markdown legible con todas las páginas y reglas |
| 9 | Recargar la página del editor | El proyecto persiste exactamente como se dejó (auto-save) |
| 10 | Abrir el proyecto en otro navegador | El proyecto carga correctamente vía api.php GET |

## **10.3 Fuera del Alcance del MVP**

* Parser de archivos .ccs (importar proyectos CodeCharge)

* Autenticación multi-usuario con roles en el propio editor

* Historial de versiones / control de cambios

* Sincronización en tiempo real multi-usuario (colaboración)

* Conexión real a BD para introspección de tablas (solo especificación manual en MVP)

# **11\. Consideraciones Adicionales**

## **11.1 Auto-save**

Implementado como hook de React con debounce de 3 segundos de inactividad. Se muestra un indicador de estado en la toolbar: 'Guardado', 'Guardando...', o 'Error al guardar'. En caso de error de red, el estado se preserva en localStorage como respaldo temporal.

## **11.2 Versionado del Schema JSON**

El campo schema\_version en el JSON permite detectar y migrar proyectos creados con versiones anteriores del editor. Se incluirá un script de migración v1→v2 para proyectos existentes.

## **11.3 Validación del JSON Exportado**

Antes de la descarga, el editor valida que el JSON cumpla el schema v2.0. Se muestra un panel de errores/advertencias si hay campos obligatorios vacíos o inconsistencias (ej: un campo con lookup sin tabla ni LOV definidos).

## **11.4 Campo 'Contexto para IA' (ai\_context)**

Cada proyecto incluye un campo de texto libre 'Contexto para IA' en las propiedades globales. Este texto se incluye al inicio del .md exportado y sirve como system prompt contextual cuando el desarrollador da la especificación a la IA. Ejemplo de contenido útil:

"ai\_context": "Este sistema es un portal interno para gobierno municipal mexicano.

  La BD es Oracle 12c. El equipo de frontend usa React 18 \+ Tailwind 3\.

  La convención de nombres en BD es: tabla\_campo (ej: USU\_NOMBRE \= tabla USUARIOS, campo NOMBRE).

  Los formularios tipo 'record' siempre tienen un botón Cancelar que regresa a la página anterior.

  La seguridad nivel 1 \= usuario autenticado, nivel 2 \= administrador de unidad, nivel 3 \= superadmin."

*Editor de Interfaces Pro-RAD — Especificación Funcional v2.0*