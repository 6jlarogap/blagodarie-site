// Version 1.6.5 three-spritetext - https://github.com/vasturiano/three-spritetext
!function(t, e) {
    "object" == typeof exports && "undefined" != typeof module ? module.exports = e(require("three")) : "function" == typeof define && define.amd ? define(["three"], e) : (t = "undefined" != typeof globalThis ? globalThis : t || self).SpriteText = e(t.THREE)
}(this, (function(t) {
    "use strict";
    function e(t, e) {
        if (!(t instanceof e))
            throw new TypeError("Cannot call a class as a function")
    }
    function r(t, e) {
        for (var r = 0; r < e.length; r++) {
            var i = e[r];
            i.enumerable = i.enumerable || !1,
            i.configurable = !0,
            "value"in i && (i.writable = !0),
            Object.defineProperty(t, i.key, i)
        }
    }
    function i(t) {
        return i = Object.setPrototypeOf ? Object.getPrototypeOf : function(t) {
            return t.__proto__ || Object.getPrototypeOf(t)
        }
        ,
        i(t)
    }
    function n(t, e) {
        return n = Object.setPrototypeOf || function(t, e) {
            return t.__proto__ = e,
            t
        }
        ,
        n(t, e)
    }
    function o(t, e) {
        if (e && ("object" == typeof e || "function" == typeof e))
            return e;
        if (void 0 !== e)
            throw new TypeError("Derived constructors may only return object or undefined");
        return function(t) {
            if (void 0 === t)
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return t
        }(t)
    }
    function a(t) {
        var e = function() {
            if ("undefined" == typeof Reflect || !Reflect.construct)
                return !1;
            if (Reflect.construct.sham)
                return !1;
            if ("function" == typeof Proxy)
                return !0;
            try {
                return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], (function() {}
                ))),
                !0
            } catch (t) {
                return !1
            }
        }();
        return function() {
            var r, n = i(t);
            if (e) {
                var a = i(this).constructor;
                r = Reflect.construct(n, arguments, a)
            } else
                r = n.apply(this, arguments);
            return o(this, r)
        }
    }
    function h(t, e) {
        return function(t) {
            if (Array.isArray(t))
                return t
        }(t) || function(t, e) {
            var r = null == t ? null : "undefined" != typeof Symbol && t[Symbol.iterator] || t["@@iterator"];
            if (null == r)
                return;
            var i, n, o = [], a = !0, h = !1;
            try {
                for (r = r.call(t); !(a = (i = r.next()).done) && (o.push(i.value),
                !e || o.length !== e); a = !0)
                    ;
            } catch (t) {
                h = !0,
                n = t
            } finally {
                try {
                    a || null == r.return || r.return()
                } finally {
                    if (h)
                        throw n
                }
            }
            return o
        }(t, e) || u(t, e) || function() {
            throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
        }()
    }
    function s(t) {
        return function(t) {
            if (Array.isArray(t))
                return c(t)
        }(t) || function(t) {
            if ("undefined" != typeof Symbol && null != t[Symbol.iterator] || null != t["@@iterator"])
                return Array.from(t)
        }(t) || u(t) || function() {
            throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
        }()
    }
    function u(t, e) {
        if (t) {
            if ("string" == typeof t)
                return c(t, e);
            var r = Object.prototype.toString.call(t).slice(8, -1);
            return "Object" === r && t.constructor && (r = t.constructor.name),
            "Map" === r || "Set" === r ? Array.from(t) : "Arguments" === r || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? c(t, e) : void 0
        }
    }
    function c(t, e) {
        (null == e || e > t.length) && (e = t.length);
        for (var r = 0, i = new Array(e); r < e; r++)
            i[r] = t[r];
        return i
    }
    var f = "undefined" != typeof window && window.THREE ? window.THREE : {
        LinearFilter: t.LinearFilter,
        Sprite: t.Sprite,
        SpriteMaterial: t.SpriteMaterial,
        Texture: t.Texture
    }
      , l = function(t) {
        !function(t, e) {
            if ("function" != typeof e && null !== e)
                throw new TypeError("Super expression must either be null or a function");
            t.prototype = Object.create(e && e.prototype, {
                constructor: {
                    value: t,
                    writable: !0,
                    configurable: !0
                }
            }),
            Object.defineProperty(t, "prototype", {
                writable: !1
            }),
            e && n(t, e)
        }(l, t);
        var i, o, u, c = a(l);
        function l() {
            var t, r = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "", i = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 10, n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : "rgba(255, 255, 255, 1)";
            return e(this, l),
            (t = c.call(this, new f.SpriteMaterial))._text = "".concat(r),
            t._textHeight = i,
            t._color = n,
            t._backgroundColor = !1,
            t._padding = 0,
            t._borderWidth = 0,
            t._borderRadius = 0,
            t._borderColor = "white",
            t._strokeWidth = 0,
            t._strokeColor = "white",
            t._fontFace = "Arial",
            t._fontSize = 90,
            t._fontWeight = "normal",
            t._canvas = document.createElement("canvas"),
            t._genCanvas(),
            t
        }
        return i = l,
        (o = [{
            key: "text",
            get: function() {
                return this._text
            },
            set: function(t) {
                this._text = t,
                this._genCanvas()
            }
        }, {
            key: "textHeight",
            get: function() {
                return this._textHeight
            },
            set: function(t) {
                this._textHeight = t,
                this._genCanvas()
            }
        }, {
            key: "color",
            get: function() {
                return this._color
            },
            set: function(t) {
                this._color = t,
                this._genCanvas()
            }
        }, {
            key: "backgroundColor",
            get: function() {
                return this._backgroundColor
            },
            set: function(t) {
                this._backgroundColor = t,
                this._genCanvas()
            }
        }, {
            key: "padding",
            get: function() {
                return this._padding
            },
            set: function(t) {
                this._padding = t,
                this._genCanvas()
            }
        }, {
            key: "borderWidth",
            get: function() {
                return this._borderWidth
            },
            set: function(t) {
                this._borderWidth = t,
                this._genCanvas()
            }
        }, {
            key: "borderRadius",
            get: function() {
                return this._borderRadius
            },
            set: function(t) {
                this._borderRadius = t,
                this._genCanvas()
            }
        }, {
            key: "borderColor",
            get: function() {
                return this._borderColor
            },
            set: function(t) {
                this._borderColor = t,
                this._genCanvas()
            }
        }, {
            key: "fontFace",
            get: function() {
                return this._fontFace
            },
            set: function(t) {
                this._fontFace = t,
                this._genCanvas()
            }
        }, {
            key: "fontSize",
            get: function() {
                return this._fontSize
            },
            set: function(t) {
                this._fontSize = t,
                this._genCanvas()
            }
        }, {
            key: "fontWeight",
            get: function() {
                return this._fontWeight
            },
            set: function(t) {
                this._fontWeight = t,
                this._genCanvas()
            }
        }, {
            key: "strokeWidth",
            get: function() {
                return this._strokeWidth
            },
            set: function(t) {
                this._strokeWidth = t,
                this._genCanvas()
            }
        }, {
            key: "strokeColor",
            get: function() {
                return this._strokeColor
            },
            set: function(t) {
                this._strokeColor = t,
                this._genCanvas()
            }
        }, {
            key: "_genCanvas",
            value: function() {
                var t = this
                  , e = this._canvas
                  , r = e.getContext("2d")
                  , i = Array.isArray(this.borderWidth) ? this.borderWidth : [this.borderWidth, this.borderWidth]
                  , n = i.map((function(e) {
                    return e * t.fontSize * .1
                }
                ))
                  , o = (Array.isArray(this.borderRadius) ? this.borderRadius : [this.borderRadius, this.borderRadius, this.borderRadius, this.borderRadius]).map((function(e) {
                    return e * t.fontSize * .1
                }
                ))
                  , a = Array.isArray(this.padding) ? this.padding : [this.padding, this.padding]
                  , u = a.map((function(e) {
                    return e * t.fontSize * .1
                }
                ))
                  , c = this.text.split("\n")
                  , l = "".concat(this.fontWeight, " ").concat(this.fontSize, "px ").concat(this.fontFace);
                r.font = l;
                var d = Math.max.apply(Math, s(c.map((function(t) {
                    return r.measureText(t).width
                }
                ))))
                  , g = this.fontSize * c.length;
                if (e.width = d + 2 * n[0] + 2 * u[0],
                e.height = g + 2 * n[1] + 2 * u[1],
                this.borderWidth) {
                    if (r.strokeStyle = this.borderColor,
                    n[0]) {
                        var p = n[0] / 2;
                        r.lineWidth = n[0],
                        r.beginPath(),
                        r.moveTo(p, o[0]),
                        r.lineTo(p, e.height - o[3]),
                        r.moveTo(e.width - p, o[1]),
                        r.lineTo(e.width - p, e.height - o[2]),
                        r.stroke()
                    }
                    if (n[1]) {
                        var y = n[1] / 2;
                        r.lineWidth = n[1],
                        r.beginPath(),
                        r.moveTo(Math.max(n[0], o[0]), y),
                        r.lineTo(e.width - Math.max(n[0], o[1]), y),
                        r.moveTo(Math.max(n[0], o[3]), e.height - y),
                        r.lineTo(e.width - Math.max(n[0], o[2]), e.height - y),
                        r.stroke()
                    }
                    if (this.borderRadius) {
                        var b = Math.max.apply(Math, s(n))
                          , v = b / 2;
                        r.lineWidth = b,
                        r.beginPath(),
                        [!!o[0] && [o[0], v, v, o[0]], !!o[1] && [e.width - o[1], e.width - v, v, o[1]], !!o[2] && [e.width - o[2], e.width - v, e.height - v, e.height - o[2]], !!o[3] && [o[3], v, e.height - v, e.height - o[3]]].filter((function(t) {
                            return t
                        }
                        )).forEach((function(t) {
                            var e = h(t, 4)
                              , i = e[0]
                              , n = e[1]
                              , o = e[2]
                              , a = e[3];
                            r.moveTo(i, o),
                            r.quadraticCurveTo(n, o, n, a)
                        }
                        )),
                        r.stroke()
                    }
                }
                this.backgroundColor && (r.fillStyle = this.backgroundColor,
                this.borderRadius ? (r.beginPath(),
                r.moveTo(n[0], o[0]),
                [[n[0], o[0], e.width - o[1], n[1], n[1], n[1]], [e.width - n[0], e.width - n[0], e.width - n[0], n[1], o[1], e.height - o[2]], [e.width - n[0], e.width - o[2], o[3], e.height - n[1], e.height - n[1], e.height - n[1]], [n[0], n[0], n[0], e.height - n[1], e.height - o[3], o[0]]].forEach((function(t) {
                    var e = h(t, 6)
                      , i = e[0]
                      , n = e[1]
                      , o = e[2]
                      , a = e[3]
                      , s = e[4]
                      , u = e[5];
                    r.quadraticCurveTo(i, a, n, s),
                    r.lineTo(o, u)
                }
                )),
                r.closePath(),
                r.fill()) : r.fillRect(n[0], n[1], e.width - 2 * n[0], e.height - 2 * n[1])),
                r.translate.apply(r, s(n)),
                r.translate.apply(r, s(u)),
                r.font = l,
                r.fillStyle = this.color,
                r.textBaseline = "bottom";
                var _ = this.strokeWidth > 0;
                _ && (r.lineWidth = this.strokeWidth * this.fontSize / 10,
                r.strokeStyle = this.strokeColor),
                c.forEach((function(e, i) {
                    var n = (d - r.measureText(e).width) / 2
                      , o = (i + 1) * t.fontSize;
                    _ && r.strokeText(e, n, o),
                    r.fillText(e, n, o)
                }
                )),
                this.material.map && this.material.map.dispose();
                var m = this.material.map = new f.Texture(e);
                m.minFilter = f.LinearFilter,
                m.needsUpdate = !0;
                var w = this.textHeight * c.length + 2 * i[1] + 2 * a[1];
                this.scale.set(w * e.width / e.height, w, 0)
            }
        }, {
            key: "clone",
            value: function() {
                return new this.constructor(this.text,this.textHeight,this.color).copy(this)
            }
        }, {
            key: "copy",
            value: function(t) {
                return f.Sprite.prototype.copy.call(this, t),
                this.color = t.color,
                this.backgroundColor = t.backgroundColor,
                this.padding = t.padding,
                this.borderWidth = t.borderWidth,
                this.borderColor = t.borderColor,
                this.fontFace = t.fontFace,
                this.fontSize = t.fontSize,
                this.fontWeight = t.fontWeight,
                this.strokeWidth = t.strokeWidth,
                this.strokeColor = t.strokeColor,
                this
            }
        }]) && r(i.prototype, o),
        u && r(i, u),
        Object.defineProperty(i, "prototype", {
            writable: !1
        }),
        l
    }(f.Sprite);
    return l
}
));
