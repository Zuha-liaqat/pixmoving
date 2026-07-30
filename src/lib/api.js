const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export async function fetchLibraryItems() {
  const res = await fetch(`${API_BASE_URL}/library/`, {
    headers: { accept: 'application/json' },
  })

  if (!res.ok) {
    throw new Error(`Failed to load library items (${res.status})`)
  }

  return res.json()
}

async function extractErrorMessage(res, fallback) {
  try {
    const data = await res.json()
    if (Array.isArray(data?.detail)) {
      return data.detail.map((d) => d.msg).join(', ') || fallback
    }
    if (typeof data?.detail === 'string') return data.detail
  } catch {
    // response wasn't JSON — fall through to the generic message
  }
  return fallback
}

export async function createLibraryItem({ name, type, image }) {
  const formData = new FormData()
  formData.append('name', name)
  formData.append('type', type)
  formData.append('image', image)

  const res = await fetch(`${API_BASE_URL}/library/`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    throw new Error(
      await extractErrorMessage(res, `Failed to upload asset (${res.status})`),
    )
  }

  return res.json()
}

export async function updateLibraryItem(libraryId, { name, type, image }) {
  const formData = new FormData()
  if (name !== undefined) formData.append('name', name)
  if (type !== undefined) formData.append('type', type)
  if (image) formData.append('image', image)

  const res = await fetch(`${API_BASE_URL}/library/${libraryId}`, {
    method: 'PUT',
    body: formData,
  })

  if (!res.ok) {
    throw new Error(
      await extractErrorMessage(res, `Failed to update asset (${res.status})`),
    )
  }

  return res.json()
}

export async function deleteLibraryItem(libraryId) {
  const res = await fetch(`${API_BASE_URL}/library/${libraryId}`, {
    method: 'DELETE',
  })

  if (!res.ok) {
    throw new Error(
      await extractErrorMessage(res, `Failed to delete asset (${res.status})`),
    )
  }

  return res.json()
}
