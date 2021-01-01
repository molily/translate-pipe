import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { TranslateService, Translations } from './translate.service';

const englishTranslations = { greeting: 'Hello!' };
const frenchTranslations = { greeting: 'Bonjour!' };

describe('TranslateService', () => {
  let translateService: TranslateService;
  let controller: HttpTestingController;

  function flushEnglishTranslations(): void {
    controller
      .expectOne({ method: 'GET', url: 'assets/en.json' })
      .flush(englishTranslations);
  }

  function flushFrenchTranslations(): void {
    controller
      .expectOne({ method: 'GET', url: 'assets/fr.json' })
      .flush(frenchTranslations);
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TranslateService],
    });
    translateService = TestBed.inject(TranslateService);
    controller = TestBed.inject(HttpTestingController);
  });

  it('loads the translations initially', () => {
    flushEnglishTranslations();
    expect().nothing();
    controller.verify();
  });

  it('changes the language', () => {
    flushEnglishTranslations();

    translateService.use('fr');
    flushFrenchTranslations();
    expect().nothing();
  });

  it('translates a key, translations already loaded', () => {
    flushEnglishTranslations();

    let actualTranslation: string | undefined;
    translateService.get('greeting').subscribe((translation) => {
      actualTranslation = translation;
    });
    expect(actualTranslation).toBe('Hello!');
  });

  it('translates a key, translations need to be loaded', () => {
    let actualTranslation: string | undefined;
    translateService.get('greeting').subscribe((translation) => {
      actualTranslation = translation;
    });

    expect(actualTranslation).toBe(undefined);
    flushEnglishTranslations();
    expect(actualTranslation).toBe('Hello!');
  });

  it('translates a key and completes the observable', () => {
    const next = jasmine.createSpy('next');
    const complete = jasmine.createSpy('complete');
    translateService.get('greeting').subscribe(next, fail, complete);

    flushEnglishTranslations();
    translateService.use('fr');
    flushFrenchTranslations();

    expect(next).toHaveBeenCalledTimes(1);
    expect(complete).toHaveBeenCalledTimes(1);
  });

  it('emits on translation change', () => {
    const actualTranslations: Translations[] = [];
    translateService.onTranslationChange.subscribe(
      (translations: Translations) => {
        actualTranslations.push(translations);
      }
    );

    flushEnglishTranslations();
    translateService.use('fr');
    flushFrenchTranslations();

    expect(actualTranslations).toEqual([
      englishTranslations,
      frenchTranslations,
    ]);
  });
});
