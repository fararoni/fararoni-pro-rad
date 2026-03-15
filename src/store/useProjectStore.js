import { create } from 'zustand';
import { newPage, newForm, newField, newRule, genId } from '../utils/schema';

// API config - can be changed via window.RAD_CONFIG
const getApiBase = () => {
  if (typeof window !== 'undefined' && window.RAD_CONFIG?.apiBase) return window.RAD_CONFIG.apiBase;
  return '/api.php';
};
const getToken = () => {
  if (typeof window !== 'undefined' && window.RAD_CONFIG?.token) return window.RAD_CONFIG.token;
  return 'rad-token-2024';
};

const apiHeaders = () => ({
  'Content-Type': 'application/json',
  'X-RAD-Token': getToken(),
});

export const useProjectStore = create((set, get) => ({
  // UI state
  screen: 'home',           // 'home' | 'editor'
  selectedNode: null,       // { type: 'project'|'page'|'form'|'field', id, pageId?, formId? }
  editorMode: 'editor',     // 'editor' | 'preview'
  saveStatus: 'saved',      // 'saved' | 'saving' | 'error' | 'unsaved'
  projects: [],             // list of {id, name, updated_at, page_count}
  currentProject: null,     // the full project JSON
  expandedNodes: new Set(),

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
  addPage: () => {
    const page = newPage();
    set(state => ({
      currentProject: { ...state.currentProject, pages: [...(state.currentProject.pages || []), page] },
      selectedNode: { type: 'page', id: page.id },
      saveStatus: 'unsaved',
    }));
    get().expandNode(state => state.currentProject?.meta?.spec_id);
    return page;
  },

  updatePage: (pageId, updater) => {
    set(state => {
      const pages = state.currentProject.pages.map(p =>
        p.id === pageId ? (typeof updater === 'function' ? updater(p) : { ...p, ...updater }) : p
      );
      return { currentProject: { ...state.currentProject, pages }, saveStatus: 'unsaved' };
    });
  },

  deletePage: (pageId) => {
    set(state => ({
      currentProject: { ...state.currentProject, pages: state.currentProject.pages.filter(p => p.id !== pageId) },
      selectedNode: { type: 'project' },
      saveStatus: 'unsaved',
    }));
  },

  // Form operations
  addForm: (pageId, type) => {
    const form = newForm(undefined, type);
    set(state => {
      const pages = state.currentProject.pages.map(p =>
        p.id === pageId ? { ...p, forms: [...(p.forms || []), form] } : p
      );
      return {
        currentProject: { ...state.currentProject, pages },
        selectedNode: { type: 'form', id: form.id, pageId },
        saveStatus: 'unsaved',
      };
    });
    return form;
  },

  updateForm: (pageId, formId, updater) => {
    set(state => {
      const pages = state.currentProject.pages.map(p => {
        if (p.id !== pageId) return p;
        return { ...p, forms: p.forms.map(f =>
          f.id === formId ? (typeof updater === 'function' ? updater(f) : { ...f, ...updater }) : f
        )};
      });
      return { currentProject: { ...state.currentProject, pages }, saveStatus: 'unsaved' };
    });
  },

  deleteForm: (pageId, formId) => {
    set(state => {
      const pages = state.currentProject.pages.map(p =>
        p.id === pageId ? { ...p, forms: p.forms.filter(f => f.id !== formId) } : p
      );
      return { currentProject: { ...state.currentProject, pages }, selectedNode: { type: 'page', id: pageId }, saveStatus: 'unsaved' };
    });
  },

  // Field operations
  addField: (pageId, formId) => {
    const field = newField();
    set(state => {
      const pages = state.currentProject.pages.map(p => {
        if (p.id !== pageId) return p;
        return { ...p, forms: p.forms.map(f => {
          if (f.id !== formId) return f;
          return { ...f, fields: [...(f.fields || []), field] };
        })};
      });
      return {
        currentProject: { ...state.currentProject, pages },
        selectedNode: { type: 'field', id: field.id, pageId, formId },
        saveStatus: 'unsaved',
      };
    });
    return field;
  },

  updateField: (pageId, formId, fieldId, updater) => {
    set(state => {
      const pages = state.currentProject.pages.map(p => {
        if (p.id !== pageId) return p;
        return { ...p, forms: p.forms.map(f => {
          if (f.id !== formId) return f;
          return { ...f, fields: f.fields.map(fld =>
            fld.id === fieldId ? (typeof updater === 'function' ? updater(fld) : { ...fld, ...updater }) : fld
          )};
        })};
      });
      return { currentProject: { ...state.currentProject, pages }, saveStatus: 'unsaved' };
    });
  },

  deleteField: (pageId, formId, fieldId) => {
    set(state => {
      const pages = state.currentProject.pages.map(p => {
        if (p.id !== pageId) return p;
        return { ...p, forms: p.forms.map(f => {
          if (f.id !== formId) return f;
          return { ...f, fields: f.fields.filter(fld => fld.id !== fieldId) };
        })};
      });
      return { currentProject: { ...state.currentProject, pages }, selectedNode: { type: 'form', id: formId, pageId }, saveStatus: 'unsaved' };
    });
  },

  reorderFields: (pageId, formId, fields) => {
    set(state => {
      const pages = state.currentProject.pages.map(p => {
        if (p.id !== pageId) return p;
        return { ...p, forms: p.forms.map(f => f.id === formId ? { ...f, fields } : f) };
      });
      return { currentProject: { ...state.currentProject, pages }, saveStatus: 'unsaved' };
    });
  },

  // Rules
  addRule: (level, pageId, formId) => {
    const rule = newRule();
    set(state => {
      let pages = state.currentProject.pages;
      if (level === 'form') {
        pages = pages.map(p => p.id !== pageId ? p : {
          ...p, forms: p.forms.map(f => f.id !== formId ? f : { ...f, rules: [...(f.rules || []), rule] })
        });
      } else if (level === 'page') {
        pages = pages.map(p => p.id !== pageId ? p : { ...p, page_rules: [...(p.page_rules || []), rule] });
      } else {
        return { currentProject: { ...state.currentProject, global_rules: [...(state.currentProject.global_rules || []), rule] }, saveStatus: 'unsaved' };
      }
      return { currentProject: { ...state.currentProject, pages }, saveStatus: 'unsaved' };
    });
    return rule;
  },

  updateRule: (level, pageId, formId, ruleId, updates) => {
    set(state => {
      const updateRuleIn = (rules) => rules.map(r => r.id === ruleId ? { ...r, ...updates } : r);
      if (level === 'global') {
        return { currentProject: { ...state.currentProject, global_rules: updateRuleIn(state.currentProject.global_rules || []) }, saveStatus: 'unsaved' };
      }
      const pages = state.currentProject.pages.map(p => {
        if (p.id !== pageId) return p;
        if (level === 'page') return { ...p, page_rules: updateRuleIn(p.page_rules || []) };
        return { ...p, forms: p.forms.map(f => f.id !== formId ? f : { ...f, rules: updateRuleIn(f.rules || []) }) };
      });
      return { currentProject: { ...state.currentProject, pages }, saveStatus: 'unsaved' };
    });
  },

  deleteRule: (level, pageId, formId, ruleId) => {
    set(state => {
      const removeRule = (rules) => (rules || []).filter(r => r.id !== ruleId);
      if (level === 'global') {
        return { currentProject: { ...state.currentProject, global_rules: removeRule(state.currentProject.global_rules) }, saveStatus: 'unsaved' };
      }
      const pages = state.currentProject.pages.map(p => {
        if (p.id !== pageId) return p;
        if (level === 'page') return { ...p, page_rules: removeRule(p.page_rules) };
        return { ...p, forms: p.forms.map(f => f.id !== formId ? f : { ...f, rules: removeRule(f.rules) }) };
      });
      return { currentProject: { ...state.currentProject, pages }, saveStatus: 'unsaved' };
    });
  },
}));
