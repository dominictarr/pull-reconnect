
var defer = require('pull-defer')

module.exports = function (connect) {

  var errors = 0, waiting = []

//  ;(function next () {
//    var attempt = Date.now()
//    console.log('connecting...')
//    connect(function (err) {
//      console.log('reconnecting...')
//      if(Date.now() - attempt < 3e3) errors ++
//      else                           errors = 0
//      setTimeout(next, Math.min(Math.pow(2, errors)*1e3, 15e3))
//    })
//  })()

  var state, attempt = Date.now() //first attempt started below.

  function isConnected (err) {
    //if the connection errored
    if(err) {
      _state = false
      errors ++
      setTimeout(function () { connect(isConnected) },
        Math.min(Math.pow(2, errors)*1e3, 15e3)
      )
    }
    else {
      _state = true
      errors = 0
    }
    if(state === _state) return
    state = _state
    if(state)
      while(waiting.length && state) waiting.shift()()
    //we don't handle any notifications for loosing connectivity.
  }

  isConnected.async = function async(fn) {
    return function () {
      var args = [].slice.call(arguments)
      if(state) fn.apply(null, args)
      else waiting.push(function () {
        fn.apply(null, args)
      })
    }
  }

  isConnected.source = function (fn) {
    return function () {
      var args = [].slice.call(arguments)
      if(state) return fn.apply(null, args)
      var source = defer.source()
      waiting.push(function () {
        source.resolve(fn.apply(null, args))
      })
      return source
    }
  }

  isConnected.sink = function (fn) {
    return function () {
      var args = [].slice.call(arguments)
      if(state) return fn.apply(null, args)
      var sink = defer.sink()
      waiting.push(function () {
        sink.resolve(fn.apply(null, args))
      })
      return sink
    }
  }

  connect(isConnected)

  return isConnected
}

