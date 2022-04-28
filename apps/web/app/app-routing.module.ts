import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'items'
  },
  { path: 'character', loadChildren: () => import('./pages/character').then((m) => m.CharacterModule) },
  { path: 'items', loadChildren: () => import('./pages/items').then(m => m.ItemsModule) },
  { path: 'perks', loadChildren: () => import('./pages/perks').then(m => m.PerksModule) },
  { path: 'armorsets', loadChildren: () => import('./pages/armorsets').then(m => m.ArmorsetsModule) },
  { path: 'status-effects', loadChildren: () => import('./pages/status-effects').then(m => m.StatusEffectsModule) },
  { path: 'abilities', loadChildren: () => import('./pages/abilities').then(m => m.AbilitiesModule) },
  { path: 'housing', loadChildren: () => import('./pages/housing').then(m => m.HousingModule) },
  { path: 'crafting', loadChildren: () => import('./pages/crafting').then(m => m.CraftingModule) },
  { path: 'preferences', loadChildren: () => import('./pages/preferences').then(m => m.PreferencesModule) },
  { path: 'dungeons', loadChildren: () => import('./pages/dungeons').then(m => m.DungeonsModule) },
  { path: 'pve-damage', loadChildren: () => import('./pages/pve-damage/pve-damage.module').then(m => m.PveDamageModule) },
  { path: 'progression', loadChildren: () => import('./pages/progression/progression.module').then(m => m.ProgressionModule) },

  { path: '**', loadChildren: () => import('./pages/not-found').then((m) => m.NotFoundModule) },
]

@NgModule({
  imports: [RouterModule.forRoot(routes, {  })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
