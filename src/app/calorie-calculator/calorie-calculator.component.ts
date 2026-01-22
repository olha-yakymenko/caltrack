import { Component, EventEmitter, inject, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { calorieActions, CalorieFormData } from '../store/calorie/calorie.actions';
import { calorieFeature, selectHistory, selectCalculationCount, CalorieState } from '../store/calorie/calorie.state';
import { AuthService } from '../serivces/auth.service';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component'; // Dodaj import

export interface HistoryEntry {
  date: string;
  result: number;
  formData: CalorieFormData;
}

export interface AppState {
  calorie: CalorieState;
}

@Component({
  selector: 'app-calorie-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmationModalComponent], 
  templateUrl: './calorie-calculator.component.html',
  styleUrl: './calorie-calculator.component.scss'
})
export class CalorieCalculatorComponent implements OnInit, OnDestroy {
  @Output() public calculate = new EventEmitter<number>();
  @Output() public closed = new EventEmitter<void>();

  private authService = inject(AuthService);
  private store = inject(Store<AppState>);

  public showModal = false;
  public modalTitle = '';
  public modalMessage = '';
  public modalDetails = '';
  public modalConfirmText = 'Tak';
  public modalCancelText = 'Nie';
  private modalAction: 'applyLimit' | null = null;


  public readonly result$: Observable<number | null> = this.store.select(calorieFeature.selectResult);
  public readonly bmr$: Observable<number | null> = this.store.select(calorieFeature.selectBmr);
  public readonly loading$: Observable<boolean> = this.store.select(calorieFeature.selectLoading);
  public readonly error$: Observable<string | null> = this.store.select(calorieFeature.selectError);
  public readonly history$: Observable<HistoryEntry[]> = this.store.select(selectHistory);
  public readonly calculationCount$: Observable<number> = this.store.select(selectCalculationCount);


  public result: number | null = null;
  public bmr: number | null = null;
  public loading = false;
  public errorMessage: string | null = null;
  public history: HistoryEntry[] = [];
  public calculationCount = 0;
  public showDebug = false;
  
  private subscriptions: Subscription[] = [];

  public form: CalorieFormData = {
    gender: 'male',
    age: null,
    weight: null,
    height: null,
    activityLevel: 'moderate',
    goal: 'maintain'
  };

  public ngOnInit(): void {
    this.subscriptions.push(
      this.result$.subscribe((result) => {
        this.result = result;
      }),
      
      this.bmr$.subscribe((bmr) => {
        this.bmr = bmr;
      }),
      
      this.loading$.subscribe((loading) => {
        this.loading = loading;
      }),
      
      this.error$.subscribe((error) => {
        this.errorMessage = error;
      }),
      
      this.history$.subscribe((history) => {
        this.history = history;
      }),
      
      this.calculationCount$.subscribe((count) => {
        this.calculationCount = count;
      })
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
    
    this.subscriptions = [];
  }

  public calculateCalories(): void {
    if (!this.form.age || !this.form.weight || !this.form.height) {
      this.showErrorModal('Błąd walidacji', 'Proszę wypełnić wszystkie wymagane pola');
      
return;
    }

    this.store.dispatch(calorieActions.calculateCalories({ 
      formData: this.form 
    }));

    const resultSubscription = this.result$.subscribe((result) => {
      if (result && !this.loading) {
        this.calculate.emit(result);
      }
    });
    
    this.subscriptions.push(resultSubscription);
  }

  public resetForm(): void {
    this.form = {
      gender: 'male',
      age: null,
      weight: null,
      height: null,
      activityLevel: 'moderate',
      goal: 'maintain'
    };
    
    this.store.dispatch(calorieActions.reset());
  }

  public onClose(): void {
    this.closed.emit();
  }

  public applyToLimit(): void {
    if (!this.result) {
      this.showErrorModal('Błąd', 'Najpierw oblicz zapotrzebowanie kaloryczne!');
      
return;
    }

    this.modalAction = 'applyLimit';
    this.modalTitle = 'Ustawienie limitu kalorii';
    this.modalMessage = `Czy na pewno chcesz ustawić ${this.result} kcal jako swój dzienny limit kalorii?`;
    this.modalDetails = 'Obecny limit zostanie zastąpiony nową wartością.';
    this.modalConfirmText = 'Ustaw limit';
    this.modalCancelText = 'Anuluj';
    this.showModal = true;
  }

  public onModalConfirmed(): void {
    if (this.modalAction === 'applyLimit') {
      this.executeApplyToLimit()
        .then(() => console.log('Limit zastosowany'))
        .catch((err) => console.error('Błąd podczas stosowania limitu:', err));
    }
    this.resetModal();
  }


  public onModalCancelled(): void {
    this.resetModal();
  }

  public onModalClosed(): void {
    this.resetModal();
  }

  private resetModal(): void {
    this.showModal = false;
    this.modalAction = null;
    this.modalTitle = '';
    this.modalMessage = '';
    this.modalDetails = '';
    this.modalConfirmText = 'Tak';
    this.modalCancelText = 'Nie';
  }

  private async executeApplyToLimit(): Promise<void> {
    if (!this.result) return;

    try {
      await this.authService.updateDailyCalorieLimit(this.result).toPromise();
      this.showSuccessModal('Sukces', `Dzienny limit kalorii został zmieniony na ${this.result} kcal`);
      this.onClose(); 
    } catch {
      this.showErrorModal('Błąd', 'Nie udało się zaktualizować limitu kalorii. Spróbuj ponownie.');
    }
  }

  private showSuccessModal(title: string, message: string): void {
    this.modalTitle = title;
    this.modalMessage = message;
    this.modalDetails = '';
    this.modalConfirmText = 'OK';
    this.modalCancelText = '';
    this.showModal = true;
  }

  private showErrorModal(title: string, message: string): void {
    this.modalTitle = title;
    this.modalMessage = message;
    this.modalDetails = '';
    this.modalConfirmText = 'OK';
    this.modalCancelText = '';
    this.showModal = true;
  }

  public getGoalLabel(): string {
    const labels: Record<string, string> = {
      maintain: 'Utrzymanie wagi',
      loss: 'Utrata wagi',
      gain: 'Przyrost masy'
    };
    
    return labels[this.form.goal];
  }

  public getActivityLabel(): string {
    const labels: Record<string, string> = {
      sedentary: 'Siedzący (brak ćwiczeń)',
      light: 'Lekka (1-3 ćwiczenia/tydzień)',
      moderate: 'Umiarkowana (3-5 ćwiczeń/tydzień)',
      active: 'Aktywna (codzienne ćwiczenia)',
      veryActive: 'Bardzo aktywna (2x dziennie)'
    };
    
    return labels[this.form.activityLevel];
  }

  public testNgRxActions(): void {
    console.log('Testowanie akcji sukcesu...');
    this.store.dispatch(calorieActions.calculateCaloriesSuccess({ 
      result: 2500, 
      bmr: 1800 
    }));
    
    setTimeout(() => {
      console.log('Testowanie akcji błędu...');
      this.store.dispatch(calorieActions.calculateCaloriesFailure({ 
        error: 'Testowy błąd z debugowania' 
      }));
      
      setTimeout(() => {
        console.log('Testowanie akcji reset...');
        this.store.dispatch(calorieActions.reset());
        console.log('Testy zakończone');
      }, 1000);
    }, 1000);
  }

  public toggleDebug(): void {
    this.showDebug = !this.showDebug;
  }
}