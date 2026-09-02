// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
const AuthContext = createContext({})
export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || ''
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [workspace, setWorkspace] = useState(null)
  const [allWorkspaces, setAllWorkspaces] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else { setProfile(null); setWorkspace(null); setAllWorkspaces([]); setLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    try {
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', userId).single()
      setProfile(prof)

      // Fetch owned workspaces
      const { data: owned } = await supabase.from('workspaces').select('*').eq('owner_id', userId)

      // Fetch member workspaces
      const { data: memberOf } = await supabase
        .from('workspace_members')
        .select('workspace_id, workspaces(*)')
        .eq('user_id', userId)

      const memberWorkspaces = memberOf?.map(m => m.workspaces).filter(Boolean) || []
      const all = [...(owned || []), ...memberWorkspaces]
      setAllWorkspaces(all)

      // Set active workspace — use first owned, or first available
      const active = owned?.[0] || memberWorkspaces[0] || null
      setWorkspace(active)
    } finally {
      setLoading(false)
    }
  }

  async function switchWorkspace(ws) {
    setWorkspace(ws)
  }

  async function createWorkspace(name) {
    if (!user) return null
    const { data, error } = await supabase
      .from('workspaces')
      .insert({ owner_id: user.id, name: name.trim() })
      .select()
      .single()
    if (!error && data) {
      setAllWorkspaces(prev => [...prev, data])
      setWorkspace(data)
    }
    return { data, error }
  }

  async function addMemberByEmail(email) {
    if (!workspace) return { error: 'No workspace selected' }
    // Find user by email in profiles
    const { data: targetProfile, error: findError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('email', email.trim())
      .single()

    if (findError || !targetProfile) return { error: 'No user found with that email. They must sign up first.' }
    if (targetProfile.id === user.id) return { error: 'You cannot add yourself.' }

    const { data, error } = await supabase
      .from('workspace_members')
      .insert({ workspace_id: workspace.id, user_id: targetProfile.id, invited_by: user.id })
      .select()
      .single()

    return { data, error, profile: targetProfile }
  }

  const isAdmin = user?.email === ADMIN_EMAIL || profile?.is_admin === true

  const signInWithGoogle = () =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })

  const signOut = () => supabase.auth.signOut()

  return (
    <AuthContext.Provider value={{
      user, profile, workspace, allWorkspaces,
      loading, isAdmin,
      signInWithGoogle, signOut, fetchProfile,
      switchWorkspace, createWorkspace, addMemberByEmail
    }}>
      {children}
    </AuthContext.Provider>
  )
}
export const useAuth = () => useContext(AuthContext)
