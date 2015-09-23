/**
 * @desc 基于react-router，对传进来的路由名单进行过滤出最终白名单，对其进行访问权限控制, 支持UMD写法
 * @author kxj0206@gmail.com
 * @namespace RouteLimiter
 * @version 1.0.5
 *
 * @interface { init, canAccess, limit }
 * @example 在可以获取菜单或者路由数据的地方，RouteLimiter.init(list, config, callback);
 *          在App.js 挂载的render函数或者在挂载之前，执行RouteLimiter.limit(this), this => react 对象
 *          在任何子页面使用 RouteLimiter.canAccess(path) 判断是否能访问该feature
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['react-router-limiter'], factory);
    } else if (typeof exports === 'object') {
        // Node, CommonJS-like
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.RouteLimiter = factory();
    }
}(this, function () {
    var keys = Object.keys || require('object-keys');

    var limiter = {
        /**
         * @desc 用于存储白名单中元素对应的key
         * @example _whiteListKeys = ['vegetable', 'tools'], 我们需要根据数组中的属性名去获取数据结构中对应的值
         * @type {Array}
         * @private
         */
        _whiteListKeys: [],

        /**
         * @desc 用于存储路由中可访问的路由
         * @type {Array}
         * @private
         */
        _whiteList: [],

        /**
         * @desc 重定向地址
         * @type {String} 默认指向根路径
         * @private
         */
        _redirectURL: '/',

        /**
         * @desc 路由权限控制
         * @param me {Object} 在react-router中的指向React对象的值, 包含路由信息
         * @public
         */
        limit: function (me) {
            var router = me._reactInternalInstance._context.router.getCurrentRoutes(),
                // 获取当前router数据
                currentRouter = router[router.length - 1],
                name = currentRouter.name || '',
                pathId = this._getPathId(name),
                redirectURL = this._redirectURL;

            // 如果名称没有`=`, 则说明其不在菜单列表
            if (pathId === -1) return;
            
            // 变化hash来更新数据
            if (this._whiteList.indexOf(pathId) === -1) {
                setTimeout(
                    function () {
                        location.hash = redirectURL;
                    },
                    10
                );
                location.hash = '';
            }
        },

        /**
         * @desc 判断传进来的值是否在白名单中，即是否可以被访问
         * @param value {String} 用于判断是否在白名单中的值
         * @return {Boolean} true => 可以被访问, false => 不可被访问
         * @public
         */
        canAccess: function (value) {
            // 如果白名单中不包含该值，则返回false
            if (this._whiteList.indexOf(value) === -1) return false;
            return true;
        },

        /**
         * @desc 遍历数据，获取数据中具备对应白名单中的key对应的值，并存储至_whiteList
         * @param data {Object} 数据或者对象
         * @private
         */
        _traversalData: function (data) {
            var me = this;
            keys(data).forEach(function (key) {
                var item  = data[key];
                if (typeof item === 'object' && item !== null) {
                    me._traversalData(item);
                } else {
                    // 如果对应的key值为白名单中需要存储的值 
                    if (me._whiteListKeys.indexOf(key) !== -1) {
                        me._whiteList.push(item);
                    }
                }
            });
        },

        /**
         * @desc 从路径字符串中获取对应的menuItemId
         * @param str {String} 来自于Route里面的name
         * @return {Number}
         * @private
         */
        _getPathId: function (str) {
            var index = str.indexOf('=');
            if (index === -1) return index;
            return str.substr(index + 1);
        },

        /**
         * @desc 如果传进config, 则初始化原始数据
         * @param config {Object} 来自于Route里面的name
         * @private
         */
        _initData: function (config) {
            // 白名单对应的key值
            if (config.whiteListKeys) {
                this._whiteListKeys = [].concat(config.whiteListKeys);
            }

            // 存储路由访问中自定义的白名单路由
            if (config.whiteElements) {
                this._whiteList = [].concat(config.whiteElements);
            }

            // 如果不可访问，指定重定向地址
            if (config.redirectURL) {
                this._redirectURL = config.redirectURL;
            }
        },

        /**
         * @desc 初始化需要路由限制条件
         * @param list     {Array} 必传，需要把路由白名单过滤出来的路由数据结构
         * @param config   [Object|Array] 可选，特殊情况处理的数据结构
         * @param callback [Function] 可选，回调函数中的`list`参数为取到的路由白名单
         * @private
         */
        init: function (list, config, callback) {
            var typeofConfig = typeof config;
            if (typeofConfig === 'object') {
                // 初始化对应的数据
                this._initData(config);
            } else if (typeofConfig === 'function') {
                // 因为第二三个参数为可选，所以这么处理
                callback = config;
            }

            // 遍历数据，生成白名单
            // TODO: 如果数据结构过于复杂，会产生性能问题, 可以写个算法优化
            this._traversalData(list);

            if (typeof callback === 'function') {
                callback(this._whiteList);
            }
        }
    };

    return limiter;
}));
