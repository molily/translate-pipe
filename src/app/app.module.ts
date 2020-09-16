import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { TranslatePipe } from './translate.pipe';
import { TranslateService } from './translate.service';

@NgModule({
  declarations: [AppComponent, TranslatePipe],
  imports: [BrowserModule, HttpClientModule],
  providers: [TranslateService],
  bootstrap: [AppComponent],
})
export class AppModule {}
