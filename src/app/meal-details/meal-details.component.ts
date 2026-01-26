import { Component, inject, OnInit } from '@angular/core';
import { MealService } from '../serivces/meal.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Meal } from '../interfaces/meal';
import { combineLatest, map, switchMap, tap } from 'rxjs';
import { MealItemWithProduct } from '../interfaces/meal-item-with-product';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import { CommonModule } from '@angular/common';
import { DisabledIfInactiveDirective } from '../directives/disabled-if-inactive.directive';

@Component({
  selector: 'app-meal-details',
  imports: [RouterModule, CommonModule, ConfirmationModalComponent, DisabledIfInactiveDirective],
  templateUrl: './meal-details.component.html',
  styleUrls: ['./meal-details.component.scss']
})
export class MealDetailsComponent implements OnInit {
  public meal: Meal | null = null;
  public itemsWithDetails: MealItemWithProduct[] = [];

  public showModal = false;
  public modalTitle = '';
  public modalMessage = '';
  public modalConfirmText = 'OK';
  private pendingAction: 'delete' | null = null;
  private pendingMealId: string | null = null;

  private mealService = inject(MealService);
  private route = inject(ActivatedRoute);

  public ngOnInit(): void {
    this.route.paramMap.pipe(

      /** switchMap – reaguje na zmianę ID w URL */
      switchMap((params) => {
        const id = params.get('id')!;
        
        return combineLatest([
          this.mealService.getMeal(id),
          this.mealService.getProducts()
        ]);
      }),
      /** tap – efekt uboczny */
      tap(([meal, _]) => {
        this.meal = meal;
      }),

      /** map – łączenie danych */
      map(([meal, products]) =>
        meal.items.map((item) => {
          const product = products.find((p) => p.id === item.productId);
          
          return {
            productId: item.productId,
            grams: item.grams,
            productName: product?.name ?? 'Nieznany',
            caloriesPer100g: product?.caloriesPer100g ?? 0
          };
        })
      )

    ).subscribe((result) => {
      this.itemsWithDetails = result;
    });
  }

  public deleteMeal(id?: string): void {
    if (!id) {
      this.showModalMessage('Błąd', 'Nie można usunąć posiłku - brak identyfikatora');
      
return;
    }

    this.pendingMealId = id;
    this.pendingAction = 'delete';
    this.showModalMessage(
      'Usuwanie posiłku',
      `Czy na pewno chcesz usunąć posiłek "${this.meal?.name}"?`,
      'Tak',
      'Nie'
    );
  }

  private showModalMessage(title: string, message: string, confirmText: string = 'OK', _: string = ''): void {
    this.modalTitle = title;
    this.modalMessage = message;
    this.modalConfirmText = confirmText;
    this.showModal = true;
  }

  public onModalConfirmed(): void {
    if (this.pendingAction === 'delete' && this.pendingMealId) {
      this.executeDeleteMeal(this.pendingMealId);
    }
    this.resetModal();
  }

  public onModalCancelled(): void {
    this.resetModal();
  }

  private resetModal(): void {
    this.showModal = false;
    this.pendingAction = null;
    this.pendingMealId = null;
    this.modalTitle = '';
    this.modalMessage = '';
    this.modalConfirmText = 'OK';
  }

  private executeDeleteMeal(id: string): void {
    this.mealService.deleteMeal(id).subscribe({
      next: () => {
        this.showModalMessage('Sukces', 'Posiłek został pomyślnie usunięty.');
      },
      error: () => {
        this.showModalMessage('Błąd', 'Nie udało się usunąć posiłku. Spróbuj ponownie.');
      },
    });
  }
}