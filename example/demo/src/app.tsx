import React from 'react'
import './app.scss'
import { BrowserRouter as Router, Route ,useHistory , Redirect  } from 'react-router-dom'
// import { KeepaliveRouterSwitch ,KeepaliveRoute} from './keep-src/index'

import { KeepaliveRouterSwitch ,KeepaliveRoute} from 'react-keepalive-router'
import Detail from './page/input'
import List from './page/lifecycle'
import TheIndex from '../src/page/home/index'
import List2 from './page/goodsList'

const menusList = [
  {
    name: '首页',
    path: '/home'
  },
  {
    name: '生命周期demo',
    path: '/list'
  },
  {
    name: '缓存列表demo',
    path: '/list2'
  },
  {
    name: '表单demo',
    path: '/detail'
  },
]


function Meuns(){
  const history = useHistory()
   return <div className="theStyle" >
   { menusList.map(item=><span className="routerLink" onClick={()=> {  history.push(item.path) } }   key={item.path}  >{ item.name }</span>) }
  </div>
}

const RouteWithSubRoutes = (item)=> <div> <KeepaliveRoute path={item.path} component={ item.component } ></KeepaliveRoute>  </div>

const index = () => {
  return <div >
    <div >
      <Router  >
      <Meuns/>
      <KeepaliveRouterSwitch  >
          {
            [{ path:'/detail' ,component:Detail }].map(item=> <RouteWithSubRoutes key={item.path} {...item}  />)
          }
          <KeepaliveRoute path={'/list2'} component={List2} scroll />
          <KeepaliveRoute path={'/list'} component={List} ></KeepaliveRoute>
          <Route path={'/home'} component={TheIndex} />
          {/*  路由不匹配，重定向到/index  */}
          <Redirect from='/*' to='/home' />
       </KeepaliveRouterSwitch>
      </Router>
    </div>
  </div>
}

export default index