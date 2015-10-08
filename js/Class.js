;(function (exports) {
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
  };

  exports.Class = Class;

})(window);