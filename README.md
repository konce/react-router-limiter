# react-router-limiter
Use to limite url with your config whatever from, like a controller

# Usage
1. 基于react-router的场景使用
2. 在数据获取处，进行初始化，使用Limiter.init(list, config, callback)
3. 在App.js入口处的render，使用Limiter.limit(this); this 为react对象
4. 在子页面中使用Limiter.canAccess('path'), 返回波尔值，判断该路径是否能被访问
5. 所有访问的页面的route，都需要加上`name`属性，并且必须`name="oooo=xxxx"`, 其中`xxxx`为白名单中可能包括的值
6. 链接或者按钮需要发生跳转或者请求，请务必加上`to`属性，比如`to="oooo=xxxx"`,指向某个页面或者请求


# Limiter.init(list, config, callback)
以下为参数:
- list: 用于获取的数据，后续用来根据config排查出最终的白名单
- config: 做一些定制化的需求, 包括以下属性
    - whiteListKeys: 必传，用于做筛查需要的feature使用，白名单的key值
    - whiteElements: 选传，用于增加白名单中的数据
    - redirectURL: 选传，如果访问路径不在白名单内，则跳转到该路径，默认为根路径
- callback: 回调函数, 传的形参为白名单列表

# Limiter.limit(me)
以下为参数:
- me: 指向react对象,  最好在App.js入口处加入
```
    render() {
        var tpl;
        if (this.state) {
            if (this.state.isLogin) {
                // 在整个节点载入前做判断，或者在更早的环节做判断也可以
                RouteLimiter.limit(this);
                tpl = [<Header data={this.state.data} > </Header>,
                    <Menu menuList={this.state.menuList} className="col-8"></Menu>,
                    <div className="page-main-container col-24" >
                        <div className = "page-main-wrapper" >
                            <ReactRouter.RouteHandler />
                        </div>
                    </div>
                ];
            } else {
                tpl = [ <Login onLoginSuccess = {this.onLoginSuccess.bind(this)} > </Login>,];
            }
        } else {
            tpl = null
        }

        return (<div className="main row" style = {{height: '100%'}} > {tpl} </div>);
    }
```

# Limiter.canAccess
以下为参数:
- path: 用于判断是否有访问权限的路径，返回true or false
