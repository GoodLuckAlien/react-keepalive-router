/**
 * 数据类型校验
 * @param type 待校验类型
 */
export function isType(type) {
  return Object.prototype.toString.call(type).slice(8, -1)
}

/* 字符串类型 */
export function isString(type) {
  return isType(type) === 'String'
}

/* 数字类型 */
export function isNumber(type) {
  return isType(type) === 'Number'
}

/* 函数类型 */
export function isFuntion(type) {
  return isType(type) === 'Function'
}

/* 数组类型 */
export function isArray(type) {
  return isType(type) === 'Array'
}

/* 对象类型 */
export function isObject(type) {
  return isType(type) === 'Object'
}

/* 访问属性 */
export function saveTryAttr(obj, attr) {
  const aAttr = isString(attr) ? attr.split('.') : null
  return aAttr
}

export function funCur (callback){
  return function (...arg){
    const cb = callback()
    cb(...arg)
  }
}