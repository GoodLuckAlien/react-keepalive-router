import React from 'react'
import hoistNonReactStatic from 'hoist-non-react-statics'

import ExtendsSelfHoc from './extendsSelf'
import {
  lifeCycles
} from '../core/keeper'
import {
  funCur,
  isFuntion
} from '../utils/index'


function keepaliveLifeCycle(Component) {
  const isClassComponent = Component.prototype.setState && Component.prototype.isReactComponent
  if (!isClassComponent) return Component
  let callback = null
  const SelfComponent = ExtendsSelfHoc(Component,funCur(() => callback))

  class WrapComponent extends React.Component {
    constructor() {
      super()
      this.cur = null
      callback = (cur) => (this.cur=cur)
    }

    componentDidMount() {
      const {
        cacheId
      } = this.props
      cacheId && (lifeCycles[cacheId] = this.handerLifeCycle)
    }
    componentWillUnmount() {
      const {
        cacheId
      } = this.props
      delete lifeCycles[cacheId]
    }
    handerLifeCycle = type => {
      if (!this.cur) return
      const lifeCycleFunc = this.cur[type]
      isFuntion(lifeCycleFunc) && lifeCycleFunc.call(this.cur)
    }
    render = () => {
      const {
        forwardedRef,
        ...otherProp
      } = this.props
      return <SelfComponent {...otherProp}
          ref={forwardedRef}
             />
    }
  }

  const forWardRefComponent = React.forwardRef((props, ref) => (
     <WrapComponent forwardedRef={ref}
         {...props}
     />
  ))

  return hoistNonReactStatic(forWardRefComponent, SelfComponent)
}

export default keepaliveLifeCycle