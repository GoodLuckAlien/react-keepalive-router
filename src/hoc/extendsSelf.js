import { isFuntion } from '../utils/index'

export default function ExtendsSelfHoc(Componet,getCurrent){
   return class Hoc extends Componet{
       constructor(props){
           super(props)
           isFuntion(getCurrent) && getCurrent(this)
       }
   }
}

