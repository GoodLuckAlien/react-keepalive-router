import React from 'react'
import './app.scss'
import { BrowserRouter as Router ,useHistory    } from 'react-router-dom'

import { renderRoutes } from 'react-router-config'
import { KeepaliveRouterSwitch ,KeepaliveRoute} from 'react-keepalive-router'

import Detail from './page/input'
import List from './page/lifecycle'
import TheIndex from '../src/page/home/index'
import List2 from './page/goodsList'
import List3 from './page/list2/index'

const menusList = [
  {
    name: '首页',
    path: '/home',
    component:TheIndex
  },
  {
    name: '生命周期demo',
    path: '/list',
    component:List
  },
  {
    name: '列表demo',
    path: '/list2',
    component:List2
  },
  {
    name: '表单demo',
    path: '/detail',
    component:()=><KeepaliveRoute component={Detail}
        path="/detail"
                  />
  },
  {
    name:'列表demo2',
    path:'/list3',
    component:List3
  }

]


function Meuns(){
  const history = useHistory()
   return <div className="theStyle" >
   {menusList.map(item=><span className="routerLink"
       key={item.path}
       onClick={()=> {  history.push(item.path) }}
                        >{item.name}</span>)}
  </div>
}

const index = () => {

  return <div >
    <div >
      <Router  >
      <Meuns/>
      <KeepaliveRouterSwitch withoutRoute >
          {renderRoutes(menusList)}
       </KeepaliveRouterSwitch>
      </Router>
    </div>
  </div>
}



export default index