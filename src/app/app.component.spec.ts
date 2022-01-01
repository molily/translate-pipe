import { Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppComponent } from './app.component';
import { expectText, findEl, setFieldValue } from './spec-helpers/element.spec-helper';
import { TranslateService } from './translate.service';

const fakeTranslateService: Partial<TranslateService> = {
  use(): void {}
};

@Pipe({ name: 'translate' })
class FakeTranslatePipe implements PipeTransform {
  public transform(key: string): string {
    return `[Translation for ${key}]`;
  }
}

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let translateService: TranslateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent, FakeTranslatePipe],
      providers: [
        { provide: TranslateService, useValue: fakeTranslateService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    translateService = TestBed.inject(TranslateService);
    spyOn(translateService, 'use');
  });

  it('renders without errors', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('changes the language', () => {
    const language = 'fr';
    setFieldValue(fixture, 'language-select', language);
    const select = findEl(fixture, 'language-select');
    select.triggerEventHandler('change', {
      target: select.nativeElement,
    });
    expect(translateService.use).toHaveBeenCalledWith(language);
  });

  it('renders a greeting', () => {
    expectText(fixture, 'greeting', '[Translation for greeting]');
  });
});
