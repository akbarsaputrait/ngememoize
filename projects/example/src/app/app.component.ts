import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgememoizeService } from 'ngememoize';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'example';
  lib = inject(NgememoizeService);
}
