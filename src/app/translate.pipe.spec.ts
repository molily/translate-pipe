import { ChangeDetectorRef, Component, EventEmitter } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { Observable, of } from 'rxjs';
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
    spyOn(translateService, 'get').and.callThrough();

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
    (translateService.get as jasmine.Spy).and.callFake((key: string) =>
      of(`[New translation for ${key}]`)
    );
    translateService.onTranslationChange.emit({});
    fixture.detectChanges();
    expect(fixture.debugElement.nativeElement.textContent).toBe(
      '[New translation for key1]'
    );
  });
});

describe('TranslatePipe bare', () => {
  let translatePipe: TranslatePipe;

  beforeEach(() => {
    const changeDetectorRef: Pick<ChangeDetectorRef, 'markForCheck'> = {
      markForCheck(): void {},
    };
    const translateService = new FakeTranslateService();
    translatePipe = new TranslatePipe(
      changeDetectorRef as ChangeDetectorRef,
      translateService as TranslateService
    );
  });

  xit('translates the key', () => {});
  xit('translates a changed key', () => {});
  xit('updates on translation change', () => {});
});
