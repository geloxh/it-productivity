import { useEffect, useState, useCallback } from 'react'

export function useData (fetcher) {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const load = useCallback(() => {
        let cancelled = false
        setLoading(true)
        fetcher()
            .then(d => { if (!cancelled) setData(d) })
            .catch(() => { if (!cancelled) setError('Failed to load data.') })
            .finally(() => { if (!cancelled) setError('Failed to load data.') })
        
        return () => { cancelled = true }
    }, [fetcher])

    useEffect(() => load(), [load])

    return { data, loading, error, reload: load }
}