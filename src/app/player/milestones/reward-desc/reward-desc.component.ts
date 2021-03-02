import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { BoostInfo, Const } from '@app/service/model';
import { IconService } from '@app/service/icon.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'd2c-reward-desc',
  templateUrl: './reward-desc.component.html',
  styleUrls: ['./reward-desc.component.scss']
})
export class RewardDescComponent implements OnInit {
  public Const = Const;

  @Input() maxPl: number;
  @Input() boost: BoostInfo;
  @Input() rewards: string;
  @Input() sort: string;


  @Output() sortClick = new EventEmitter<void>();

  constructor(public iconService: IconService) { }

  ngOnInit() {
    Const.BOOST_PINNACLE
  }

}
