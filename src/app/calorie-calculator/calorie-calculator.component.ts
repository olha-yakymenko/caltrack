import { Component, EventEmitter, inject, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { calorieActions, CalorieFormData } from '../store/calorie/calorie.actions';
import { calorieFeature, selectHistory, selectCalculationCount, CalorieState } from '../store/calorie/calorie.state';
import { AuthService } from '../serivces/auth.service';

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
  imports: [CommonModule, FormsModule],
  templateUrl: './calorie-calculator.component.html',
  styleUrl: './calorie-calculator.component.scss'
})
export class CalorieCalculatorComponent implements OnInit, OnDestroy {
  @Output() public calculate = new EventEmitter<number>();
  @Output() public closed = new EventEmitter<void>();

  private authService = inject(AuthService);
  private store = inject(Store<AppState>);

  // Observable z NgRx Store
  public readonly result$: Observable<number | null> = this.store.select(calorieFeature.selectResult);
  public readonly bmr$: Observable<number | null> = this.store.select(calorieFeature.selectBmr);
  public readonly loading$: Observable<boolean> = this.store.select(calorieFeature.selectLoading);
  public readonly error$: Observable<string | null> = this.store.select(calorieFeature.selectError);
  public readonly history$: Observable<HistoryEntry[]> = this.store.select(selectHistory);
  public readonly calculationCount$: Observable<number> = this.store.select(selectCalculationCount);

  // Zmienne lokalne
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
      alert('Proszę wypełnić wszystkie wymagane pola');
      
return;
    }

    // Dispatch akcji do NgRx
    this.store.dispatch(calorieActions.calculateCalories({ 
      formData: this.form 
    }));

    // Subskrypcja do wyniku
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

  public async applyToLimit(): Promise<void> {
    if (!this.result) {
      alert('Najpierw oblicz zapotrzebowanie kaloryczne!');
      
return;
    }

    const confirmed = confirm(`Czy na pewno chcesz ustawić ${this.result} kcal jako swój dzienny limit kalorii?`);
    
    if (!confirmed) {
      return;
    }

    try {
      await this.authService.updateDailyCalorieLimit(this.result).toPromise();
      alert(`Dzienny limit kalorii został zmieniony na ${this.result} kcal`);
      this.onClose(); 
    } catch {
      alert('Nie udało się zaktualizować limitu kalorii. Spróbuj ponownie.');
    }
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
