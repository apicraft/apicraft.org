if (!Object.create) {
	Object.create = function(obj) {
		function F() {}
		F.prototype = obj;
		
		return new F();
	}
}

$(function($){
	var ejs = require('ejs');
	
	$.Ejs = function(options) {
		var view = Object.create(EjsView);
		
		view.options = $.extend({}, view.defaults, options);
		
		return view;
	}
	
	var EjsView = {
		defaults: {
			path: '/public/views/',
			extension: '.html',
			open: '<?',
			close: '?>',
			async: true,
			cache: true,
			memory: true
		},
		
		options: {},
		
		cache: {},
		
		load: function(template, options, callback) {
		  var View = this;

		  var path = options.path + template + options.extension;

		  if (options.memory && View.cache[path]) {
			  template = View.cache[path];

			  callback(null, template);
		  } else {
			  $.ajax({
					async: options.async,
					cache: options.cache,

					url: path,
					type: 'GET',

					success: function(templ) {
						template = templ;

						if (options.memory) { View.cache[path] = template; }

						callback(null, template);
					},

					error: function(error) {
						callback(error);
					}
				})
		  }
		},

		compile: function(template, opts, callback) {
			var View = this;

			if (typeof(opts) == 'function') {
				callback = opts;
				opts = {};
			}

			if (!opts) { opts = {}; }

			var compiled;
			var options = $.extend({}, View.options, opts);

			View.load(template, options, function(error, template) {
				if (error) { return callback(error); }

				ejs.open = options.open;
				ejs.close = options.close;

				try {
		      compiled = ejs.compile(template, { View: View });
	      } catch (error) {
		      return (callback ? callback(error) : null);
	      }

	      callback && callback(null, compiled);
			});

			return compiled;
		},

		render: function(template, data, opts, callback) {
			var View = this;

      if (typeof(data) == 'function') {
	      callback = data;
	      data = {};
      }

			if (typeof(opts) == 'function') {
				callback = opts;
				opts = {};
			}

			if (!data) { data = {}; }
			if (!opts) { opts = {}; }

			var html;
			var options = $.extend({}, View.options, opts);

			View.load(template, options, function(error, template) {
				if (error) { return callback(error); }

				ejs.open = options.open;
				ejs.close = options.close;

				data.View = View;

				try {
		      html = ejs.render(template, data);
	      } catch (error) {
		      return (callback ? callback(error) : null);
	      }

	      callback && callback(null, html);
			});

			return html;
		},

		partial: function(template, data, opts) {
			var View = this;

			if (!opts) { opts = {}; }

			opts.async = false;

			return View.render(template, data, opts);
		},

		update: function(el, template, data, opts, callback) {
			return this.action('update', el, template, data, opts, callback);
		},

		before: function(el, template, data, opts, callback) {
			return this.action('before', el, template, data, opts, callback);
		},

		after: function(el, template, data, opts, callback) {
			return this.action('after', el, template, data, opts, callback);
		},

		prepend: function(el, template, data, opts, callback) {
			return this.action('prepend', el, template, data, opts, callback);
		},

		append: function(el, template, data, opts, callback) {
			return this.action('append', el, template, data, opts, callback);
		},

		replace: function(el, template, data, opts, callback) {
			return this.action('replace', el, template, data, opts, callback);
		},

		action: function(type, el, template, data, opts, callback) {
			var View = this;

			if (typeof(opts) == 'function') {
				callback = opts;
				opts = {};
			}

			if (!opts) { opts = {}; }

			var html;

			return View.render(template, data, opts, function(error, content) {
				if (!error) {
					html = content;

	        var methods = {
		        update: 'html',
		        before: 'before',
		        after: 'after',
		        prepend: 'prepend',
		        append: 'append',
		        replace: 'replaceWith'
	        };

	        $(el)[methods[type]](html);
				}

				callback && callback(error, html);
			});

			return html;
		}
	}
}(jQuery));
