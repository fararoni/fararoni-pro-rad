// Export project to JSON string
export const exportJSON = (project) => {
  const p = { ...project, meta: { ...project.meta, updated_at: new Date().toISOString() } };
  return JSON.stringify(p, null, 2);
};

// Export project to Markdown narrative
export const exportMarkdown = (project) => {
  const { meta, database, global_rules, navigation, pages, export_meta } = project;
  const lines = [];

  lines.push(`# Proyecto: ${meta.name}`);
  lines.push('');
  lines.push(`**Versión:** ${meta.version}  `);
  lines.push(`**Autor:** ${meta.author}  `);
  lines.push(`**Fecha:** ${meta.updated_at?.slice(0, 10)}  `);
  if (meta.description) lines.push(`\n${meta.description}\n`);

  if (export_meta?.ai_context) {
    lines.push('## Contexto para IA');
    lines.push('');
    lines.push(export_meta.ai_context);
    lines.push('');
  }

  // Database
  if (database?.name) {
    lines.push('## Base de Datos');
    lines.push('');
    lines.push(`- **Tipo:** ${database.type}`);
    lines.push(`- **Host:** ${database.host}`);
    lines.push(`- **Nombre:** ${database.name}`);
    if (database.schema) lines.push(`- **Schema:** ${database.schema}`);
    lines.push('');
  }

  // Global rules
  if (global_rules?.length) {
    lines.push('## Reglas Globales');
    lines.push('');
    global_rules.forEach((r, i) => {
      lines.push(`${i + 1}. **[${r.type?.toUpperCase()}]** ${r.description}`);
      if (r.detail) lines.push(`   > ${r.detail}`);
    });
    lines.push('');
  }

  // Pages
  pages?.forEach(page => {
    lines.push(`## Página: ${page.title}`);
    lines.push('');
    if (page.description) lines.push(`${page.description}\n`);
    lines.push(`- **Layout:** ${page.layout}`);
    lines.push(`- **Seguridad:** Nivel ${page.security_level}`);
    if (page.roles_allowed?.length) lines.push(`- **Roles:** ${page.roles_allowed.join(', ')}`);
    lines.push('');

    if (page.page_rules?.length) {
      lines.push('### Reglas de Página');
      page.page_rules.forEach((r, i) => {
        lines.push(`${i + 1}. ${r.description}`);
        if (r.detail) lines.push(`   > ${r.detail}`);
      });
      lines.push('');
    }

    page.forms?.forEach(form => {
      lines.push(`### Formulario: ${form.title} (${form.type})`);
      lines.push('');
      if (form.description) lines.push(`${form.description}\n`);
      if (form.data_source?.table) {
        lines.push(`**Fuente de datos:** \`${form.data_source.table}\``);
        if (form.data_source.where) lines.push(`**WHERE base:** \`${form.data_source.where}\``);
        lines.push('');
      }

      // Operations
      const ops = form.operations || {};
      const opList = ['insert','update','delete','search','export']
        .filter(k => ops[`allow_${k}`])
        .join(', ');
      if (opList) lines.push(`**Operaciones:** ${opList}\n`);

      // Fields table
      if (form.fields?.length) {
        lines.push('#### Campos');
        lines.push('');
        lines.push('| Campo | Tipo | Fuente BD | Req | Lookup | Descripción |');
        lines.push('|-------|------|-----------|-----|--------|-------------|');
        form.fields.forEach(f => {
          const lookup = f.lookup?.sql ? '✓ SQL' : f.lookup?.lov ? '✓ LOV' : '—';
          const req = f.required ? '✓' : '—';
          lines.push(`| \`${f.name}\` | ${f.type} | ${f.data_source || '—'} | ${req} | ${lookup} | ${f.description || f.caption} |`);
        });
        lines.push('');
      }

      // Form rules
      if (form.rules?.length) {
        lines.push('#### Reglas de Negocio');
        lines.push('');
        form.rules.forEach((r, i) => {
          lines.push(`${i + 1}. **[${r.type?.toUpperCase()}]** ${r.description}`);
          if (r.detail) lines.push(`   > ${r.detail}`);
        });
        lines.push('');
      }
    });
  });

  // Open issues
  if (export_meta?.open_issues?.length) {
    lines.push('## Puntos Abiertos');
    lines.push('');
    export_meta.open_issues.forEach((issue, i) => {
      lines.push(`${i + 1}. ${issue}`);
    });
    lines.push('');
  }

  lines.push('---');
  lines.push(`*Generado por Pro-RAD Editor — ${new Date().toLocaleString('es-MX')}*`);

  return lines.join('\n');
};

// Export executive summary
export const exportSummary = (project) => {
  const { meta, pages } = project;
  let totalForms = 0, totalFields = 0, totalRules = 0;
  pages?.forEach(p => {
    totalForms += p.forms?.length || 0;
    p.forms?.forEach(f => {
      totalFields += f.fields?.length || 0;
      totalRules += f.rules?.length || 0;
    });
  });

  const lines = [
    `# Resumen Ejecutivo: ${meta.name}`,
    '',
    `**Versión:** ${meta.version} | **Autor:** ${meta.author} | **Fecha:** ${meta.updated_at?.slice(0, 10)}`,
    '',
    '## Inventario del Sistema',
    '',
    `| Elemento | Cantidad |`,
    `|----------|----------|`,
    `| Páginas  | ${pages?.length || 0} |`,
    `| Formularios | ${totalForms} |`,
    `| Campos | ${totalFields} |`,
    `| Reglas de negocio | ${totalRules} |`,
    '',
    '## Páginas',
    '',
  ];
  pages?.forEach(p => {
    lines.push(`- **${p.title}** — ${p.forms?.length || 0} formularios`);
  });
  lines.push('');
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
