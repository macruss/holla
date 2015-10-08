;(function ($, exports) {
  var Model = {
    inherited: function () {},
    created: function () {
      this.records = {};
      this.attributes = [];
    },

    prototype: {
      init: function () {}
    },

    extend: function (o) {
      var extended = o.extended;

      $.extend(this, o);
      if (extended) {
        extended(this);
      };
    },

    include: function (o) {
      var included = o.included;

      $.extend(this.prototype, o);
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

    populate: function (values) {
      this.records = {};
      values.forEach(function (value) {
        var record = this.init(value);

        record.newRecord = false;
        this.records[record.id] = record;
      }, this);
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
      }, this);
    },

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
      this.parent.records[this.id] = this.dup();
    },

    dup: function () {
      return $.extend(true, {}, this);
    },

    destroy: function () {
      delete this.parent.records[this.id];
    },

    attributes: function () {
      var result = {};

      this.parent.attributes

      this.parent.attributes.forEach(function (attr) {
        result[attr] = this[attr];
      }, this); 

      result.id = this.id;
      return result;
    },

    toJSON: function () {
      return (this.attributes());
    }
  });

  exports.Model = Model;
})(jQuery, window);