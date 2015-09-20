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

  unsubscribe: function (ev) {
    delete this._callbacks[ev];
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


// =========== Model ===========

var Model = {
  inherited: function () {},
  created: function () {
    this.records = {};
  },

  prototype: {
    init: function () {}
  },

  extend: function (o) {
    var extended = o.extended;

    jQuery.extend(this, o);
    if (extended) {
      extended(this);
    };
  },

  include: function (o) {
    var included = o.included;

    jQuery.extend(this.prototype, o);
    if (included) {
      included(this);
    };
  },

  create: function () {
    var object = Object.create(this);

    object.parent = this;
    object.prototype = object.fn = Object.create(this.prototype);

    object.created();
    this.inherited(object);

    return object;
  },

  init: function () {
    var instance = Object.create(this.prototype);

    instance.parent = this;
    instance.init.apply(instance, arguments);

    return instance;
  }
};

Model.extend({
  find: function (id) {
    return this.records[id] || console.log("Unknown record ");
  }
});

Model.include({
  init: function (atts) {
    if (atts) {
      this.load(atts);
    };
  },

  load: function (attributes) {
    Object.keys(attributes).forEach(function (attr) {
      this[attr] = attributes[attr];
    }.bind(this));
  }
});

Model.include({
  newRecord: true,

  save: function () {
    this.newRecord ? this.create() : this.update();
  },
  create: function () {
    if ( !this.id ) {
      this.id = Math.guid();
    };

    this.newRecord = false;
    this.parent.records[this.id] = this;
  },
  
  update: function () {
    this.parent.records[this.id] = this;
  },

  destroy: function () {
    delete this.parent.records[this.id];
  }
});


// ============== Math.guid ============

Math.guid = function () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
    function (c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    }).toUpperCase();
};

