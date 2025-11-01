import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Order } from '../../types/order';
import { OrderService } from '../../services/orderService';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-customer-orders',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  templateUrl: './customer-orders.html',
  styleUrl: './customer-orders.scss'
})
export class CustomerOrders implements OnInit, OnDestroy {
  orders: Order[] = [];
  subtotal = 0;
  discount = 0;
  total = 0;
  isLoading = true;
  error: string | null = null;

  private orderService = inject(OrderService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  ngOnInit() {
    console.log('CustomerOrders ngOnInit');
    
    setTimeout(() => {
      this.loadOrders();
    }, 100);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOrders() {
    console.log('Loading customer orders...');
    this.isLoading = true;
    this.error = null;

    this.orderService.getCustomerOrders()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          console.log('✅ Orders received:', result);
          console.log('Number of orders:', result?.length);

          this.orders = Array.isArray(result) ? result : [];
          console.log('Orders assigned:', this.orders.length);

          if (this.orders.length > 0) {
            console.log('Sample order:', this.orders[0]);
            console.log('Sample items:', this.orders[0].items);
            this.calculateTotals();
          }

          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('❌ Error loading orders:', error);
          console.error('Error details:', {
            message: error.message,
            status: error.status,
            statusText: error.statusText,
            url: error.url,
            error: error.error
          });

          if (error.status === 401) {
            this.error = 'Please login to view your orders';
          } else if (error.status === 0) {
            this.error = 'Cannot connect to server. Please check your connection.';
          } else {
            this.error = 'Failed to load your orders. Please try again.';
          }

          this.isLoading = false;
          this.orders = [];
          this.cdr.detectChanges();
        },
        complete: () => {
          console.log('Orders loading completed');
        }
      });
  }

  calculateTotals() {
    console.log('Calculating totals...');
    
    // Reset totals
    this.subtotal = 0;
    this.discount = 0;
    this.total = 0;

    // Calculate from all orders
    this.orders.forEach(order => {
      console.log('Processing order:', order._id);
      
      // Add order's total amount
      this.total += order.totalAmount || 0;
      
      // Calculate subtotal and discount from items if product data is available
      if (order.items && order.items.length > 0) {
        order.items.forEach((item: any) => {
          console.log('Processing item:', item);
          
          // ✅ Check if item.product exists (it should based on your API response)
          if (item.product) {
            const itemPrice = item.product.price || 0;
            const itemDiscount = item.product.discount || 0;
            const quantity = item.quantity || 0;
            
            this.subtotal += itemPrice * quantity;
            this.discount += itemDiscount * quantity;
            
            console.log(`Item: ${item.product.name}, Price: ${itemPrice}, Qty: ${quantity}, Discount: ${itemDiscount}`);
          } else {
            console.warn('Item missing product data:', item);
          }
        });
      }
    });

    console.log('Final totals:', {
      subtotal: this.subtotal,
      discount: this.discount,
      total: this.total
    });
  }

  trackByOrderId(index: number, order: Order) {
    return order._id || index;
  }

  trackByItemId(index: number, item: any) {
    return item._id || item.product?._id || index;
  }

  handleImageError(event: any) {
    console.log('Image failed to load');
    // Hide the broken image
    event.target.style.display = 'none';
  }

  retryLoading() {
    this.loadOrders();
  }
}