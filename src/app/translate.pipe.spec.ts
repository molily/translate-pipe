import { ChangeDetectorRef, Component, EventEmitter } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { expectContent } from './spec-helpers/element.spec-helper';
import { TranslatePipe } from './translate.pipe';
import { TranslateService, Translations } from './translate.service';

const key1 = 'key1';
const key2 = 'key2';

@Component({
  template: '{{ key | translate }}',
})
class HostComponent {
  public key = key1;
}

describe('TranslatePipe: with TestBed and HostComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let translateService: Pick<TranslateService, 'onTranslationChange' | 'get'>;

  beforeEach(async () => {
    translateService = {
      onTranslationChange: new EventEmitter<Translations>(),
      get(key: string): Observable<string> {
        return of(`Translation for ${key}`);
      },
    };

    await TestBed.configureTestingModule({
      declarations: [TranslatePipe, HostComponent],
      providers: [{ provide: TranslateService, useValue: translateService }],
    }).compileComponents();

    translateService = TestBed.inject(TranslateService);
    fixture = TestBed.createComponent(HostComponent);
  });

  it('translates the key, sync service response', () => {
    fixture.detectChanges();
    expectContent(fixture, 'Translation for key1');
  });

  it('translates the key, async service response', fakeAsync(() => {
    translateService.get = (key) => of(`Async translation for ${key}`).pipe(delay(100));
    fixture.detectChanges();
    expectContent(fixture, '');

    tick(100);
    fixture.detectChanges();
    expectContent(fixture, 'Async translation for key1');
  }));

  it('translates a changed key', () => {
    fixture.detectChanges();
    fixture.componentInstance.key = key2;
    fixture.detectChanges();
    expectContent(fixture, 'Translation for key2');
  });

  it('updates on translation change', () => {
    fixture.detectChanges();
    translateService.get = (key) => of(`New translation for ${key}`);
    translateService.onTranslationChange.emit({});
    fixture.detectChanges();
    expectContent(fixture, 'New translation for key1');
  });
});

describe('TranslatePipe: direct test', () => {
  let translatePipe: TranslatePipe;

  let changeDetectorRef: Pick<ChangeDetectorRef, 'markForCheck'>;
  let translateService: Pick<TranslateService, 'onTranslationChange' | 'get'>;

  beforeEach(() => {
    changeDetectorRef = {
      markForCheck(): void {},
    };

    translateService = {
      onTranslationChange: new EventEmitter<Translations>(),
      get(key: string): Observable<string> {
        return of(`Translation for ${key}`);
      },
    };

    spyOn(changeDetectorRef, 'markForCheck');

    translatePipe = new TranslatePipe(
      changeDetectorRef as ChangeDetectorRef,
      translateService as TranslateService,
    );
  });

  it('translates the key, sync service response', () => {
    const translation = translatePipe.transform(key1);
    expect(translation).toBe('Translation for key1');
    expect(changeDetectorRef.markForCheck).toHaveBeenCalled();
  });

  it('translates the key, async service response', fakeAsync(() => {
    translateService.get = (key) => of(`Async translation for ${key}`).pipe(delay(100));

    const translation1 = translatePipe.transform(key1);
    expect(translation1).toBe(null);

    tick(100);

    const translation2 = translatePipe.transform(key1);
    expect(translation2).toBe('Async translation for key1');
  }));

  it('gets a translation for a key only once', () => {
    spyOn(translateService, 'get').and.callThrough();

    const translation1 = translatePipe.transform(key1);
    expect(translation1).toBe('Translation for key1');
    expect(translateService.get).toHaveBeenCalledTimes(1);

    const translation2 = translatePipe.transform(key1);
    expect(translation2).toBe('Translation for key1');
    expect(translateService.get).toHaveBeenCalledTimes(1);
  });

  it('translates a changed key', () => {
    const translation1 = translatePipe.transform(key1);
    expect(translation1).toBe('Translation for key1');

    const translation2 = translatePipe.transform(key2);
    expect(translation2).toBe('Translation for key2');
  });

  it('updates on translation change', () => {
    const translation1 = translatePipe.transform(key1);
    expect(translation1).toBe('Translation for key1');
    expect(changeDetectorRef.markForCheck).toHaveBeenCalledTimes(1);

    translateService.get = (key) => of(`New translation for ${key}`);
    translateService.onTranslationChange.emit({});
    expect(changeDetectorRef.markForCheck).toHaveBeenCalledTimes(2);

    const translation2 = translatePipe.transform(key1);
    expect(translation2).toBe('New translation for key1');
  });
});
