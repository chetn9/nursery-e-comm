// import { Component, inject, ViewChild } from '@angular/core';
// import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
// import {MatSort, MatSortModule} from '@angular/material/sort';
// import {MatTableDataSource, MatTableModule} from '@angular/material/table';
// import {MatInputModule} from '@angular/material/input';
// import {MatFormFieldModule} from '@angular/material/form-field';
// import { CategoryService} from '../../../services/categoryService';
// import { MatButtonModule } from '@angular/material/button';
// import { RouterLink } from '@angular/router';
// import { Category } from '../../../types/category';
// import { MatIcon } from '@angular/material/icon';


// @Component({
//   selector: 'app-categories',
//   imports: [MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, MatButtonModule, RouterLink,MatIcon],
//   templateUrl: './categories.html',
//   styleUrl: './categories.scss'
// })
// export class Categories {
//      displayedColumns: string[] = ['id', 'name', 'action'];
//       dataSource: MatTableDataSource<Category>;

//       @ViewChild(MatPaginator) paginator!: MatPaginator;
//       @ViewChild(MatSort) sort!: MatSort;

//       categoryService=inject(CategoryService)

//       constructor() {
       
//         this.dataSource = new MatTableDataSource([] as any);
//       }

//       ngOnInit() {
//          this.getServerData();
//       }

//   private getServerData() {
//     this.categoryService.getCategories().subscribe((result) => {
//       console.log(result);
//       this.dataSource.data = result;
//     });
//   }

//       ngAfterViewInit() {
//         this.dataSource.paginator = this.paginator;
//         this.dataSource.sort = this.sort;
//       }

//       applyFilter(event: Event) {
//         const filterValue = (event.target as HTMLInputElement).value;
//         this.dataSource.filter = filterValue.trim().toLowerCase();

//         if (this.dataSource.paginator) {
//           this.dataSource.paginator.firstPage();
//         }
//       }

//       delete(id:string){
//         console.log(id)
//         this.categoryService.deleteCategoryById(id).subscribe((result:any)=>{
//           alert("Category Deleted");
//           this.getServerData();
//         })
//       }
// }



import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../../services/categoryService';
import { Router, RouterLink } from '@angular/router';
import { Category } from '../../../types/category';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './categories.html',
  styleUrls: ['./categories.scss'],
})
export class Categories implements OnInit, OnDestroy {
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  searchText: string = '';
  isLoading = true;
  error: string | null = null;

  private categoryService = inject(CategoryService);
  public router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  ngOnInit() {
    console.log('Categories ngOnInit called');
    console.log('CategoryService exists:', !!this.categoryService);
    
    setTimeout(() => {
      this.getCategories();
    }, 0);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getCategories() {
    console.log('Loading categories...');
    this.isLoading = true;
    this.error = null;

    this.categoryService.getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          console.log('✅ Categories received:', result);
          console.log('Number of categories:', result?.length);

          this.categories = Array.isArray(result) ? result : [];
          this.filteredCategories = [...this.categories];
          
          console.log('Categories assigned:', this.categories.length);
          console.log('Filtered categories:', this.filteredCategories.length);

          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('❌ Error loading categories:', error);
          console.error('Error details:', {
            message: error.message,
            status: error.status,
            statusText: error.statusText,
            url: error.url,
            error: error.error
          });

          this.error = 'Failed to load categories. Please try again.';
          this.isLoading = false;
          this.categories = [];
          this.filteredCategories = [];
          this.cdr.detectChanges();
        },
        complete: () => {
          console.log('Categories loading completed');
        }
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.searchText = filterValue;
    
    console.log('Filtering categories with:', filterValue);
    
    this.filteredCategories = this.categories.filter((cat) =>
      cat.name.toLowerCase().includes(filterValue)
    );
    
    console.log('Filtered results:', this.filteredCategories.length);
    this.cdr.detectChanges();
  }

  delete(id: string) {
    if (confirm('Are you sure you want to delete this category?')) {
      console.log('Deleting category:', id);

      this.categoryService.deleteCategoryById(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            console.log('✅ Category deleted successfully:', response);
            alert('Category Deleted Successfully');
            this.getCategories();
          },
          error: (error) => {
            console.error('❌ Error deleting category:', error);
            alert('Failed to delete category. Please try again.');
          }
        });
    }
  }

  navigateToAdd() {
    this.router.navigate(['/admin/categories/add']);
  }

  navigateToEdit(id: string) {
    this.router.navigate(['/admin/categories', id]);
  }

  retryLoading() {
    this.getCategories();
  }
}

