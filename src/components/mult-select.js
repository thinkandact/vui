var request = require('../request'),
    utils   = require('../utils'),
    lang    = require('../lang/lang'),
    forEach = utils.forEach,
    caches  = {}

module.exports = {
    template: require('./mult-select.html'),
    replace: true,
    paramAttributes: ['src', 'placeholder', 'single'],
    methods: {
        open: function () {
            if (this.$open) return
            this.$open = true
            setTimeout(function () {
                utils.addClass(this.$el, 'active')
                document.body.addEventListener('click', this.$closeHandle)
            }.bind(this), 50)
        },
        close: function () {
            if (!this.$open) return
            this.$open = false

            utils.removeClass(this.$el, 'active')
            document.body.removeEventListener('click', this.$closeHandle)
        },
        select: function (item, setOnly) {
            if (this.single) {
                this.text = item.text
                if (item.value != this.value)
                    this.value = item.value
            } else {
                var index = this.values.indexOf(item)
                if (index === -1) {
                    this.values.push(item)
                } else if (!setOnly) {
                    this.values.splice(index, 1)
                }
                var v = [], t = []
                this.values.forEach(function (i) {
                    v.push(i.value)
                    t.push(i.text)
                })

                var vs = v.join(',')
                if (vs !== this.value) {
                    this.value = vs
                }
                this.text = t.join(',')
            }
        },
        setValue: function (value) {
            if (undefined === value) {
                this.text = null
                return
            }

            var values = value
            if ('string' === typeof value)
                values = this.single ? [value.toString()] : value.split(',')

            forEach(this.options, function (item) {
                if (values.indexOf(item.value.toString()) >= 0)
                    this.select(item, true)
            }.bind(this))
        }
    },
    data: {
        options: [],
        values: []
    },
    created: function () {
        var self = this
        this.values = []
        utils.addClass(this.$el, 'select')

        if (this.src) {
            if (caches[this.src]) {
                this.options = caches[this.src]
                this.setValue(this.value)
            } else {
                request.get(this.src).end(function (res) {
                    if (res.body instanceof Array) {
                        self.options = res.body
                    } else if (res.body.status === 1) {
                        self.options = res.body.data
                    }
                    self.setValue(self.value)
                    caches[self.src] = self.options
                })
            }
        }

        this.$closeHandle = function (evt) {
            if (utils.isDescendant(self.$el, evt.target)) return
            self.close()
        }

        this.$watch('value', function (value, mut) {
            this.setValue(value)
        }.bind(this))
    }
}