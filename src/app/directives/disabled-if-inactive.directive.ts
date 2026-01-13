import { Directive, ElementRef, Input, OnInit, OnDestroy, Renderer2, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../serivces/auth.service';

@Directive({
  selector: '[appDisabledIfInactive]',
  standalone: true
})
export class DisabledIfInactiveDirective implements OnInit, OnDestroy {
  @Input() public appDisabledIfInactive: boolean | '' = true;

  private readonly authService = inject(AuthService);
  private readonly renderer = inject(Renderer2);
  private readonly elementRef = inject(ElementRef);
  
  private subscription: Subscription = new Subscription();
  private isDisabled = false;

  public ngOnInit(): void {
    this.updateState();
    
    this.subscription = this.authService.currentUser$.subscribe(() => {
      this.updateState();
    });
  }
  
  private updateState(): void {
    const user = this.authService.getCurrentUser();
    const shouldDisable = this.appDisabledIfInactive === '' || this.appDisabledIfInactive === true;
    
    if (!shouldDisable) {
      this.enableIfNeeded();
      
  return;
    }

      if (!user) {
    this.enableIfNeeded();
    
return;
  }
    
    const isUserInactive = !user.isActive;
    
    if (isUserInactive) {
      this.disableIfNeeded();
    } else {
      this.enableIfNeeded();
    }
  }

  private disableIfNeeded(): void {
    if (!this.isDisabled) {
      this.disableElement();
      this.isDisabled = true;
    }
  }

  private enableIfNeeded(): void {
    if (this.isDisabled) {
      this.enableElement();
      this.isDisabled = false;
    }
  }

  private disableElement(): void {
    try {
      const element = this.elementRef.nativeElement as HTMLElement;
      
      this.renderer.setAttribute(element, 'disabled', 'true');
      this.renderer.setAttribute(element, 'aria-disabled', 'true');
      
      this.renderer.setStyle(element, 'opacity', '0.6');
      this.renderer.setStyle(element, 'cursor', 'not-allowed');
      
      const originalTitle = element.getAttribute('title');
      if (originalTitle) {
        element.setAttribute('data-original-title', originalTitle);
      }
      this.renderer.setAttribute(element, 'title', 'Konto jest zawieszone. Akcja niedostępna.');
      
      this.renderer.addClass(element, 'disabled-by-inactive');
      
      this.setupEventBlocking(element);
    } catch (error) {
      console.error('Error disabling element:', error);
    }
  }

  private enableElement(): void {
    try {
      const element = this.elementRef.nativeElement as HTMLElement;
      
      this.renderer.removeAttribute(element, 'disabled');
      this.renderer.removeAttribute(element, 'aria-disabled');
      
      this.renderer.removeStyle(element, 'opacity');
      this.renderer.removeStyle(element, 'cursor');
      
      const originalTitle = element.getAttribute('data-original-title');
      if (originalTitle) {
        this.renderer.setAttribute(element, 'title', originalTitle);
        this.renderer.removeAttribute(element, 'data-original-title');
      } else {
        this.renderer.removeAttribute(element, 'title');
      }
      
      this.renderer.removeClass(element, 'disabled-by-inactive');
      
      this.removeEventBlocking(element);
    } catch (error) {
      console.error('Error enabling element:', error);
    }
  }

  private setupEventBlocking(element: HTMLElement): void {
    element.onclick = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      
return false;
    };
    
    element.onkeydown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    
    if (element.tagName.toLowerCase() === 'a') {
      this.renderer.setStyle(element, 'pointer-events', 'none');
    }
  }

  private removeEventBlocking(element: HTMLElement): void {
    element.onclick = null;
    element.onkeydown = null;
    
    if (element.tagName.toLowerCase() === 'a') {
      this.renderer.removeStyle(element, 'pointer-events');
    }
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
    
    if (this.isDisabled) {
      this.enableElement();
    }
  }
}