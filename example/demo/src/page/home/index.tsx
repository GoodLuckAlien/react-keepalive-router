//todo
import React from 'react'
import './index.scss'
import { useCacheDispatch } from 'react-keepalive-router'

class Index extends React.Component{

    handerClick=(payload)=>{
        const dispatch = useCacheDispatch()
        dispatch({ type:'reset' , payload  })
    }

    render(){
        console.log(this.props)
         return <div className="box" >
             <div className="item"
                 onClick={() => this.handerClick('/list')}
             >清除  生命周期</div>
             <div className="item"
                 onClick={() => this.handerClick('/list2')}
             >清除  缓存列表</div>
             <div className="item"
                 onClick={() => this.handerClick('/detail')}
             >清除  缓存表单</div>
         </div>
    }
}





export default Index