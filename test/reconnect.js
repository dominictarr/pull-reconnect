
var tape = require('tape')
var Reconnect = require('../')

tape('reconnect after disconnect', function (t) {
  var n = 3
  var r = Reconnect(function (isConnected) {

    setTimeout(function () {
      console.log(n)
      isConnected(--n ? new Error() : null)
    })

  })

  var ready = r.async(function (cb) {
    cb()
  })

  ready(t.end)

})
