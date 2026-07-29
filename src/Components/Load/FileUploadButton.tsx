import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useLoadData } from '../Load/LoadDataProvider'

interface UploadButtonProps {
	onWarning: (message: string, color: string) => void
	is121Plus: boolean
}

interface ApiMaterialEntry {
	path: string
	materialId: string
	downloadUrl: string
	isChildMaterial?: boolean
}

interface MaterialTreeNode {
	name: string
	path: string
	kind: 'folder' | 'file'
	materialId?: string
	downloadUrl?: string
	isChildMaterial?: boolean
	children: MaterialTreeNode[]
}

const FileUpload: React.FC<UploadButtonProps> = ({ onWarning, is121Plus }) => {
	const { setLoadData, addWarning } = useLoadData()
	const [filename, setFileName] = useState<string>('')
	const [apiEntries, setApiEntries] = useState<ApiMaterialEntry[]>([])
	const [isScanning, setIsScanning] = useState(false)
	const [showApiEntries, setShowApiEntries] = useState(false)
	const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({})
	const [scanProgress, setScanProgress] = useState({ detected: 0, total: 0, downloaded: 0 })
	const apiMenuRef = useRef<HTMLDivElement>(null)

	const { registerWarningListener, clearWarningListeners } = useLoadData()

	const versionLabel = is121Plus ? '1.21' : '1.20'
	const apiCacheKey = `miapi-material-scan-cache-v1:${versionLabel}`
	const apiFileCacheKey = `miapi-material-file-cache-v1:${versionLabel}`
	const githubFetch = async (url: string, init?: RequestInit) =>
		fetch(url, {
			...init,
			headers: {
				...(init?.headers ?? {})
			},
			mode: 'cors',
			credentials: 'omit'
		})

	const getRateLimitWarning = async (response: Response): Promise<string | null> => {
		const remaining = Number(response.headers.get('x-ratelimit-remaining') ?? 'Infinity')
		const resetAt = response.headers.get('x-ratelimit-reset')
		const resetTime = resetAt ? new Date(Number(resetAt) * 1000).toLocaleTimeString() : 'soon'

		let bodyMessage = ''
		try {
			const bodyText = await response.clone().text()
			if (bodyText) {
				const parsed = JSON.parse(bodyText) as { message?: unknown }
				if (typeof parsed.message === 'string') {
					bodyMessage = parsed.message
				}
			}
		} catch {
			// Ignore non-JSON bodies and fall back to the header-based check.
		}

		if (bodyMessage.toLowerCase().includes('rate limit exceeded') || response.status === 403 || response.status === 429 || remaining <= 0) {
			return 'GitHub rate limit exceeded'
		}

		return null
	}

	const MAX_CONCURRENCY = 8

	const runWithConcurrency = async <T,>(tasks: Array<() => Promise<T>>, limit: number): Promise<T[]> => {
		const results: T[] = new Array(tasks.length)
		let nextIndex = 0

		await Promise.all(
			Array.from({ length: Math.min(limit, tasks.length) }, async () => {
				while (true) {
					const currentIndex = nextIndex
					nextIndex += 1
					if (currentIndex >= tasks.length) {
						return
					}

					results[currentIndex] = await tasks[currentIndex]()
				}
			})
		)

		return results
	}

	const buttonStyle = {
		padding: '0 12px',
		margin: '5px',
		backgroundColor: '#7289DA',
		color: '#ffffff',
		border: 'none',
		borderRadius: '5px',
		cursor: 'pointer',
		display: 'inline-flex',
		alignItems: 'center',
		justifyContent: 'center',
		fontSize: '13px',
		fontFamily: 'inherit',
		fontWeight: 600,
		lineHeight: 1.1,
		minHeight: '42px',
		height: '42px',
		minWidth: '180px',
		width: '180px',
		maxWidth: '180px',
		boxSizing: 'border-box' as const,
		whiteSpace: 'nowrap',
		textAlign: 'center' as const,
		overflow: 'hidden',
		textOverflow: 'ellipsis'
	} as const

	useEffect(() => {
		// Register the warning listener
		registerWarningListener(onWarning)

		// I prob should de-register this again
		return () => {
			clearWarningListeners()
		}
	}, [clearWarningListeners, onWarning, registerWarningListener])

	useEffect(() => {
		setApiEntries([])
		setShowApiEntries(false)
		setExpandedFolders({})
	}, [is121Plus])

	useEffect(() => {
		if (!showApiEntries) {
			return
		}

		const handlePointerDown = (event: MouseEvent) => {
			if (apiMenuRef.current && !apiMenuRef.current.contains(event.target as Node)) {
				setShowApiEntries(false)
			}
		}

		document.addEventListener('mousedown', handlePointerDown)
		return () => document.removeEventListener('mousedown', handlePointerDown)
	}, [showApiEntries])

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = event.target.files?.[0] // Get the first selected file
		fileUpdate(selectedFile)
	}

	const fileUpdate = (selectedFile: File | undefined) => {
		if (selectedFile === undefined) {
			console.log('file is not defined!')
		}
		selectedFile?.text().then((text: string) => {
			try {
				const parsed = JSON.parse(text)
				setLoadData(parsed)
				setFileName(selectedFile.name)
			} catch (error) {
				addWarning('could not load as a material! ' + selectedFile?.name)
				console.log(error)
			}
		})
	}

	const getRepoBranch = () => (is121Plus ? 'release/1.21-mojmaps' : 'release/1.20.1')

	const getRepoMaterialsPath = () => {
		return is121Plus ? 'common/src/main/resources/data/miapi/miapi/materials' : 'common/src/main/resources/data/miapi/materials'
	}

	const getCookie = (name: string): string | null => {
		if (typeof document === 'undefined') {
			return null
		}

		const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
		const match = document.cookie.match(new RegExp(`(?:^|; )${escapedName}=([^;]*)`))
		return match ? decodeURIComponent(match[1]) : null
	}

	const setCookie = (name: string, value: string, days: number) => {
		if (typeof document === 'undefined') {
			return
		}

		const expiry = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString()
		document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${days * 24 * 60 * 60}; expires=${expiry}; SameSite=Lax`
	}

	const getScanCache = () => {
		const cacheKey = `${apiCacheKey}:${getRepoBranch()}:${getRepoMaterialsPath()}`
		const cookieValue = getCookie(cacheKey)
		if (cookieValue) {
			try {
				return JSON.parse(cookieValue)
			} catch (error) {
				console.warn('Failed to parse cookie cache', error)
			}
		}

		const localValue = localStorage.getItem(cacheKey)
		if (localValue) {
			try {
				return JSON.parse(localValue)
			} catch (error) {
				console.warn('Failed to parse local cache', error)
			}
		}

		return null
	}

	const saveScanCache = (items: ApiMaterialEntry[]) => {
		const cacheKey = `${apiCacheKey}:${getRepoBranch()}:${getRepoMaterialsPath()}`
		const payload = JSON.stringify({ version: `${getRepoBranch()}/${getRepoMaterialsPath()}`, timestamp: Date.now(), items })
		setCookie(cacheKey, payload, 7)
		localStorage.setItem(cacheKey, payload)
	}

	const clearMaterialCaches = () => {
		const prefixes = [`${apiCacheKey}:`, `${apiFileCacheKey}:`]

		for (const key of Object.keys(localStorage)) {
			if (prefixes.some((prefix) => key.startsWith(prefix))) {
				localStorage.removeItem(key)
			}
		}

		for (const cookie of document.cookie.split(';')) {
			const cookieName = cookie.split('=')[0]?.trim()
			if (cookieName && prefixes.some((prefix) => cookieName.startsWith(prefix))) {
				document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`
			}
		}

		setApiEntries([])
		setShowApiEntries(false)
		setExpandedFolders({})
		setScanProgress({ detected: 0, total: 0, downloaded: 0 })
		onWarning('Cleared cached material examples and scan data.', 'green')
	}

	const getFolderPriority = (name: string) => {
		const lower = name.toLowerCase()
		if (lower.includes('wood')) return 0
		if (lower.includes('metal')) return 1
		if (lower.includes('crystal')) return 2
		if (lower.includes('stone')) return 3
		if (lower.includes('wool')) return 4
		if (lower.includes('glass')) return 5
		return 6
	}

	const isPureParentDataTemplate = (value: unknown): boolean => {
		if (!value || typeof value !== 'object' || Array.isArray(value)) {
			return false
		}

		const keys = Object.keys(value as Record<string, unknown>)
		return keys.length === 2 && keys.includes('parent') && keys.includes('data')
	}

	const countMaterialFiles = async (item: any): Promise<number> => {
		if (item.type === 'file' && item.name.endsWith('.json')) {
			return 1
		}

		if (item.type === 'dir') {
			const dirResponse = await githubFetch(item.url)
			if (!dirResponse.ok) {
				return 0
			}

			const dirEntries = await dirResponse.json()
			const counts = await Promise.all(dirEntries.map((child: any) => countMaterialFiles(child)))
			return counts.reduce((sum, count) => sum + count, 0)
		}

		return 0
	}

	const scanGitHubMaterials = async (): Promise<ApiMaterialEntry[]> => {
		const branch = getRepoBranch()
		const path = getRepoMaterialsPath()
		const url = `https://api.github.com/repos/Truly-Modular/Modular-Item-API/contents/${path}?ref=${branch}`

		const response = await githubFetch(url)
		const rateLimitWarning = await getRateLimitWarning(response)
		if (rateLimitWarning) {
			throw new Error(rateLimitWarning)
		}
		if (!response.ok) {
			throw new Error(`GitHub API request failed (${response.status})`)
		}

		const entries = await response.json()
		const collected: ApiMaterialEntry[] = []
		const sortedEntries = [...entries].sort((a, b) => getFolderPriority(a.name) - getFolderPriority(b.name) || a.name.localeCompare(b.name))
		const totalMaterials = (await Promise.all(sortedEntries.map((entry) => countMaterialFiles(entry)))).reduce((sum, count) => sum + count, 0)

		setScanProgress({ detected: 0, total: totalMaterials, downloaded: 0 })

		const visit = async (item: any): Promise<ApiMaterialEntry[]> => {
			if (item.type === 'file' && item.name.endsWith('.json')) {
				const relativePath = item.path.replace(/^.*?\/materials\//, '').replace(/\\/g, '/')

				try {
					const response = await githubFetch(item.download_url)
					const rateLimitWarning = await getRateLimitWarning(response)
					if (rateLimitWarning) {
						throw new Error(rateLimitWarning)
					}
					if (!response.ok) {
						console.warn(`Skipping file ${item.path} due to status ${response.status}`)
						return []
					}

					const parsed = await response.json()
					const isChildMaterial = isPureParentDataTemplate(parsed)
					const entry: ApiMaterialEntry = {
						path: relativePath,
						materialId: `miapi:${relativePath.replace(/\.json$/, '')}`,
						downloadUrl: item.download_url,
						isChildMaterial
					}

					collected.push(entry)
					setScanProgress((prev) => ({ ...prev, detected: prev.detected + 1 }))
					return [entry]
				} catch (error) {
					console.warn(`Failed to inspect material file ${item.path}`, error)
					return []
				}
			}

			if (item.type === 'dir') {
				try {
					const dirResponse = await githubFetch(item.url)
					const rateLimitWarning = await getRateLimitWarning(dirResponse)
					if (rateLimitWarning) {
						throw new Error(rateLimitWarning)
					}
					if (!dirResponse.ok) {
						console.warn(`Skipping folder ${item.path} due to status ${dirResponse.status}`)
						return []
					}

					const dirEntries = await dirResponse.json()
					const nestedResults = await runWithConcurrency<ApiMaterialEntry[]>(
						dirEntries.map((child: any) => () => visit(child)),
						MAX_CONCURRENCY
					)
					return nestedResults.flat()
				} catch (error) {
					console.warn(`Failed to scan folder ${item.path}`, error)
					return []
				}
			}

			return []
		}

		const visited = await runWithConcurrency<ApiMaterialEntry[]>(
			sortedEntries.map((entry) => () => visit(entry)),
			MAX_CONCURRENCY
		)
		const flattened = visited.flat()

		return flattened.sort((a, b) => a.path.localeCompare(b.path))
	}

	const handleLoadFromApi = async () => {
		if (isScanning) {
			return
		}

		if (apiEntries.length > 0) {
			setShowApiEntries((prev) => !prev)
			return
		}

		setIsScanning(true)
		setShowApiEntries(true)
		setScanProgress({ detected: 0, total: 0, downloaded: 0 })

		const runScan = async () => {
			try {
				const cacheValue = getScanCache()
				const now = Date.now()

				let items = cacheValue?.items as ApiMaterialEntry[] | undefined
				if (!items || now - cacheValue?.timestamp > 1000 * 60 * 60 * 24 * 7) {
					items = await scanGitHubMaterials()
					saveScanCache(items)
				}

				setApiEntries(items)
				setShowApiEntries(true)
				onWarning(`Loaded ${items.length} material examples from the live API path.`, 'green')
			} catch (error) {
				console.error(error)
				const message = error instanceof Error ? error.message : 'Could not scan the live material API path.'
				onWarning(message, 'red')
			} finally {
				setIsScanning(false)
			}
		}

		window.setTimeout(() => {
			void runScan()
		}, 0)
	}

	const loadApiMaterial = async (entry: ApiMaterialEntry) => {
		try {
			const cacheKey = `${apiFileCacheKey}:${entry.path}`
			const cachedText = localStorage.getItem(cacheKey)
			let materialText = cachedText

			if (!materialText) {
				const response = await githubFetch(entry.downloadUrl)
				const rateLimitWarning = await getRateLimitWarning(response)
				if (rateLimitWarning) {
					onWarning('Github Rate Limit Warning: ' + rateLimitWarning, 'red')
					throw new Error(rateLimitWarning)
				}
				if (!response.ok) {
					throw new Error('Failed to fetch example material JSON')
				}
				materialText = await response.text()
				localStorage.setItem(cacheKey, materialText)
			}

			const parsed = JSON.parse(materialText)
			setLoadData(parsed)
			setFileName(entry.materialId)
			setScanProgress((prev) => ({ ...prev, downloaded: prev.downloaded + 1 }))
			onWarning(`Loaded example material: ${entry.materialId}`, 'green')
		} catch (error) {
			console.error(error)
			const message = error instanceof Error ? error.message : 'Could not load the selected API material example.'
			onWarning(message, 'red')
		}
	}

	const buildMaterialTree = (entries: ApiMaterialEntry[]): MaterialTreeNode[] => {
		const root: MaterialTreeNode[] = []

		const ensureFolder = (nodes: MaterialTreeNode[], folderPath: string): MaterialTreeNode => {
			const existing = nodes.find((node) => node.kind === 'folder' && node.path === folderPath)
			if (existing) {
				return existing
			}

			const folderNode: MaterialTreeNode = {
				name: folderPath.split('/').pop() || folderPath,
				path: folderPath,
				kind: 'folder',
				children: []
			}
			nodes.push(folderNode)
			return folderNode
		}

		for (const entry of entries) {
			const parts = entry.path.split('/').filter(Boolean)
			const fileName = parts.pop() || entry.path
			let currentNodes = root
			let currentPath = ''

			for (const folder of parts) {
				currentPath = currentPath ? `${currentPath}/${folder}` : folder
				currentNodes = ensureFolder(currentNodes, currentPath).children
			}

			currentNodes.push({
				name: fileName,
				path: entry.path,
				kind: 'file',
				materialId: entry.materialId,
				downloadUrl: entry.downloadUrl,
				isChildMaterial: entry.isChildMaterial,
				children: []
			})
		}

		return root.sort((a, b) => a.name.localeCompare(b.name))
	}

	const materialTree = useMemo(() => buildMaterialTree(apiEntries), [apiEntries])

	const toggleFolder = (folderPath: string) => {
		setExpandedFolders((prev) => ({
			...prev,
			[folderPath]: !prev[folderPath]
		}))
	}

	const renderTree = (nodes: MaterialTreeNode[], depth = 0) => {
		return nodes.map((node) => {
			if (node.kind === 'folder') {
				const isExpanded = expandedFolders[node.path] ?? false
				return (
					<div key={node.path} style={{ marginLeft: depth * 10 }}>
						<button
							type="button"
							onClick={(event) => {
								event.preventDefault()
								event.stopPropagation()
								toggleFolder(node.path)
							}}
							style={{
								background: 'transparent',
								border: 'none',
								padding: '4px 0',
								color: '#f2f2f2',
								fontWeight: 600,
								textAlign: 'left',
								cursor: 'pointer',
								display: 'flex',
								alignItems: 'center',
								gap: '6px',
								fontFamily: 'inherit',
								fontSize: '13px'
							}}
						>
							<span style={{ color: '#b9bbbe', width: '12px', display: 'inline-block' }}>{isExpanded ? '▾' : '▸'}</span>
							<span>{node.name}</span>
							<span style={{ color: '#b9bbbe', fontSize: '12px', marginLeft: '6px' }}>{node.path}</span>
						</button>
						{isExpanded && (
							<div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>{renderTree(node.children, depth + 1)}</div>
						)}
					</div>
				)
			}

			const isDisabledEntry = Boolean(node.isChildMaterial)

			return (
				<button
					type="button"
					key={node.path}
					onClick={() => {
						if (isDisabledEntry) {
							return
						}

						loadApiMaterial({
							path: node.path,
							materialId: node.materialId || `miapi:${node.path.replace(/\.json$/, '')}`,
							downloadUrl: node.downloadUrl || '',
							isChildMaterial: false
						})
					}}
					disabled={isDisabledEntry}
					style={{
						background: isDisabledEntry ? '#2b2f36' : '#36393f',
						color: isDisabledEntry ? '#9aa0a6' : '#fff',
						border: isDisabledEntry ? '1px dashed #4f545c' : '1px solid #4f545c',
						borderRadius: '6px',
						padding: '6px 8px',
						textAlign: 'left',
						cursor: isDisabledEntry ? 'not-allowed' : 'pointer',
						marginLeft: depth * 8,
						fontSize: '13px',
						opacity: isDisabledEntry ? 0.85 : 1
					}}
				>
					<strong>{node.materialId || `miapi:${node.path.replace(/\.json$/, '')}`}</strong>
					<span style={{ color: isDisabledEntry ? '#b0b3b8' : '#b9bbbe', display: 'block', fontSize: '12px' }}>{node.path}</span>
					{isDisabledEntry && <span style={{ color: '#d8d8d8', display: 'block', fontSize: '11px', marginTop: '2px' }}>Child material</span>}
				</button>
			)
		})
	}

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault()
	}

	return (
		<div>
			<form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
				<label style={buttonStyle}>
					Load From File
					<input type="file" onChange={handleFileChange} style={{ display: 'none' }} />
				</label>
				<div ref={apiMenuRef} style={{ position: 'relative', display: 'inline-flex' }}>
					<button type="button" style={buttonStyle} onClick={handleLoadFromApi} disabled={isScanning} aria-expanded={showApiEntries}>
						{isScanning
							? 'Scanning...'
							: apiEntries.length > 0 && showApiEntries
								? 'Hide API Examples'
								: apiEntries.length > 0
									? 'Show API Examples'
									: 'Load From API'}
					</button>
					{showApiEntries && (
						<div
							style={{
								position: 'absolute',
								top: 'calc(100% + 6px)',
								left: 0,
								zIndex: 1000,
								minWidth: '360px',
								maxWidth: '680px',
								display: 'flex',
								flexDirection: 'column',
								gap: '6px',
								padding: '10px',
								borderRadius: '10px',
								backgroundColor: '#2f3136',
								border: '1px solid #3a3f4b',
								boxShadow: '0 8px 18px rgba(0, 0, 0, 0.35)'
							}}
						>
							{isScanning ? (
								<div
									style={{ color: '#d7d7d7', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}
								>
									<div>
										Scanning examples
										{scanProgress.total > 0
											? ` • detected ${scanProgress.detected}/${scanProgress.total} • downloaded ${scanProgress.downloaded}`
											: ' • fetching metadata…'}
									</div>
									<button
										type="button"
										onClick={(event) => {
											event.preventDefault()
											event.stopPropagation()
											clearMaterialCaches()
										}}
										style={{
											background: '#40444b',
											border: '1px solid #575d67',
											borderRadius: '999px',
											color: '#f2f2f2',
											cursor: 'pointer',
											fontSize: '11px',
											fontFamily: 'inherit',
											padding: '4px 8px',
											lineHeight: 1
										}}
									>
										Clear cache
									</button>
								</div>
							) : (
								<div style={{ color: '#d7d7d7', fontSize: '12px' }}>
									Available examples
									{scanProgress.total > 0 ? ` • detected ${scanProgress.detected}/${scanProgress.total}` : ' (cached locally)'}
									<button
										type="button"
										onClick={(event) => {
											event.preventDefault()
											event.stopPropagation()
											clearMaterialCaches()
										}}
										style={{
											background: '#40444b',
											border: '1px solid #575d67',
											borderRadius: '999px',
											color: '#f2f2f2',
											cursor: 'pointer',
											fontSize: '11px',
											fontFamily: 'inherit',
											padding: '4px 8px',
											lineHeight: 1
										}}
									>
										Clear cache
									</button>
								</div>
							)}
							<div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '320px', overflowY: 'auto' }}>
								{renderTree(materialTree)}
							</div>
						</div>
					)}
				</div>
				<span style={{ color: '#d6d6d6', marginLeft: '6px' }}>{filename}</span>
			</form>
		</div>
	)
}

export default FileUpload
