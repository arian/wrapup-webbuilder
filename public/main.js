(function(modules) {
    var cache = {}, require = function(id) {
        var module;
        if (module = cache[id]) return module.exports;
        module = cache[id] = {
            exports: {}
        };
        var exports = module.exports;
        modules[id].call(exports, require, module, exports, window);
        return module.exports;
    };
    require("0");
})({
    "0": function(require, module, exports, global) {
        var $ = require("1");
        var string = require("9");
        var CodeMirror = window.CodeMirror;
        $.ready(function() {
            var textarea = document.getElementById("editor");
            var value = string.trim(textarea.value);
            textarea.value = "";
            var editor = CodeMirror.fromTextArea(textarea, {
                mode: "javascript",
                indentWithTabs: true,
                lineNumbers: true,
                matchBrackets: true,
                indentUnit: 4
            });
            editor.setValue(value);
            var line, i = 0;
            while ((line = editor.getLine(i)) !== undefined) {
                editor.indentLine(i++);
            }
        });
    },
    "1": function(require, module, exports, global) {
        "use strict";
        var $ = require("2");
        require("4");
        require("a");
        require("b");
        require("5");
        require("d");
        module.exports = $;
    },
    "2": function(require, module, exports, global) {
        "use strict";
        var prime = require("3");
        var uniqueIndex = 0;
        var uniqueID = function(n) {
            return n === global ? "global" : n.uniqueNumber || (n.uniqueNumber = "n:" + (uniqueIndex++).toString(36));
        };
        var instances = {};
        var search, sort;
        var $ = prime({
            constructor: function nodes(n, context) {
                if (n == null) return null;
                if (n instanceof Nodes) return n;
                var self = new Nodes;
                if (n.nodeType || n === global) {
                    self[self.length++] = n;
                } else if (typeof n === "string") {
                    if (search) search(n, context, self);
                } else if (n.length) {
                    var uniques = {};
                    for (var i = 0, l = n.length; i < l; i++) {
                        var nodes = $(n[i], context);
                        if (nodes && nodes.length) for (var j = 0, k = nodes.length; j < k; j++) {
                            var node = nodes[j], uid = uniqueID(node);
                            if (!uniques[uid]) {
                                self[self.length++] = node;
                                uniques[uid] = true;
                            }
                        }
                    }
                    if (sort && self.length > 1) sort(self);
                }
                if (!self.length) return null;
                if (self.length === 1) {
                    var uid = uniqueID(self[0]);
                    return instances[uid] || (instances[uid] = self);
                }
                return self;
            }
        });
        var Nodes = prime({
            inherits: $,
            constructor: function Nodes() {
                this.length = 0;
            },
            handle: function handle(method) {
                var buffer = [], length = this.length;
                if (length === 1) {
                    var res = method.call(this, this[0], 0, buffer);
                    if (res != null && res !== false && res !== true) buffer.push(res);
                } else for (var i = 0; i < length; i++) {
                    var node = this[i], res = method.call($(node), node, i, buffer);
                    if (res === false || res === true) break;
                    if (res != null) buffer.push(res);
                }
                return buffer;
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
        "use strict";
        var has = function(self, key) {
            return Object.hasOwnProperty.call(self, key);
        };
        var each = function(object, method, context) {
            for (var key in object) if (method.call(context, object[key], key, object) === false) break;
            return object;
        };
        if (!{
            valueOf: 0
        }.propertyIsEnumerable("valueOf")) {
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
        var create = Object.create || function(self) {
            var F = function() {};
            F.prototype = self;
            return new F;
        };
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
            var constructor = has(proto, "constructor") ? proto.constructor : superprime ? function() {
                return superproto.constructor.apply(this, arguments);
            } : function() {};
            if (superprime) {
                var cproto = constructor.prototype = create(superproto);
                constructor.parent = superproto;
                cproto.constructor = constructor;
            }
            constructor.mutator = proto.mutator || superprime && superprime.mutator || mutator;
            constructor.implement = implement;
            return constructor.implement(proto);
        };
        prime.each = each;
        prime.has = has;
        prime.create = create;
        module.exports = prime;
    },
    "4": function(require, module, exports, global) {
        "use strict";
        var $ = require("5"), string = require("8"), array = require("6");
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
        $.implement(function() {
            var properties = {};
            array.forEach("type,value,name,href,title".split(","), function(name) {
                properties[name] = function(value) {
                    if (arguments.length) {
                        this.forEach(function(node) {
                            node[name] = value;
                        });
                        return this;
                    }
                    return this[0][name];
                };
            });
            return properties;
        }());
        $.implement(function() {
            var booleans = {};
            array.forEach("checked,disabled,selected".split(","), function(name) {
                booleans[name] = function(value) {
                    if (arguments.length) {
                        this.forEach(function(node) {
                            node[name] = !!value;
                        });
                        return this;
                    }
                    return !!this[0][name];
                };
            });
            return booleans;
        }());
        var classes = function(className) {
            var classNames = string.clean(className).split(" "), uniques = {};
            return array.filter(classNames, function(className) {
                if (className !== "" && !uniques[className]) return uniques[className] = className;
            }).sort();
        };
        $.implement({
            classNames: function() {
                return classes(this[0].className);
            },
            className: function(className) {
                if (arguments.length) {
                    this.forEach(function(node) {
                        node.className = classes(className).join(" ");
                    });
                    return this;
                }
                return this.classNames().join(" ");
            },
            id: function(id) {
                var node = this[0];
                if (arguments.length) node.id = id; else return node.id;
                return this;
            },
            tag: function() {
                return this[0].tagName.toLowerCase();
            }
        });
        $.implement({
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
        $.prototype.toString = function() {
            var tag = this.tag(), id = this.id(), classes = this.classNames();
            var str = tag;
            if (id) str += "#" + id;
            if (classes.length) str += "." + classes.join(".");
            return str;
        };
        module.exports = $;
    },
    "5": function(require, module, exports, global) {
        "use strict";
        var $ = require("2"), list = require("6").prototype;
        module.exports = $.implement({
            forEach: list.forEach,
            map: list.map,
            filter: list.filter,
            every: list.every,
            some: list.some
        });
    },
    "6": function(require, module, exports, global) {
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
        var methods = {};
        var names = "pop,push,reverse,shift,sort,splice,unshift,concat,join,slice,lastIndexOf,reduce,reduceRight".split(",");
        for (var i = 0, name, method; name = names[i++]; ) if (method = proto[name]) methods[name] = method;
        array.implement(methods);
        module.exports = array;
    },
    "7": function(require, module, exports, global) {
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
        "use strict";
        var shell = require("7");
        var string = shell({
            inherits: require("9"),
            contains: function(string, separator) {
                return (separator ? (separator + this + separator).indexOf(separator + string + separator) : (this + "").indexOf(string)) > -1;
            },
            clean: function() {
                return string.trim((this + "").replace(/\s+/g, " "));
            },
            camelize: function() {
                return (this + "").replace(/-\D/g, function(match) {
                    return match.charAt(1).toUpperCase();
                });
            },
            hyphenate: function() {
                return (this + "").replace(/[A-Z]/g, function(match) {
                    return "-" + match.toLowerCase();
                });
            },
            capitalize: function() {
                return (this + "").replace(/\b[a-z]/g, function(match) {
                    return match.toUpperCase();
                });
            },
            escape: function() {
                return (this + "").replace(/([-.*+?^${}()|[\]\/\\])/g, "\\$1");
            },
            number: function() {
                return parseFloat(this);
            }
        });
        if (typeof JSON !== "undefined") string.implement({
            decode: function() {
                return JSON.parse(this);
            }
        });
        module.exports = string;
    },
    "9": function(require, module, exports, global) {
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
        "use strict";
        var $ = require("5");
        $.implement({
            appendChild: function(child) {
                this[0].appendChild($(child)[0]);
                return this;
            },
            insertBefore: function(child) {
                this[0].insertBefore($(child)[0]);
                return this;
            },
            removeChild: function(child) {
                this[0].removeChild($(child)[0]);
                return this;
            },
            replaceChild: function(child) {
                this[0].replaceChild($(child)[0]);
                return this;
            }
        });
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
        $.implement({
            insert: $.prototype.bottom,
            remove: function() {
                this.forEach(function(node) {
                    var parent = node.parentNode;
                    if (parent) parent.removeChild(node);
                });
                return this;
            },
            replace: function(element) {
                element = $(element)[0];
                element.parentNode.replaceChild(this[0], element);
                return this;
            }
        });
        module.exports = $;
    },
    b: function(require, module, exports, global) {
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
                    NodesEmitter.parent.off.call(this, event, handle);
                    var domListeners = this._domListeners, domEvent, listeners = this._listeners, events;
                    if (domListeners && (domEvent = domListeners[event]) && listeners && (events = listeners[event]) && !events.length) {
                        removeEventListener(node, event, domEvent);
                        delete domListeners[event];
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
                for (var i = 0; ready = readys[i++]; ) ready.call($);
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
            var complete = function() {
                return !!/loaded|complete/.test(document.readyState);
            };
            checks.push(complete);
            if (!complete()) {
                if (readystatechange) doc.on("readystatechange", check); else shouldPoll = true;
            } else {
                domready();
            }
        }
        if (test.doScroll) {
            var scrolls = function() {
                try {
                    test.doScroll();
                    return true;
                } catch (e) {}
                return false;
            };
            if (!scrolls()) {
                checks.push(scrolls);
                shouldPoll = true;
            }
        }
        if (shouldPoll) poll();
        doc.on("DOMContentLoaded", domready);
        win.on("load", domready);
        $.ready = function(ready) {
            loaded ? ready.call($) : readys.push(ready);
            return $;
        };
        module.exports = $;
    }
});