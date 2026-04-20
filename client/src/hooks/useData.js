import { useEffect, useState, useCallback } from 'react'

export function useData (fetcher) {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const load = useCallback(() => {
        setLoading(true)
        fetcher()
            .then(setData)
            .catch(() => setError('Failed to load data.'))
            .finally(() => setLoading(false))
    }, [fetcher])

    useEffect(() => { load() }, [load])

    return { data, loading, error, reload: load }
}