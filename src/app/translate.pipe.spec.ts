import { ChangeDetectorRef, Component, EventEmitter } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { Observable, of, VirtualTimeScheduler } from 'rxjs';
import { delay } from 'rxjs/operators';

import { TranslatePipe } from './translate.pipe';
import { TranslateService, Translations } from './translate.service';

const key1 = 'key1';
const key2 = 'key2';

class FakeTranslateService implements Partial<TranslateService> {
  public onTranslationChange = new EventEmitter<Translations>();
  public get(key: string): Observable<string> {
    return of(`[Translation for ${key}]`);
  }
}

@Component({
  template: '{{ key | translate }}',
})
class HostComponent {
  public key = key1;
}

describe('TranslatePipe with HostComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let translateService: TranslateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TranslatePipe, HostComponent],
      providers: [
        { provide: TranslateService, useClass: FakeTranslateService },
      ],
    });

    translateService = TestBed.inject(TranslateService);

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('translates the key', () => {
    expect(fixture.debugElement.nativeElement.textContent).toBe(
      '[Translation for key1]'
    );
  });

  it('translates a changed key', () => {
    fixture.componentInstance.key = key2;
    fixture.detectChanges();
    expect(fixture.debugElement.nativeElement.textContent).toBe(
      '[Translation for key2]'
    );
  });

  it('updates on translation change', () => {
    translateService.get = (key: string) => of(`[New translation for ${key}]`);
    translateService.onTranslationChange.emit({});
    fixture.detectChanges();
    expect(fixture.debugElement.nativeElement.textContent).toBe(
      '[New translation for key1]'
    );
  });
});

class FakeChangeDetectorRef implements Pick<ChangeDetectorRef, 'markForCheck'> {
  markForCheck(): void {}
}

fdescribe('TranslatePipe bare', () => {
  let translatePipe: TranslatePipe;
  let changeDetectorRef: FakeChangeDetectorRef;
  let translateService: FakeTranslateService;

  beforeEach(() => {
    changeDetectorRef = new FakeChangeDetectorRef();
    translateService = new FakeTranslateService();

    spyOn(changeDetectorRef, 'markForCheck');

    translatePipe = new TranslatePipe(
      changeDetectorRef as ChangeDetectorRef,
      translateService as TranslateService
    );
  });

  it('translates the key, sync service responsex', () => {
    const translation = translatePipe.transform(key1);
    expect(translation).toBe('[Translation for key1]');
    expect(changeDetectorRef.markForCheck).toHaveBeenCalled();
  });

  it('translates the key, async service response (1)', () => {
    const scheduler = new VirtualTimeScheduler();
    translateService.get = (key: string) =>
      of(`[Translation for ${key}]`).pipe(delay(1, scheduler));

    const translation1 = translatePipe.transform(key1);
    expect(translation1).toBe(null);
    scheduler.flush();

    const translation2 = translatePipe.transform(key1);
    expect(translation2).toBe('[Translation for key1]');
  });

  it('translates the key, async service response (2)', fakeAsync(() => {
    translateService.get = (key: string) =>
      new Observable((subscriber) => {
        setTimeout(() => {
          subscriber.next(`[Translation for ${key}]`);
          subscriber.complete();
        }, 1);
      });

    const translation1 = translatePipe.transform(key1);
    expect(translation1).toBe(null);
    tick(1);

    const translation2 = translatePipe.transform(key1);
    expect(translation2).toBe('[Translation for key1]');
  }));

  it('gets a translation for a key only once', () => {
    spyOn(translateService, 'get').and.callThrough();

    const translation1 = translatePipe.transform(key1);
    expect(translation1).toBe('[Translation for key1]');
    expect(translateService.get).toHaveBeenCalledTimes(1);

    const translation2 = translatePipe.transform(key1);
    expect(translation2).toBe('[Translation for key1]');
    expect(translateService.get).toHaveBeenCalledTimes(1);
  });

  it('translates a changed key, sync response', () => {
    const translation1 = translatePipe.transform(key1);
    expect(translation1).toBe('[Translation for key1]');

    const translation2 = translatePipe.transform(key2);
    expect(translation2).toBe('[Translation for key2]');
  });

  it('updates on translation change', () => {
    const translation1 = translatePipe.transform(key1);
    expect(translation1).toBe('[Translation for key1]');
    expect(changeDetectorRef.markForCheck).toHaveBeenCalledTimes(1);

    translateService.get = (key: string) => of(`[New translation for ${key}]`);
    translateService.onTranslationChange.emit({});
    expect(changeDetectorRef.markForCheck).toHaveBeenCalledTimes(2);

    const translation2 = translatePipe.transform(key1);
    expect(translation2).toBe('[New translation for key1]');
  });
});
