import {
  ChangeDetectorRef,
  OnDestroy,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { Subscription } from 'rxjs';

import { TranslateService } from './translate.service';

@Pipe({
  name: 'translate',
  pure: false,
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private lastKey: string | null = null;
  private translation: string | null = null;

  private onTranslationChangeSubscription: Subscription;
  private getSubscription: Subscription | null = null;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private translateService: TranslateService
  ) {
    this.onTranslationChangeSubscription = this.translateService.onTranslationChange.subscribe(
      () => {
        if (this.lastKey) {
          this.getTranslation(this.lastKey);
        }
      }
    );
  }

  public transform(key: string): string | null {
    if (key !== this.lastKey) {
      this.lastKey = key;
      this.getTranslation(key);
    }
    return this.translation;
  }

  private getTranslation(key: string): void {
    this.getSubscription?.unsubscribe();
    this.getSubscription = this.translateService
      .get(key)
      .subscribe((translation) => {
        this.translation = translation;
        this.changeDetectorRef.markForCheck();
        this.getSubscription = null;
      });
  }

  public ngOnDestroy(): void {
    this.onTranslationChangeSubscription.unsubscribe();
    this.getSubscription?.unsubscribe();
  }
}
