import { Component, OnInit, Input} from '@angular/core';
import { GrabCryptoServiceService } from '../service/grabCryptoService.service';
import { Coin } from '../_model/Coin';
// tslint:disable-next-line:import-blacklist
import { Observable } from 'rxjs/Rx';
import { Price } from '../_model/Price';
import { TransferServiceService } from '../service/transferService.service';

@Component({
  selector: 'app-cryptocurrencies',
  templateUrl: './cryptocurrencies.component.html',
  styleUrls: ['./cryptocurrencies.component.css']
})
export class CryptocurrenciesComponent implements OnInit {
  coins: Coin;
  objectKeys = Object.keys;
  prices: Price[] = [];
  counter: number;
  flag: boolean;
  choosingCoinPrice1: number;
  obj: any = {key: false};
  filterValue: number;
  @Input() oldCoinPrice: number;

  constructor(private grabCryptoService: GrabCryptoServiceService, private transferService: TransferServiceService) {  }

  ngOnInit() {
    this.loadCoins(this.filterValue);
    this.choosingCoinPrice1 = 0.0000000001;

    /* 2 different syntax */
    // this.transferService.getMessage().subscribe(
    //   data => this.filterValue = data
    // );
    /* OR */
    this.transferService.getMessage().subscribe(function(data) {
      this.filterValue = data;
    // tslint:disable-next-line:max-line-length
    }); // very important!!!!!!!!, if you don't call getMessage().subscribe, and instead you just call newTransferData.subscribe.. it won't update the filterValue

    Observable.interval(4000).takeWhile(() => true).subscribe(() => this.loadCoins(this.filterValue));
    this.counter = 0;
  }

  loadCoins(coinsNumber: any) {
    this.transferService.newTransferData.subscribe(
      data => this.filterValue = data
    );
    console.log('filter: ' + this.filterValue);
    this.grabCryptoService.getCoins(this.filterValue).subscribe((coins: Coin) => {
      this.coins = coins;
      this.flag = !this.flag;
      console.log(this.flag);
      // console.log('counter: ' + this.counter++);
      // console.log('old coin price: ' + this.oldCoinPrice);
      // Object.entries(this.coins.data).forEach(
      //   ([key, value]) => console.log(key, value['name'])
      // );
      // Object.entries(this.coins.data).forEach(
      //    ([key, value]) => Object.entries(value['quotes']).forEach(
      //     ([key1, value1]) => console.log(key1, value1['price'])
      //    )
      // );
      Object.entries(this.coins.data).forEach(
          ([key, value]) => Object.entries(value['quotes']).forEach(
          ([key1, value1]) => this.prices.push(
              new Price(key, value1['price'])
          )
        )
      );
      // for (let i = 0; i < this.prices.length; i++) {
      //   console.log(this.prices[i]);
      // }
      Object.entries(this.coins.data).forEach((entry) => {
        let price = 0;
        const[key, value] = entry;
        Object.entries(value['quotes']).forEach((entry1) => {
          const[key1, value1] = entry1;
          const choosingCoinPrice = 1;
          if (this.prices.filter(i => i.id === key)[0].amount >= value1['price']) {
              // console.log('here1');
              this.obj[key] = false;
          } else {
              // console.log('here2');
              this.obj[key] = true;
          }
          price = value1['price'];
        });
        console.log('save this coin: name: ' + value['name'] + 'price: ' + this.prices.filter(i => i.id === key)[0].amount);
        this.grabCryptoService.saveCoins(key, value['name'], this.prices.filter(i => i.id === key)[0].amount);
      });
    }, error => {
      console.log('something wrong here');
    });
  }

  generateArray(obj) {
    return Object.keys(obj).map((key) => obj[key]);
  }

}
