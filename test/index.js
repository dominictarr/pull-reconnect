
var tape = require('tape')
var pull = require('pull-stream')

var Reconnect = require('../')

tape('delay async', function (t) {

  var ready = false
  var r = Reconnect(function (isConnected) {
    setTimeout(function () {
      isConnected(ready = true)
    })
  })

  var what = r.async(function (cb) {
    t.ok(ready)
    setTimeout(function () {
      cb(null, ready)
    })
  })

  what(function (err, ready) {
    t.ok(ready)
    t.end()
  })

})


tape('delay async, sync', function (t) {

  var ready = false
  var r = Reconnect(function (isConnected) {
    isConnected(ready = true)
  })

  var what = r.async(function (cb) {
    t.ok(ready)
    setTimeout(function () {
      cb(null, ready)
    })
  })

  what(function (err, ready) {
    t.ok(ready)
    t.end()
  })

})



tape('delay source', function (t) {
  var ready = false
  var r = Reconnect(function (isConnected) {
    setTimeout(function () {
      isConnected(ready = true)
    })
  })

  var what = r.source(function () {
    return pull.values([1,2,3])
  })

  pull(what(), pull.collect(function (err, ary) {
    if(err) throw err
    t.deepEqual(ary, [1,2,3])
    t.end()
  }))

})

tape('delay source, sync', function (t) {
  var ready = false
  var r = Reconnect(function (isConnected) {
    isConnected(ready = true)
  })

  var what = r.source(function () {
    return pull.values([1,2,3])
  })

  pull(what(), pull.collect(function (err, ary) {
    if(err) throw err
    t.deepEqual(ary, [1,2,3])
    t.end()
  }))

})

tape('delay sink', function (t) {
  var ready = false
  var r = Reconnect(function (isConnected) {
    setTimeout(function () {
      isConnected(ready = true)
    })
  })

  var collect = r.sink(function (cb) {
    t.ok(ready)
    return pull.collect(cb)
  })

  pull(pull.values([1,2,3]), collect(function (err, ary) {
    if(err) throw err
    t.deepEqual(ary, [1,2,3])
    t.end()
  }))

})

tape('delay duplex, sync', function (t) {
  t.plan(2)

  var ready = false
  var r = Reconnect(function (isConnected) {
    isConnected(ready = true)
  })

  var what = r.duplex(function (cb) {
    return {
      source: pull.values([1,2,3]),
      sink: pull.collect(cb)
    }
  })

  const duplex = what(function (err, ary) {
    if(err) throw err
    t.deepEqual(ary, [1,2,3])
  })

  pull(pull.values([1,2,3]), duplex)

  pull(duplex, pull.collect(function (err, ary) {
    if(err) throw err
    t.deepEqual(ary, [1,2,3])
  }))
})

