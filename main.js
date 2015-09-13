// ======= Class =========

var Class = function (parent) {
  var klass = function () {
    this.init.apply(this, arguments);
  }

  if (parent) {
    var subclass = function () {};
    subclass.prototype = parent.prototype;
    klass.prototype = new subclass;
  }

  klass.prototype.init = function() {};

  klass.fn = klass.prototype;
  klass.fn.parent = klass;
  klass._super = klass.__proto__;

  klass.proxy = function (func) {
    var self = this;

    return (function () {
      return func.apply(self, arguments);
    })
  }

  klass.extend = function (obj) {
    var extended = obj.extended;

    Object.keys(obj).forEach(function (key) {
      klass[key] = obj[key];
    });

    if (extended) extended(klass)
  };

  klass.include = function (obj) {
    var included = obj.included;

    Object.keys(obj).forEach(function (key) {
      klass.fn[key] = obj[key];
    });

    if (included) included(klass)
  }
  
  klass.fn.proxy = klass.proxy;
  return klass;
}



// ========= PubSub ==========

var PubSub = {
  subscribe: function (ev, callback) {
    var calls = this._callbacks || (this._callbacks = {});

    (this._callbacks[ev] || (this._callbacks[ev] = [])).push(callback);
    return this;
  },

  publish: function () {
    var args = Array.prototype.slice.call(arguments, 0)
      , ev   = args.shift()
      , list
      , calls;

    if (!(calls = this._callbacks)) return this;
    if (!(list  = this._callbacks[ev])) return this;

    list.forEach(function (callback) {
      callback.apply(this, args)
    }.bind(this));

    return this;
  }
}
