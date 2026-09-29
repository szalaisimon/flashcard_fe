import {Component, input, output} from '@angular/core';


@Component({
  selector: 'app-pagination',
  standalone: true,
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css',
})
export class PaginationComponent {
  readonly disabled = input(false);
  readonly currentPage = input<number>(0);
  readonly totalPages = input<number>(1);
  readonly totalItems = input<number>(0);
  readonly limit = input<number>(4);

  readonly pageChange = output<number>();
  readonly limitChange = output<number>();

  public firstPage(): void {
    if (this.currentPage() > 0) this.pageChange.emit(0);
  }

  public previousPage(): void {
    if (this.currentPage() > 0) this.pageChange.emit(this.currentPage() - 1);
  }

  public nextPage(): void {
    if (this.currentPage() < this.totalPages() - 1) {
      this.pageChange.emit(this.currentPage() + 1);
    }
  }

  public lastPage(): void {
    if (this.currentPage() < this.totalPages() - 1) {
      this.pageChange.emit(this.totalPages() - 1);
    }
  }

  public onLimitChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newLimit = parseInt(target.value, 10);
    this.limitChange.emit(newLimit);
  }
}

