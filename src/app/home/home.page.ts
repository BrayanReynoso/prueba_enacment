import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonItem, IonLabel, IonInput, IonList, IonBadge, IonListHeader, IonNote, LoadingController } from '@ionic/angular/standalone';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonBadge, IonButton, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, FormsModule, IonList, IonBadge, IonListHeader, IonNote, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomePage {

  userInput: number = 0; // Número ingresado por el usuario
  multiplesList: { value: number; color: string }[] = []; // Números y colores
  paginatedList: { value: number, color: string }[] = []; // Lista paginada

  pageSize = 20;
  currentPage = 1;
  totalPages = 1;

  constructor(private firestore: Firestore, private loadingController: LoadingController) {}

  isInteger(value: number): boolean {
    return Number.isInteger(value);
  }

  async generateNumbersAndMultiples() {
    if (this.userInput < 0) return;

    const loading = await this.loadingController.create({
      message: 'Calculando múltiplos...',
    });
    
    await loading.present();

    this.multiplesList = [];
    for (let i = 0; i <= this.userInput; i++) {
      let color = 'black';
      if (i % 3 === 0) color = 'green';
      if (i % 5 === 0 && color !== 'green') color = 'red';
      if (i % 7 === 0 && color !== 'green' && color !== 'red') color = 'blue';

      this.multiplesList.push({ value: i, color });
    }

    this.totalPages = Math.ceil(this.multiplesList.length / this.pageSize);
    this.updatePaginatedList();
    await loading.dismiss();
    this.saveToDatabase();
  }

  async saveToDatabase() {
    try {
      const docRef = await addDoc(collection(this.firestore, 'multiples'), {
        value: this.userInput,
        multiples: this.multiplesList
      });
      console.log(`Documento escrito con ID: ${docRef.id}`);
    } catch (error) {
      console.log(`Error al agregar documento: ${error}`);
    }
  }

  updatePaginatedList() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedList = this.multiplesList.slice(start, end);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePaginatedList();
  }

  clearData() {
    this.userInput = 0;
    this.multiplesList = [];
    this.paginatedList = [];
    this.currentPage = 1;
    this.totalPages = 1;
  }
}
