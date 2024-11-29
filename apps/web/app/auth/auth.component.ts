import { Component, inject } from "@angular/core";
import { SupabaseService } from "../supabase.service";
import { TooltipModule } from "~/ui/tooltip";
import { AppMenuComponent } from "~/app-menu.component";
import { CdkMenuModule } from "@angular/cdk/menu";

@Component({
  standalone: true,
  selector: "app-auth",
  templateUrl: "./auth.component.html",
  // styleUrls: ["./auth.component.scss"],
  imports: [TooltipModule, CdkMenuModule],
})
export class AuthComponent {
  loading = false;
  protected supabase = inject(SupabaseService);

  async signIn(): Promise<void> {
    try {
      this.loading = true;

      const { error } = await this.supabase.signIn();
      if (error) throw error;
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      this.loading = false;
    }
  }
  async signOut() {
    this.supabase.signOut();
  }
}
