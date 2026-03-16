// Export project to JSON string
export const exportJSON = (project) => {
  const p = { ...project, meta: { ...project.meta, updated_at: new Date().toISOString() } };
  return JSON.stringify(p, null, 2);
};

// ─── Helpers ────────────────────────────────────────────────────────────────

const ruleLines = (rules, indent = '') =>
  (rules || []).map((r, i) =>
    `${indent}${i + 1}. **[${(r.type || 'REGLA').toUpperCase()}]** ${r.description || '(sin descripción)'}` +
    (r.detail ? `\n${indent}   > ${r.detail}` : '')
  );

const fieldLookupLabel = (f, catalogs = []) => {
  if (f.tabla_config?.catalog_id) {
    const cat = catalogs.find(c => c.id === f.tabla_config.catalog_id);
    return cat ? `📋 ${cat.name}` : '📋 catálogo';
  }
  if (f.lookup?.catalog_id) {
    const cat = catalogs.find(c => c.id === f.lookup.catalog_id);
    return cat ? `📂 ${cat.name}` : '📂 catálogo';
  }
  if (f.lookup?.sql) return '✓ SQL';
  if (f.lookup?.lov) return '✓ LOV';
  if (f.lookup?.table) return `✓ BD:${f.lookup.table}`;
  return '—';
};

const slotLabel = (f, form) => {
  if (form.type === 'wizard' && form.wizard_config?.steps?.length) {
    const step = form.wizard_config.steps[f.wizard_step ?? 0];
    return step ? `Paso ${(f.wizard_step ?? 0) + 1}: ${step}` : '—';
  }
  if (form.type === 'tabs' && form.tabs_config?.tabs?.length) {
    return form.tabs_config.tabs[f.tab_index ?? 0] || '—';
  }
  if (form.type === 'timeline' && form.timeline_config?.events?.length) {
    return form.timeline_config.events[f.timeline_event ?? 0] || '—';
  }
  return null;
};

const renderFieldsTable = (form, catalogs) => {
  const lines = [];
  if (!form.fields?.length) return lines;

  const isSlotted = ['wizard', 'tabs', 'timeline'].includes(form.type);
  const header = isSlotted
    ? '| Campo | Tipo | Fuente BD | Req | Lookup | Slot | Descripción |'
    : '| Campo | Tipo | Fuente BD | Req | Lookup | Descripción |';
  const sep = isSlotted
    ? '|-------|------|-----------|-----|--------|------|-------------|'
    : '|-------|------|-----------|-----|--------|-------------|';

  lines.push('#### Campos', '');
  lines.push(header);
  lines.push(sep);
  form.fields.forEach(f => {
    const lookup = fieldLookupLabel(f, catalogs);
    const req = f.required ? '✓' : '—';
    const pk = f.is_pk ? ' 🔑' : '';
    const desc = (f.description || f.caption || '').replace(/\|/g, '\\|');
    if (isSlotted) {
      const slot = slotLabel(f, form) || '—';
      lines.push(`| \`${f.name}\`${pk} | ${f.type} | ${f.data_source || '—'} | ${req} | ${lookup} | ${slot} | ${desc} |`);
    } else {
      lines.push(`| \`${f.name}\`${pk} | ${f.type} | ${f.data_source || '—'} | ${req} | ${lookup} | ${desc} |`);
    }
  });
  lines.push('');
  return lines;
};

const renderFormConfig = (form) => {
  const lines = [];
  if (form.type === 'wizard' && form.wizard_config?.steps?.length) {
    lines.push(`**Pasos del Wizard:** ${form.wizard_config.steps.map((s, i) => `${i + 1}. ${s}`).join(' · ')}`, '');
  }
  if (form.type === 'tabs' && form.tabs_config?.tabs?.length) {
    lines.push(`**Pestañas:** ${form.tabs_config.tabs.join(' · ')}`, '');
  }
  if (form.type === 'timeline' && form.timeline_config) {
    const { orientation, events = [] } = form.timeline_config;
    lines.push(`**Timeline:** ${orientation} — ${events.map((e, i) => `${i + 1}. ${e}`).join(' · ')}`, '');
  }
  return lines;
};

const renderForm = (form, catalogs) => {
  const lines = [];
  lines.push(`### Formulario: ${form.title} *(${form.type})*`, '');
  if (form.description) lines.push(`${form.description}`, '');

  // Slot config
  lines.push(...renderFormConfig(form));

  // Operations
  const ops = form.operations || {};
  const opList = ['insert', 'update', 'delete', 'search', 'export']
    .filter(k => ops[`allow_${k}`]).join(', ');
  if (opList) lines.push(`**Operaciones:** ${opList}`, '');

  // Fields
  lines.push(...renderFieldsTable(form, catalogs));

  // Rules
  if (form.rules?.length) {
    lines.push('#### Reglas de Negocio', '');
    lines.push(...ruleLines(form.rules));
    lines.push('');
  }

  return lines;
};

const renderPage = (page, catalogs, headingLevel = '##') => {
  const lines = [];
  lines.push(`${headingLevel} Página: ${page.title}`, '');
  if (page.description) lines.push(`${page.description}`, '');
  lines.push(
    `- **Layout:** ${page.layout || '—'}`,
    `- **Seguridad:** Nivel ${page.security_level ?? '—'}`,
  );
  if (page.roles_allowed?.length) lines.push(`- **Roles:** ${page.roles_allowed.join(', ')}`);
  lines.push('');

  if (page.page_rules?.length) {
    lines.push(`${headingLevel}# Reglas de Página`, '');
    lines.push(...ruleLines(page.page_rules));
    lines.push('');
  }

  page.forms?.forEach(form => lines.push(...renderForm(form, catalogs)));
  return lines;
};

// ─── Main export ─────────────────────────────────────────────────────────────

export const exportMarkdown = (project) => {
  const { meta, catalogs = [], global_rules = [], navigation, pages = [], modules = [], export_meta } = project;
  const lines = [];

  // ── Header ──
  lines.push(`# Especificación: ${meta.name}`, '');
  lines.push(
    `**Versión:** ${meta.version}  `,
    `**Autor:** ${meta.author}  `,
    `**Fecha:** ${new Date().toISOString().slice(0, 10)}  `,
  );
  if (meta.tags?.length) lines.push(`**Tags:** ${meta.tags.join(', ')}  `);
  if (meta.roles?.length) lines.push(`**Roles del sistema:** ${meta.roles.join(', ')}  `);
  if (meta.description) lines.push('', meta.description);
  lines.push('');

  // ── Contexto IA ──
  if (export_meta?.ai_context) {
    lines.push('## Contexto para IA', '');
    lines.push(export_meta.ai_context, '');
  }

  if (export_meta?.tech_stack?.length) {
    lines.push(`**Stack tecnológico:** ${export_meta.tech_stack.join(', ')}`, '');
  }

  // ── Catálogos ──
  if (catalogs.length) {
    lines.push('## Catálogos del Proyecto', '');
    catalogs.forEach(cat => {
      lines.push(`### Catálogo: \`${cat.name}\``);
      if (cat.description) lines.push(`*${cat.description}*`);
      lines.push(`- **Tipo:** ${cat.input_mode}`);
      if (cat.input_mode === 'tabla' && cat.columns?.length) {
        lines.push('- **Columnas:**');
        cat.columns.forEach(col => lines.push(`  - \`${col.name}\` (${col.type}) — ${col.label}`));
      } else if (cat.input_mode === 'json' && cat.data) {
        lines.push(`- **Datos JSON:** \`${cat.data.slice(0, 120)}${cat.data.length > 120 ? '…' : ''}\``);
      } else if (cat.data) {
        lines.push(`- **Valores:** ${cat.data.slice(0, 200)}${cat.data.length > 200 ? '…' : ''}`);
      }
      lines.push('');
    });
  }

  // ── Navegación ──
  if (navigation && (navigation.login_page || navigation.home_page || navigation.menu_structure?.length)) {
    lines.push('## Navegación', '');
    if (navigation.login_page) lines.push(`- **Login:** ${navigation.login_page}`);
    if (navigation.home_page) lines.push(`- **Inicio:** ${navigation.home_page}`);
    if (navigation.header_page) lines.push(`- **Header global:** ${navigation.header_page}`);
    if (navigation.footer_page) lines.push(`- **Footer global:** ${navigation.footer_page}`);
    lines.push('');
  }

  // ── Reglas Globales ──
  if (global_rules.length) {
    lines.push('## Reglas Globales', '');
    lines.push(...ruleLines(global_rules));
    lines.push('');
  }

  // ── Módulos ──
  modules.forEach(mod => {
    lines.push(`## Módulo: ${mod.title}`, '');
    if (mod.description) lines.push(`${mod.description}`, '');
    if (mod.roles_allowed?.length) lines.push(`- **Roles:** ${mod.roles_allowed.join(', ')}`);
    lines.push('');
    (mod.pages || []).forEach(page => lines.push(...renderPage(page, catalogs, '###')));
  });

  // ── Páginas top-level ──
  if (modules.length && pages.length) {
    lines.push('## Páginas sin módulo', '');
  }
  pages.forEach(page => lines.push(...renderPage(page, catalogs, '##')));

  // ── Puntos Abiertos ──
  if (export_meta?.open_issues?.length) {
    lines.push('## Puntos Abiertos', '');
    export_meta.open_issues.forEach((issue, i) => lines.push(`${i + 1}. ${issue}`));
    lines.push('');
  }

  lines.push('---');
  lines.push(`*Generado por Pro-RAD Editor — ${new Date().toLocaleString('es-MX')}*`);

  return lines.join('\n');
};

// ─── Summary export ──────────────────────────────────────────────────────────

export const exportSummary = (project) => {
  const { meta, pages = [], modules = [], catalogs = [], global_rules = [], export_meta } = project;

  // Count everything across top-level pages and module pages
  let totalPages = 0, totalForms = 0, totalFields = 0, totalRules = 0;

  const countPage = (p) => {
    totalPages++;
    totalForms += p.forms?.length || 0;
    p.forms?.forEach(f => {
      totalFields += f.fields?.length || 0;
      totalRules += f.rules?.length || 0;
    });
    totalRules += p.page_rules?.length || 0;
  };

  pages.forEach(countPage);
  modules.forEach(m => (m.pages || []).forEach(countPage));

  const lines = [
    `# Resumen Ejecutivo: ${meta.name}`,
    '',
    `**Versión:** ${meta.version} | **Autor:** ${meta.author} | **Fecha:** ${new Date().toISOString().slice(0, 10)}`,
    '',
    '## Inventario del Sistema',
    '',
    `| Elemento            | Cantidad |`,
    `|---------------------|----------|`,
    `| Módulos             | ${modules.length} |`,
    `| Páginas             | ${totalPages} |`,
    `| Formularios         | ${totalForms} |`,
    `| Campos              | ${totalFields} |`,
    `| Reglas de negocio   | ${totalRules} |`,
    `| Catálogos           | ${catalogs.length} |`,
    `| Reglas globales     | ${global_rules.length} |`,
    '',
  ];

  if (export_meta?.tech_stack?.length) {
    lines.push(`**Stack:** ${export_meta.tech_stack.join(', ')}`, '');
  }

  if (modules.length) {
    lines.push('## Módulos', '');
    modules.forEach(m => {
      lines.push(`### ${m.title} (${(m.pages || []).length} páginas)`);
      (m.pages || []).forEach(p => lines.push(`- **${p.title}** — ${p.forms?.length || 0} formularios`));
      lines.push('');
    });
  }

  if (pages.length) {
    lines.push('## Páginas sin módulo', '');
    pages.forEach(p => lines.push(`- **${p.title}** — ${p.forms?.length || 0} formularios`));
    lines.push('');
  }

  if (global_rules.length) {
    lines.push('## Reglas Globales', '');
    lines.push(...ruleLines(global_rules));
    lines.push('');
  }

  if (export_meta?.open_issues?.length) {
    lines.push('## Puntos Abiertos', '');
    export_meta.open_issues.forEach((issue, i) => lines.push(`${i + 1}. ${issue}`));
    lines.push('');
  }

  lines.push('---');
  lines.push(`*Pro-RAD Editor v2.0*`);
  return lines.join('\n');
};

export const downloadFile = (content, filename, mime = 'text/plain') => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
