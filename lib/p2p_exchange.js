'use strict'

const { PeerRPCServer, PeerRPCClient } = require('grenache-nodejs-http')
const Link = require('grenache-nodejs-link')
const Event = require('node:events')
const MatchingEngine = require('./MatchingEngine')

class P2PExchange extends Event {
  constructor() {
    super()
  }

  init() {
    // create peer server
    this._initPeerSvr()

    // init peer client
    this._initPeerClient()

    // init matching engine
    this._initME()
    
    // handle order updates
    this._handleRequests()
    
  }

  _initPeerSvr() {
    const link = new Link({
      grape: 'http://127.0.0.1:30001',
    })
    link.start()

    this.peerSvr = new PeerRPCServer(link, {})
    this.peerSvr.init()

    this.service = this.peerSvr.transport('server')
    this.service.listen(1337)
    console.log(`started http server port:${this.service.port}`)

    // announce node to DHT
    setInterval(() => {
      link.announce("peer-server", this.service.port, {})
    })
  }


  _initPeerClient() {
    const link = new Link({
      grape: 'http://127.0.0.1:30001'
    })
    link.start()
    
    this.peer = new PeerRPCClient(link, {})
    this.peer.init()
  }

  _handleRequests() {
    this.service.on('request', (rid, key, data, handler) => {
      const payload = JSON.parse(data)["payload"]
      console.log(payload)
      console.log(payload.data)
      switch(payload.action) {
        case 'create-order':
          this._addOrder(payload.data)
        case 'order-broadcast':
          this._updateOrderbook(payload.data)
        default:
          console.log("unhandled action type!")
          handler.reply(null, "failure")
      }
    })
  }

  _initME() {
    this.me = new MatchingEngine()
  }

  _addOrder() {
    // TODO
    // In order to ensure, orderbook is in sync with other peers
    // Check new order sequence ID against a global order sequence ID 
    // If sequence IDs are consistent, proceed to adding order
    // in case the local sequence ID and global sequence ID are out of sync
    //    1. Invalidate Current Order
    //    2. Retry n times before failure

    try{
      this.me.add(order)
      this.me.printOB()

      // TODO
      // increment a global order sequence ID
  
      // on successful add, broadcast to others
      request = {
        action: 'order-broadcast',
        data: order,
      }
  
      this.peer.request('peer-server', request, {timeout: 10000}, (err, result) => {
        if (err) {
          console.error('order broadcast failed!')
          throw err
        }
        console.log('order broadcast successful!')
      })
    } catch (err) {
      console.error('error occured while adding order', err)
    }
  }

  _updateOrderbook(order) {
    // update order to matching engine
    this.me.add(order)
  }


}

module.exports = P2PExchange