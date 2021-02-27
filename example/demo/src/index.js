import React from 'react'
import ReactDOM from 'react-dom'
import App from './app'
import rux from 'ruxjs'
import './assets/styles/common.scss'


ReactDOM.render(
    rux.create({}, () => < App / > ),
    document.getElementById('app')
)

