import { NgModule } from '@angular/core';
import { BrowserModule, HammerGestureConfig, HAMMER_GESTURE_CONFIG } from "@angular/platform-browser";
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';

export class AppHammerConfig extends HammerGestureConfig {
  overrides = <any>{
    "pan": { threshold: 1 },
    "rotate": { enable: true }
  }
}

@NgModule({
  imports: [BrowserModule, FormsModule],
  declarations: [AppComponent],
  providers: [
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: AppHammerConfig
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
