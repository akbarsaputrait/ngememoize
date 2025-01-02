import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Ngememoize, NgememoizeService } from 'ngememoize';

interface Product {
  basePrice: number;
  quantity: number;
  discountCode?: string;
  shipping?: string;
}

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss',
})
export class ProductComponent {
  product: Product = {
    basePrice: 0,
    quantity: 1,
    discountCode: '',
    shipping: 'standard',
  };

  subtotal: number = 0;
  discount: number = 0;
  shippingCost: number = 0;
  total: number = 0;

  memoizeService = inject(NgememoizeService);

  calculateTotal() {
    console.log('\n🧮 Starting price calculation...');
    const startTime = performance.now();

    this.subtotal = this.calculateSubtotal(
      this.product.basePrice,
      this.product.quantity,
    );
    this.discount = this.calculateDiscount(
      this.subtotal,
      this.product.discountCode ?? '',
      this.product.quantity,
    );
    this.shippingCost = this.calculateShipping(
      this.product.shipping ?? '',
      this.subtotal,
    );
    this.total = this.subtotal - this.discount + this.shippingCost;

    const endTime = performance.now();
    console.log(
      `⏱️ Total calculation time: ${(endTime - startTime).toFixed(2)}ms`,
    );

    console.log('Ngememoize Caches:', this.memoizeService.getAllCache());
  }

  @Ngememoize({
    // maxAge: 30000, // Cache for 30 seconds
    // debugLabel: 'subtotal',
    onCacheHit: (key) =>
      console.log(`🎯 Cache HIT: Subtotal calculation for ${key as string}`),
    onCacheMiss: (key) =>
      console.log(`📝 Cache MISS: Computing new subtotal for ${key as string}`),
  })
  calculateSubtotal(price: number, quantity: number): number {
    console.log(
      `💰 Computing subtotal for price: $${price} × ${quantity} items`,
    );
    // Simulate complex calculation
    return Number((price * quantity).toFixed(2));
  }

  @Ngememoize({
    // maxAge: 30000,
    // debugLabel: 'discount',
    onCacheHit: (key) =>
      console.log(`🎯 Cache HIT: Discount calculation for ${key as string}`),
    onCacheMiss: (key) =>
      console.log(`📝 Cache MISS: Computing new discount for ${key as string}`),
  })
  calculateDiscount(subtotal: number, code: string, quantity: number): number {
    console.log(
      `🏷️ Computing discount for subtotal: $${subtotal}, code: ${code}, quantity: ${quantity}`,
    );

    if (!code) return 0;

    switch (code) {
      case 'SAVE10':
        return Number((subtotal * 0.1).toFixed(2));
      case 'SAVE20':
        return Number((subtotal * 0.2).toFixed(2));
      case 'BULK15':
        return quantity >= 5 ? Number((subtotal * 0.15).toFixed(2)) : 0;
      default:
        return 0;
    }
  }

  @Ngememoize({
    // maxAge: 30000,
    // debugLabel: 'shipping',
    onCacheHit: (key) =>
      console.log(`🎯 Cache HIT: Shipping calculation for ${key as string}`),
    onCacheMiss: (key) =>
      console.log(`📝 Cache MISS: Computing new shipping for ${key as string}`),
  })
  calculateShipping(method: string, subtotal: number): number {
    console.log(
      `📦 Computing shipping for method: ${method}, subtotal: $${subtotal}`,
    );

    switch (method) {
      case 'express':
        return subtotal > 100 ? 10 : 15;
      case 'overnight':
        return subtotal > 150 ? 20 : 25;
      default:
        return 0;
    }
  }
}
