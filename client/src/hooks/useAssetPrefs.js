import { useState } from 'react'

const DEFAULT_COLS = [
  'assetTag','name','user','category','serialNumber',
  'systemInfo','manufacturer','model','deviceYearModel',
  'formerUser','contractStatus','dateAcquired','equipmentStatus',
  'notes','company','status'
]

function storageKey(userId) { return `asset-prefs-${userId ?? 'guest'}` }

function load(userId) {
  try { return JSON.parse(localStorage.getItem(storageKey(userId))) ?? {} } catch { return {} }
}

export function useAssetPrefs(userId) {
  const [prefs, setPrefs] = useState(() => load(userId))

  const save = (next) => {
    setPrefs(next)
    localStorage.setItem(storageKey(userId), JSON.stringify(next))
  }

  const viewMode   = prefs.viewMode ?? 'table'
  const colOrder   = prefs.colOrder ?? DEFAULT_COLS
  const hiddenCols = prefs.hiddenCols ?? []

  const setViewMode   = (v)  => save({ ...prefs, viewMode: v })
  const setColOrder   = (o)  => save({ ...prefs, colOrder: o })
  const toggleCol     = (k)  => save({ ...prefs, hiddenCols: hiddenCols.includes(k) ? hiddenCols.filter(c => c !== k) : [...hiddenCols, k] })

  return { viewMode, setViewMode, colOrder, setColOrder, hiddenCols, toggleCol }
}