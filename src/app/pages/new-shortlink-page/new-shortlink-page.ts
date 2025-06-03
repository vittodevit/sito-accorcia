import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputField } from '../../components/input-field/input-field';
import { BombIcon, Link2Icon, LinkIcon } from 'lucide-angular';
import { UrlService } from '../../services/url.service';
import { NotificationService } from '../../services/notification.service';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
//import {RiveForm} from '../../components/rive-form/rive-form';

@Component({
  selector: 'app-new-shortlink',
  imports: [
    FormsModule,
    InputField,
    ReactiveFormsModule,
    //RiveForm
  ],
  templateUrl: './new-shortlink-page.html'
})
export class NewShortlinkPage {

  protected readonly LinkIcon = LinkIcon;
  protected readonly Link2Icon = Link2Icon;
  protected readonly BombIcon = BombIcon;

  longLink: string = '';
  shortLink: string = '';
  expirationDate: string = '';

  constructor(
    private router: Router,
    private urlService: UrlService,
    private notificationService: NotificationService
  ) {}

  onSubmit() {

    if(!this.longLink) {
      this.notificationService.notify('Il campo "Link lungo" è obbligatorio.');
      return;
    }

    // Chiamata al servizio per creare il nuovo shortlink
    this.urlService.createUrl({
      originalUrl: this.longLink,
      shortCode: this.shortLink || undefined,
      expirationDate: this.expirationDate + "T00:00:00" || undefined
    }).subscribe({
      next: (response) => {
        this.notificationService.notify('Shortlink creato con successo!');
        this.urlService.refreshUrls();
        this.router.navigate(['/sc', response.shortCode]);
      },
      error: (error) => {
        this.notificationService.notify(`Errore nella creazione dello shortlink: ${error}`);
      }
    });
  }

  protected readonly environment = environment;
}
