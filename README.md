# react-keepalive-router


## 一 介绍

基于`react 16.8+` ,`react-router 4+` 开发的`react`缓存组件，可以用于缓存页面组件，类似`vue`的`keepalive`包裹`vue-router`的效果功能。

采用`react hooks`全新`api`,支持缓存路由，手动解除缓存，增加了**缓存的状态周期**，监听函数等。

后续版本会完善其他功能。


### demo

#### 缓存组件 + 监听


## 二 快速上手


### 下载

```bash
npm install react-keepalive-router --save
# or
yarn add react-keepalive-router
```


### 使用

### 1 基本用法

#### KeepliveRouterSwitch ,KeepliveRoute

`KeepliveRouterSwitch`,`KeepliveRoute` 基本使用和 `Switch` , `Route`没有任何区别

````jsx
import { BrowserRouter as Router, Route, Redirect ,useHistory  } from 'react-router-dom'
import { KeepliveRouterSwitch ,KeepliveRoute ,addKeeperListener } from 'react-keepalive-router'

const index = () => {
  useEffect(()=>{
    /* 增加缓存监听器 */
    addKeeperListener((history,cacheKey)=>{
      if(history)console.log('当前激活状态缓存组件：'+ cacheKey )
    })
  },[])
  return <div >
    <div >
      <Router  >
      <Meuns/>
      <KeepliveRouterSwitch>
          <Route path={'/index'} component={Index} ></Route>
          <Route path={'/list'} component={List} ></Route>
          { /* 我们将详情页加入缓存 */ }
          <KeepliveRoute path={'/detail'} component={ Detail } ></KeepliveRoute>
          <Redirect from='/*' to='/index' />
       </KeepliveRouterSwitch>
      </Router>
    </div>
  </div>
}

````

**在当前版本中⚠️⚠️⚠️如果 KeepliveRoute 如果没有被 KeepliveRouterSwitch包裹就会失去缓存作用。**

**效果**




![demo演示](https://img-blog.csdnimg.cn/20201209002609524.gif#pic_center)



### 2 其他功能



#### 1 缓存组件激活监听器

如果我们希望对当前激活的组件，有一些额外的操作，我们可以添加监听器，用来监听缓存组件的激活状态。

````js
addKeeperListener((history,cacheKey)=>{
  if(history)console.log('当前激活状态缓存组件：'+ cacheKey )
})
````
第一个参数未history对象，第二个参数为当前缓存路由的唯一标识cacheKey

#### 2 清除缓存

缓存的组件，或是被`route`包裹的组件，会在`props`增加额外的方法`cacheDispatch`用来清除缓存。

如果props没有`cacheDispatch`方法，可以通过


````js


import React from 'react'
import { useCacheDispatch } from 'react-keepalive-router'

function index(){
    const cacheDispatch = useCacheDispatch()
    return <div>我是首页
        <button onClick={()=> cacheDispatch({ type:'reset' }) } >清除缓存</button>
    </div>
}

export default index
````

**1 清除所有缓存**

````js
cacheDispatch({ type:'reset' }) 
````

**2 清除单个缓存**

````js
cacheDispatch({ type:'reset',payload:'cacheId' }) 
````

**2 清除多个缓存**

````js
cacheDispatch({ type:'reset',payload:['cacheId1'，'cacheId2'] }) 
````