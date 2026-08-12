import { queueItems } from './queueItems'

const STORAGE_KEY = 'pixmoving_generated_posts'

export function getGeneratedPosts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveGeneratedPost(post) {
  const posts = getGeneratedPosts()
  const existing = posts.some((p) => p.id === post.id)
  const next = existing ? posts.map((p) => (p.id === post.id ? post : p)) : [post, ...posts]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

export function updateGeneratedPost(id, updates) {
  const posts = getGeneratedPosts()
  const next = posts.map((p) => (p.id === id ? { ...p, ...updates } : p))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

export function removeGeneratedPost(id) {
  const posts = getGeneratedPosts()
  const next = posts.filter((p) => p.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

export function getAllQueueItems() {
  return [...getGeneratedPosts(), ...queueItems]
}

export function getQueueItemById(id) {
  return getAllQueueItems().find((p) => p.id === id)
}
