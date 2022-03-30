import { Component, VERSION, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';
import { DataTableDirective } from 'angular-datatables';

class Person {
  id: number;
  firstName: string;
  lastName: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  version = 'Angular: v' + VERSION.full;
  dtOptions: DataTables.Settings = {};
  persons: Person[];
  dtTrigger: Subject = new Subject();

  @ViewChild(DataTableDirective)
  datatableElement: DataTableDirective;

  constructor(private http: Http) {}

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
    };
    this.http
      .get(
        'https://raw.githubusercontent.com/l-lin/angular-datatables/master/demo/src/data/data.json'
      )
      .map(this.extractData)
      .subscribe((persons) => {
        this.persons = persons;
        // Calling the DT trigger to manually render the table
        this.dtTrigger.next();
      });
  }

  ngAfterViewInit(): void {
    this.dtTrigger.subscribe(() => {
      this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.columns().every(function () {
          const that = this;
          console.log(this);
          $('input', this.footer()).on('keyup change', function () {
            if (that.search() !== this['value']) {
              that.search(this['value']).draw();
            }
          });
        });
      });
    });
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  private extractData(res: Response) {
    const body = res.json();
    return body.data || {};
  }
}
