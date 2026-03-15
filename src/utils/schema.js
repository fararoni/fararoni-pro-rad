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
  { value: 'listbox',    label: 'Lista desplegable', group: 'Selección' },
  { value: 'multiselect',label: 'Multiselección', group: 'Selección' },
  { value: 'radio',      label: 'Radio',         group: 'Selección' },
  { value: 'checkbox',   label: 'Checkbox',      group: 'Selección' },
  { value: 'url_link',   label: 'URL / Enlace',  group: 'Acción' },
  { value: 'button',     label: 'Botón',         group: 'Acción' },
  { value: 'image',      label: 'Imagen',        group: 'Acción' },
  { value: 'file',       label: 'Archivo',       group: 'Acción' },
];

export const FORM_TYPES = [
  { value: 'record', label: 'Record — CRUD un registro' },
  { value: 'grid',   label: 'Grid — Tabla de registros' },
  { value: 'menu',   label: 'Menu — Navegación' },
  { value: 'search', label: 'Search — Búsqueda + resultados' },
  { value: 'report', label: 'Report — Solo lectura con totales' },
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
  },
  database: {
    type: data.db_type || 'mysql',
    host: data.db_host || 'localhost',
    port: data.db_port || 3306,
    name: data.db_name || '',
    schema: data.db_schema || '',
  },
  global_rules: [],
  navigation: {
    login_page: '',
    home_page: '',
    header_page: '',
    footer_page: '',
    menu_structure: [],
  },
  pages: data.firstPage ? [newPage(data.firstPage)] : [],
  components_library: [],
  export_meta: {
    ai_context: '',
    tech_stack: ['React', 'PHP'],
    conventions: [],
    open_issues: [],
  },
});

export const newPage = (name = 'Nueva Página') => ({
  id: genId(),
  title: name,
  description: '',
  layout: 'simple',
  security_level: 1,
  roles_allowed: ['usuario'],
  is_generated: false,
  forms: [],
  page_rules: [],
});

export const newForm = (name = 'Nuevo Formulario') => ({
  id: genId(),
  title: name,
  description: '',
  type: 'record',
  order: 0,
  data_source: { table: '', sql_custom: null, order_field: '', order_dir: 'asc', where: '' },
  operations: { allow_insert: true, allow_update: true, allow_delete: false, allow_search: true, allow_export: false },
  pagination: { enabled: false, records_per_page: 20, show_prev_next: true, show_page_numbers: true },
  layout: { orientation: 'vertical', grid_type: 'tabular' },
  parameters: [],
  fields: [],
  rules: [],
});

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
  lookup: { table: '', id_field: '', name_field: '', sql: '', lov: '' },
  validations: [],
  display_rules: [],
});

export const newRule = () => ({
  id: genId(),
  description: '',
  type: 'business',
  detail: '',
});
