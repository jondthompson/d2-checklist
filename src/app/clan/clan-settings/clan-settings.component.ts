import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ChildComponent } from '@app/shared/child.component';
import { StorageService } from '@app/service/storage.service';
import { ClanStateService } from '../clan-state.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { BungieGroupMember } from '@app/service/model';
import { ClanUserListDialogComponent } from './clan-user-list-dialog/clan-user-list-dialog.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'd2c-clan-settings',
  templateUrl: './clan-settings.component.html',
  styleUrls: ['./clan-settings.component.scss']
})
export class ClanSettingsComponent extends ChildComponent implements OnInit {

  constructor(storageService: StorageService,
    public state: ClanStateService,
    public dialog: MatDialog) {
    super(storageService);
  }

  ngOnInit() {
  }

  openUserDialog(title: string, desc: string, users: BungieGroupMember[]) {
    const dc = new MatDialogConfig();
    dc.disableClose = false;
    dc.autoFocus = true;
    dc.data = {
      title,
      desc,
      users
    };
    this.dialog.open(ClanUserListDialogComponent, dc);
  }

}
