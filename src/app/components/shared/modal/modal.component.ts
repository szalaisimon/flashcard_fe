import {Component, Input, output} from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent {
  @Input() title = '';
  @Input() busy = false;
  @Input() confirmLabel = 'Save';
  closeEvent = output<void>();
  submitEvent = output<void>();

  closeModal(): void {
    if (!this.busy) this.closeEvent.emit();
  }

  submitModal(): void {
    if (!this.busy) this.submitEvent.emit();
  }
}
