import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

import * as Hammer from 'hammerjs';


@Component({
    moduleId: module.id,
    selector: 'my-app',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
    orderArr: Array<number> = [-1, 0, 1];
    tableList: Array<HTMLDivElement> = [];
    tableWidth: number;
    @ViewChild("table01") table01: ElementRef;
    @ViewChild("table02") table02: ElementRef;
    @ViewChild("table03") table03: ElementRef;

    ngOnInit(){}

    ngAfterViewInit() {
        this.tableList.push(<HTMLDivElement>this.table01.nativeElement);
        this.tableList.push(<HTMLDivElement>this.table02.nativeElement);
        this.tableList.push(<HTMLDivElement>this.table03.nativeElement);
        this.tableWidth = this.tableList[0].offsetWidth;
        this.setTablesStyle();
    }

    setTablesStyle(deltaX: number = 0){
        this.tableList.forEach((table, index)=>{
            let posX: number = this.orderArr[index] * this.tableWidth + deltaX;
            table.setAttribute('style', `transform: translate3d(${posX}px, 0, 0)`);
        });
    }

    handlePan(e: HammerInput){
        if(e.type === 'pan'){
            this.setTablesStyle(e.deltaX);
        }else if(e.type === 'panend'){
            if(e.distance > this.tableWidth / 2 || e.velocity > 0.3){
                this.switchTable(e.deltaX > 0? 'right' : 'left');
            }
            this.setTablesStyle();
        }
    }

    switchTable(direction: 'right' | 'left'){
        if(direction === 'right'){
            let tmp: HTMLDivElement = this.tableList.pop();
	        this.tableList.unshift(tmp);
        } else if(direction === 'left') {
            let tmp: HTMLDivElement = this.tableList.shift();
	        this.tableList.push(tmp);
        }
    }
}
