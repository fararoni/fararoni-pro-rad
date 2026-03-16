import { create } from 'zustand';
import { newPage, newForm, newField, newRule, newModule, genId } from '../utils/schema';

// API config - can be changed via window.RAD_CONFIG
const getApiBase = () => {
  if (typeof window !== 'undefined' && window.RAD_CONFIG?.apiBase) return window.RAD_CONFIG.apiBase;
  return 'http://localhost/rad/api.php';
};
const getToken = () => {
  if (typeof window !== 'undefined' && window.RAD_CONFIG?.token) return window.RAD_CONFIG.token;
  return 'rad-token-2024';
};

const apiHeaders = () => ({
  'Content-Type': 'application/json',
  'X-RAD-Token': getToken(),
});

// Universal page finder
const _findPage = (project, pageId) => {
  const p = project?.pages?.find(p => p.id === pageId);
  if (p) return p;
  for (const m of project?.modules || []) {
    const pm = m.pages?.find(p => p.id === pageId);
    if (pm) return pm;
  }
  return null;
};

// Universal page updater (updates page wherever it lives)
const _updatePageInProject = (project, pageId, updater) => {
  const fn = typeof updater === 'function' ? updater : (p) => ({ ...p, ...updater });
  if (project.pages?.find(p => p.id === pageId)) {
    return { ...project, pages: project.pages.map(p => p.id === pageId ? fn(p) : p) };
  }
  return {
    ...project,
    modules: (project.modules || []).map(m => ({
      ...m,
      pages: (m.pages || []).map(p => p.id === pageId ? fn(p) : p),
    })),
  };
};

export const useProjectStore = create((set, get) => ({
  // UI state
  screen: 'home',           // 'home' | 'editor'
  selectedNode: null,       // { type: 'project'|'module'|'page'|'form'|'field', id, moduleId?, pageId?, formId? }
  editorMode: 'editor',     // 'editor' | 'preview'
  saveStatus: 'saved',      // 'saved' | 'saving' | 'error' | 'unsaved'
  projects: [],             // list of {id, name, updated_at, page_count}
  currentProject: null,     // the full project JSON
  expandedNodes: new Set(),
  clipboardForm: null,      // { form, sourcePageId } — form in clipboard for paste

  // Actions: navigation
  goHome: () => set({ screen: 'home', currentProject: null, selectedNode: null }),

  selectNode: (node) => set({ selectedNode: node }),

  setEditorMode: (mode) => set({ editorMode: mode }),

  toggleNode: (id) => set(state => {
    const next = new Set(state.expandedNodes);
    next.has(id) ? next.delete(id) : next.add(id);
    return { expandedNodes: next };
  }),

  expandNode: (id) => set(state => {
    const next = new Set(state.expandedNodes);
    next.add(id);
    return { expandedNodes: next };
  }),

  // Load projects list from server
  loadProjects: async () => {
    try {
      const res = await fetch(`${getApiBase()}?action=list`, { headers: { 'X-RAD-Token': getToken() } });
      if (res.ok) {
        const data = await res.json();
        set({ projects: data.projects || [] });
      }
    } catch (e) {
      console.warn('No server connection, using localStorage only');
      // Load from localStorage
      const stored = JSON.parse(localStorage.getItem('rad_projects') || '[]');
      set({ projects: stored });
    }
  },

  // Load a specific project
  loadProject: async (id) => {
    try {
      const res = await fetch(`${getApiBase()}?action=get&id=${id}`, { headers: { 'X-RAD-Token': getToken() } });
      if (res.ok) {
        const project = await res.json();
        set({ currentProject: project, screen: 'editor', selectedNode: { type: 'project' }, expandedNodes: new Set([project.meta?.spec_id]) });
        return project;
      }
    } catch (e) {}
    // fallback to localStorage
    const stored = localStorage.getItem(`rad_project_${id}`);
    if (stored) {
      const project = JSON.parse(stored);
      set({ currentProject: project, screen: 'editor', selectedNode: { type: 'project' }, expandedNodes: new Set([project.meta?.spec_id]) });
      return project;
    }
    return null;
  },

  // Save current project
  saveProject: async (projectOverride) => {
    const project = projectOverride || get().currentProject;
    if (!project) return;
    const updated = { ...project, meta: { ...project.meta, updated_at: new Date().toISOString() } };
    set({ saveStatus: 'saving', currentProject: updated });

    // Always save to localStorage as backup
    localStorage.setItem(`rad_project_${updated.meta.spec_id}`, JSON.stringify(updated));
    // Update projects list in localStorage
    const list = JSON.parse(localStorage.getItem('rad_projects') || '[]');
    const idx = list.findIndex(p => p.id === updated.meta.spec_id);
    const entry = { id: updated.meta.spec_id, name: updated.meta.name, updated_at: updated.meta.updated_at, page_count: updated.pages?.length || 0 };
    if (idx >= 0) list[idx] = entry; else list.unshift(entry);
    localStorage.setItem('rad_projects', JSON.stringify(list));

    try {
      const res = await fetch(getApiBase(), {
        method: 'POST',
        headers: apiHeaders(),
        body: JSON.stringify({ action: 'save', project: updated }),
      });
      if (res.ok) {
        set({ saveStatus: 'saved' });
        await get().loadProjects();
      } else {
        set({ saveStatus: 'error' });
      }
    } catch (e) {
      // Saved in localStorage already
      set({ saveStatus: 'saved' }); // localStorage save succeeded
      await get().loadProjects();
    }
  },

  // Create new project from wizard data
  createProject: async (projectData) => {
    const { newProject } = await import('../utils/schema');
    const project = newProject(projectData);
    set({ currentProject: project, screen: 'editor', selectedNode: { type: 'project' }, expandedNodes: new Set([project.meta.spec_id]) });
    await get().saveProject(project);
    return project;
  },

  // Delete project
  deleteProject: async (id) => {
    localStorage.removeItem(`rad_project_${id}`);
    const list = JSON.parse(localStorage.getItem('rad_projects') || '[]').filter(p => p.id !== id);
    localStorage.setItem('rad_projects', JSON.stringify(list));
    try {
      await fetch(getApiBase(), {
        method: 'POST',
        headers: apiHeaders(),
        body: JSON.stringify({ action: 'delete', id }),
      });
    } catch (e) {}
    await get().loadProjects();
  },

  // Project mutation helpers
  updateProject: (updater) => {
    set(state => {
      const updated = typeof updater === 'function' ? updater(state.currentProject) : { ...state.currentProject, ...updater };
      return { currentProject: updated, saveStatus: 'unsaved' };
    });
  },

  // Page operations
  addPage: (moduleId) => {
    const page = newPage();
    set(state => {
      let project;
      if (moduleId) {
        project = {
          ...state.currentProject,
          modules: (state.currentProject.modules || []).map(m =>
            m.id === moduleId ? { ...m, pages: [...(m.pages || []), page] } : m
          ),
        };
      } else {
        project = {
          ...state.currentProject,
          pages: [...(state.currentProject.pages || []), page],
        };
      }
      return {
        currentProject: project,
        selectedNode: { type: 'page', id: page.id, moduleId: moduleId || undefined },
        saveStatus: 'unsaved',
      };
    });
    return page;
  },

  updatePage: (pageId, updater) => {
    set(state => {
      const project = _updatePageInProject(state.currentProject, pageId, updater);
      return { currentProject: project, saveStatus: 'unsaved' };
    });
  },

  deletePage: (pageId, moduleId) => {
    set(state => {
      let project;
      if (moduleId) {
        project = {
          ...state.currentProject,
          modules: (state.currentProject.modules || []).map(m =>
            m.id === moduleId ? { ...m, pages: (m.pages || []).filter(p => p.id !== pageId) } : m
          ),
        };
      } else {
        project = { ...state.currentProject, pages: state.currentProject.pages.filter(p => p.id !== pageId) };
      }
      const backNode = moduleId ? { type: 'module', id: moduleId } : { type: 'project' };
      return { currentProject: project, selectedNode: backNode, saveStatus: 'unsaved' };
    });
  },

  // Page reorder / move across modules
  movePage: (pageId, srcModuleId, dstModuleId, dstIndex) => {
    set(state => {
      let movedPage = null;
      let project = state.currentProject;

      // Remove from source
      if (!srcModuleId) {
        movedPage = project.pages?.find(p => p.id === pageId);
        project = { ...project, pages: project.pages.filter(p => p.id !== pageId) };
      } else {
        const srcMod = project.modules?.find(m => m.id === srcModuleId);
        movedPage = srcMod?.pages?.find(p => p.id === pageId);
        project = {
          ...project,
          modules: project.modules.map(m =>
            m.id === srcModuleId ? { ...m, pages: (m.pages || []).filter(p => p.id !== pageId) } : m
          ),
        };
      }

      if (!movedPage) return {};

      // Insert at destination
      if (!dstModuleId) {
        const pages = [...(project.pages || [])];
        pages.splice(dstIndex, 0, movedPage);
        project = { ...project, pages };
      } else {
        project = {
          ...project,
          modules: project.modules.map(m => {
            if (m.id !== dstModuleId) return m;
            const pages = [...(m.pages || [])];
            pages.splice(dstIndex, 0, movedPage);
            return { ...m, pages };
          }),
        };
      }

      const selectedNode = state.selectedNode?.id === pageId
        ? { type: 'page', id: pageId, moduleId: dstModuleId || undefined }
        : state.selectedNode;

      return { currentProject: project, selectedNode, saveStatus: 'unsaved' };
    });
  },

  // Module operations
  addModule: () => {
    const mod = newModule();
    set(state => ({
      currentProject: {
        ...state.currentProject,
        modules: [...(state.currentProject.modules || []), mod],
      },
      selectedNode: { type: 'module', id: mod.id },
      saveStatus: 'unsaved',
    }));
    return mod;
  },

  updateModule: (moduleId, updater) => {
    set(state => {
      const fn = typeof updater === 'function' ? updater : (m) => ({ ...m, ...updater });
      return {
        currentProject: {
          ...state.currentProject,
          modules: (state.currentProject.modules || []).map(m => m.id === moduleId ? fn(m) : m),
        },
        saveStatus: 'unsaved',
      };
    });
  },

  deleteModule: (moduleId) => {
    set(state => ({
      currentProject: {
        ...state.currentProject,
        modules: (state.currentProject.modules || []).filter(m => m.id !== moduleId),
      },
      selectedNode: { type: 'project' },
      saveStatus: 'unsaved',
    }));
  },

  // Form operations
  addForm: (pageId, type) => {
    const form = newForm(undefined, type);
    set(state => {
      const project = _updatePageInProject(state.currentProject, pageId, p => ({
        ...p, forms: [...(p.forms || []), form],
      }));
      return {
        currentProject: project,
        selectedNode: { type: 'form', id: form.id, pageId },
        saveStatus: 'unsaved',
      };
    });
    return form;
  },

  updateForm: (pageId, formId, updater) => {
    set(state => {
      const project = _updatePageInProject(state.currentProject, pageId, p => ({
        ...p, forms: p.forms.map(f =>
          f.id === formId ? (typeof updater === 'function' ? updater(f) : { ...f, ...updater }) : f
        ),
      }));
      return { currentProject: project, saveStatus: 'unsaved' };
    });
  },

  deleteForm: (pageId, formId) => {
    set(state => {
      const project = _updatePageInProject(state.currentProject, pageId, p => ({
        ...p, forms: p.forms.filter(f => f.id !== formId),
      }));
      return { currentProject: project, selectedNode: { type: 'page', id: pageId }, saveStatus: 'unsaved' };
    });
  },

  duplicateForm: (pageId, formId) => {
    set(state => {
      const project = _updatePageInProject(state.currentProject, pageId, p => {
        const idx = (p.forms || []).findIndex(f => f.id === formId);
        if (idx === -1) return p;
        const original = p.forms[idx];
        const clone = {
          ...original,
          id: genId(),
          title: original.title + ' (copia)',
          fields: (original.fields || []).map(f => ({ ...f, id: genId() })),
          rules: (original.rules || []).map(r => ({ ...r, id: genId() })),
        };
        const forms = [...p.forms];
        forms.splice(idx + 1, 0, clone);
        return { ...p, forms };
      });
      return { currentProject: project, saveStatus: 'unsaved' };
    });
  },

  copyForm: (pageId, formId) => {
    const state = get();
    const page = _findPage(state.currentProject, pageId);
    const form = page?.forms?.find(f => f.id === formId);
    if (!form) return;
    // Deep clone with fresh IDs ready for paste
    const clone = {
      ...form,
      id: genId(),
      title: form.title + ' (pegado)',
      fields: (form.fields || []).map(f => ({ ...f, id: genId() })),
      rules: (form.rules || []).map(r => ({ ...r, id: genId() })),
    };
    set({ clipboardForm: clone });
  },

  pasteForm: (pageId) => {
    set(state => {
      if (!state.clipboardForm) return {};
      // Generate fresh IDs every paste so you can paste multiple times
      const form = {
        ...state.clipboardForm,
        id: genId(),
        fields: (state.clipboardForm.fields || []).map(f => ({ ...f, id: genId() })),
        rules: (state.clipboardForm.rules || []).map(r => ({ ...r, id: genId() })),
      };
      const project = _updatePageInProject(state.currentProject, pageId, p => ({
        ...p, forms: [...(p.forms || []), form],
      }));
      return { currentProject: project, saveStatus: 'unsaved' };
    });
  },

  clearClipboard: () => set({ clipboardForm: null }),

  moveForm: (formId, sourcePageId, targetPageId, targetIndex) => {
    set(state => {
      let movedForm = null;
      let project = _updatePageInProject(state.currentProject, sourcePageId, p => {
        movedForm = p.forms?.find(f => f.id === formId);
        return { ...p, forms: (p.forms || []).filter(f => f.id !== formId) };
      });
      if (!movedForm) return {};
      project = _updatePageInProject(project, targetPageId, p => {
        const forms = [...(p.forms || [])];
        forms.splice(targetIndex, 0, movedForm);
        return { ...p, forms };
      });
      return { currentProject: project, saveStatus: 'unsaved' };
    });
  },

  // Field operations
  addField: (pageId, formId, extraData = {}) => {
    const field = { ...newField(), ...extraData };
    set(state => {
      const project = _updatePageInProject(state.currentProject, pageId, p => ({
        ...p, forms: p.forms.map(f => {
          if (f.id !== formId) return f;
          return { ...f, fields: [...(f.fields || []), field] };
        }),
      }));
      return {
        currentProject: project,
        selectedNode: { type: 'field', id: field.id, pageId, formId },
        saveStatus: 'unsaved',
      };
    });
    return field;
  },

  updateField: (pageId, formId, fieldId, updater) => {
    set(state => {
      const project = _updatePageInProject(state.currentProject, pageId, p => ({
        ...p, forms: p.forms.map(f => {
          if (f.id !== formId) return f;
          return { ...f, fields: f.fields.map(fld =>
            fld.id === fieldId ? (typeof updater === 'function' ? updater(fld) : { ...fld, ...updater }) : fld
          )};
        }),
      }));
      return { currentProject: project, saveStatus: 'unsaved' };
    });
  },

  deleteField: (pageId, formId, fieldId) => {
    set(state => {
      const project = _updatePageInProject(state.currentProject, pageId, p => ({
        ...p, forms: p.forms.map(f => {
          if (f.id !== formId) return f;
          return { ...f, fields: f.fields.filter(fld => fld.id !== fieldId) };
        }),
      }));
      return { currentProject: project, selectedNode: { type: 'form', id: formId, pageId }, saveStatus: 'unsaved' };
    });
  },

  reorderFields: (pageId, formId, fields) => {
    set(state => {
      const project = _updatePageInProject(state.currentProject, pageId, p => ({
        ...p, forms: p.forms.map(f => f.id === formId ? { ...f, fields } : f),
      }));
      return { currentProject: project, saveStatus: 'unsaved' };
    });
  },

  reorderForms: (pageId, forms) => {
    set(state => {
      const project = _updatePageInProject(state.currentProject, pageId, p => ({ ...p, forms }));
      return { currentProject: project, saveStatus: 'unsaved' };
    });
  },

  // Catalog operations
  addCatalog: () => {
    const catalog = { id: genId(), name: 'NUEVO_CATALOGO', description: '', input_mode: 'comma', data: '' };
    set(state => ({
      currentProject: {
        ...state.currentProject,
        catalogs: [...(state.currentProject.catalogs || []), catalog],
      },
      saveStatus: 'unsaved',
    }));
    return catalog;
  },

  updateCatalog: (catalogId, updater) => {
    set(state => {
      const fn = typeof updater === 'function' ? updater : (c) => ({ ...c, ...updater });
      return {
        currentProject: {
          ...state.currentProject,
          catalogs: (state.currentProject.catalogs || []).map(c => c.id === catalogId ? fn(c) : c),
        },
        saveStatus: 'unsaved',
      };
    });
  },

  deleteCatalog: (catalogId) => {
    set(state => ({
      currentProject: {
        ...state.currentProject,
        catalogs: (state.currentProject.catalogs || []).filter(c => c.id !== catalogId),
      },
      saveStatus: 'unsaved',
    }));
  },

  fillGridFromCatalog: (pageId, formId, catalogId) => {
    set(state => {
      const catalog = (state.currentProject.catalogs || []).find(c => c.id === catalogId);
      if (!catalog) return {};

      // Resolve columns from tabla or json mode
      let columns = [];
      if (catalog.input_mode === 'tabla') {
        columns = catalog.columns || [];
      } else if (catalog.input_mode === 'json') {
        try {
          const data = JSON.parse(catalog.data || '[]');
          if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
            columns = Object.keys(data[0]).map(k => ({ name: k.toUpperCase(), label: k, type: 'text' }));
          }
        } catch {}
      }
      if (!columns.length) return {};

      const typeMap = { text: 'text', number: 'number', currency: 'currency', date: 'date', boolean: 'checkbox', email: 'email' };
      const generatedFields = columns.map(col => ({
        ...newField(col.name),
        caption: col.label || col.name,
        type: typeMap[col.type] || 'text',
        description: `Generado desde catálogo ${catalog.name}`,
        tabla_config: { catalog_id: catalogId },
      }));
      const project = _updatePageInProject(state.currentProject, pageId, p => ({
        ...p,
        forms: p.forms.map(f => f.id === formId ? { ...f, fields: generatedFields } : f),
      }));
      return { currentProject: project, saveStatus: 'unsaved' };
    });
  },

  // Rules
  addRule: (level, pageId, formId) => {
    const rule = newRule();
    set(state => {
      if (level === 'global') {
        return { currentProject: { ...state.currentProject, global_rules: [...(state.currentProject.global_rules || []), rule] }, saveStatus: 'unsaved' };
      }
      let project;
      if (level === 'form') {
        project = _updatePageInProject(state.currentProject, pageId, p => ({
          ...p, forms: p.forms.map(f => f.id !== formId ? f : { ...f, rules: [...(f.rules || []), rule] }),
        }));
      } else {
        project = _updatePageInProject(state.currentProject, pageId, p => ({
          ...p, page_rules: [...(p.page_rules || []), rule],
        }));
      }
      return { currentProject: project, saveStatus: 'unsaved' };
    });
    return rule;
  },

  updateRule: (level, pageId, formId, ruleId, updates) => {
    set(state => {
      const updateRuleIn = (rules) => rules.map(r => r.id === ruleId ? { ...r, ...updates } : r);
      if (level === 'global') {
        return { currentProject: { ...state.currentProject, global_rules: updateRuleIn(state.currentProject.global_rules || []) }, saveStatus: 'unsaved' };
      }
      let project;
      if (level === 'page') {
        project = _updatePageInProject(state.currentProject, pageId, p => ({
          ...p, page_rules: updateRuleIn(p.page_rules || []),
        }));
      } else {
        project = _updatePageInProject(state.currentProject, pageId, p => ({
          ...p, forms: p.forms.map(f => f.id !== formId ? f : { ...f, rules: updateRuleIn(f.rules || []) }),
        }));
      }
      return { currentProject: project, saveStatus: 'unsaved' };
    });
  },

  deleteRule: (level, pageId, formId, ruleId) => {
    set(state => {
      const removeRule = (rules) => (rules || []).filter(r => r.id !== ruleId);
      if (level === 'global') {
        return { currentProject: { ...state.currentProject, global_rules: removeRule(state.currentProject.global_rules) }, saveStatus: 'unsaved' };
      }
      let project;
      if (level === 'page') {
        project = _updatePageInProject(state.currentProject, pageId, p => ({
          ...p, page_rules: removeRule(p.page_rules),
        }));
      } else {
        project = _updatePageInProject(state.currentProject, pageId, p => ({
          ...p, forms: p.forms.map(f => f.id !== formId ? f : { ...f, rules: removeRule(f.rules) }),
        }));
      }
      return { currentProject: project, saveStatus: 'unsaved' };
    });
  },
}));
