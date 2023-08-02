/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/no-multi-comp */
import React, {useRef, useEffect, useMemo, memo, useContext} from 'react'

import CacheContext from '../core/cacheContext'
import useKeeper , { scrolls } from '../core/keeper'
import {ACTION_ACTIVE, ACTION_ACTIVED, ACITON_UNACTIVE, ACTION_UNACTIVED, ACTION_DESTORYED} from '../utils/const'
import {isFuntion} from '../utils/index'


export const beforeSwitchDestory = {}
const keepChange = (pre, next) => pre.state === next.state
let cacheDispatchCurrent = null

export const handerReactComponent = (children, prop) =>
  React.isValidElement(children)
    ? React.createElement(children, {...prop})
    : isFuntion(children)
      ? children(prop)
      : null
const UpdateComponent = memo(({children}) => children, () => true)

const CacheKeepItem = memo(({cacheId, children, state, dispatch, className='', lastState,load = () => {}, router = {}}) => {
  const parentCurDom = useRef(null)
  const curDom = useRef(null)
  const curComponent = useRef(null)
  useEffect(()=>{
    beforeSwitchDestory[cacheId] = function (){
      if(parentCurDom.current && curDom.current ) parentCurDom.current.appendChild(curDom.current)
    }
    return function(){
       if(scrolls[cacheId]) delete scrolls[cacheId]
       delete beforeSwitchDestory[cacheId]
    }
  },[])
  useEffect(() => {
    if (state === ACTION_ACTIVE) { /* 激活状态 */
      const {current} = curDom
      const parentNode = current.parentNode
      parentCurDom.current = parentNode
      load(current)
    } else if (state === ACITON_UNACTIVE) {
      parentCurDom.current.appendChild(curDom.current)
      /* 改变状态为休眠完成状态 */
      if (lastState === 'destory') {
        dispatch({
          type: ACTION_DESTORYED,
          payload: cacheId
        })
      } else {
        dispatch({
          type: ACTION_UNACTIVED,
          payload: cacheId
        })
      }
    }
    return () => {
      if (state === 'destory') { /* 如果是销毁阶段 */
        curComponent.current = null
      }
    }
  }, [state])
  return <div ref={curDom}
      style={{
        display: state === ACTION_UNACTIVED ? 'none' : 'block'
      }}
      className={className}
         >
    {(state === ACTION_ACTIVE || state === ACTION_ACTIVED || state === ACITON_UNACTIVE || state === ACTION_UNACTIVED) ? <UpdateComponent>{children()}</UpdateComponent> : null}
  </div>
}, keepChange)

function Cache({children, className, ...prop}) {
  const [cacheState, cacheDispatch] = useKeeper()
  return <CacheContext.Provider value={{cacheState, cacheDispatch}} >
    {
      Object.keys(cacheState).map(cacheId =>{
        return  <CacheKeepItem cacheId={cacheId}
             key={cacheId}
             className={className}
             {...cacheState[cacheId]}
              dispatch={cacheDispatch}
                />
      })
    }
    {!cacheDispatchCurrent && <GetCacheContext cacheDispatch={c => (cacheDispatchCurrent = c)} />}
    {/* 提供对外的cacheDispatch方法 */}
    {useMemo(() => children({cacheDispatch}), [prop.location])}
  </CacheContext.Provider>
}

export default Cache

/* 对于层层嵌套的组件结构 ，我们需要一个容器来提供 cacheContext */
export const GetCacheContext = ({children, cacheDispatch}) => {
  const cacheContext = useContext(CacheContext) || {}
  useEffect(() => {
    cacheDispatch && isFuntion(cacheDispatch) && cacheDispatch(cacheContext.cacheDispatch)
  }, [])
  return <CacheContext.Consumer>
    {context => {
      return handerReactComponent(children, context)
    }}
  </CacheContext.Consumer>
}

const nextTick = (cb)=> Promise.resolve().then(cb)
let timer = null

export const resolveCacheDispatch = ( dispatch ) =>  ()  =>  (action) => {
  const { type } = action
  const cacheDispatch = dispatch || cacheDispatchCurrent
  if( !cacheDispatch ) return
  if(type === 'reset'){
    if(timer) clearTimeout(timer)
    timer = setTimeout(()=>{
      cacheDispatch(action)
      nextTick(()=> {
        cacheDispatch({ type :'clear'  })
      })
    },50)
  }else{
    cacheDispatch(action)
  }
}

export const useCacheDispatch = resolveCacheDispatch( cacheDispatchCurrent  )