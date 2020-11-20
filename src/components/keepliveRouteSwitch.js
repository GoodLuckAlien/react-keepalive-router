
import React, {useMemo} from 'react'
import {Switch, matchPath} from 'react-router'
import invariant from 'invariant'

import Cache from './keepCache'
import {KEEPLIVE_ROUTE_SWITCH, KEEPLIVE_ROUTE_COMPONENT} from '../utils/const'
import {isFuntion, isObject} from '../utils/index'
import CacheContext from '../core/cacheContext'

const {isValidElement, cloneElement} = React
const {forEach} = React.Children

const isKeepliveRouter = child => child.type.__componentType === KEEPLIVE_ROUTE_COMPONENT

class KeepliveRouterSwitch extends Switch {

  constructor(props, ...arg) {
    super(props, ...arg)
    const {ishasRouterSwitch, children, cacheDispatch} = props
    const __render = this.render
    this.render = () => {
      if (ishasRouterSwitch) {
        const {history} = this.context.router
        const {location} = history
        let element, match
        forEach(children, child => {
          if (match == null && isValidElement(child)) {
            element = child
            const path = child.props.path || child.props.from
            match = path
              ? matchPath(location.pathname, {...child.props, path})
              : this.context.match
          }
        })
        return match
          ? isKeepliveRouter(element)
            ? <CacheContext.Consumer>
              { context => cloneElement(element, {location, computedMatch: match, cacheDispatch, iskeep: true, ...context}) }
            </CacheContext.Consumer>
            : cloneElement(element, {location, computedMatch: match, cacheDispatch})
          : null
      }
      return __render.call(this)
    }
  }
}

KeepliveRouterSwitch.__componentType = KEEPLIVE_ROUTE_SWITCH

export default ({children, ...props}) => {
  const ishasRouterSwitch = useMemo(() => {
    let ishas = false
    forEach(children, child => {
      if (isObject(child) && isFuntion(child.type) && isKeepliveRouter(child)) {
        invariant(
          child.props.cacheId || child.props.path,
          'keepliveRouter should be a cacheid or paths attribute'
        )
        return (ishas = true)
      }
    })
    return ishas
  }, [])
  if (ishasRouterSwitch) {
    return <Cache>
      {
        cacheProps => {
          return (
            <KeepliveRouterSwitch
              {...props}
              {...cacheProps}
              ishasRouterSwitch
            >
              {children}
            </KeepliveRouterSwitch>
          )
        }
      }
    </Cache>
  }
  return <KeepliveRouterSwitch {...props} >
    {children}
  </KeepliveRouterSwitch>
}

