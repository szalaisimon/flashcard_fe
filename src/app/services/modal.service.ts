import {
  ApplicationRef,
  ComponentFactoryResolver,
  DOCUMENT,
  Inject,
  Injectable,
  Injector,
  TemplateRef
} from '@angular/core';
import {ModalComponent} from '../components/shared/modal/modal.component';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ModalService {

  private modalNotifier?: Subject<string>;

  constructor(
    private resolver: ComponentFactoryResolver,
    private injector: Injector,
    private appRef: ApplicationRef,
    @Inject(DOCUMENT) private document: Document
  ) {
  }

  open(content: TemplateRef<any>, context?: any, options?: { title?: string }) {

    const contentViewRef = content.createEmbeddedView(context);

    this.appRef.attachView(contentViewRef);

    const modalFactory = this.resolver.resolveComponentFactory(ModalComponent);
    const modalComponent = modalFactory.create(
      this.injector,
      [contentViewRef.rootNodes]
    );

    modalComponent.instance.title = options?.title ?? 'Modal Title';

    modalComponent.instance.closeEvent.subscribe(() => this.closeModal());
    modalComponent.instance.submitEvent.subscribe(() => this.submitModal());

    this.appRef.attachView(modalComponent.hostView);
    this.document.body.appendChild(modalComponent.location.nativeElement);

    this.modalNotifier = new Subject();
    return this.modalNotifier.asObservable();
  }


  closeModal() {
    this.modalNotifier?.complete();
  }

  submitModal() {
    this.modalNotifier?.next('confirm');
    this.closeModal();
  }
}
