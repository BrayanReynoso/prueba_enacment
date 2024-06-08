import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { AngularFireModule} from '@angular/fire/compat'
@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp({...environment.firebaseConfig})
  ],
  providers: [],
})
export class AppModule { }
