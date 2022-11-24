import Wallet from '../src/wallet'
import Coin from '../src/coin'
import Distribution from '../src/distribution';
import ReservationHandle from '../src/reservation-handle';
import { fail } from 'assert';
const expect = require('chai').expect

describe('Wallet module', () => {

      it('should return zero available if no coins are added to wallet', () => {
        const wallet = new Wallet();
        expect(wallet.available()).to.equal(0)
      })

      it('should return the value of the coin available if a coin was passed during coin object initiation', () => {
        const value: number = Math.floor(Math.random() * 10);
        const coin = new Coin(value)
        const wallet = new Wallet(coin);
        expect(wallet.available()).to.equal(value)
      })

      it('should return the total value of the coins available', () => {
        const wallet = new Wallet();
        let totalValue = 0;
        for (let index = 0; index < 5; index++) {
            const value: number = Math.floor(Math.random() * 10);
            totalValue += value;
            const coin = new Coin(value)
            wallet.add(coin)
        }
        expect(wallet.available()).to.equal(totalValue)
      })

      it('should distribute coins into buckets', () => {
        const coins = [new Coin(1234), new Coin(5), new Coin(67), new Coin(1000001)]
        const wallet = new Wallet();
        for (const coin of coins) {
            wallet.add(coin)
        }
        const buckets = wallet.distribution(1000)

        const result = new Distribution([
            [ new Coin(5), new Coin(67) ],
            [ new Coin (1234)],
            [ new Coin(1000001) ]
        ])

        expect(buckets.buckets[0][0].getValue()).to.equal(result.buckets[0][0].getValue())
        expect(buckets.buckets[0][1].getValue()).to.equal(result.buckets[0][1].getValue())
        expect(buckets.buckets[1][0].getValue()).to.equal(result.buckets[1][0].getValue())
        expect(buckets.buckets[2][0].getValue()).to.equal(result.buckets[2][0].getValue())
        
      })

      it('should be able to deduct amount from wallet', () => {
        const coins = [new Coin(1234), new Coin(5), new Coin(67), new Coin(1000001)]
        const wallet = new Wallet();
        const spendAmount = 1000003;
        for (const coin of coins) {
            wallet.add(coin)
        }
        const initialAmount = wallet.available();
        const spentCoins = wallet.spend(spendAmount)
        expect(wallet.available()).to.equal(initialAmount - spendAmount)
        let totalSpent = 0
        for (const spentCoin of spentCoins) {
            totalSpent += spentCoin.getValue();
        }
        expect(spendAmount).to.equal(totalSpent)
      })

      it('should throw an error if the wallet has no enough funds', () => {
        const wallet = new Wallet(new Coin(1234));
        const spendAmount = 1000003;
        try {
            wallet.spend(spendAmount)
            fail("it should throw insufficient funds error")
        } catch (error) {
            console.log(error)
        }
      })

      it('should be able to reserve some funds', () => {
        const wallet = new Wallet(new Coin(1234));
        const reservationAmount: number = 300;
        const reservation: ReservationHandle = wallet.reserve(reservationAmount)

        expect(wallet.available()).to.equal(1234 - reservationAmount)
        let coinTotal:number = 0
        for (const coin of reservation.getCoins()) {
            coinTotal += coin.getValue()
        }
        // expect(coinTotal).to.equal(reservationAmount)
      })

      it('should be able to cancel reserves', () => {
        const wallet = new Wallet(new Coin(1234));
        expect(wallet.available()).to.equal(1234)
        const reservationAmount: number = 300;
        const reservation: ReservationHandle = wallet.reserve(reservationAmount)
        expect(wallet.available()).to.equal(1234 - reservationAmount)
        wallet.reservationCancel(reservation)
        expect(wallet.available()).to.equal(1234)
    })

    it('should be able to spend reserves', () => {
        const wallet = new Wallet(new Coin(1234));
        const reservationAmount: number = 300;
        const reservation: ReservationHandle = wallet.reserve(reservationAmount)
        const coins = wallet.reservationSpend(reservation)
        let coinTotal = 0
        for (const coin of coins) {
            coinTotal += coin.getValue()
        }
        expect(coinTotal).to.equal(reservationAmount)
    })

})


