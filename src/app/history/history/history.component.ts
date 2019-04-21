
import { takeUntil } from 'rxjs/operators';
import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { BungieService } from '../../service/bungie.service';
import { Player, ActivityMode, Const } from '../../service/model';
import { SortFilterDatabase, SortFilterDataSource } from '../../shared/sort-filter-data';
import { MatPaginator, MatSort } from '@angular/material';
import { ChildComponent } from '../../shared/child.component';
import { StorageService } from '../../service/storage.service';

@Component({
  selector: 'anms-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistoryComponent extends ChildComponent implements OnInit, OnDestroy {

  readonly activityModes: ActivityMode[];
  maxResults: number[];
  selectedMaxResults: number;
  selectedMode: ActivityMode;

  membershipType: number;
  membershipId: string;
  characterId: string;
  player: Player;

  database = new SortFilterDatabase([]);
  dataSource: SortFilterDataSource | null;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumns = ['period', 'mode', 'name', 'kd', 'timePlayedSeconds'];

  constructor(storageService: StorageService, private bungieService: BungieService,
    private route: ActivatedRoute, private router: Router,
    private ref: ChangeDetectorRef) {
    super(storageService, ref);
    this.activityModes = bungieService.getActivityModes();
    this.selectedMode = this.activityModes[0];
    this.maxResults = [100, 200, 500, 1000, 2000];
    this.selectedMaxResults = this.maxResults[0];
  }

  public async history() {
    this.loading.next(true);
    try {
      const rows = await this.bungieService.getActivityHistory(this.membershipType, this.membershipId, this.characterId,
        this.selectedMode.type, this.selectedMaxResults);
      this.paginator.firstPage();
      this.database.setData(rows);
    }
    finally {
      this.loading.next(false);
    }
  }

  pgcr(instanceId: string) {

    this.router.navigate(['/pgcr', instanceId]);
  }

  ngOnInit() {
    this.dataSource = new SortFilterDataSource(this.database, this.paginator, this.sort);

    this.route.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
      const platform: string = params['platform'];

      this.database.setData([]);
      if (platform == null) { return; }

      const selPlatform = Const.PLATFORMS_DICT[platform];

      if (selPlatform != null) {
        this.membershipType = selPlatform.type;
        this.membershipId = params['memberId'];
        this.bungieService.getChars(this.membershipType, this.membershipId, ['Profiles', 'Characters'], false).then(p => {
          this.player = p;

        });
        this.characterId = params['characterId'];
        this.history();
      }

    });
  }

}
