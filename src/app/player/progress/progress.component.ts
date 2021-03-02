import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Progression } from '@app/service/model';
import { StorageService } from '@app/service/storage.service';
import { ChildComponent } from '@app/shared/child.component';
import { PlayerStateService } from '../player-state.service';
import { ProgressStepDialogComponent } from './progress-step-dialog/progress-step-dialog.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'd2c-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.scss']
})
export class ProgressComponent extends ChildComponent implements OnInit {
  constructor(
    storageService: StorageService,
    public state: PlayerStateService,
    public dialog: MatDialog) {
      super(storageService);
    }

  ngOnInit() {
  }

  public openStepDialog(faction: Progression): void {
    const dc = new MatDialogConfig();
    dc.disableClose = false;
    dc.autoFocus = true;
    dc.data = faction;
    dc.maxWidth = '500px';
    this.dialog.open(ProgressStepDialogComponent, dc);
  }


}
