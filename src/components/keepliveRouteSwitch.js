
import React, {useMemo, useEffect} from 'react'
import {Switch, matchPath, useHistory, __RouterContext, withRouter} from 'react-router-dom'
import invariant from 'invariant'

import Cache , { beforeSwitchDestory } from './keepCache'
import {KEEPLIVE_ROUTE_SWITCH, KEEPLIVE_ROUTE_COMPONENT  } from '../utils/const'
import {isFuntion, isObject} from '../utils/index'


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
        let element, match, history, location
        if (this.context.router) {
          history = this.context.router.history
          location = history.location
        } else {
          history = this.props.history
          location = this.props.location
        }
        forEach(children, child => {
          if (match == null && isValidElement(child)) {
            element = child
            const path = child.props.path || child.props.from
            match = path
              ? matchPath(location.pathname, {...child.props, path})
              : this.context.match
          }
        })
        /* 防止路由渲染过程中，切换路由，页面不刷新情况，我们这里加入key,提高渲染，防止渲染异常 */
        const key = element.props.cacheId ||element.props.path
        return match
          ? isKeepliveRouter(element)
            ? cloneElement(element, { key, location, history, computedMatch: match, cacheDispatch, match,iskeep: true})
            : cloneElement(element, { key, location, history, computedMatch: match, cacheDispatch, match})
          : null
      }
      return __render.call(this)
    }
  }
}

KeepliveRouterSwitch.__componentType = KEEPLIVE_ROUTE_SWITCH

const KeepSwitch = ({children, withoutRoute = false, deep = true,...props}) => {
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

  useEffect(()=>{
    /* 防止当 KeepSwitch 突然销毁造成 react 找不到即将销毁的真实dom节点引发的报错 */
    return function (){
       try{
         for(let key in beforeSwitchDestory){
          beforeSwitchDestory[key] && beforeSwitchDestory[key]()
         }
       }catch(e){}
    }
  },[])

  if (ishasRouterSwitch || deep) {
    return <Cache {...props} >
      {
        cacheProps => {
          return withoutRoute
          ?
          children
          :
          <KeepliveRouterSwitch
              {...props}
              {...cacheProps}
              ishasRouterSwitch
          >
              {children}
          </KeepliveRouterSwitch>
        }
      }
    </Cache>
  }
  return <KeepliveRouterSwitch {...props} >
    {children}
  </KeepliveRouterSwitch>
}

export default (useHistory || __RouterContext) ? withRouter(KeepSwitch) : KeepSwitch