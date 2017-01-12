import { NgModule } from '@angular/core';
import { BrowserModule, HammerGestureConfig, HAMMER_GESTURE_CONFIG } from "@angular/platform-browser";
import { AppComponent } from './app.component';

export class AppHammerConfig extends HammerGestureConfig {
  overrides = <any>{
    "pan": { threshold: 1 }
  }
}

@NgModule({
  imports: [BrowserModule],
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
