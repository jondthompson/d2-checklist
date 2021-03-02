import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { IconService } from '@app/service/icon.service';
import { TriumphRecordNode } from '@app/service/model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'd2c-triumph-objectives',
  templateUrl: './triumph-objectives.component.html',
  styleUrls: ['./triumph-objectives.component.scss']
})
export class TriumphObjectivesComponent implements OnInit {
  @Input() triumph: TriumphRecordNode;
  @Input() hideDesc = false;

  constructor(public iconService: IconService) { }

  ngOnInit() {
  }

}
