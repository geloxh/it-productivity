import { createContext, useContext } from 'react'

const ElectronContext = createContext({ openPanel: null, isElectron: false })

export function ElectronProvider({ children }) {
    const isElectron = !!window.electron?.isElectron
    const openPanel = isElectron ? window.electron.openPanel : null

    return (
        <ElectronContext.Provider value={{ openPanel, isElectron }}>
            {children}
        </ElectronContext.Provider>
    )
}

export const useElectron = () => useContext(ElectronContext)