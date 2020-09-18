import { Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppComponent } from './app.component';
import { expectText, findEl } from './spec-helpers/element.spec-helper';
import { TranslateService } from './translate.service';

class FakeTranslateService implements Partial<TranslateService> {
  public use(): void {}
}

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
        { provide: TranslateService, useClass: FakeTranslateService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    translateService = TestBed.inject(TranslateService);
    spyOn(translateService, 'use');
  });

  it('should create the app', () => {
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('changes the language', () => {
    const select = findEl(fixture, 'language-select');
    select.triggerEventHandler('change', {
      target: { value: 'fr' },
    });
    expect(translateService.use).toHaveBeenCalledWith('fr');
  });

  it('renders a greeting', () => {
    expectText(fixture, 'greeting', '[Translation for greeting]');
  });
});
