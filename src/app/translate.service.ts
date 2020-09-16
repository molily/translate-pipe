import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';

interface Translations {
  [key: string]: string;
}

@Injectable()
export class TranslateService {
  /** The current langage */
  private currentLang = 'en';

  /** Translations for the current language */
  private translations: Translations | null = null;

  /** Emits when the language change */
  public onTranslationChange = new EventEmitter();

  constructor(private http: HttpClient) {
    this.loadTranslations(this.currentLang);
  }

  /** Changes the language */
  public use(language: string): void {
    this.currentLang = language;
    this.loadTranslations(language);
  }

  /** Translates a key asynchronously */
  public get(key: string): Observable<string> {
    if (this.translations) {
      return of(this.instant(key));
    }
    return this.onTranslationChange.pipe(
      take(1),
      map((translations) => translations[key])
    );
  }

  /** Translates a key synchronously */
  public instant(key: string): string {
    if (!this.translations) {
      throw new Error('Translations not loaded');
    }
    return this.translations[key];
  }

  /** Loads the translations for the given language */
  private loadTranslations(language: string): void {
    this.translations = null;
    this.http
      .get<Translations>(`/assets/${language}.json`)
      .subscribe((translations) => {
        this.translations = translations;
        this.onTranslationChange.emit(translations);
      });
  }
}
