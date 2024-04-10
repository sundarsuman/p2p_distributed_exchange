/*
  order = {
    id: 1,
    size: 10,
    limit_price: 200,
    side: "buy",
    unfilled_size: 5,
    user_id: 1
  }
  
  Orderbook = {
    bids: [order1, order2, ...]
    asks: [order3, order4, ...]
  }

  - Orderbook bids are sorted by limit_price in descending order
  - Orderbook asks are sorted by limit_price in ascending order
  - Any new order is matched against existing order
  - If matching/further matching, is not possible the order/remaining order is added 
    to the orderbook
*/

const utils = require('../helper/utils.js')

class MatchingEngine {
  init() {
    this.orderbook = {}
  }

  add(order) {
    const orderbook = this.orderbook
    while (this._match(orderbook, order)) {
      if (order.side == "buy") {
        orderbook.bids, order = _publishTrade(orderbook.bids, order)
      } else {
        orderbook.asks, order = _publishTrade(orderbook.asks, order)
      }
    }

    this.orderbook = orderbook

    // return if order is completely consumed
    if (order.size == 0) {
      return
    }

    // add order to orderbook
    if (order.side == "buy") {
      this.orderbook.bids = utils.insertSortedDesc(this.orderbook.bids, order)
    } else {
      this.orderbook.asks = utils.insertSortedAsc(this.orderbook.asks, order)
    }
  }

  _match(orderbook, order) {
    let levels = []
    if (order.side == "buy") {
      levels = orderbook.asks
      if (levels[0].limit_price > order.limit_price) {
        return false
      }
    } else {
      levels = orderbook.bids
      if (levels[0].limit_price < order.limit_price) {
        return false
      }
    }

    if (order.size == 0) {
      return false
    }

    return (levels.length > 0)
  }

  _publishTrade(levels, order) {
    const tradeSize = Math.min(levels[0].size, order.size)
    console.log(`orders matched, side: ${order.side}, size: ${tradeSize}, price: ${levels[0].limit_price}`)
    
    if (levels[0].size > order.size) {
      levels[0].size -= tradeSize
      order.size = 0
    } else if (levels[0].size < order.size) {
      levels.shift()
      order.size -= tradeSize
    } else {
      levels.shift()
      order.size = 0
    }

    return levels, order
  }

  edit(order) {
    // TODO
  }


  delete(orderID) {
    // TODO
  }
}

module.exports = MatchingEngine