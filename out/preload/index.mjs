import { contextBridge, ipcRenderer } from "electron";
const api = {
  transactions: {
    list: () => ipcRenderer.invoke("transactions:list"),
    create: (payload) => ipcRenderer.invoke("transactions:create", payload),
    update: (id, payload) => ipcRenderer.invoke("transactions:update", id, payload),
    remove: (id) => ipcRenderer.invoke("transactions:delete", id)
  },
  categories: {
    list: () => ipcRenderer.invoke("categories:list")
  },
  stats: {
    dashboard: () => ipcRenderer.invoke("stats:dashboard")
  },
  nomina: {
    calculate: (salary) => ipcRenderer.invoke("nomina:calculate", salary)
  },
  employees: {
    list: () => ipcRenderer.invoke("employees:list"),
    create: (payload) => ipcRenderer.invoke("employees:create", payload),
    update: (id, payload) => ipcRenderer.invoke("employees:update", id, payload),
    remove: (id) => ipcRenderer.invoke("employees:delete", id)
  },
  payroll: {
    send: (payload) => ipcRenderer.invoke("payroll:send", payload),
    list: () => ipcRenderer.invoke("payroll:list")
  },
  window: {
    minimize: () => ipcRenderer.invoke("window:minimize"),
    toggleMaximize: () => ipcRenderer.invoke("window:toggle-maximize"),
    close: () => ipcRenderer.invoke("window:close"),
    isMaximized: () => ipcRenderer.invoke("window:is-maximized"),
    onMaximizedChange: (callback) => {
      const listener = (_event, value) => callback(value);
      ipcRenderer.on("window:maximized", listener);
      return () => ipcRenderer.removeListener("window:maximized", listener);
    }
  }
};
contextBridge.exposeInMainWorld("api", api);
