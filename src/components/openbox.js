var Vue     = require('vue'),
    utils   = require('../utils'),
    request = require('../request'),
    route   = require('../route')

/*
 * show: default -false 创建时是否显示
 * callback: [function, this] 关闭时回调方法
 */

function openbox(opts) {
    var callback = opts.callback,

        Openbox = Vue.extend({
            template: require('./openbox.html'),
            replace: true,
            methods: {
                show: function () {
                    utils.addClass(this.$el, 'open')
                    var box = this.$el.querySelector('.openbox-content')
                    box.style.width = this.width
                },
                bgclose: function (e) {
                    var box = this.$el.querySelector('.openbox-content')
                    if (e.target == box || utils.isDescendant(box, e.target)) return
                    this.close()
                },
                close: function (suc) {
                    if (suc && callback) callback(this.modals)
                    this.$destroy()
                },
                getComponent: function () {
                }
            },
            data: {
                title: opts.title,
                width: opts.width || 600,
                modals: {},
                src: opts.src
            },
            created: function () {
                document.body.appendChild(this.$el)
                var self = this
                if (opts.btns) {
                    self.btns = []
                    utils.forEach(opts.btns, function (btn) {
                        if (typeof btn === 'string') {
                            switch(btn) {
                                case 'close':
                                    self.btns.push({ text: '关 闭', type:'default', fn: self.close.bind(self) })
                                    break
                                case 'ok':
                                    self.btns.push({ text: '确 定', type:'primary', fn: self.close.bind(self, true) })
                                    break
                            }
                        } else {
                            self.btns.push(btn)
                        }
                    })
                }

                this.$watch('src', function () {
                    route.getComponent(this.src, function () {
                        this.content = this.src
                    }.bind(this))
                }.bind(this))
            },

            ready: function () {
            }
        }),

        vm = new Openbox()

    /*
    function createComponent(src) {
        request.getTemplate(src).end(function (temp) {
            Vue.component(src, {
                template: temp
            })

            vm.content = src
        })
    }

    createComponent(opts.src)
    */
    if (opts.show) vm.show()
   
    //return vm
}


module.exports = openbox