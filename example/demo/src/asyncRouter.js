import React from 'react'

const routerObserveQueue = []

/* 懒加载路由卫士钩子 */
export const RouterHooks = {
    /* 路由组件加载之前 */
    beforeRouterComponentLoad: function (callback) {
        routerObserveQueue.push({
            type: 'before',
            callback
        })
    },
    /* 路由组件加载之后 */
    afterRouterComponentDidLoaded(callback) {
        routerObserveQueue.push({
            type: 'after',
            callback
        })
    }
}

/* 路由懒加载HOC */
export default function AsyncRouter(loadRouter) {
    return class Content extends React.Component {
        constructor(props) {
            super(props)
            this.dispatchRouterQueue('before')
        }
        state = {
            Component: null
        }
        dispatchRouterQueue(type) {
            const {
                history
            } = this.props
            routerObserveQueue.forEach(item => {
                if (item.type === type) item.callback(history)
            })
        }
        componentDidMount() {
            if (this.state.Component) return
            loadRouter()
                .then(module => module.default)
                .then(Component => this.setState({
                        Component
                    },
                    () => {
                        this.dispatchRouterQueue('after')
                    }))
        }
        render() {
            const {
                Component
            } = this.state
            return Component ? < Component {
                ...this.props
            }
                               /> : null
        }
    }
}
