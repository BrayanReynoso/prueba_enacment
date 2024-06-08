import { Component, CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
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

  userInput: number = 0; // Parámetro numérico ingresado por el usuario
  multiplesList: { value: number; color: string }[] = []; // Lista de números y colores
  paginatedList: { value: number, color: string }[] = []; // Lista paginada de números y colores

  pageSize = 20;
  currentPage = 1;
  totalPages = 1;

  constructor(private firestore: Firestore,private loadingController: LoadingController) {}

  isInteger(value: number): boolean {
    return Number.isInteger(value);
  }
  /**
   * Genera los números entre 0 y el número ingresado por el usuario,
   * encuentra sus múltiplos de 3, 5 y 7, y los despliega en pantalla
   * con los colores correspondientes.
   */
  async generateNumbersAndMultiples() {
    // Comprueba si el número ingresado es negativo
    if (this.userInput < 0) {
      return; // Detiene la ejecución de la función
    }
    const loading = await this.loadingController.create({
      message: 'Calculando múltiplos...',
    });
    await loading.present();
    // Reinicia la lista de números y colores
    this.multiplesList = [];
    // Genera los números entre 0 y el número ingresado por el usuario
    for (let i = 0; i <= this.userInput; i++) {
      let color = 'black'; // Por defecto, el color es negro
      // Encuentra los múltiplos del 3, 5 y 7 y asigna el color correspondiente
      if (i % 3 === 0) {
        color = 'green'; // Múltiplos del 3 en verde
      }
      if (i % 5 === 0 && color !== 'green') { 
        color = 'red'; // Múltiplos del 5 en rojo
      }
      if (i % 7 === 0 && color !== 'green' && color !== 'red') { // Si ya es verde o rojo, no cambia el color
        color = 'blue'; // Múltiplos del 7 en azul
      }

      // Agrega el número a la lista con su color correspondiente
      this.multiplesList.push({ value: i, color: color });
    }

    // Calcula el total de páginas para la paginación
    this.totalPages = Math.ceil(this.multiplesList.length / this.pageSize);

    // Actualiza la lista paginada
    this.updatePaginatedList();
    await loading.dismiss();
    this.saveToDatabase();
  }
  /**
   * Guarda los números y colores en la base de datos Firestore.
   */
  async saveToDatabase() {
    try {
      // Agrega un documento a la colección 'multiples' con los números y colores
      const docRef = await addDoc(collection(this.firestore, 'multiples'), {
        value: this.userInput,
        multiples: this.multiplesList
      });
      // Muestra el ID del documento en la consola si se agregó correctamente
      console.log(`Document written with ID: ${docRef.id}`);
    } catch (error) {
      // Muestra un error si no se pudo agregar el documento
      console.log(`Error adding document: ${error}`);
    }
  }

  /**
   * Actualiza la lista paginada de números y colores
   * utilizando la página actual y el tamaño de página.
   */
  updatePaginatedList() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedList = this.multiplesList.slice(start, end);
  }

  /**
   * Cambia a la página especificada y actualiza la lista paginada.
   * @param page Número de página al que se desea ir.
   */
  goToPage(page: number) {
    // Verifica si la página especificada está dentro de los límites válidos
    if (page < 1 || page > this.totalPages) {
      return;
    }
    // Actualiza la página actual y la lista paginada
    this.currentPage = page;
    this.updatePaginatedList();
  }

  clearData() {
    // Reinicia el parámetro de entrada del usuario y las listas de resultados
    this.userInput = 0;
    this.multiplesList = [];
    this.paginatedList = [];
    // Reinicia la paginación
    this.currentPage = 1;
    this.totalPages = 1;
  }

}
