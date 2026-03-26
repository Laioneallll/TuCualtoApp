import { contextBridge, ipcRenderer } from 'electron'

const api = {
  transactions: {
    list: () => ipcRenderer.invoke('transactions:list'),
    create: (payload: unknown) => ipcRenderer.invoke('transactions:create', payload),
    update: (id: number, payload: unknown) => ipcRenderer.invoke('transactions:update', id, payload),
    remove: (id: number) => ipcRenderer.invoke('transactions:delete', id)
  },
  categories: {
    list: () => ipcRenderer.invoke('categories:list')
  },
  stats: {
    dashboard: () => ipcRenderer.invoke('stats:dashboard')
  },
  nomina: {
    calculate: (salary: number) => ipcRenderer.invoke('nomina:calculate', salary)
  },
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    toggleMaximize: () => ipcRenderer.invoke('window:toggle-maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:is-maximized'),
    onMaximizedChange: (callback: (value: boolean) => void) => {
      const listener = (_event: Electron.IpcRendererEvent, value: boolean) => callback(value)
      ipcRenderer.on('window:maximized', listener)
      return () => ipcRenderer.removeListener('window:maximized', listener)
    }
  }
}

contextBridge.exposeInMainWorld('api', api)

