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
          this.translation = this.translateService.instant(this.lastKey);
          this.changeDetectorRef.markForCheck();
        }
      }
    );
  }

  public transform(key: string): string | null {
    if (key !== this.lastKey) {
      this.lastKey = key;
      this.getSubscription?.unsubscribe();
      this.getSubscription = this.translateService
        .get(key)
        .subscribe((translation) => {
          this.translation = translation;
          this.changeDetectorRef.markForCheck();
          this.getSubscription = null;
        });
    }
    return this.translation;
  }

  ngOnDestroy(): void {
    this.onTranslationChangeSubscription.unsubscribe();
    if (this.getSubscription) {
      this.getSubscription.unsubscribe();
    }
  }
}
