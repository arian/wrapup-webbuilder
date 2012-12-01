(function(modules) {
    var cache = {}, require = function(id) {
        var module = cache[id];
        if (!module) {
            module = cache[id] = {};
            var exports = module.exports = {};
            modules[id].call(exports, require, module, exports, window);
        }
        return module.exports;
    };
    require("0")
})({
    "0": function(require, module, exports, global) {
        /*global snippets:true CodeMirror:true*/
                "use strict";

        var $ = require("1");

        require("d");

        var e = require("h");

        var string = require("9");

        require("i")(function() {
            // editor with options
            var editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
                lineNumbers: true,
                matchBrackets: true,
                theme: "monokai",
                indentWithTabs: true
            });
            // simple editor features we need
            function append(text) {
                var pos = editor.getCursor();
                editor.replaceRange(text, pos);
            }
            function set(text) {
                editor.setValue(text);
            }
            // appending new snippets to the editor
            $(".snippets a").on("click", function(event) {
                e(event).preventDefault();
                var name = this.getAttribute("href").slice(1);
                var snippet = snippets[name];
                if (!snippet) console.warn(name + " does not exist"); else append(snippet);
            });
            // load from the file input
            (function(file) {
                if (!file || !file[0]) return;
                // FileReader not supported, hide the input field
                if (typeof FileReader == "undefined") {
                    file.parent(".load").addClass("hidden");
                }
                // when reading the file is ready
                var reader = new FileReader();
                reader.onload = function(event) {
                    set(event.target.result);
                };
                // after a file was chosen
                file.on("change", function() {
                    reader.readAsText(file[0].files[0]);
                });
            })($(".load input"));
        });
    },
    "1": function(require, module, exports, global) {
        /*
require everything and export
*/
                "use strict";

        var $ = require("2");

        require("4");

        require("a");

        require("b");

        require("5");

        module.exports = $;
    },
    "2": function(require, module, exports, global) {
        /*
elements
*/
                "use strict";

        var prime = require("3");

        // uniqueID
        var uniqueIndex = 0;

        var uniqueID = function(n) {
            return n === global ? "global" : n.uniqueNumber || (n.uniqueNumber = "n:" + (uniqueIndex++).toString(36));
        };

        var instances = {};

        // `search` is the selector engine
        // `sort` is the elements sorter
        var search, sort;

        // the exposed prime
        var $ = prime({
            constructor: function $(n, context) {
                if (n == null) return null;
                if (n instanceof elements) return n;
                var self = new elements(), uid;
                if (n.nodeType || n === global) {
                    self[self.length++] = n;
                } else if (typeof n === "string") {
                    if (search) search(n, context, self);
                } else if (n.length) {
                    // this could be an array, or any object with a length attribute,
                    // including another instance of elements from another interface.
                    var uniques = {};
                    for (var i = 0, l = n.length; i < l; i++) {
                        // perform elements flattening
                        var nodes = $(n[i], context);
                        if (nodes && nodes.length) for (var j = 0, k = nodes.length; j < k; j++) {
                            var node = nodes[j];
                            uid = uniqueID(node);
                            if (!uniques[uid]) {
                                self[self.length++] = node;
                                uniques[uid] = true;
                            }
                        }
                    }
                    if (sort && self.length > 1) sort(self);
                }
                if (!self.length) return null;
                // when length is 1 always use the same elements instance
                if (self.length === 1) {
                    uid = uniqueID(self[0]);
                    return instances[uid] || (instances[uid] = self);
                }
                return self;
            }
        });

        // the resulting prime
        // this also makes it impossible to override handle (short of constructor hijacking)
        var elements = prime({
            inherits: $,
            constructor: function elements() {
                this.length = 0;
            },
            handle: function handle(method) {
                var buffer = [], length = this.length, res;
                if (length === 1) {
                    res = method.call(this, this[0], 0, buffer);
                    if (res != null && res !== false && res !== true) buffer.push(res);
                } else for (var i = 0; i < length; i++) {
                    var node = this[i];
                    res = method.call($(node), node, i, buffer);
                    if (res === false || res === true) break;
                    if (res != null) buffer.push(res);
                }
                return buffer;
            },
            remove: function(destroy) {
                var res = this.handle(function(node) {
                    var parent = node.parentNode;
                    if (parent) parent.removeChild(node);
                    if (destroy) {
                        delete instances[uniqueID(node)];
                        return node;
                    }
                });
                return destroy ? res : this;
            }
        });

        $.use = function(extension) {
            $.implement(prime.create(extension.prototype));
            if (extension.search) search = extension.search;
            if (extension.sort) sort = extension.sort;
            return this;
        };

        module.exports = $;
    },
    "3": function(require, module, exports, global) {
        /*
prime
 - prototypal inheritance
*/
                "use strict";

        var has = function(self, key) {
            return Object.hasOwnProperty.call(self, key);
        };

        var each = function(object, method, context) {
            for (var key in object) if (method.call(context, object[key], key, object) === false) break;
            return object;
        };

        /*(es5 && fixEnumBug)?*/
        if (!{
            valueOf: 0
        }.propertyIsEnumerable("valueOf")) {
            // fix stupid IE enum 🐛
            var buggy = "constructor,toString,valueOf,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString".split(","), proto = Object.prototype;
            each = function(object, method, context) {
                var i = buggy.length, key, value;
                for (key in object) if (method.call(context, object[key], key, object) === false) return object;
                while (i--) {
                    key = buggy[i];
                    value = object[key];
                    if (value !== proto[key] && method.call(context, value, key, object) === false) break;
                }
                return object;
            };
        }

        /*:*/
        var create = Object.create || function(self) {
            var F = function() {};
            F.prototype = self;
            return new F();
        };

        /*:*/
        var mutator = function(key, value) {
            this.prototype[key] = value;
        };

        var implement = function(obj) {
            each(obj, function(value, key) {
                if (key !== "constructor" && key !== "inherits" && key !== "mutator") this.mutator(key, value);
            }, this);
            return this;
        };

        var prime = function(proto) {
            var superprime = proto.inherits, superproto;
            if (superprime) superproto = superprime.prototype;
            // if our nice proto object has no own constructor property
            // then we proceed using a ghosting constructor that all it does is
            // call the parent's constructor if it has a superprime, else an empty constructor
            // proto.constructor becomes the effective constructor
            var constructor = has(proto, "constructor") ? proto.constructor : superprime ? function() {
                return superproto.constructor.apply(this, arguments);
            } : function() {};
            if (superprime) {
                // inherit from superprime
                var cproto = constructor.prototype = create(superproto);
                // setting constructor.parent to superprime.prototype
                // because it's the shortest possible absolute reference
                constructor.parent = superproto;
                cproto.constructor = constructor;
            }
            // inherit (kindof inherit) mutator
            constructor.mutator = proto.mutator || superprime && superprime.mutator || mutator;
            // copy implement (this should never change)
            constructor.implement = implement;
            // finally implement proto and return constructor
            return constructor.implement(proto);
        };

        prime.each = each;

        prime.has = has;

        prime.create = create;

        module.exports = prime;
    },
    "4": function(require, module, exports, global) {
        /*
elements attributes
*/
                "use strict";

        var $ = require("5"), string = require("8"), array = require("6");

        // attributes
        $.implement({
            setAttribute: function(name, value) {
                this.forEach(function(node) {
                    node.setAttribute(name, value);
                });
                return this;
            },
            getAttribute: function(name) {
                var attr = this[0].getAttributeNode(name);
                return attr && attr.specified ? attr.value : null;
            },
            hasAttribute: function(name) {
                var node = this[0];
                if (node.hasAttribute) return node.hasAttribute(name);
                var attr = node.getAttributeNode(name);
                return !!(attr && attr.specified);
            },
            removeAttribute: function(name) {
                this.forEach(function(node) {
                    var attr = node.getAttributeNode(name);
                    if (attr) node.removeAttributeNode(attr);
                });
                return this;
            }
        });

        var accessors = {};

        array.forEach("type,value,name,href,title,id".split(","), function(name) {
            accessors[name] = function(value) {
                if (value !== undefined) {
                    this.forEach(function(node) {
                        node[name] = value;
                    });
                    return this;
                }
                return this[0][name];
            };
        });

        // booleans
        array.forEach("checked,disabled,selected".split(","), function(name) {
            accessors[name] = function(value) {
                if (value !== undefined) {
                    this.forEach(function(node) {
                        node[name] = !!value;
                    });
                    return this;
                }
                return !!this[0][name];
            };
        });

        // className
        var classes = function(className) {
            var classNames = string.clean(className).split(" "), uniques = {};
            return array.filter(classNames, function(className) {
                if (className !== "" && !uniques[className]) return uniques[className] = className;
            }).sort();
        };

        accessors.className = function(className) {
            if (className !== undefined) {
                this.forEach(function(node) {
                    node.className = classes(className).join(" ");
                });
                return this;
            }
            return classes(this[0].className).join(" ");
        };

        // attribute
        $.implement({
            attribute: function(name, value) {
                var accessor = accessors[name];
                if (accessor) return accessor.call(this, value);
                if (value != null) return this.setAttribute(name, value); else if (value === null) return this.removeAttribute(name); else if (value === undefined) return this.getAttribute(name);
            }
        });

        $.implement(accessors);

        // shortcuts
        $.implement({
            check: function() {
                return this.checked(true);
            },
            uncheck: function() {
                return this.checked(false);
            },
            disable: function() {
                return this.disabled(true);
            },
            enable: function() {
                return this.disabled(false);
            },
            select: function() {
                return this.selected(true);
            },
            deselect: function() {
                return this.selected(false);
            }
        });

        // classNames, has / add / remove Class
        $.implement({
            classNames: function() {
                return classes(this[0].className);
            },
            hasClass: function(className) {
                return array.indexOf(this.classNames(), className) > -1;
            },
            addClass: function(className) {
                this.forEach(function(node) {
                    var nodeClassName = node.className;
                    var classNames = classes(nodeClassName + " " + className).join(" ");
                    if (nodeClassName != classNames) node.className = classNames;
                });
                return this;
            },
            removeClass: function(className) {
                this.forEach(function(node) {
                    var classNames = classes(node.className);
                    array.forEach(classes(className), function(className) {
                        var index = array.indexOf(classNames, className);
                        if (index > -1) classNames.splice(index, 1);
                    });
                    node.className = classNames.join(" ");
                });
                return this;
            }
        });

        // toString
        $.prototype.toString = function() {
            var tag = this.tag(), id = this.id(), classes = this.classNames();
            var str = tag;
            if (id) str += "#" + id;
            if (classes.length) str += "." + classes.join(".");
            return str;
        };

        var textProperty = document.createElement("div").textContent == null ? "innerText" : "textContent";

        // tag, html, text
        $.implement({
            tag: function() {
                return this[0].tagName.toLowerCase();
            },
            html: function(html) {
                if (html != null) {
                    this.forEach(function(node) {
                        node.innerHTML = html;
                    });
                    return this;
                }
                return this[0].innerHTML;
            },
            text: function(text) {
                if (text != undefined) {
                    this.forEach(function(node) {
                        node[textProperty] = text;
                    });
                    return this;
                }
                return this[0][textProperty];
            }
        });

        module.exports = $;
    },
    "5": function(require, module, exports, global) {
        /*
elements events
*/
                "use strict";

        var $ = require("2"), array = require("6").prototype;

        module.exports = $.implement({
            // straight es5 prototypes (or emulated methods)
            forEach: array.forEach,
            map: array.map,
            filter: array.filter,
            every: array.every,
            some: array.some
        });
    },
    "6": function(require, module, exports, global) {
        /*
array
 - es5 array shell
*/
                "use strict";

        var shell = require("7");

        var proto = Array.prototype;

        var array = shell({
            filter: proto.filter || function(fn, context) {
                var results = [];
                for (var i = 0, l = this.length >>> 0; i < l; i++) if (i in this) {
                    var value = this[i];
                    if (fn.call(context, value, i, this)) results.push(value);
                }
                return results;
            },
            indexOf: proto.indexOf || function(item, from) {
                for (var l = this.length >>> 0, i = from < 0 ? Math.max(0, l + from) : from || 0; i < l; i++) {
                    if (i in this && this[i] === item) return i;
                }
                return -1;
            },
            map: proto.map || function(fn, context) {
                var length = this.length >>> 0, results = Array(length);
                for (var i = 0, l = length; i < l; i++) {
                    if (i in this) results[i] = fn.call(context, this[i], i, this);
                }
                return results;
            },
            forEach: proto.forEach || function(fn, context) {
                for (var i = 0, l = this.length >>> 0; i < l; i++) {
                    if (i in this) fn.call(context, this[i], i, this);
                }
            },
            every: proto.every || function(fn, context) {
                for (var i = 0, l = this.length >>> 0; i < l; i++) {
                    if (i in this && !fn.call(context, this[i], i, this)) return false;
                }
                return true;
            },
            some: proto.some || function(fn, context) {
                for (var i = 0, l = this.length >>> 0; i < l; i++) {
                    if (i in this && fn.call(context, this[i], i, this)) return true;
                }
                return false;
            }
        });

        array.isArray = Array.isArray || function(self) {
            return Object.prototype.toString.call(self) === "[object Array]";
        };

        /*:*/
        var methods = {};

        var names = "pop,push,reverse,shift,sort,splice,unshift,concat,join,slice,lastIndexOf,reduce,reduceRight".split(",");

        for (var i = 0, name, method; name = names[i++]; ) if (method = proto[name]) methods[name] = method;

        array.implement(methods);

        module.exports = array;
    },
    "7": function(require, module, exports, global) {
        /*
shell 🐚
*/
                "use strict";

        var prime = require("3"), slice = Array.prototype.slice;

        var shell = prime({
            mutator: function(key, method) {
                this[key] = function(self) {
                    var args = arguments.length > 1 ? slice.call(arguments, 1) : [];
                    return method.apply(self, args);
                };
                this.prototype[key] = method;
            },
            constructor: {
                prototype: {}
            }
        });

        module.exports = function(proto) {
            var inherits = proto.inherits || (proto.inherits = shell);
            proto.constructor = prime.create(inherits);
            return prime(proto);
        };
    },
    "8": function(require, module, exports, global) {
        /*
string methods
 - inherits from es5/string
*/
                "use strict";

        var shell = require("7");

        var string = shell({
            inherits: require("9"),
            /*(string.contains)?*/
            contains: function(string, separator) {
                return (separator ? (separator + this + separator).indexOf(separator + string + separator) : (this + "").indexOf(string)) > -1;
            },
            /*:*/
            /*(string.clean)?*/
            clean: function() {
                return string.trim((this + "").replace(/\s+/g, " "));
            },
            /*:*/
            /*(string.camelize)?*/
            camelize: function() {
                return (this + "").replace(/-\D/g, function(match) {
                    return match.charAt(1).toUpperCase();
                });
            },
            /*:*/
            /*(string.hyphenate)?*/
            hyphenate: function() {
                return (this + "").replace(/[A-Z]/g, function(match) {
                    return "-" + match.toLowerCase();
                });
            },
            /*:*/
            /*(string.capitalize)?*/
            capitalize: function() {
                return (this + "").replace(/\b[a-z]/g, function(match) {
                    return match.toUpperCase();
                });
            },
            /*:*/
            /*(string.escape)?*/
            // « https://github.com/slevithan/XRegExp/blob/master/src/xregexp.js
            escape: function() {
                return (this + "").replace(/([-.*+?^${}()|[\]\/\\])/g, "\\$1");
            },
            /*:*/
            /*(string.number)?*/
            number: function() {
                return parseFloat(this);
            }
        });

        /*(string.decode)?*/
        if (typeof JSON !== "undefined") string.implement({
            decode: function() {
                return JSON.parse(this);
            }
        });

        /*:*/
        module.exports = string;
    },
    "9": function(require, module, exports, global) {
        /*
string
 - es5 string shell
*/
                "use strict";

        var shell = require("7");

        var proto = String.prototype;

        var string = shell({
            trim: proto.trim || function() {
                return (this + "").replace(/^\s+|\s+$/g, "");
            }
        });

        var methods = {};

        var names = "charAt,charCodeAt,concat,indexOf,lastIndexOf,match,quote,replace,search,slice,split,substr,substring,toLowerCase,toUpperCase".split(",");

        for (var i = 0, name, method; name = names[i++]; ) if (method = proto[name]) methods[name] = method;

        string.implement(methods);

        module.exports = string;
    },
    a: function(require, module, exports, global) {
        /*
elements insertion
*/
                "use strict";

        var $ = require("5");

        // base insertion
        $.implement({
            appendChild: function(child) {
                this[0].appendChild($(child)[0]);
                return this;
            },
            insertBefore: function(child, ref) {
                this[0].insertBefore($(child)[0], $(ref)[0]);
                return this;
            },
            removeChild: function(child) {
                this[0].removeChild($(child)[0]);
                return this;
            },
            replaceChild: function(child, ref) {
                this[0].replaceChild($(child)[0], $(ref)[0]);
                return this;
            }
        });

        // before, after, bottom, top
        $.implement({
            before: function(element) {
                element = $(element)[0];
                var parent = element.parentNode;
                if (parent) this.forEach(function(node) {
                    parent.insertBefore(node, element);
                });
                return this;
            },
            after: function(element) {
                element = $(element)[0];
                var parent = element.parentNode;
                if (parent) this.forEach(function(node) {
                    parent.insertBefore(node, element.nextSibling);
                });
                return this;
            },
            bottom: function(element) {
                element = $(element)[0];
                this.forEach(function(node) {
                    element.appendChild(node);
                });
                return this;
            },
            top: function(element) {
                element = $(element)[0];
                this.forEach(function(node) {
                    element.insertBefore(node, element.firstChild);
                });
                return this;
            }
        });

        // insert, replace
        $.implement({
            insert: $.prototype.bottom,
            replace: function(element) {
                element = $(element)[0];
                element.parentNode.replaceChild(this[0], element);
                return this;
            }
        });

        module.exports = $;
    },
    b: function(require, module, exports, global) {
        /*
elements events
*/
                "use strict";

        var $ = require("2"), prime = require("3"), Emitter = require("c");

        var html = document.documentElement;

        var addEventListener = html.addEventListener ? function(node, event, handle) {
            node.addEventListener(event, handle, false);
            return handle;
        } : function(node, event, handle) {
            node.attachEvent("on" + event, handle);
            return handle;
        };

        var removeEventListener = html.removeEventListener ? function(node, event, handle) {
            node.removeEventListener(event, handle, false);
        } : function(node, event, handle) {
            node.detachEvent("on" + event, handle);
        };

        var NodesEmitter = prime({
            inherits: Emitter,
            on: function(event, handle) {
                this.handle(function(node) {
                    NodesEmitter.parent.on.call(this, event, handle);
                    var self = this, domListeners = this._domListeners || (this._domListeners = {});
                    if (!domListeners[event]) domListeners[event] = addEventListener(node, event, function(e) {
                        self.emit(event, e || window.event);
                    });
                });
                return this;
            },
            off: function(event, handle) {
                this.handle(function(node) {
                    var domListeners = this._domListeners, domEvent, listeners = this._listeners, events;
                    if (domListeners && (domEvent = domListeners[event]) && listeners && (events = listeners[event])) {
                        NodesEmitter.parent.off.call(this, event, handle);
                        var empty = true, k, l;
                        for (k in events) {
                            empty = false;
                            break;
                        }
                        if (empty) {
                            removeEventListener(node, event, domEvent);
                            delete domListeners[event];
                            for (l in domListeners) empty = false;
                            if (empty) delete this._domListeners;
                        }
                    }
                });
                return this;
            },
            emit: function(event) {
                var args = arguments;
                this.handle(function(node) {
                    NodesEmitter.parent.emit.apply(this, args);
                });
                return this;
            }
        });

        module.exports = $.use(NodesEmitter);
    },
    c: function(require, module, exports, global) {
        /*
Emitter
*/
                "use strict";

        var prime = require("3"), array = require("6");

        module.exports = prime({
            on: function(event, fn) {
                var listeners = this._listeners || (this._listeners = {}), events = listeners[event] || (listeners[event] = []);
                if (!events.length || array.indexOf(events, fn) === -1) events.push(fn);
                return this;
            },
            off: function(event, fn) {
                var listeners = this._listeners, events;
                if (listeners && (events = listeners[event]) && events.length) {
                    var index = array.indexOf(events, fn);
                    if (index > -1) events.splice(index, 1);
                }
                return this;
            },
            emit: function(event) {
                var listeners = this._listeners, events;
                if (listeners && (events = listeners[event]) && events.length) {
                    var args = arguments.length > 1 ? array.slice(arguments, 1) : [];
                    array.forEach(events.slice(), function(event) {
                        event.apply(this, args);
                    }, this);
                }
                return this;
            }
        });
    },
    d: function(require, module, exports, global) {
        /*
Slick Integration
*/
                "use strict";

        var $ = require("2"), array = require("6"), slick = require("e");

        $.use(slick);

        var walk = function(combinator, method) {
            return function(expression) {
                var parts = slick.parse(expression || "*");
                expression = array.map(parts, function(part) {
                    return combinator + " " + part;
                }).join(", ");
                if (this.length === 1) return $(expression, this[0]);
                if (method === "search") return $(this.handle(function(node, i, buffer) {
                    buffer.push.apply(buffer, slick.search(expression, node));
                }));
                if (method === "find") return $(this.handle(function(node) {
                    return slick.find(expression, node);
                }));
            };
        };

        $.implement({
            search: function(expression) {
                if (this.length === 1) return $(expression, this[0]);
                return $(this.handle(function(node, i, buffer) {
                    buffer.push.apply(buffer, slick.search(expression, node));
                }));
            },
            find: function(expression) {
                if (this.length === 1) return $(slick.find(expression, this[0]));
                return $(this.handle(function(node, i, buffer) {
                    buffer.push(slick.find(expression, node));
                }));
            },
            matches: function(expression) {
                return slick.matches(this[0], expression);
            },
            nextSiblings: walk("~", "search"),
            nextSibling: walk("+", "find"),
            previousSiblings: walk("!~", "search"),
            previousSibling: walk("!+", "find"),
            children: walk(">", "find"),
            parent: function(expression) {
                return $(this.handle(function(node, i, buffer) {
                    while (node = node.parentNode) {
                        if (!expression || slick.matches(node, expression)) return !buffer.push(node);
                    }
                }));
            },
            parents: function(expression) {
                return $(this.handle(function(node, i, buffer) {
                    while (node = node.parentNode) {
                        if (!expression || slick.matches(node, expression)) buffer.push(node);
                    }
                }));
            }
        });

        module.exports = $;
    },
    e: function(require, module, exports, global) {
        /*
main
*/
                "use strict";

        var parse = require("f"), slick = require("g");

        slick.parse = parse;

        module.exports = slick;
    },
    f: function(require, module, exports, global) {
        /*
Slick Parser
 - originally created by the almighty Thomas Aylott <@subtlegradient> (http://subtlegradient.com)
*/
                "use strict";

        // Notable changes from Slick.Parser 1.0.x
        // The parser now uses 2 classes: Expressions and Expression
        // `new Expressions` produces an array-like object containing a list of Expression objects
        // - Expressions::toString() produces a cleaned up expressions string
        // `new Expression` produces an array-like object
        // - Expression::toString() produces a cleaned up expression string
        // The only exposed method is parse, which produces a (cached) `new Expressions` instance
        // parsed.raw is no longer present, use .toString()
        // parsed.expression is now useless, just use the indexes
        // parsed.reverse() has been removed for now, due to its apparent uselessness
        // Other changes in the Expressions object:
        // - classNames are now unique, and save both escaped and unescaped values
        // - attributes now save both escaped and unescaped values
        // - pseudos now save both escaped and unescaped values
        var escapeRe = /([-.*+?^${}()|[\]\/\\])/g, unescapeRe = /\\/g;

        var escape = function(string) {
            // XRegExp v2.0.0-beta-3
            // « https://github.com/slevithan/XRegExp/blob/master/src/xregexp.js
            return (string + "").replace(escapeRe, "\\$1");
        };

        var unescape = function(string) {
            return (string + "").replace(unescapeRe, "");
        };

        var slickRe = RegExp(/*
#!/usr/bin/env ruby
puts "\t\t" + DATA.read.gsub(/\(\?x\)|\s+#.*$|\s+|\\$|\\n/,'')
__END__
    "(?x)^(?:\
      \\s* ( , ) \\s*               # Separator          \n\
    | \\s* ( <combinator>+ ) \\s*   # Combinator         \n\
    |      ( \\s+ )                 # CombinatorChildren \n\
    |      ( <unicode>+ | \\* )     # Tag                \n\
    | \\#  ( <unicode>+       )     # ID                 \n\
    | \\.  ( <unicode>+       )     # ClassName          \n\
    |                               # Attribute          \n\
    \\[  \
        \\s* (<unicode1>+)  (?:  \
            \\s* ([*^$!~|]?=)  (?:  \
                \\s* (?:\
                    ([\"']?)(.*?)\\9 \
                )\
            )  \
        )?  \\s*  \
    \\](?!\\]) \n\
    |   :+ ( <unicode>+ )(?:\
    \\( (?:\
        (?:([\"'])([^\\12]*)\\12)|((?:\\([^)]+\\)|[^()]*)+)\
    ) \\)\
    )?\
    )"
*/
        "^(?:\\s*(,)\\s*|\\s*(<combinator>+)\\s*|(\\s+)|(<unicode>+|\\*)|\\#(<unicode>+)|\\.(<unicode>+)|\\[\\s*(<unicode1>+)(?:\\s*([*^$!~|]?=)(?:\\s*(?:([\"']?)(.*?)\\9)))?\\s*\\](?!\\])|(:+)(<unicode>+)(?:\\((?:(?:([\"'])([^\\13]*)\\13)|((?:\\([^)]+\\)|[^()]*)+))\\))?)".replace(/<combinator>/, "[" + escape(">+~`!@$%^&={}\\;</") + "]").replace(/<unicode>/g, "(?:[\\w\\u00a1-\\uFFFF-]|\\\\[^\\s0-9a-f])").replace(/<unicode1>/g, "(?:[:\\w\\u00a1-\\uFFFF-]|\\\\[^\\s0-9a-f])"));

        // Part
        var Part = function Part(combinator) {
            this.combinator = combinator || " ";
            this.tag = "*";
        };

        Part.prototype.toString = function() {
            if (!this.raw) {
                var xpr = "", k, part;
                xpr += this.tag || "*";
                if (this.id) xpr += "#" + this.id;
                if (this.classes) xpr += "." + this.classList.join(".");
                if (this.attributes) for (k = 0; part = this.attributes[k++]; ) {
                    xpr += "[" + part.name + (part.operator ? part.operator + '"' + part.value + '"' : "") + "]";
                }
                if (this.pseudos) for (k = 0; part = this.pseudos[k++]; ) {
                    xpr += ":" + part.name;
                    if (part.value) xpr += "(" + part.value + ")";
                }
                this.raw = xpr;
            }
            return this.raw;
        };

        // Expression
        var Expression = function Expression() {
            this.length = 0;
        };

        Expression.prototype.toString = function() {
            if (!this.raw) {
                var xpr = "";
                for (var j = 0, bit; bit = this[j++]; ) {
                    if (j !== 1) xpr += " ";
                    if (bit.combinator !== " ") xpr += bit.combinator + " ";
                    xpr += bit;
                }
                this.raw = xpr;
            }
            return this.raw;
        };

        var replacer = function(rawMatch, separator, combinator, combinatorChildren, tagName, id, className, attributeKey, attributeOperator, attributeQuote, attributeValue, pseudoMarker, pseudoClass, pseudoQuote, pseudoClassQuotedValue, pseudoClassValue) {
            var expression, current;
            if (separator || !this.length) {
                expression = this[this.length++] = new Expression();
                if (separator) return "";
            }
            if (!expression) expression = this[this.length - 1];
            if (combinator || combinatorChildren || !expression.length) {
                current = expression[expression.length++] = new Part(combinator);
            }
            if (!current) current = expression[expression.length - 1];
            if (tagName) {
                current.tag = unescape(tagName);
            } else if (id) {
                current.id = unescape(id);
            } else if (className) {
                var unescaped = unescape(className);
                var classes = current.classes || (current.classes = {});
                if (!classes[unescaped]) {
                    classes[unescaped] = escape(className);
                    (current.classList || (current.classList = [])).push(unescaped);
                }
            } else if (pseudoClass) {
                pseudoClassValue = pseudoClassValue || pseudoClassQuotedValue;
                (current.pseudos || (current.pseudos = [])).push({
                    type: pseudoMarker.length == 1 ? "class" : "element",
                    name: unescape(pseudoClass),
                    escapedName: escape(pseudoClass),
                    value: pseudoClassValue ? unescape(pseudoClassValue) : null,
                    escapedValue: pseudoClassValue ? escape(pseudoClassValue) : null
                });
            } else if (attributeKey) {
                attributeValue = attributeValue ? escape(attributeValue) : null;
                (current.attributes || (current.attributes = [])).push({
                    operator: attributeOperator,
                    name: unescape(attributeKey),
                    escapedName: escape(attributeKey),
                    value: attributeValue ? unescape(attributeValue) : null,
                    escapedValue: attributeValue ? escape(attributeValue) : null
                });
            }
            return "";
        };

        // Expressions
        var Expressions = function Expressions(expression) {
            this.length = 0;
            var self = this;
            while (expression) expression = expression.replace(slickRe, function() {
                return replacer.apply(self, arguments);
            });
        };

        Expressions.prototype.toString = function() {
            if (!this.raw) {
                var expressions = [];
                for (var i = 0, expression; expression = this[i++]; ) expressions.push(expression);
                this.raw = expressions.join(", ");
            }
            return this.raw;
        };

        var cache = {};

        var parse = function(expression) {
            if (expression == null) return null;
            expression = ("" + expression).replace(/^\s+|\s+$/g, "");
            return cache[expression] || (cache[expression] = new Expressions(expression));
        };

        module.exports = parse;
    },
    g: function(require, module, exports, global) {
        /*
Finder Finder
*/
                "use strict";

        // Notable changes from Slick.Finder 1.0.x
        // faster bottom -> up expression matching
        // prefers mental sanity over *obsessive compulsive* milliseconds savings
        // uses prototypes instead of objects
        // tries to use matchesSelector smartly, whenever available
        // can populate objects as well as arrays
        // lots of stuff is broken or not implemented
        var parse = require("f");

        // utilities
        var uniqueIndex = 0;

        var uniqueID = function(node) {
            return node.uniqueNumber || (node.uniqueNumber = "s:" + uniqueIndex++);
        };

        var uniqueIDXML = function(node) {
            var uid = node.getAttribute("uniqueNumber");
            if (!uid) {
                uid = "s:" + uniqueIndex++;
                node.setAttribute("uniqueNumber", uid);
            }
            return uid;
        };

        var isArray = Array.isArray || function(object) {
            return Object.prototype.toString.call(object) === "[object Array]";
        };

        // tests
        var HAS = {
            GET_ELEMENT_BY_ID: function(test, id) {
                // checks if the document has getElementById, and it works
                test.innerHTML = '<a id="' + id + '"></a>';
                return !!this.getElementById(id);
            },
            QUERY_SELECTOR: function(test) {
                // this supposedly fixes a webkit bug with matchesSelector / querySelector & nth-child
                test.innerHTML = "_<style>:nth-child(2){}</style>";
                // checks if the document has querySelectorAll, and it works
                test.innerHTML = '<a class="MiX"></a>';
                return test.querySelectorAll(".MiX").length === 1;
            },
            EXPANDOS: function(test, id) {
                // checks if the document has elements that support expandos
                test._custom_property_ = id;
                return test._custom_property_ === id;
            },
            // TODO: use this ?
            // CHECKED_QUERY_SELECTOR: function(test){
            //
            //     // checks if the document supports the checked query selector
            //     test.innerHTML = '<select><option selected="selected">a</option></select>'
            //     return test.querySelectorAll(':checked').length === 1
            // },
            // TODO: use this ?
            // EMPTY_ATTRIBUTE_QUERY_SELECTOR: function(test){
            //
            //     // checks if the document supports the empty attribute query selector
            //     test.innerHTML = '<a class=""></a>'
            //     return test.querySelectorAll('[class*=""]').length === 1
            // },
            MATCHES_SELECTOR: function(test) {
                test.innerHTML = '<a class="MiX"></a>';
                // checks if the document has matchesSelector, and we can use it.
                var matches = test.matchesSelector || test.mozMatchesSelector || test.webkitMatchesSelector;
                // if matchesSelector trows errors on incorrect syntax we can use it
                if (matches) try {
                    matches.call(test, ":slick");
                } catch (e) {
                    // just as a safety precaution, also test if it works on mixedcase (like querySelectorAll)
                    return matches.call(test, ".MiX") ? matches : false;
                }
                return false;
            },
            GET_ELEMENTS_BY_CLASS_NAME: function(test) {
                test.innerHTML = '<a class="f"></a><a class="b"></a>';
                if (test.getElementsByClassName("b").length !== 1) return false;
                test.firstChild.className = "b";
                if (test.getElementsByClassName("b").length !== 2) return false;
                // Opera 9.6 getElementsByClassName doesnt detects the class if its not the first one
                test.innerHTML = '<a class="a"></a><a class="f b a"></a>';
                if (test.getElementsByClassName("a").length !== 2) return false;
                // tests passed
                return true;
            },
            // no need to know
            // GET_ELEMENT_BY_ID_NOT_NAME: function(test, id){
            //     test.innerHTML = '<a name="'+ id +'"></a><b id="'+ id +'"></b>'
            //     return this.getElementById(id) !== test.firstChild
            // },
            // this is always checked for and fixed
            // STAR_GET_ELEMENTS_BY_TAG_NAME: function(test){
            //
            //     // IE returns comment nodes for getElementsByTagName('*') for some documents
            //     test.appendChild(this.createComment(''))
            //     if (test.getElementsByTagName('*').length > 0) return false
            //
            //     // IE returns closed nodes (EG:"</foo>") for getElementsByTagName('*') for some documents
            //     test.innerHTML = 'foo</foo>'
            //     if (test.getElementsByTagName('*').length) return false
            //
            //     // tests passed
            //     return true
            // },
            // this is always checked for and fixed
            // STAR_QUERY_SELECTOR: function(test){
            //
            //     // returns closed nodes (EG:"</foo>") for querySelector('*') for some documents
            //     test.innerHTML = 'foo</foo>'
            //     return !!(test.querySelectorAll('*').length)
            // },
            GET_ATTRIBUTE: function(test) {
                // tests for working getAttribute implementation
                var shout = "fus ro dah";
                test.innerHTML = '<a class="' + shout + '"></a>';
                return test.firstChild.getAttribute("class") === shout;
            }
        };

        // Finder
        var Finder = function Finder(document) {
            this.document = document;
            var root = this.root = document.documentElement;
            this.tested = {};
            // uniqueID
            this.uniqueID = this.has("EXPANDOS") ? uniqueID : uniqueIDXML;
            // getAttribute
            this.getAttribute = this.has("GET_ATTRIBUTE") ? function(node, name) {
                return node.getAttribute(name);
            } : function(node, name) {
                var node = node.getAttributeNode(name);
                return node && node.specified ? node.value : null;
            };
            // hasAttribute
            this.hasAttribute = root.hasAttribute ? function(node, attribute) {
                return node.hasAttribute(attribute);
            } : function(node, attribute) {
                node = node.getAttributeNode(attribute);
                return !!(node && node.specified);
            };
            // contains
            this.contains = document.contains && root.contains ? function(context, node) {
                return context.contains(node);
            } : root.compareDocumentPosition ? function(context, node) {
                return context === node || !!(context.compareDocumentPosition(node) & 16);
            } : function(context, node) {
                do {
                    if (node === context) return true;
                } while (node = node.parentNode);
                return false;
            };
            // sort
            // credits to Sizzle (http://sizzlejs.com/)
            this.sorter = root.compareDocumentPosition ? function(a, b) {
                if (!a.compareDocumentPosition || !b.compareDocumentPosition) return 0;
                return a.compareDocumentPosition(b) & 4 ? -1 : a === b ? 0 : 1;
            } : "sourceIndex" in root ? function(a, b) {
                if (!a.sourceIndex || !b.sourceIndex) return 0;
                return a.sourceIndex - b.sourceIndex;
            } : document.createRange ? function(a, b) {
                if (!a.ownerDocument || !b.ownerDocument) return 0;
                var aRange = a.ownerDocument.createRange(), bRange = b.ownerDocument.createRange();
                aRange.setStart(a, 0);
                aRange.setEnd(a, 0);
                bRange.setStart(b, 0);
                bRange.setEnd(b, 0);
                return aRange.compareBoundaryPoints(Range.START_TO_END, bRange);
            } : null;
            this.failed = {};
            var nativeMatches = this.has("MATCHES_SELECTOR");
            if (nativeMatches) this.matchesSelector = function(node, expression) {
                if (this.failed[expression]) return true;
                try {
                    return nativeMatches.call(node, expression);
                } catch (e) {
                    if (slick.debug) console.warn("matchesSelector failed on " + expression);
                    return this.failed[expression] = true;
                }
            };
            if (this.has("QUERY_SELECTOR")) {
                this.querySelectorAll = function(node, expression) {
                    if (this.failed[expression]) return true;
                    var result, _id, _expression, _slick_id, _combinator;
                    // non-document rooted QSA
                    // credits to Andrew Dupont
                    if (node !== this.document) {
                        _combinator = expression[0].combinator;
                        _id = node.getAttribute("id");
                        _expression = expression;
                        if (!_id) {
                            _slick_id = true;
                            _id = "__slick__";
                            node.setAttribute("id", _id);
                        }
                        expression = "#" + _id + " " + _expression;
                        // these combinators need a parentNode due to how querySelectorAll works, which is:
                        // finding all the elements that match the given selector
                        // then filtering by the ones that have the specified element as an ancestor
                        if (_combinator.indexOf("~") > -1 || _combinator.indexOf("+") > -1) {
                            node = node.parentNode;
                            if (!node) result = true;
                        }
                    }
                    if (!result) try {
                        result = node.querySelectorAll(expression);
                    } catch (e) {
                        if (slick.debug) console.warn("querySelectorAll failed on " + (_expression || expression));
                        result = this.failed[_expression || expression] = true;
                    }
                    if (_slick_id) node.removeAttribute("id");
                    return result;
                };
            }
        };

        Finder.prototype.has = function(FEATURE) {
            var tested = this.tested, testedFEATURE = tested[FEATURE];
            if (testedFEATURE != null) return testedFEATURE;
            var root = this.root, document = this.document, testNode = document.createElement("div");
            testNode.setAttribute("style", "display: none;");
            root.appendChild(testNode);
            var TEST = HAS[FEATURE], result = false;
            if (TEST) try {
                result = TEST.call(document, testNode, "s:" + uniqueIndex++);
            } catch (e) {}
            if (slick.debug && !result) console.warn("document has no " + FEATURE);
            root.removeChild(testNode);
            return tested[FEATURE] = result;
        };

        Finder.prototype.search = function(context, expression, found) {
            if (!context) context = this.document; else if (context.document) context = context.document;
            var expressions = parse(expression);
            if (!expressions || !expressions.length) throw new Error("invalid expression");
            if (!found) found = [];
            var uniques, push = isArray(found) ? function(node) {
                found[found.length] = node;
            } : function(node) {
                found[found.length++] = node;
            };
            if (expressions.length > 1) {
                uniques = {};
                var plush = push;
                push = function(node) {
                    var uid = uniqueID(node);
                    if (!uniques[uid]) {
                        uniques[uid] = true;
                        plush(node);
                    }
                };
            }
            // walker
            var expression, node;
            main: for (var i = 0; expression = expressions[i++]; ) {
                // querySelector
                // TODO: more functional tests
                if (!slick.noQSA && this.querySelectorAll) {
                    var nodes = this.querySelectorAll(context, expression);
                    if (nodes !== true) {
                        if (nodes && nodes.length) for (var j = 0; node = nodes[j++]; ) if (node.nodeName > "@") {
                            push(node);
                        }
                        continue main;
                    }
                }
                var expressionLength = expression.length;
                var nodes = this.last(context, expression[expressionLength - 1], uniques);
                if (!nodes.length) continue;
                var expressionIndex = expressionLength - 2;
                for (var n = 0; node = nodes[n++]; ) if (this.validate(context, node, expressionIndex, expression)) {
                    push(node);
                }
            }
            if (uniques && found && found.length > 1) this.sort(found);
            return found;
        };

        Finder.prototype.sort = function(nodes) {
            return this.sorter ? Array.prototype.sort.call(nodes, this.sorter) : nodes;
        };

        Finder.prototype.validate = function(context, node, expressionIndex, expression) {
            var bit = expression[expressionIndex], check, combinator;
            if (!bit) {
                // last
                combinator = expression[expressionIndex + 1].combinator;
                check = function(node) {
                    return node === context;
                };
            } else {
                combinator = expression[expressionIndex-- + 1].combinator;
                var self = this;
                check = function(node) {
                    return self.match(node, bit) && self.validate(context, node, expressionIndex, expression);
                };
            }
            switch (combinator) {
              // children of
                case " ":
                while (node = node.parentNode) {
                    if (check(node)) return true;
                }
                break;

              // direct children of
                case ">":
                {
                    node = node.parentNode;
                    if (check(node)) return true;
                }
                break;

              // next siblings of
                case "~":
                while (node = node.previousSibling) {
                    if (node.nodeType === 1 && check(node)) return true;
                }
                break;

              // next sibling of
                case "+":
                while (node = node.previousSibling) {
                    if (node.nodeType === 1) return check(node);
                }
                break;

              // previous sibling of
                case "!+":
                while (node = node.nextSibling) {
                    if (node.nodeType === 1) return check(node);
                }
                break;

              // previous siblings of
                case "!~":
                while (node = node.nextSibling) {
                    if (node.nodeType === 1 && check(node)) return true;
                }
                break;
            }
            return false;
        };

        // TODO: most of these pseudo selectors include <html> and qsa doesnt. fixme.
        var pseudos = {
            // TODO: returns different results than qsa empty.
            empty: function() {
                var child = this.firstChild;
                return !(this && this.nodeType === 1) && !(this.innerText || this.textContent || "").length;
            },
            not: function(expression) {
                return !slick.match(this, expression);
            },
            contains: function(text) {
                return (this.innerText || this.textContent || "").indexOf(text) > -1;
            },
            "first-child": function() {
                var node = this;
                while (node = node.previousSibling) if (node.nodeType == 1) return false;
                return true;
            },
            "last-child": function() {
                var node = this;
                while (node = node.nextSibling) if (node.nodeType == 1) return false;
                return true;
            },
            "only-child": function() {
                var prev = this;
                while (prev = prev.previousSibling) if (prev.nodeType == 1) return false;
                var next = this;
                while (next = next.nextSibling) if (next.nodeType == 1) return false;
                return true;
            },
            "first-of-type": function() {
                var node = this, nodeName = node.nodeName;
                while (node = node.previousSibling) if (node.nodeName == nodeName) return false;
                return true;
            },
            "last-of-type": function() {
                var node = this, nodeName = node.nodeName;
                while (node = node.nextSibling) if (node.nodeName == nodeName) return false;
                return true;
            },
            "only-of-type": function() {
                var prev = this, nodeName = this.nodeName;
                while (prev = prev.previousSibling) if (prev.nodeName == nodeName) return false;
                var next = this;
                while (next = next.nextSibling) if (next.nodeName == nodeName) return false;
                return true;
            },
            enabled: function() {
                return !this.disabled;
            },
            disabled: function() {
                return this.disabled;
            },
            checked: function() {
                return this.checked || this.selected;
            },
            selected: function() {
                return this.selected;
            },
            focus: function() {
                var doc = this.ownerDocument;
                return doc.activeElement === this && (this.href || this.type || slick.hasAttribute(this, "tabindex"));
            },
            root: function() {
                return this === this.ownerDocument.documentElement;
            }
        };

        Finder.prototype.match = function(node, bit, noTag, noId, noClass) {
            // TODO: more functional tests ?
            if (!slick.noQSA && this.matchesSelector) {
                var matches = this.matchesSelector(node, bit);
                if (matches !== true) return matches;
            }
            // normal matching
            if (!noTag && bit.tag) {
                var nodeName = node.nodeName.toLowerCase();
                if (bit.tag === "*") {
                    if (nodeName < "@") return false;
                } else if (nodeName != bit.tag) {
                    return false;
                }
            }
            if (!noId && bit.id && node.getAttribute("id") !== bit.id) return false;
            var i, part;
            if (!noClass && bit.classes) {
                var className = this.getAttribute(node, "class");
                if (!className) return false;
                for (var part in bit.classes) if (!RegExp("(^|\\s)" + bit.classes[part] + "(\\s|$)").test(className)) return false;
            }
            if (bit.attributes) for (i = 0; part = bit.attributes[i++]; ) {
                var operator = part.operator, name = part.name, value = part.value, escaped = part.escapedValue;
                if (!operator) {
                    if (!this.hasAttribute(node, name)) return false;
                } else {
                    var actual = this.getAttribute(node, name);
                    if (actual == null) return false;
                    switch (operator) {
                      case "^=":
                        if (!RegExp("^" + escaped).test(actual)) return false;
                        break;

                      case "$=":
                        if (!RegExp(escaped + "$").test(actual)) return false;
                        break;

                      case "~=":
                        if (!RegExp("(^|\\s)" + escaped + "(\\s|$)").test(actual)) return false;
                        break;

                      case "|=":
                        if (!RegExp("^" + escaped + "(-|$)").test(actual)) return false;
                        break;

                      case "=":
                        if (actual !== value) return false;
                        break;

                      case "*=":
                        if (actual.indexOf(value) === -1) return false;
                        break;

                      default:
                        return false;
                    }
                }
            }
            if (bit.pseudos) for (i = 0; part = bit.pseudos[i++]; ) {
                var name = part.name, value = part.value;
                if (pseudos[name]) return pseudos[name].call(node, value);
                if (value != null) {
                    if (this.getAttribute(node, name) !== value) return false;
                } else {
                    if (!this.hasAttribute(node, name)) return false;
                }
            }
            return true;
        };

        Finder.prototype.matches = function(node, expression) {
            var expressions = parse(expression);
            if (expressions.length === 1 && expressions[0].length === 1) {
                // simplest match
                return this.match(node, expressions[0][0]);
            }
            // TODO: more functional tests ?
            if (!slick.noQSA && this.matchesSelector) {
                var matches = this.matchesSelector(node, expressions);
                if (matches !== true) return matches;
            }
            var nodes = this.search(node, expression, {
                length: 0
            });
            for (var i = 0, res; res = nodes[i++]; ) if (node === res) return true;
            return false;
        };

        Finder.prototype.last = function(node, bit, uniques) {
            var item, items, found = {
                length: 0
            };
            var noId = !bit.id, noTag = !bit.tag, noClass = !bit.classes;
            if (bit.id && node.getElementById && this.has("GET_ELEMENT_BY_ID")) {
                item = node.getElementById(bit.id);
                // return only if id is found, else keep checking
                // might be a tad slower on non-existing ids, but less insane
                if (item && item.getAttribute("id") === bit.id) {
                    items = [ item ];
                    noId = true;
                    // if tag is star, no need to check it in match()
                    if (bit.tag === "*") noTag = true;
                }
            }
            if (!items) {
                if (bit.classes && node.getElementsByClassName && this.has("GET_ELEMENTS_BY_CLASS_NAME")) {
                    items = node.getElementsByClassName(bit.classList);
                    if (!items || !items.length) return found;
                    noClass = true;
                    // if tag is star, no need to check it in match()
                    if (bit.tag === "*") noTag = true;
                } else {
                    items = node.getElementsByTagName(bit.tag);
                    if (!items || !items.length) return found;
                    // if tag is star, need to check it in match because it could select junk, boho
                    if (bit.tag !== "*") noTag = true;
                }
            }
            if (!uniques && noTag && noId && noClass && !bit.attributes && !bit.pseudos) return items;
            for (var i = 0; item = items[i++]; ) if ((!uniques || !uniques[this.uniqueID(item)]) && (noTag && noId && noClass && !bit.attributes && !bit.pseudos || this.match(item, bit, noTag, noId, noClass))) found[found.length++] = item;
            return found;
        };

        var finders = {};

        var finder = function(context) {
            var doc = context || document;
            if (doc.document) doc = doc.document; else if (doc.ownerDocument) doc = doc.ownerDocument;
            if (doc.nodeType !== 9) throw new TypeError("invalid document");
            var uid = uniqueID(doc);
            return finders[uid] || (finders[uid] = new Finder(doc));
        };

        // ... API ...
        var slick = function(expression, context) {
            return slick.search(expression, context);
        };

        slick.search = function(expression, context, found) {
            return finder(context).search(context, expression, found);
        };

        slick.find = function(expression, context) {
            return finder(context).search(context, expression)[0] || null;
        };

        slick.getAttribute = function(node, name) {
            return finder(node).getAttribute(node, name);
        };

        slick.hasAttribute = function(node, name) {
            return finder(node).hasAttribute(node, name);
        };

        slick.contains = function(context, node) {
            return finder(context).contains(context, node);
        };

        slick.matches = function(node, expression) {
            return finder(node).matches(node, expression);
        };

        slick.sort = function(nodes) {
            if (nodes && nodes.length > 1) finder(nodes[0]).sort(nodes);
            return nodes;
        };

        // slick.debug = true
        // slick.noQSA  = true
        module.exports = slick;
    },
    h: function(require, module, exports, global) {
                "use strict";

        var prime = require("3");

        var $ = require("1");

        var Event = prime({
            constructor: function(event) {
                if (!(this instanceof Event)) return new Event(event);
                this.event = event;
            },
            type: function() {
                return this.event.type;
            },
            target: function() {
                var event = this.event;
                var target = event.target || event.srcElement;
                while (target && target.nodeType == 3) target = target.parentNode;
                return $(target);
            },
            stopPropagation: function() {
                if (this.event.stopPropagation) this.event.stopPropagation(); else this.event.cancelBubble = true;
                return this;
            },
            preventDefault: function() {
                if (this.event.preventDefault) this.event.preventDefault(); else this.event.returnValue = false;
                return this;
            }
        });

        module.exports = Event;
    },
    i: function(require, module, exports, global) {
        /*
domready
*/
                "use strict";

        var $ = require("b");

        var readystatechange = "onreadystatechange" in document, shouldPoll = false, loaded = false, readys = [], checks = [], ready = null, timer = null, test = document.createElement("div"), doc = $(document), win = $(window);

        var domready = function() {
            if (timer) timer = clearTimeout(timer);
            if (!loaded) {
                if (readystatechange) doc.off("readystatechange", check);
                doc.off("DOMContentLoaded", domready);
                win.off("load", domready);
                loaded = true;
                for (var i = 0; ready = readys[i++]; ) ready();
            }
            return loaded;
        };

        var check = function() {
            for (var i = checks.length; i--; ) if (checks[i]()) return domready();
            return false;
        };

        var poll = function() {
            clearTimeout(timer);
            if (!check()) timer = setTimeout(poll, 1e3 / 60);
        };

        if (document.readyState) {
            // use readyState if available
            var complete = function() {
                return !!/loaded|complete/.test(document.readyState);
            };
            checks.push(complete);
            if (!complete()) {
                // unless dom is already loaded
                if (readystatechange) doc.on("readystatechange", check); else shouldPoll = true;
            } else {
                // dom is already loaded
                domready();
            }
        }

        if (test.doScroll) {
            // also use doScroll if available (doscroll comes before readyState "complete")
            // LEGAL DEPT:
            // doScroll technique discovered by, owned by, and copyrighted to Diego Perini http://javascript.nwbox.com/IEContentLoaded/
            // testElement.doScroll() throws when the DOM is not ready, only in the top window
            var scrolls = function() {
                try {
                    test.doScroll();
                    return true;
                } catch (e) {}
                return false;
            };
            // If doScroll works already, it can't be used to determine domready
            // e.g. in an iframe
            if (!scrolls()) {
                checks.push(scrolls);
                shouldPoll = true;
            }
        }

        if (shouldPoll) poll();

        // make sure that domready fires before load, also if not onreadystatechange and doScroll and DOMContentLoaded load will fire
        doc.on("DOMContentLoaded", domready);

        win.on("load", domready);

        module.exports = function(ready) {
            loaded ? ready() : readys.push(ready);
            return null;
        };
    }
});