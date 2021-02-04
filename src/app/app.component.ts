import { Component } from '@angular/core';
import { TranslateService } from './translate.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor(private translateService: TranslateService) {}

  public useLanguage(event: Event): void {
    if (!(event.target instanceof HTMLSelectElement)) {
      throw new Error('Event target is not a select element');
    }
    const language = event.target.value;
    this.translateService.use(language);
  }
}
