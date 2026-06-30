import { useState, useEffect } from 'react'
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

const MURAL_COL = 'mural'

export function useMural() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, MURAL_COL), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        setEntries(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      (err) => {
        console.error('Mural Firestore error:', err)
        setLoading(false)
      }
    )
    return () => unsub()
  }, [])

  const addEntry = async (entry) => {
    await addDoc(collection(db, MURAL_COL), {
      ...entry,
      createdAt: serverTimestamp(),
    })
  }

  const deleteEntry = async (id) => {
    await deleteDoc(doc(db, MURAL_COL, id))
  }

  return { entries, loading, addEntry, deleteEntry }
}
