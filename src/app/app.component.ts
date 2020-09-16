import { Component } from '@angular/core';
import { TranslateService } from './translate.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor(private translateService: TranslateService) {}

  public useLanguage(language: string): void {
    this.translateService.use(language);
  }
}
