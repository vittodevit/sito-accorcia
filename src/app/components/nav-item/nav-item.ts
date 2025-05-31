import {Component, Input} from '@angular/core';
import {LucideAngularModule, LucideIconData, HomeIcon} from 'lucide-angular';

@Component({
  selector: 'app-nav-item',
  imports: [
    LucideAngularModule
  ],
  templateUrl: './nav-item.html'
})
export class NavItem {
  @Input() icon: LucideIconData = HomeIcon;
  @Input() text: string = '';
  @Input() link: string = '';
  @Input() active: boolean = false;
}
