// Simple ID generator
export const genId = () => Math.random().toString(36).substr(2, 9);

export const FIELD_TYPES = [
  { value: 'text',       label: 'Texto',        group: 'Básicos' },
  { value: 'textarea',   label: 'Área de texto', group: 'Básicos' },
  { value: 'number',     label: 'Número',        group: 'Básicos' },
  { value: 'currency',   label: 'Moneda',        group: 'Básicos' },
  { value: 'percentage', label: 'Porcentaje',    group: 'Básicos' },
  { value: 'email',      label: 'Email',         group: 'Básicos' },
  { value: 'password',   label: 'Contraseña',    group: 'Básicos' },
  { value: 'date',       label: 'Fecha',         group: 'Básicos' },
  { value: 'datetime',   label: 'Fecha y hora',  group: 'Básicos' },
  { value: 'hidden',     label: 'Oculto',        group: 'Básicos' },
  { value: 'label',      label: 'Etiqueta',      group: 'Básicos' },
  { value: 'richtext',   label: 'Texto enriquecido', group: 'Básicos' },
  { value: 'timeline',   label: 'Línea del tiempo',  group: 'Básicos' },
  { value: 'listbox',    label: 'Lista desplegable', group: 'Selección' },
  { value: 'multiselect',label: 'Multiselección', group: 'Selección' },
  { value: 'radio',      label: 'Radio',         group: 'Selección' },
  { value: 'checkbox',   label: 'Checkbox',      group: 'Selección' },
  { value: 'url_link',   label: 'URL / Enlace',  group: 'Acción' },
  { value: 'button',     label: 'Botón',         group: 'Acción' },
  { value: 'image',      label: 'Imagen',        group: 'Acción' },
  { value: 'file',       label: 'Archivo',       group: 'Acción' },
  { value: 'nav_menu',   label: 'Menú de navegación', group: 'Layout' },
  { value: 'copyright',  label: 'Copyright',     group: 'Layout' },
  { value: 'tabla',      label: 'Tabla',          group: 'Datos' },
];

export const FORM_TYPES = [
  { value: 'record', label: 'Record — CRUD un registro' },
  { value: 'grid',   label: 'Grid — Tabla de registros' },
  { value: 'menu',   label: 'Menu — Navegación' },
  { value: 'search', label: 'Search — Búsqueda + resultados' },
  { value: 'report', label: 'Report — Solo lectura con totales' },
  { value: 'header', label: 'Header — Cabecera de página' },
  { value: 'footer', label: 'Footer — Pie de página' },
  { value: 'hero',   label: 'Hero — Sección principal destacada' },
  { value: 'modal',  label: 'Modal — Ventana emergente' },
  { value: 'wizard',   label: 'Wizard — Formulario multi-paso' },
  { value: 'tabs',     label: 'Tabs — Formulario con pestañas' },
  { value: 'timeline', label: 'Timeline — Línea del tiempo' },
];

export const DB_TYPES = ['oracle','mysql','postgres','mssql','sqlite'];

export const RULE_TYPES = [
  { value: 'business',   label: 'Negocio',     color: '#fbbf24' },
  { value: 'ui',         label: 'UI',          color: '#388bfd' },
  { value: 'security',   label: 'Seguridad',   color: '#f85149' },
  { value: 'data',       label: 'Datos',       color: '#3fb950' },
  { value: 'validation', label: 'Validación',  color: '#bc8cff' },
];

export const fieldTypeColor = (type) => {
  const map = {
    text: '#388bfd', textarea: '#388bfd', number: '#fbbf24', currency: '#fbbf24',
    percentage: '#fbbf24', email: '#3fb950', password: '#f85149', date: '#bc8cff',
    datetime: '#bc8cff', hidden: '#8b949e', label: '#8b949e', richtext: '#388bfd',
    listbox: '#d97706', multiselect: '#d97706', radio: '#d97706', checkbox: '#d97706',
    url_link: '#3fb950', button: '#f85149', image: '#bc8cff', file: '#3fb950',
    nav_menu: '#388bfd', copyright: '#8b949e', timeline: '#bc8cff', tabla: '#3fb950',
  };
  return map[type] || '#8b949e';
};

export const newProject = (data) => ({
  schema_version: '2.0',
  meta: {
    spec_id: genId(),
    name: data.name,
    version: '1.0.0',
    author: data.author || '',
    description: data.description || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    roles: [],
  },
  catalogs: [],
  global_rules: [],
  navigation: {
    login_page: '',
    home_page: '',
    header_page: '',
    footer_page: '',
    menu_structure: [],
  },
  pages: data.firstPage ? [newPage(data.firstPage)] : [],
  modules: [],
  components_library: [],
  export_meta: {
    ai_context: '',
    tech_stack: ['React', 'PHP'],
    conventions: [],
    open_issues: [],
  },
});

export const newModule = (name = 'Nuevo Módulo') => ({
  id: genId(),
  title: name,
  description: '',
  roles_allowed: [],
  pages: [],
});

export const newPage = (name = 'Nueva Página') => ({
  id: genId(),
  title: name,
  description: '',
  layout: 'limpio',
  security_level: 1,
  roles_allowed: ['usuario'],
  is_generated: false,
  forms: [],
  page_rules: [],
});

const DEFAULT_FORM_TITLES = { header: 'Header', footer: 'Footer', hero: 'Hero', modal: 'Modal' };

const defaultFieldsFor = (type) => {
  if (type === 'header') {
    return [{ ...newField('MENU_PRINCIPAL'), caption: 'Menú Principal', type: 'nav_menu', description: 'Menú de navegación principal' }];
  }
  if (type === 'footer') {
    return [{ ...newField('COPYRIGHT'), caption: '© 2024 - Todos los derechos reservados', type: 'copyright', description: 'Texto de copyright' }];
  }
  if (type === 'hero') {
    return [
      { ...newField('HERO_TITULO'),    caption: 'Título principal',       type: 'label',    description: 'Texto del título grande del hero' },
      { ...newField('HERO_SUBTITULO'), caption: 'Subtítulo / descripción', type: 'textarea', description: 'Texto descriptivo debajo del título' },
      { ...newField('HERO_CTA'),       caption: 'Comenzar ahora',          type: 'button',   description: 'Botón de llamada a la acción' },
    ];
  }
  return [];
};

const defaultMenuItems = () => [
  { id: genId(), label: 'Inicio',        url: '#', icon: '' },
  { id: genId(), label: 'Módulo 1',      url: '#', icon: '' },
  { id: genId(), label: 'Configuración', url: '#', icon: '' },
];

export const newForm = (name, type = 'record') => {
  const title = name || DEFAULT_FORM_TITLES[type] || 'Nuevo Formulario';
  return {
    id: genId(),
    title,
    description: '',
    type,
    order: 0,
    data_source: { table: '', sql_custom: null, order_field: '', order_dir: 'asc', where: '' },
    operations: { allow_insert: true, allow_update: true, allow_delete: false, allow_search: true, allow_export: false },
    pagination: { enabled: false, records_per_page: 20, show_prev_next: true, show_page_numbers: true },
    layout: { orientation: 'vertical', grid_type: 'tabular' },
    menu_config: { direction: 'horizontal', items: type === 'menu' ? defaultMenuItems() : [] },
    wizard_config: type === 'wizard' ? { steps: ['Paso 1', 'Paso 2', 'Confirmación'] } : undefined,
    tabs_config: type === 'tabs' ? { tabs: ['Pestaña 1', 'Pestaña 2'] } : undefined,
    timeline_config: type === 'timeline' ? { orientation: 'horizontal', events: ['Inicio', 'En progreso', 'Revisión', 'Completado'] } : undefined,
    parameters: [],
    fields: defaultFieldsFor(type),
    rules: [],
  };
};

export const newField = (name = 'NUEVO_CAMPO') => ({
  id: genId(),
  name,
  caption: name,
  description: '',
  type: 'text',
  data_source: '',
  is_pk: false,
  required: false,
  unique: false,
  format: 'text',
  size: 100,
  max_length: 255,
  rows: 3,
  default_value: '',
  placeholder: '',
  help_text: '',
  lookup: { table: '', id_field: '', name_field: '', sql: '', lov: '', catalog_id: '' },
  tabla_config: { catalog_id: '' },
  timeline_config: { orientation: 'horizontal', events: ['Evento 1', 'Evento 2', 'Evento 3'] },
  wizard_step: 0,
  tab_index: 0,
  timeline_event: 0,
  validations: [],
  display_rules: [],
});

export const newRule = () => ({
  id: genId(),
  description: '',
  type: 'business',
  detail: '',
});
