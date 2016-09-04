import Vue = require('vue')
import {ComponentOptions, PropOptions, VClass, $$Prop} from './interface'
import {Component} from './core'

import {getReflectType} from './util'

const PROP_KEY = '$$Prop' as $$Prop

type Props = {[key: string]: PropOptions}

export function Prop(target: Vue, key: string): void {
  let propKeys: string[] = target[PROP_KEY] = target[PROP_KEY] || []
  propKeys.push(key)
}

Component.register(PROP_KEY, function(proto, instance, options) {
  let propKeys: string[] = proto[PROP_KEY]
  let props: Props = {}

  for (let key of propKeys) {
    let prop: PropOptions = {}
    if (instance[key] != null) {
      prop = instance[key]
      delete instance[key]
    }
    // refill type if not existing, do we need this?
    if (!prop.type) {
      prop.type = getReflectType(proto, key)
    }
    props[key] = prop
  }
  options.props = props
})


type Class<T> = {new (...args: {}[]): T}

interface PlainProp<T> {
  type?: Class<T>
  required?: boolean
  default?: T | (() => T)
  validator?(value: T): boolean
}

// FuncPropOption is solely for bad API
interface FuncProp<T extends Function> {
  type: FunctionConstructor,
  defaultFunc: T
}

export function p<T>(tpe: NumberConstructor): number
export function p<T>(tpe: StringConstructor): string
export function p<T>(tpe: BooleanConstructor): boolean
export function p<T>(tpe: Class<T>): T
export function p<T>(conf: PlainProp<T>): T
export function p<T extends Function>(conf: FuncProp<T>): T
export function p<T>(confOrType: Class<T> | PlainProp<T>): T {
  if (typeof confOrType === 'function') {
    let tpe = confOrType
    return {type: tpe} as any
  }
  let conf: any = confOrType
  if (conf.type === Function) {
    conf.default = conf.defaultFunc
  }
  return conf
}