import React, { createContext, useState, useContext, useCallback, useMemo, ReactNode } from 'react'

interface LoadDataContextType {
	loadData: any | null
	setLoadData: React.Dispatch<React.SetStateAction<any | null>>
	addWarning: (message: string) => void
	addCustomMessage: (message: string, color: string) => void
	registerWarningListener: (callback: (message: string, color: string) => void) => void
	clearWarningListeners: () => void
}

const LoadDataContext = createContext<LoadDataContextType | undefined>(undefined)

export const useLoadData = () => {
	const context = useContext(LoadDataContext)
	if (!context) {
		throw new Error('useLoadData must be used within a LoadDataProvider')
	}
	return context
}

const LoadDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [loadData, setLoadData] = useState<any | null>(null)
	const [listeners, setListeners] = useState<((message: string, color: string) => void)[]>([])

	const addWarning = useCallback(
		(message: string) => {
			listeners.forEach((listener) => listener(message, 'orange'))
		},
		[listeners]
	)

	const addCustomMessage = useCallback(
		(message: string, color: string) => {
			listeners.forEach((listener) => listener(message, color))
		},
		[listeners]
	)

	const registerWarningListener = useCallback((callback: (message: string, color: string) => void) => {
		setListeners((prevListeners) => [...prevListeners, callback])
	}, [])

	const clearWarningListeners = useCallback(() => {
		setListeners([])
	}, [])

	const contextValue = useMemo(
		() => ({ loadData, setLoadData, addWarning, addCustomMessage, registerWarningListener, clearWarningListeners }),
		[loadData, addWarning, addCustomMessage, registerWarningListener, clearWarningListeners]
	)

	return <LoadDataContext.Provider value={contextValue}>{children}</LoadDataContext.Provider>
}

export default LoadDataProvider
