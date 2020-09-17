import { Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppComponent } from './app.component';
import { TranslateService } from './translate.service';

class FakeTranslateService implements Partial<TranslateService> {
  public use(): void {}
}

@Pipe({ name: 'translate' })
class FakeTranslatePipe implements PipeTransform {
  public transform(): string {
    return 'FakeTranslatePipe#transform';
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

  xit('changes the language', () => {});

  xit('renders a greeting', () => {});
});
