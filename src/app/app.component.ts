import { Component } from '@angular/core';
import {concatMap, delay, from, min, of} from "rxjs";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'SortingAlgorithms';

  screen_width = (Number(window.innerWidth) - 250) * 0.8;
  screen_height = Number(window.innerHeight) - 100;

  min_column_width = 7;
  max_column_width = 30;
  max_length = Math.floor(this.screen_width / (this.min_column_width + 1));
  min_length = Math.floor(this.screen_width / (this.max_column_width + 1));
  length = Math.floor((this.max_length - this.min_length) / 2) + this.min_length;
  column_width = Math.floor(this.screen_width - this.length) / this.length;

  list = this.createList();
  algorithm = 0;
  list_algorithms = this.save_algorithms();
  cheatsheet: any = {"insertion": 0, "selection": 1, "merge": 2, "bubble": 3, "cocktail": 4, "radix": 5}

  green1 = -1;
  green2 = -1;
  red1 = -1;
  red2 = -1;

  speeds: any = {1: 1000, 2: 500, 3: 250, 4: 100, 5: 50, 6: 25, 7: 10, 8: 5, 9: 1};
  speed = 4;
  stop_sort = false;
  started = false;

  async start_sort() {
    if (!this.started) {
      this.started = true;
      this.stop_sort = false;
      let start = this.list_algorithms[this.algorithm];
      await start();
      await this.done();
    }
  }

  reset() {
    this.stop_sort = true;
    this.list = this.createList();
    this.green1 = -1;
    this.red1 = -1;
    this.red2 = -1;
    this.started = false;
  }

  createList() {
    let list: number[] = [];
    for (let i = 0; i < this.length; i++) {
      list.push(Math.floor(Math.random() * ((this.screen_height * 0.8) - 10 + 1)) + 10);
    }
    return list;
  }

  sleep(ms: number) {
    return new Promise<void>(res => {
      setTimeout(() => res(), ms)
    });
  }

  getSliderValue(event: any) {
    this.speed = event.target.value;
  }

  changeSize(event: any) {
    this.length = Number(event.target.value);
    this.column_width = Math.floor(this.screen_width - this.length) / this.length;
    this.reset();
  }

  changeAlgorithm(event: any) {
    let algo: string = event.target.value;
    this.algorithm = this.cheatsheet[algo];
    this.reset();
  }

  async done() {
    this.green1 = -1;
    this.green2 = -1
    this.red1 = -1;
    this.red2 = -1;
    for (let i = 0; i < this.length && !this.stop_sort; i++) {
      this.green1 = i;
      await this.sleep(25);
    }
    this.green1 = -1;
  }

  save_algorithms() {
    let algorithms: Function[] = [

      // INSERTION - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      async () => {
        for (let i = 1; i < this.length && !this.stop_sort; i++) {
          for (let j = i; j > 0 && this.list[j - 1] > this.list[j] && !this.stop_sort; j--) {
            this.green1 = i;
            this.red1 = j;
            this.red2 = j - 1;

            let a = this.list[j];
            this.list[j] = this.list[j - 1];
            this.list[j - 1] = a;

            await this.sleep(this.speeds[this.speed]);
          }
        }
      },
      // END INSERTION - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


      // SELECTION - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      async () => {
        for (let i = 0; i < this.length && !this.stop_sort; i++) {
          let minimum = i;
          for (let j = i + 1; j < this.length && !this.stop_sort; j++) {
            if (this.list[minimum] > this.list[j]) {
              minimum = j;
            }
            this.green1 = minimum;
            this.red1 = j;

            await this.sleep(this.speeds[this.speed]);
          }
          let a = this.list[i];
          this.list[i] = this.list[minimum];
          this.list[minimum] = a;
        }
      },
      // END SELECTION - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


      // MERGE - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      async (start: number = 0, end: number = this.length) => {
      if (end - start <= 1 || this.stop_sort) {
        return;
      }

      let half = Math.ceil((end - start) / 2)
      await algorithms[2](start, half+start);
      await algorithms[2](half+start, end);

      let i = start;
      let j = start+half;
      let new_list: number[] = [];

      while (i < start+half && j < end && !this.stop_sort) {

        this.green1 = start;
        this.green2 = end-1;
        this.red1 = i;
        this.red2 = j;

        if (this.list[i] >= this.list[j]) {
          new_list.push(this.list[j]);
          j++;
        } else {
          new_list.push(this.list[i]);
          i++;
        }
        await this.sleep(this.speeds[this.speed]);
      }
      new_list.push.apply(new_list, this.list.slice(i, half+start));
      new_list.push.apply(new_list, this.list.slice(j, end));

      this.red2 = -1;
      for (let i = 0; i < new_list.length && !this.stop_sort; i++) {
        this.red1 = i + start;
        this.list[i + start] = new_list[i];
        await this.sleep(this.speeds[this.speed]);
      }
      return;},
      // END MERGE - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


      // BUBBLE - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      async () => {
        for (let i = 0; i < this.length && !this.stop_sort; i++) {
          for (let j = 0; j < (this.length - i - 1) && !this.stop_sort; j++) {
            if (this.list[j] > this.list[j + 1]) {

              this.green1 = this.length - i;
              this.red1 = j;
              this.red2 = j + 1;

              let a = this.list[j];
              this.list[j] = this.list[j + 1];
              this.list[j + 1] = a;

              await this.sleep(this.speeds[this.speed]);
            }
          }
        }
      },
      // END BUBBLE - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


      // COCKTAIL SHAKER
      async () => {
        let left = 0;
        let right = this.length - 1;
        while ( left <= right && !this.stop_sort ) {
          for ( let i = left; i < right && !this.stop_sort; i++ ) {

            this.red1 = i;
            this.red2 = i + 1;
            await this.sleep(this.speeds[this.speed]);

            if ( this.list[i] > this.list[i + 1] ) {
              [this.list[i], this.list[i + 1]] = [this.list[i + 1], this.list[i]];
            }
          }

          this.green1 = right;
          right --;

          for ( let j = right; j > left && !this.stop_sort; j-- ) {

            this.red1 = j;
            this.red2 = j + 1;
            await this.sleep(this.speeds[this.speed]);

            if ( this.list[j] < this.list[j - 1] ) {
              [this.list[j], this.list[j - 1]] = [this.list[j - 1], this.list[j]];
            }
          }

          this.green2 = left;
          left += 1;
        }
      },
      // END COCKTAIL SHAKER


      // RADIX - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      async () => {
        let a = Math.max(...this.list);
        let loop = Math.ceil(Math.log10(a));
        for (let i = 0; i < loop; i++) {

          let dic: any = {};
          for (let k = 0; k < 10; k++) {
            dic[k] = [];
          }

          for (let j = 0; j < this.length && !this.stop_sort; j++) {
            let b = (Math.floor(this.list[j] / (10**i))) % 10;
            dic[b].push(this.list[j]);

            this.red1 = j;
            await this.sleep(this.speeds[this.speed]);
          }
          this.red1 = -1;

          let new_list: number[] = [];
          for (let m = 0; m < 10; m++) {
            new_list.push.apply(new_list, dic[m])
          }

          for (let n = 0; n < this.length && !this.stop_sort; n++) {
            this.list[n] = new_list[n];
            this.green1 = n;
            await this.sleep(this.speeds[this.speed]);
          }
          this.green1 = -1;
        }
      },
      // END RADIX - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

      // QUICK - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      async ( start: number = 0, end: number = this.length ) => {
        let left: number[] = [];
        let right: number[] = [];
        let pivot = this.list[start];

        for ( let i = start + 1; i < this.length; i++ ) {
          if ( this.list[i] < pivot ) {
            left.push(this.list[i]);
          }
          else {
            right.push(this.list[i]);
          }
        }

        return
      }
    ]
    // END LIST

    return algorithms;
  }
}
