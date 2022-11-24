import Coin from './coin';

class ReservationHandle {
  private coins: Array<Coin>;

  constructor(coins: Array<Coin>) {
    this.coins = coins;
  }

  public available(): number {
    const amount = this.coins.reduce(
      (accumulator, currentCoin) => accumulator + currentCoin.getValue(),
      0,
    );
    return amount;
  }

  public getCoins(): Array<Coin> {
    return this.coins;
  }
}

export default ReservationHandle;
