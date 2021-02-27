
import React from 'react'

import {lifeCycles} from '../core/keeper'
import {isFuntion} from '../utils/index'

function keepaliveLifeCycle(Component) {
  return class Hoc extends React.Component {
    cur = null
    handerLifeCycle = type => {
      if (!this.cur) return
      const lifeCycleFunc = this.cur[type]
      isFuntion(lifeCycleFunc) && lifeCycleFunc.call(this.cur)
    }
    componentDidMount() {
      const {cacheId} = this.props
      cacheId && (lifeCycles[cacheId] = this.handerLifeCycle)
    }
    componentWillUnmount() {
      const {cacheId} = this.props
      delete lifeCycles[cacheId]
    }
     render=() => <Component {...this.props}
         ref={cur => (this.cur = cur)}
                  />
  }
}

export default keepaliveLifeCycle
