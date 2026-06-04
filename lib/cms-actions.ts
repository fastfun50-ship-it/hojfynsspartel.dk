'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { verifyAuth } from './auth'
import {
  getProjects,
  saveProjects,
  getProcessSteps,
  saveProcessSteps,
  getSiteContent,
  saveSiteContent,
  getInquiries,
  markInquiryRead,
  deleteInquiry,
  getNextProjectId,
} from './cms'
import type { Project, ProcessStep, SiteContent } from '@/types/cms'

// Helper: ensure admin
async function ensureAdmin() {
  const ok = await verifyAuth()
  if (!ok) {
    throw new Error('Unauthorized')
  }
}

// ===== SITE CONTENT =====
export async function updateSiteContent(data: Partial<SiteContent>) {
  await ensureAdmin()
  const current = await getSiteContent()
  const merged: SiteContent = {
    ...current,
    ...data,
    company: { ...current.company, ...data.company },
    contact: { ...current.contact, ...data.contact },
    metadata: { ...current.metadata, ...data.metadata },
    hero: { ...current.hero, ...data.hero },
    about: { ...current.about, ...data.about },
    colors: { 
      ...current.colors, 
      ...data.colors,
      // ensure nested if partial
    },
  }
  await saveSiteContent(merged)
  revalidatePath('/')
  revalidatePath('/admin')
  return { success: true }
}

// ===== PROJECTS =====
export async function createProject(project: Omit<Project, 'id' | 'order'>) {
  await ensureAdmin()
  const projects = await getProjects()
  const nextId = await getNextProjectId()
  const newProject: Project = {
    ...project,
    id: nextId,
    order: projects.length + 1,
  }
  await saveProjects([...projects, newProject])
  revalidatePath('/')
  revalidatePath('/admin')
  return newProject
}

export async function updateProject(id: number, updates: Partial<Omit<Project, 'id'>>) {
  await ensureAdmin()
  const projects = await getProjects()
  const updated = projects.map((p) => (p.id === id ? { ...p, ...updates } : p))
  await saveProjects(updated)
  revalidatePath('/')
  revalidatePath('/admin')
  return { success: true }
}

export async function deleteProject(id: number) {
  await ensureAdmin()
  const projects = await getProjects()
  const filtered = projects.filter((p) => p.id !== id)
  // reindex order
  const reindexed = filtered.map((p, i) => ({ ...p, order: i + 1 }))
  await saveProjects(reindexed)
  revalidatePath('/')
  revalidatePath('/admin')
  return { success: true }
}

export async function reorderProjects(orderedIds: number[]) {
  await ensureAdmin()
  const projects = await getProjects()
  const map = new Map(projects.map((p) => [p.id, p]))
  const reordered = orderedIds
    .map((id, idx) => {
      const p = map.get(id)
      return p ? { ...p, order: idx + 1 } : null
    })
    .filter(Boolean) as Project[]
  await saveProjects(reordered)
  revalidatePath('/')
  revalidatePath('/admin')
}

// ===== PROCESS =====
export async function updateProcessSteps(steps: ProcessStep[]) {
  await ensureAdmin()
  await saveProcessSteps(steps)
  revalidatePath('/')
  revalidatePath('/admin')
  return { success: true }
}

// ===== INQUIRIES =====
export async function markAsRead(id: number) {
  await ensureAdmin()
  await markInquiryRead(id)
  revalidatePath('/admin')
}

export async function removeInquiry(id: number) {
  await ensureAdmin()
  await deleteInquiry(id)
  revalidatePath('/admin')
}

// ===== IMAGE UPLOAD =====
export async function uploadImage(formData: FormData) {
  await ensureAdmin()

  const file = formData.get('file') as File | null
  if (!file) throw new Error('No file')

  const filename = file.name.replace(/\s+/g, '-').toLowerCase()

  // If Vercel Blob token present → use it (prod + previews)
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put: blobPut } = await import('@vercel/blob')
    const blob = await blobPut(`uploads/${Date.now()}-${filename}`, file, {
      access: 'public',
      addRandomSuffix: false,
    })
    return { url: blob.url }
  }

  // Dev fallback: write to public/uploads (will be served statically)
  // Note: in real prod without blob this won't persist, but for local testing fine.
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const { writeFile, mkdir } = await import('fs/promises')
  const { join } = await import('path')
  const uploadDir = join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadDir, { recursive: true })
  const localPath = join(uploadDir, `${Date.now()}-${filename}`)
  await writeFile(localPath, buffer)
  const url = `/uploads/${localPath.split(/[\\/]/).pop()}`
  return { url }
}
