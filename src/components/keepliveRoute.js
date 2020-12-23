import React , { useContext } from 'react'
import {Route , withRouter ,useLocation ,matchPath } from 'react-router-dom'
import invariant from 'invariant'

import CacheContext from '../core/cacheContext'
import {isFuntion} from '../utils/index'
import { resolveCacheDispatch } from './keepCache'
import {keeperCallbackQuene} from '../core/keeper'
import {
  KEEPLIVE_ROUTE_COMPONENT,
  ACITON_CREATED,
  ACTION_ACTIVE,
  ACTION_ACTIVED,
  ACITON_UNACTIVE,
  ACTION_UNACTUVED
} from '../utils/const'

class CacheRoute extends React.Component {
  constructor(prop, ...arg) {
    super(prop, ...arg)
    this.parentNode = null
    this.keepliveState = ''
    this.componentCur = null
    const {children, component,iskeep, render,  cacheState, ...otherProps } = prop
    const { cacheDispatch, history, location , computedMatch ,path } = otherProps

    const match = computedMatch
        ? this.props.computedMatch
        : path
        ? matchPath(location.pathname, this.props)
        : null
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
        const  WithRouterComponent = history && location ? component : withRouter(component)

        const useCacheDispatch = resolveCacheDispatch(cacheDispatch)

        otherProps.cacheDispatch = useCacheDispatch()

        cacheDispatch({
          type: ACITON_CREATED,
          payload: {
            cacheId,
            load: this.injectDom.bind(this),
            children: () => children
              ? isFuntion(children)
                ? children({ ...otherProps })
                : children
              : component
                ? React.createElement(WithRouterComponent, { ...otherProps })
                : render
                  ? render({ ...otherProps })
                  : null
          }
        })
        this.keepliveState = ACITON_CREATED
      } else if (cacheState[cacheId]) {
        this.keepliveState = cacheState[cacheId].state
      }

    }
  }

  render(){
    return <div ref={node => (this.parentNode = node)} />
  }

  componentWillReceiveProps(curProps) {
    const { cacheState } = curProps
    if(!cacheState) return
    this.keepliveState = cacheState[this.getAndcheckCacheKey()].state
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
    const {cacheDispatch, iskeep} = this.props
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
    try {
      /* 切换keepalive缓存状态 */
      cacheDispatch({
        type: ACITON_UNACTIVE,
        payload: cacheId
      })
    } catch (e) {

    }
  }
  componentWillUnmount() {
    const {iskeep} = this.props
    if (!iskeep) return
    this.exportDom()
  }

}


const KeepliveRoute = (props)=>{
    const { cacheState , path } = props
    const value = useContext(CacheContext) || {}
    const location = useLocation()
    if(cacheState) return <Route  path={path}
        render={()=><CacheRoute {...props} />}
                          />
    else return (
      /* 对于外层没有 switch 包裹的结构，我们需要一个 `控制器` 来控制 组件的 挂载与销毁 , 这里用 Route 刚好 */
      <Route  path={path}
          render={()=>{
        return  <CacheRoute {...props}
            {...value}
            iskeep
            location={location}
                />
      }}
      />

    )
}

KeepliveRoute.__componentType = KEEPLIVE_ROUTE_COMPONENT

export default KeepliveRoute