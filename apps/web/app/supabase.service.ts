import { Injectable, signal } from '@angular/core'
import { AuthChangeEvent, AuthSession, createClient, Session, SupabaseClient, User } from '@supabase/supabase-js'
import { environment } from '../environments/environment'
import type { Database } from './database.types'

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private static client: SupabaseClient<Database> = createClient(environment.supabaseUrl, environment.supabaseAnonKey)
  session = signal<AuthSession | null>(null)

  constructor() {
    SupabaseService.client.auth
      .getSession()
      .then(({ data }) =>
        SupabaseService.client.auth.refreshSession(data.session).then(({ data }) => this.session.set(data.session)),
      )

    this.bindSession()
  }

  get handle() {
    return SupabaseService.client
  }

  getAvatarUrl() {
    const iden = this.session()?.user.identities[0].identity_data
    return iden['avatar_url']
  }

  getUsername() {
    const iden = this.session()?.user.identities[0].identity_data
    return iden['full_name']
  }

  private async bindSession() {
    this.authChanges((event, session) => {
      if (event == 'SIGNED_IN') {
        this.session.set(session)
      }
      if (event == 'SIGNED_OUT') {
        this.session.set(null)
      }
    })
  }

  async profile(user: User) {
    const { error } = await SupabaseService.client
      .from('profiles')
      .select(`username, avatar_url`)
      .eq('id', user.id)
      .limit(1)
      .single()
  }

  authChanges(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return SupabaseService.client.auth.onAuthStateChange(callback)
  }

  async signIn() {
    const {
      data: { session },
      error,
    } = await SupabaseService.client.auth.getSession()
    if (error || !session) {
      const response = await SupabaseService.client.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: window ? window.location.href : null,
        },
      })
      return
    }

    const {
      data: { session: refreshedSession },
    } = await SupabaseService.client.auth.refreshSession(session)

    this.session.set(refreshedSession)
  }

  async signOut() {
    await SupabaseService.client.auth.signOut()
  }

  updateProfile(profile: any) {
    const update = {
      ...profile,
      updated_at: new Date(),
    }

    return SupabaseService.client.from('profiles').upsert(update)
  }
}
