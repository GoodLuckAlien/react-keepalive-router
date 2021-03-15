import {
  useReducer
} from 'react'
import {
  ACITON_CREATED,
  ACTION_ACTIVE,
  ACTION_ACTIVED,
  ACITON_UNACTIVE,
  ACTION_UNACTIVED,
  ACTION_RESERT,
  ACTION_DESTORYED,
  ACTION_CLEAR
} from '../utils/const'
import {
  isString,
  isArray,
  isFuntion
} from '../utils/index'

export const keeperCallbackQuene = []
export const lifeCycles = {}
export const scrolls = {}

export const addKeeperListener =  (cb) => {
  keeperCallbackQuene.push(cb)
  return () => {
    const keepIndex = keeperCallbackQuene.findIndex(callback => cb === callback)
    if (keepIndex) keeperCallbackQuene.splice(keepIndex, 1)
  }
}

function destoryState(state,keep){
  if (state[keep].state !== ACTION_ACTIVED) {
    state[keep].lastState = state[keep].state
    state[keep].state = 'destory'
    state[keep].load = null
  }
}

/**
 * keeplive keeplive状态 active(激活)
 *  cacheId (缓存id) :{ state：状态 , children:激活组件实例 , load :加载函数 }  state状态有 active actived  unActive unActived created  destoryed
 */
const useKeeper = () => useReducer((state, action) => {
  const {
    type,
    payload
  } = action
  switch (type) {
    /* 添加keeplive状态 */
    case ACITON_CREATED:
      const {
        cacheId, children, load
      } = payload
      const isDestory = state[cacheId] && (state[cacheId].state === 'destory')
      if (!state[cacheId] || isDestory) {
        state[cacheId] = {
          children,
          state: ACITON_CREATED,
          lastState: isDestory ? 'destory' : '',
          load
        }
      }
      return state
      /* 开始激活状态 */
    case ACTION_ACTIVE:
      if (state[payload.cacheId]) {
        let other = {}
        if (payload.load) other.load = payload.load
        state[payload.cacheId] = {
          ...state[payload.cacheId],
          lastState: state[payload.cacheId].state,
          state: ACTION_ACTIVE,
          ...other
        }
      }
      return {
        ...state
      }
      /* 激活完成状态 */
      case ACTION_ACTIVED:
        if (state[payload]) {
          state[payload] = {
            ...state[payload],
            lastState: state[payload].state,
            state: ACTION_ACTIVED
          }
          const lifeCycleFunc = lifeCycles[payload]
          lifeCycleFunc && isFuntion(lifeCycleFunc) && lifeCycleFunc(ACTION_ACTIVED)
        }
        return {
          ...state
        }
        /* 休眠状态 */
        case ACITON_UNACTIVE:
          if (state[payload]) {
            state[payload] = {
              ...state[payload],
              lastState: state[payload].state,
              state: ACITON_UNACTIVE
            }
          }
          return {
            ...state
          }
          /* 休眠完成状态 */
          case ACTION_UNACTIVED:
            if (state[payload]) {
              state[payload] = {
                ...state[payload],
                lastState: state[payload].state,
                state: ACTION_UNACTIVED
              }
              const lifeCycleFunc = lifeCycles[payload]
              lifeCycleFunc && isFuntion(lifeCycleFunc) && lifeCycleFunc(ACTION_UNACTIVED)
            }
            return {
              ...state
            }
            /* 销毁状态 */
            case ACTION_RESERT:
              if (isString(payload) && state[payload]) {
                  destoryState(state,payload)
              } else if (isArray(payload)) {
                  payload.forEach(item=>{
                    state[item] && destoryState(state,item)
                  })
              } else if(!payload){
                Object.keys(state).forEach(keep => {
                  destoryState(state,keep)
                })
              }
              return state
              /* 销毁单个state */
            case ACTION_DESTORYED:
              delete state[payload]
              return {
                ...state
              }
            case ACTION_CLEAR:
              Object.keys(state).forEach(keep => {
                 if( state[keep].state !== ACTION_ACTIVED && ( state[keep].state === 'destory' ||  state[keep].lastState === 'destory'  )){
                   delete state[keep]
                 }
              })
              return {
                ...state
              }
              default:
                return state
  }
}, {})

export default useKeeper