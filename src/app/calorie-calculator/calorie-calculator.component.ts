import { Component, EventEmitter, inject, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../serivces/auth.service';

interface CalorieForm {
  gender: 'male' | 'female';
  age: number | null;
  weight: number | null;
  height: number | null;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';
  goal: 'maintain' | 'loss' | 'gain';
}

@Component({
  selector: 'app-calorie-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calorie-calculator.component.html',
  styleUrl: './calorie-calculator.component.scss'
})
export class CalorieCalculatorComponent {
  @Output() calculate = new EventEmitter<number>();
  @Output() close = new EventEmitter<void>();

  private authService = inject(AuthService);
  
  form: CalorieForm = {
    gender: 'male',
    age: null,
    weight: null,
    height: null,
    activityLevel: 'moderate',
    goal: 'maintain'
  };

  result: number | null = null;
  bmr: number | null = null;

  activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    veryActive: 1.9
  };

  goalMultipliers = {
    maintain: 1,
    loss: 0.85,
    gain: 1.15
  };

  calculateCalories(): void {
    if (!this.form.age || !this.form.weight || !this.form.height) {
      alert('Proszę wypełnić wszystkie wymagane pola');
      return;
    }

    let bmr;
    if (this.form.gender === 'male') {
      bmr = (10 * this.form.weight) + (6.25 * this.form.height) - (5 * this.form.age) + 5;
    } else {
      bmr = (10 * this.form.weight) + (6.25 * this.form.height) - (5 * this.form.age) - 161;
    }

    this.bmr = Math.round(bmr);

    const tdee = bmr * this.activityMultipliers[this.form.activityLevel];
    
    const calories = tdee * this.goalMultipliers[this.form.goal];
    
    this.result = Math.round(calories);
    this.calculate.emit(this.result);
  }

  resetForm(): void {
    this.form = {
      gender: 'male',
      age: null,
      weight: null,
      height: null,
      activityLevel: 'moderate',
      goal: 'maintain'
    };
    this.result = null;
    this.bmr = null;
  }

  onClose(): void {
    this.close.emit();
  }

  // applyToLimit(): void {
  //   if (this.result) {
  //     alert(`Nowy limit kalorii: ${this.result} kcal został obliczony. Możesz go ustawić w ustawieniach profilu.`);
  //   }
  // }


    async applyToLimit(): Promise<void> {
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
    } catch (error) {
      console.error('Błąd aktualizacji limitu:', error);
      alert('Nie udało się zaktualizować limitu kalorii. Spróbuj ponownie.');
    } 
  }

  getGoalLabel(): string {
  const labels = {
    maintain: 'Utrzymanie wagi',
    loss: 'Utrata wagi',
    gain: 'Przyrost masy'
  };
  return labels[this.form.goal];
}

getActivityLabel(): string {
  const labels = {
    sedentary: 'Siedzący (brak ćwiczeń)',
    light: 'Lekka (1-3 ćwiczenia/tydzień)',
    moderate: 'Umiarkowana (3-5 ćwiczeń/tydzień)',
    active: 'Aktywna (codzienne ćwiczenia)',
    veryActive: 'Bardzo aktywna (2x dziennie)'
  };
  return labels[this.form.activityLevel];
}
}