import React, { useEffect, useRef, useState } from 'react';
import './main.css';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css'
import * as option from './options'
import { LodkaValterraFunc } from './algoritm'

function Main() {

  const [data, setData] = useState({})
  const [options, setOptions] = useState(option.options)
  const multiplication = option.multiplication

  const getName = (value) => {
    switch (value) {
      case `time`: return 'Время'
      case `gamma`: return 'Гамма'
      case `delta`: return 'Дельта'
      case `sX`: return 'Начальное значение Х'
      case `sY`: return 'Начальное значение У'
      case `alpha`: return 'Хищники'
      case `beta`: return 'Жертвы'
    }
  }

  useEffect(() => {
    setData(() => {
      const payload = {
        dx: [],
        time: [],
        time2: [],
      }
      let x = options.sX;
      let y = options.sY;
      for (let i = 0; i < options.time; i++) {
        payload.dx.push([x, y]);
        payload.time2.push([i, x]);
        payload.time.push([i, y]);
        const [dx, dy] = LodkaValterraFunc(x, y, options);
        x += dx;
        y += dy;
      }
      return payload
    })
  }, [options])

  let canvas = {}
  canvas['1'] = useRef();
  canvas['2'] = useRef();

  function buildLine(canvas, ctx, data, color, data2, color2) {
    const [yMin, yMax] = minMax(data, 'y')
    const [xMin, xMax] = minMax(data, 'x')
    const padding = 40
    const countLine = 5
    const size = { width: 400, height: 250 }
    const dpiSize = { width: size.width * 2, height: size.height * 2 }
    const viewHeight = dpiSize.height - (padding * 2)
    const step = viewHeight / countLine
    const textStep = (yMax - yMin) / countLine
    const deltaY = (yMax - yMin)
    const deltaX = (xMax - xMin)
    const Ky = viewHeight / deltaY
    const Kx = dpiSize.width / deltaX
    canvas.current.style.width = `${size?.width}px`
    canvas.current.style.height = `${size?.height}px`
    canvas.current.width = dpiSize?.width
    canvas.current.height = dpiSize?.height

    ///////////////////////////////////////////

    ctx.beginPath()
    for (let i = 0; i <= countLine; i++) {
      const y = step * i
      const text = Math.round(yMax - textStep * i)
      ctx.strokeStyle = '#bbb'
      ctx.font = 'normal 30px sans-serif'
      ctx.fillStyle = '#000'
      ctx.fillText(text, 10, y + padding - 10)
      ctx.moveTo(0, y + padding)
      ctx.lineTo(dpiSize.width, y + padding)
    }

    ctx.stroke()
    ctx.closePath()

    ///////////////////////////////////////////

    ctx.beginPath()
    ctx.lineWidth = 5;
    ctx.strokeStyle = color

    data?.forEach(([x, y]) => {
      ctx.lineTo(x * Kx, dpiSize.height - (y * Ky + padding))
    })
    ctx.stroke()

    ctx.beginPath()
    ctx.lineWidth = 5;
    ctx.strokeStyle = color2

    if (data2) {
      data2?.forEach(([x, y]) => {
        ctx.lineTo(x * Kx, dpiSize.height - (y * Ky + padding))
      })
    }
    ctx.stroke()
    ctx.closePath()
  }

  useEffect(() => {
    // console.log(data.time2,'222',data.time,'111')
    const ctx = canvas['1']?.current?.getContext('2d')
    const ctx2 = canvas['2']?.current?.getContext('2d')
    buildLine(canvas['1'], ctx, data.time, '#c4416a', data.time2, '#31a84b')
    buildLine(canvas['2'], ctx2, data.dx, '#c4416a')
  }, [data])

  function minMax(data, type) {
    let min
    let max

    data?.forEach((el) => {
      const value = type === 'y' ? el[1] : el[0];
      if (typeof min !== 'number') min = value
      if (typeof max !== 'number') max = value
      if (min > value) min = value
      if (max < value) max = value
    })
    return [min, max == `Infinity` ? 1000000 : max]
  }

  return (
    <>
      <div className="App">
        <div className="appSignature title">
        Модель Лотки-Вольтерры. Выполнил Филиппов Юрий.
        </div>
        {Object.keys(canvas).map((el, index) => (
          <div className="container">
            <div className="card">
              <canvas id='canvas' ref={canvas[`${index + 1}`]} className={'canvas'} />
            </div>
          </div>
        ))}
        <div className={`sliderBox`}>
          {Object.keys(options).map((param) => (
            <div className="btns_item">
              <div style={{ minWidth: '60px' }}>{getName(param)} : {options[param]}</div>
              <Slider
                value={options[param] * multiplication[param]}
                onChange={(data) => { setOptions(prev => ({ ...prev, [param]: data / multiplication[param] })) }}
                min={param === 'time' ? 10 : 0}
                max={param === 'time' ? 200 : 20}
              />
            </div>
          ))}
        </div>
        <div className="appSignature">
          <div className="item">
            <div className="circle green" />
            <div className="text">
              Жертвы
          </div>
          </div>
          <div className="item">
            <div className="circle red" />
            <div className="text">
              Хищники
          </div>
          </div>
        </div>
      </div>
    </>

  );
}

export default Main;
