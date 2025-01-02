import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductComponent } from './product/product.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, ProductComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {}
