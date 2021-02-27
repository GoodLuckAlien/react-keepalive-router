import React from 'react'
import { listData } from '../../mock'

import './index.scss'


class Index extends React.Component<any, any>{
    num = 0
    state = {
        list:[],
        renderList: []  /* 渲染列表 */
    }

    componentDidMount() {
       this.setState({
           list : listData.data
       })
    }
    /* 处理滚动效果 */
    render() {
        const { list  } = this.state
        return <div className="list_box">
            <div
                style={{ overflow: 'scroll', position: 'relative' }}
            >
                {/* 显然区 */}
                <div style={{ position: 'relative', left: 0, top: 0, right: 0 }} >
                    {
                        list.map((item:any, index) => (
                            <div className="goods_item"
                                key={index}
                            >
                                <img className="item_image"
                                    src={item.giftImage}
                                />
                                <div className="item_content" >
                                    <div className="goods_name" >
                                        {item.giftName}
                                    </div>
                                    <div  className="hold_price" />
                                    <div className="new_price" >
                                        <div className="new_price" >
                                            <div className="one view">
                                              ¥ {item.price}
                                            </div>
                                        </div>
                                    </div>
                                    <img  className="go_share  go_text"  />
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>

        </div>
    }
}


export default Index