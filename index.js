
var defer = require('pull-defer')

module.exports = function (connect, factor, max) {

  factor = factor || 100
  max = max || 10e3

  var errors = 0, waiting = []

  var state, attempt = Date.now() //first attempt started below.

  function tryConnect () {
    try { connect(isConnected) }
    catch (err) { console.log(err); isConnected(err) }
  }

  function isConnected (err) {
    //if the connection errored
    if(err && err !== true) {
      _state = false
      errors ++
      setTimeout(tryConnect, Math.min(Math.pow(2, errors)*factor, max))
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

  isConnected.duplex = function (fn) {
    return function () {
      var args = [].slice.call(arguments)
      if(state) return fn.apply(null, args)
      var duplex = defer.duplex()
      waiting.push(function () {
        duplex.resolve(fn.apply(null, args))
      })
      return duplex
    }
  }

  tryConnect()

  return isConnected
}








