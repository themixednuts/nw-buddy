import { Injectable, OnInit, signal } from "@angular/core";
import {
  AuthChangeEvent,
  AuthSession,
  createClient,
  Session,
  SupabaseClient,
  User,
} from "@supabase/supabase-js";
import { environment } from "../environments/environment";
import { Database } from "./database.types";

@Injectable({
  providedIn: "root",
})
export class SupabaseService {
  private supabase: SupabaseClient<Database>;
  session = signal<AuthSession | null>(null);

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseAnonKey,
    );

    this.bindSession();
  }

  getAvatarUrl() {
    const iden = this.session()?.user.identities[0].identity_data;
    return iden["avatar_url"];
  }

  getUsername() {
    const iden = this.session()?.user.identities[0].identity_data;
    return iden["full_name"];
  }

  protected async refreshSession() {
    // console.log(this.supabase.auth.getSession());
  }
  private async bindSession() {
    this.authChanges((event, session) => {
      if (event == "SIGNED_IN") {
        this.session.set(session);
      }
      if (event == "SIGNED_OUT") {
        this.session.set(null);
      }
    });
  }

  async profile(user: User) {
    const { data, error } = await this.supabase
      .from("profiles")
      .select(`username, avatar_url`)
      .eq("id", user.id)
      .limit(1)
      .single();

    return data;
  }

  authChanges(
    callback: (event: AuthChangeEvent, session: Session | null) => void,
  ) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  async signIn() {
    const response = await this.supabase.auth.signInWithOAuth({
      provider: "discord",
    });
    return response;
  }

  async signOut() {
    await this.supabase.auth.signOut();
  }

  updateProfile(profile: any) {
    const update = {
      ...profile,
      updated_at: new Date(),
    };

    return this.supabase.from("profiles").upsert(update);
  }

  downLoadImage(path: string) {
    return this.supabase.storage.from("avatars").download(path);
  }

  uploadAvatar(filePath: string, file: File) {
    return this.supabase.storage.from("avatars").upload(filePath, file);
  }
}
