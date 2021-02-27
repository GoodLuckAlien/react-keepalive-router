
function getData(){
  return new Promise((resolve)=>setTimeout(()=>{ resolve(1) },100)).then(res=>res)
}

export default {
  state: {
    number: 1
  },
  reducer: {
    numberAdd(state) {
      return {
        ...state,
        number: state.number + 1
      }
    },
    numberDel(state) {
      return {
        ...state,
        number: state.number - 1
      }
    },
    numberReset(state,{ payload }){
      return {
        ...state,
        number: payload
      }
    }
  },
  effect: {
    asyncnumberAdd(dispatch) {
      setTimeout(() => {
        dispatch({
          type: 'numberAdd'
        })
      }, 3000)
    },
    async resetNumber(dispatch){
       const res = await getData()
       dispatch({
         type:'numberReset',
         payload:res
       })
    }
  }
}