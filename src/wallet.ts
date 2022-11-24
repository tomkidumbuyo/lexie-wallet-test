import Coin from './coin';
import Distribution from './distribution';
import ReservationHandle from './reservation-handle';

// The Wallet Class
class Wallet {
  private coins: Array<Coin>;

  constructor(coin?: Coin) {
    this.coins = coin ? [coin] : [];
  }

  public available(): number {
    const amount = this.coins.reduce(
      (accumulator, currentCoin) => accumulator + currentCoin.getValue(),
      0,
    );
    return amount;
  }

  public add(coin: Coin) {
    this.coins.push(coin);
  }

  public distribution(scale: number): Distribution {
    const buckets = [];
    const maxCoinValue = Math.max(...this.coins.map((coin) => coin.getValue()));
    let index = 0;
    while (true) {
      const min = scale ** index;
      const max = scale ** (index + 1);
      buckets.push(this.coins.filter((coin) => coin.getValue() >= min && coin.getValue() < max));
      if (maxCoinValue < max) { break; }
      index += 1;
    }
    return new Distribution(buckets);
  }

  public spend(amount: number): Array<Coin> {
    return this.deductAmount(amount);
  }

  private deductAmount(amount: number): Array<Coin> {
    if (amount > this.available()) {
      throw new Error('Spend Error: Insufficient funds in the wallet.');
    }
    const deductedCoins: Array<Coin> = [];
    let deductedCoinsValue = 0;
    while (true) {
      const coin = this.coins.pop();
      if (coin && deductedCoinsValue + coin.getValue() <= amount) {
        deductedCoins.push(coin);
        deductedCoinsValue += coin.getValue();
      } else if (coin && deductedCoinsValue + coin.getValue() > amount && deductedCoinsValue < amount) {
        const remainingCoinHalf = new Coin(coin.getValue() - (amount - deductedCoinsValue));
        const deductedCoinHalf = new Coin(amount - deductedCoinsValue);
        this.add(remainingCoinHalf);
        deductedCoins.push(deductedCoinHalf);
        deductedCoinsValue += deductedCoinHalf.getValue();
        break;
      }
    }
    return deductedCoins;
  }

  public reserve(amount: number): ReservationHandle {
    const deductedCoins = this.deductAmount(amount);
    return new ReservationHandle(deductedCoins);
  }

  public reservationSpend(reservation: ReservationHandle): Array<Coin> {
    return reservation.getCoins();
  }

  public reservationCancel(reservation: ReservationHandle) {
    reservation.getCoins().forEach((coin) => this.add(coin));
  }
}

export default Wallet;
