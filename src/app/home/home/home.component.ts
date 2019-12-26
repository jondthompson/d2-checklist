
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { Router } from '@angular/router';
import { BungieService } from '@app/service/bungie.service';
import { DestinyCacheService } from '@app/service/destiny-cache.service';
import { IconService } from '@app/service/icon.service';
import { Today, WeekService } from '@app/service/week.service';
import { environment as env } from '@env/environment';
import { BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BountySet, Character, Const, MilestoneActivity, Platform, Player, SelectedUser, UserInfo } from '../../service/model';
import { StorageService } from '../../service/storage.service';
import { ChildComponent } from '../../shared/child.component';
import { BountySetsDialogComponent } from './bounty-sets-dialog/bounty-sets-dialog.component';
import { BurnDialogComponent } from './burn-dialog/burn-dialog.component';
import { ParseService } from '@app/service/parse.service';
import { AuthService } from '@app/service/auth.service';

@Component({
  selector: 'd2c-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent extends ChildComponent implements OnInit, OnDestroy {
  readonly BOUNTY_CUTOFF = 4;
  readonly isSignedOn: BehaviorSubject<boolean> = new BehaviorSubject(false);
  readonly showAllVendorBounties: BehaviorSubject<boolean> = new BehaviorSubject(false);
  readonly showAllPlayerBounties: BehaviorSubject<boolean> = new BehaviorSubject(false);

  readonly playerLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);
  readonly player: BehaviorSubject<Player> = new BehaviorSubject(null);
  readonly char: BehaviorSubject<Character> = new BehaviorSubject(null);
  currentChar: Character = null;

  readonly vendorBountiesLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);
  readonly playerBountiesLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);
  readonly playerBountySets: BehaviorSubject<BountySet[]> = new BehaviorSubject([]);
  readonly vendorBountySets: BehaviorSubject<BountySet[]> = new BehaviorSubject([]);

  readonly version = env.versions.app;
  manifestVersion = '';
  readonly platforms: Platform[] = Const.PLATFORMS_ARRAY;

  selectedPlatform: Platform;
  gamerTag: string;
  showMoreInfo = false;
  today: Today = null;

  constructor(
    private destinyCacheService: DestinyCacheService,
    public bungieService: BungieService,
    private authService: AuthService,
    private parseService: ParseService,
    public iconService: IconService,
    public dialog: MatDialog,
    storageService: StorageService,
    private weekService: WeekService,
    private router: Router,
    private ref: ChangeDetectorRef) {
    super(storageService);
    this.selectedPlatform = this.platforms[0];
    if (this.destinyCacheService.cache != null) {
      this.manifestVersion = this.destinyCacheService.cache.version;
    }

    this.storageService.settingFeed.pipe(
      takeUntil(this.unsubscribe$))
      .subscribe(
        x => {
          if (x.defaultplatform != null) {
            this.setPlatform(x.defaultplatform);

            this.ref.markForCheck();
          }
          if (x.defaultgt != null) {
            this.gamerTag = x.defaultgt;

            this.ref.markForCheck();
          }
        });

  }

  private setPlatform(type: number) {
    // already set
    if (this.selectedPlatform != null && this.selectedPlatform.type === type) { return; }
    this.selectedPlatform = Const.PLATFORMS_DICT['' + type];
  }

  public routeSearch(): void {
    if (this.selectedPlatform == null) {
      return;
    }
    if (this.gamerTag == null || this.gamerTag.trim().length < 1) {
      return;
    }

    this.router.navigate(['gt', this.selectedPlatform.type, this.gamerTag]);
  }

  onPlatformChange() {
    this.storageService.setItem('defaultplatform', this.selectedPlatform.type);
  }

  onGtChange() {
    this.storageService.setItem('defaultgt', this.gamerTag);
  }

  showBurns(msa: MilestoneActivity) {
    const dc = new MatDialogConfig();
    dc.disableClose = false;
    dc.data = msa;
    this.dialog.open(BurnDialogComponent, dc);
  }

  logon() {
    this.authService.getCurrentMemberId(true);
  }


  showBountySet(bs: BountySet) {
    const dc = new MatDialogConfig();
    dc.disableClose = false;
    dc.data = bs;
    dc.width = '80%';
    this.dialog.open(BountySetsDialogComponent, dc);
  }

  async loadMileStones() {
    try {
      this.today = await this.weekService.getToday();
      this.ref.markForCheck();
    }
    finally {
      this.loading.next(false);
    }
  }

  async loadPlayerForBounties(selectedUser: SelectedUser) {
    if (!selectedUser) {
      return;
    }
    try {
      this.playerLoading.next(true);
      const player = await this.bungieService.getChars(selectedUser.userInfo.membershipType, selectedUser.userInfo.membershipId,
        ['Profiles', 'Characters', 'CharacterInventories', 'ItemObjectives', 'PresentationNodes', 'Records', 'Collectibles', 'ItemSockets', 'ItemPlugObjectives']);
      if (!player || !player.characters || player.characters.length == 0) {
        return;
      }
      this.player.next(player);
    }
    finally {
      this.playerLoading.next(false);
    }
  }

  async loadVendorBountySets(char: Character) {
    try {
      this.vendorBountiesLoading.next(true);
      let bounties = await this.bungieService.groupVendorBounties(char);
      bounties = bounties.filter(bs => bs.bounties.length > 1);
      this.vendorBountySets.next(bounties);
    }
    finally {
      this.vendorBountiesLoading.next(false);
    }
  }

  async loadPlayerBountySets(char: Character) {
    try {
      this.playerBountiesLoading.next(true);
      let bounties = this.parseService.groupCharBounties(this.player.getValue(), char);
      bounties = bounties.filter(bs => bs.bounties.length > 1);
      this.playerBountySets.next(bounties);
    }
    finally {
      this.playerBountiesLoading.next(false);
    }
  }


  ngOnInit() {

    this.loading.next(true);
    this.loadMileStones();

    // selected user changed
    this.bungieService.selectedUserFeed.pipe(takeUntil(this.unsubscribe$)).subscribe((selectedUser: SelectedUser) => {
      this.player.next(null);
      this.isSignedOn.next(selectedUser != null);
      this.loadPlayerForBounties(selectedUser);
    });
    this.player.pipe(takeUntil(this.unsubscribe$)).pipe(takeUntil(this.unsubscribe$)).subscribe((player: Player) => {
      this.vendorBountySets.next([]);
      this.playerBountySets.next([]);
      if (!player || !player.characters || player.characters.length == 0) {
        this.char.next(null);
        return;
      }
      this.char.next(player.characters[0]);
    });
    this.char.pipe(takeUntil(this.unsubscribe$)).pipe(takeUntil(this.unsubscribe$)).subscribe((char: Character) => {
      this.currentChar = char;
      if (char) {
        console.log(char.label);
      }
      this.vendorBountySets.next([]);
      this.playerBountySets.next([]);
      if (!char) {
        return;
      }

      this.loadVendorBountySets(char);
      this.loadPlayerBountySets(char);

    });


  }
}
