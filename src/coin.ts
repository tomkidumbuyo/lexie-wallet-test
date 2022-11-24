// Represent a specific value of a coin
class Coin {
  private value: number;

  constructor(value: number) {
    this.value = value;
  }

  getValue() {
    return this.value;
  }
}

export default Coin;
