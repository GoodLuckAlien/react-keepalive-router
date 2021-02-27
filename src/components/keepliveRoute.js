import React , { useContext } from 'react'
import {Route , withRouter  ,matchPath } from 'react-router-dom'
import invariant from 'invariant'

import CacheContext from '../core/cacheContext'
import {isFuntion} from '../utils/index'
import { resolveCacheDispatch } from './keepCache'
import {keeperCallbackQuene ,scrolls } from '../core/keeper'
import {
  KEEPLIVE_ROUTE_COMPONENT,
  ACITON_CREATED,
  ACTION_ACTIVE,
  ACTION_ACTIVED,
  ACITON_UNACTIVE,
  ACTION_UNACTUVED
} from '../utils/const'

class CacheRoute extends Route {

  cacheMatch=null

  constructor(prop, ...arg) {
    super(prop, ...arg)
    this.parentNode = null
    this.keepliveState = ''
    this.componentCur = null
    const {children, component,iskeep, render,  cacheState, ...otherProps } = prop
    const { cacheDispatch, history, location } = otherProps
    /* 记录路由是否匹配 */
    const match = this.computerMatchRouter(prop)
    this.cacheMatch={...match}
    if (iskeep && cacheDispatch && cacheState && match ) {
      /* 如果当前 KeepliveRoute 没有被 KeepliveRouterSwitch 包裹 ，那么 KeepliveRoute 就会失去缓存作用， 就会按照正常route处理 */
      const cacheId = this.getAndcheckCacheKey()
      /* 执行监听函数 */
      Promise.resolve().then(() => {
        keeperCallbackQuene.forEach(cb => {
          isFuntion(cb) && cb({...otherProps}, this.getAndcheckCacheKey())
        })
      })
      if (!cacheState[cacheId] || (cacheState[cacheId] && cacheState[cacheId].state === 'destory')) {
        let  WithRouterComponent = history && location ? component : withRouter(component)

        /* 对 cacheDispatch 处理 */
        const useCacheDispatch = resolveCacheDispatch(cacheDispatch)
        otherProps.cacheDispatch = useCacheDispatch()
        const childrenProps = { ...otherProps,cacheId }

        cacheDispatch({
          type: ACITON_CREATED,
          payload: {
            cacheId,
            load: this.injectDom.bind(this),
            children: () => children
              ? isFuntion(children)
                ? children(childrenProps)
                : children
              : component
                ? React.createElement(WithRouterComponent, childrenProps)
                : render
                  ? render(childrenProps)
                  : null
          }
        })
        this.keepliveState = ACITON_CREATED
      } else if (cacheState[cacheId]) {
        this.keepliveState = cacheState[cacheId].state
      }
      this.render = ()=>{
        return <div ref={node => (this.parentNode = node)} />
      }

    }
  }
  /* 路由是否匹配 */
  computerMatchRouter=(props)=>{
     const { computedMatch ,location ,path } = props
     return computedMatch
        ? computedMatch
        : path
        ? matchPath(location.pathname, props)
        : null
  }


  UNSAFE_componentWillReceiveProps(curProps) {
    const { cacheState ,iskeep  } = curProps
    if(!cacheState || !iskeep ) return
    this.keepliveState = cacheState[this.getAndcheckCacheKey()].state
    const newMatch = (this.computerMatchRouter(curProps) || {})
    if(this.keepliveState === 'actived' && newMatch && this.cacheMatch && newMatch.path !== this.cacheMatch.path && newMatch.url !==  this.cacheMatch.url  ){
      //TODO: 路由不一致情况
    }
  }

  getAndcheckCacheKey = () => {
    const {cacheId, path} = this.props
    const cacheKey = cacheId || path
    invariant(
      cacheKey,
      'KeepliveRoute must have a cacheId'
    )
    return cacheKey
  }

  componentDidMount() {
    /* 如果第一次创建keepliveRouter,那么激活keepliveRouter */
    const {cacheDispatch, iskeep, scroll } = this.props
    if (!iskeep) return
    if (this.keepliveState === ACITON_CREATED) {
      cacheDispatch({
        type: ACTION_ACTIVE,
        payload: {cacheId: this.getAndcheckCacheKey()}
      })
      /* 如果keeplive是休眠状态，那么复用节点再次激活 */
    } else if (this.keepliveState === ACTION_UNACTUVED) {
      cacheDispatch({
        type: ACTION_ACTIVE,
        payload: {cacheId: this.getAndcheckCacheKey(), load: this.injectDom.bind(this)}
      })
    }
    if(scroll){
      this.parentNode.addEventListener('scroll', this.handerKeepScoll ,true)
    }
    const cacheId = this.getAndcheckCacheKey()
    if(scrolls[cacheId]){
       const { scrollTarget , scrollTop } = scrolls[cacheId]  
       this.scrollTimer = setTimeout(()=>{
          if(scrollTarget) scrollTarget.scrollTop = scrollTop
       },0)
    }

  }

  handerKeepScoll= (e) => {
    if(!this.scrollTarget ) this.scrollTarget = e.target
  }

  injectDom = currentNode => {
    const {cacheDispatch} = this.props
    this.parentNode && this.parentNode.appendChild(currentNode)
    /* 改变状态actived 激活完成状态 */
    cacheDispatch({
      type: ACTION_ACTIVED,
      payload: this.getAndcheckCacheKey()
    })
  }
  exportDom = () => {
    const {cacheDispatch} = this.props
    const cacheId = this.getAndcheckCacheKey()
    if(this.scrollTarget){
       scrolls[cacheId] = {
        scrollTarget:this.scrollTarget,
        scrollTop:this.scrollTarget.scrollTop
      }
    }
    try {
      /* 切换keepalive缓存状态 */
      cacheDispatch({
        type: ACITON_UNACTIVE,
        payload:cacheId
      })
    } catch (e) {

    }
  }
  componentWillUnmount() {
    const {iskeep} = this.props
    if (!iskeep) return
    this.exportDom()
    this.parentNode.removeEventListener('scroll',this.handerKeepScoll,true)
    if(this.scrollTimer) clearTimeout(this.scrollTimer)
  }

}


const KeepliveRoute = (props)=>{
    const { path } = props
    const value = useContext(CacheContext) || {}
    const { cacheState } = value
    return (
        /* 对于外层没有 switch 包裹的结构，我们需要一个 `控制器` 来控制 组件的 挂载与销毁 , 这里用 Route 刚好 */
        <Route  path={path}
            render={(historyProps)=>{
          return (
          <CacheRoute
              {...historyProps}
              {...props}
              {...value}
              iskeep={cacheState ? true :false}
          />)
    }}
        />
    )
}

KeepliveRoute.__componentType = KEEPLIVE_ROUTE_COMPONENT

export default KeepliveRoute