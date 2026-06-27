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

export function useComments(postId) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!postId) return
    const q = query(
      collection(db, 'posts', postId, 'comments'),
      orderBy('createdAt', 'asc')
    )
    const unsub = onSnapshot(q, (snap) => {
      setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return () => unsub()
  }, [postId])

  const addComment = async ({ author, text }) => {
    await addDoc(collection(db, 'posts', postId, 'comments'), {
      author: author.trim() || 'anônimo',
      text: text.trim(),
      createdAt: serverTimestamp(),
    })
  }

  const deleteComment = async (commentId) => {
    await deleteDoc(doc(db, 'posts', postId, 'comments', commentId))
  }

  return { comments, loading, addComment, deleteComment }
}
