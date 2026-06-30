import { useState, useEffect } from 'react'
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

const POSTS_COL = 'posts'

export function usePosts() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Escuta em tempo real — qualquer novo post aparece na hora para todos
    const q = query(collection(db, POSTS_COL), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        setPosts(data)
        setLoading(false)
      },
      (err) => {
        console.error('Firestore error:', err)
        setLoading(false)
      }
    )
    return () => unsub()
  }, [])

  const addPost = async (post) => {
    const { id: _ignore, ...rest } = post
    await addDoc(collection(db, POSTS_COL), {
      ...rest,
      createdAt: serverTimestamp(),
    })
  }

  const deletePost = async (id) => {
    await deleteDoc(doc(db, POSTS_COL, id))
  }

  const updatePost = async (id, data) => {
    await updateDoc(doc(db, POSTS_COL, id), data)
  }

  return { posts, loading, addPost, deletePost, updatePost }
}
