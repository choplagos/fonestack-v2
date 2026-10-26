'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

const PHONE_NUMBER = '234XXXXXXXXXX'

const TESTS = [
  { id: 'screen', name: 'Screen' },
  { id: 'touch', name: 'Touchscreen' },
  { id: 'speaker', name: 'Speaker' },
  { id: 'microphone', name: 'Microphone' },
  { id: 'camera', name: 'Cameras' },
  { id: 'sensors', name: 'Motion sensors' },
  { id: 'vibration', name: 'Vibration' },
] as const

type TestId = (typeof TESTS)[number]['id']
type ResultStatus = 'pass' | 'problem' | 'skipped' | 'not-supported'
type TestResults = Partial<Record<TestId, ResultStatus>>
type DeviceInfo = {
  userAgent: string
  screenSize: string
  pixelRatio: string
}
type SensorReading = {
  acceleration: string
  rotation: string
}

const SCREEN_COLORS = [
  { name: 'Red', color: '#ff0000' },
  { name: 'Green', color: '#00ff00' },
  { name: 'Blue', color: '#0000ff' },
  { name: 'White', color: '#ffffff' },
  { name: 'Black', color: '#000000' },
]

const BUTTON_CLASS =
  'min-h-14 rounded-xl px-5 py-4 text-base font-bold transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400'
const PRIMARY_BUTTON_CLASS = `${BUTTON_CLASS} bg-lime-400 text-black hover:bg-lime-300`
const SECONDARY_BUTTON_CLASS = `${BUTTON_CLASS} border border-white/15 bg-white/5 text-white hover:bg-white/10`

function formatValue(value: number | null | undefined) {
  return typeof value === 'number' && Number.isFinite(value) ? value.toFixed(2) : '—'
}

function resultLabel(status: ResultStatus | undefined) {
  switch (status) {
    case 'pass':
      return 'Pass'
    case 'problem':
      return 'Problem'
    case 'skipped':
      return 'Skipped'
    case 'not-supported':
      return 'Not supported on this device'
    default:
      return 'Not tested'
  }
}

export default function DiagnosticPage() {
  const [step, setStep] = useState(-1)
  const [results, setResults] = useState<TestResults>({})
  const [apiError, setApiError] = useState('')
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null)
  const [screenColorIndex, setScreenColorIndex] = useState(0)
  const [touchSquares, setTouchSquares] = useState<boolean[]>(() => Array(36).fill(false))
  const [pointerSupported, setPointerSupported] = useState<boolean | null>(null)
  const [microphoneLevel, setMicrophoneLevel] = useState(0)
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user')
  const [sensorReading, setSensorReading] = useState<SensorReading>({
    acceleration: 'Waiting for sensor data…',
    rotation: 'Waiting for sensor data…',
  })

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const oscillatorRef = useRef<OscillatorNode | null>(null)
  const toneTimerRef = useRef<number | null>(null)
  const meterFrameRef = useRef<number | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sensorHandlerRef = useRef<((event: DeviceMotionEvent) => void) | null>(null)
  const mediaRequestIdRef = useRef(0)
  const activePointersRef = useRef<Set<number>>(new Set())

  useEffect(() => {
    try {
      if (typeof document !== 'undefined') {
        document.title = 'Free Phone Diagnostic Test | Fonestack'
      }
    } catch (error) {
      console.error('Unable to set diagnostic page title:', error)
    }

    try {
      if (typeof window !== 'undefined') {
        setPointerSupported(typeof window.PointerEvent !== 'undefined')
      }
    } catch (error) {
      console.error('Unable to detect pointer support:', error)
      setPointerSupported(false)
    }

    try {
      if (typeof navigator !== 'undefined' && typeof screen !== 'undefined') {
        setDeviceInfo({
          userAgent: navigator.userAgent || 'Unavailable',
          screenSize: `${screen.width} x ${screen.height}`,
          pixelRatio: String(window.devicePixelRatio || 1),
        })
      }
    } catch (error) {
      console.error('Unable to read device information:', error)
      setDeviceInfo({
        userAgent: 'Unavailable',
        screenSize: 'Unavailable',
        pixelRatio: 'Unavailable',
      })
    }
  }, [])

  const stopMedia = useCallback(() => {
    mediaRequestIdRef.current += 1
    try {
      if (
        meterFrameRef.current !== null &&
        typeof window !== 'undefined' &&
        typeof window.cancelAnimationFrame === 'function'
      ) {
        window.cancelAnimationFrame(meterFrameRef.current)
        meterFrameRef.current = null
      }
    } catch (error) {
      console.error('Unable to stop microphone level meter:', error)
    }

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          try {
            track.stop()
          } catch (error) {
            console.error('Unable to stop media track:', error)
          }
        })
        streamRef.current = null
      }
    } catch (error) {
      console.error('Unable to stop media stream:', error)
    }

    try {
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    } catch (error) {
      console.error('Unable to clear camera preview:', error)
    }

    analyserRef.current = null
    setMicrophoneLevel(0)
  }, [])

  const stopTone = useCallback(() => {
    try {
      if (toneTimerRef.current !== null && typeof window !== 'undefined' && typeof window.clearTimeout === 'function') {
        window.clearTimeout(toneTimerRef.current)
        toneTimerRef.current = null
      }
    } catch (error) {
      console.error('Unable to clear speaker test timer:', error)
    }

    try {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop()
        oscillatorRef.current.disconnect()
        oscillatorRef.current = null
      }
    } catch (error) {
      console.error('Unable to stop speaker test tone:', error)
    }

    try {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        void audioContextRef.current.close().catch((error) => {
          console.error('Unable to close audio context:', error)
        })
        audioContextRef.current = null
      }
    } catch (error) {
      console.error('Unable to close audio context:', error)
    }
  }, [])

  useEffect(() => {
    setApiError('')
    return () => {
      stopMedia()
      stopTone()
      try {
        if (
          sensorHandlerRef.current &&
          typeof window !== 'undefined' &&
          typeof window.removeEventListener === 'function'
        ) {
          window.removeEventListener('devicemotion', sensorHandlerRef.current)
          sensorHandlerRef.current = null
        }
      } catch (error) {
        console.error('Unable to stop motion sensor listener:', error)
      }
    }
  }, [step, stopMedia, stopTone])

  const recordResult = (testId: TestId, status: ResultStatus) => {
    stopMedia()
    stopTone()
    setResults((current) => ({ ...current, [testId]: status }))
    setStep((current) => current + 1)
  }

  const markUnsupported = (testId: TestId) => {
    setApiError('')
    recordResult(testId, 'not-supported')
  }

  const advanceScreenColors = () => {
    if (screenColorIndex < SCREEN_COLORS.length - 1) {
      setScreenColorIndex((current) => current + 1)
    } else {
      setScreenColorIndex(SCREEN_COLORS.length)
    }
  }

  const markTouchSquare = (index: number) => {
    setTouchSquares((current) => {
      if (current[index]) return current
      const next = [...current]
      next[index] = true
      return next
    })
  }

  const playTone = (channel: 'left' | 'right' | 'both') => {
    setApiError('')
    stopTone()

    try {
      if (typeof window === 'undefined' || typeof window.AudioContext === 'undefined') {
        markUnsupported('speaker')
        return
      }

      const context = new window.AudioContext()
      if (typeof context.createStereoPanner !== 'function') {
        void context.close().catch((error) => console.error('Unable to close unsupported audio context:', error))
        markUnsupported('speaker')
        return
      }
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      const panner = context.createStereoPanner()
      const pan = channel === 'left' ? -1 : channel === 'right' ? 1 : 0

      oscillator.type = 'sine'
      oscillator.frequency.value = 440
      gain.gain.value = 0.18
      panner.pan.value = pan
      oscillator.connect(panner)
      panner.connect(gain)
      gain.connect(context.destination)
      audioContextRef.current = context
      oscillatorRef.current = oscillator
      oscillator.start()
      void context.resume().catch((error) => {
        console.error('Unable to resume audio context:', error)
        setApiError('Audio playback was blocked by the browser. Check audio permissions and try again.')
      })
      if (typeof window.setTimeout !== 'function') {
        markUnsupported('speaker')
        return
      }
      toneTimerRef.current = window.setTimeout(stopTone, 1200)
    } catch (error) {
      console.error('Speaker test failed:', error)
      setApiError('The speaker test could not start. Check browser audio permissions and try again.')
    }
  }

  const startMicrophone = async () => {
    setApiError('')
    stopMedia()
    stopTone()
    let requestId = 0
    try {
      if (
        typeof navigator === 'undefined' ||
        typeof navigator.mediaDevices === 'undefined' ||
        typeof navigator.mediaDevices.getUserMedia !== 'function' ||
        typeof window === 'undefined' ||
        typeof window.requestAnimationFrame !== 'function' ||
        typeof window.cancelAnimationFrame !== 'function'
      ) {
        markUnsupported('microphone')
        return
      }

      requestId = ++mediaRequestIdRef.current
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      if (requestId !== mediaRequestIdRef.current) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }

      streamRef.current = stream
      const AudioContextConstructor = window.AudioContext
      if (typeof AudioContextConstructor === 'undefined') {
        markUnsupported('microphone')
        return
      }

      const context = new AudioContextConstructor()
      if (typeof context.createMediaStreamSource !== 'function' || typeof context.createAnalyser !== 'function') {
        void context.close().catch((error) => console.error('Unable to close unsupported audio context:', error))
        markUnsupported('microphone')
        return
      }
      const source = context.createMediaStreamSource(stream)
      const analyser = context.createAnalyser()
      const samples = new Uint8Array(analyser.fftSize)
      source.connect(analyser)
      analyserRef.current = analyser

      const updateLevel = () => {
        try {
          analyser.getByteTimeDomainData(samples)
          const sum = samples.reduce((total, sample) => total + (sample - 128) ** 2, 0)
          setMicrophoneLevel(Math.min(100, Math.round(Math.sqrt(sum / samples.length) * 2)))
          meterFrameRef.current = window.requestAnimationFrame(updateLevel)
        } catch (error) {
          console.error('Unable to read microphone level:', error)
          setApiError('The microphone level meter stopped unexpectedly.')
        }
      }

      audioContextRef.current = context
      updateLevel()
    } catch (error) {
      if (requestId !== 0 && requestId !== mediaRequestIdRef.current) return
      const errorName =
        typeof error === 'object' && error !== null && 'name' in error ? error.name : undefined
      if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
        markUnsupported('microphone')
        return
      }
      console.error('Microphone test failed:', error)
      setApiError('Microphone access failed. Allow microphone access in your browser settings, then try again.')
    }
  }

  const startCamera = async (facing: 'user' | 'environment') => {
    setApiError('')
    stopMedia()
    setCameraFacing(facing)
    let requestId = 0

    try {
      if (
        typeof navigator === 'undefined' ||
        typeof navigator.mediaDevices === 'undefined' ||
        typeof navigator.mediaDevices.getUserMedia !== 'function'
      ) {
        markUnsupported('camera')
        return
      }

      requestId = ++mediaRequestIdRef.current
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facing } },
        audio: false,
      })
      if (requestId !== mediaRequestIdRef.current) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }

      streamRef.current = stream
      if (!videoRef.current) {
        stream.getTracks().forEach((track) => track.stop())
        streamRef.current = null
        setApiError('Camera preview is unavailable in this browser.')
        return
      }
      if (typeof videoRef.current.play !== 'function') {
        markUnsupported('camera')
        return
      }
      videoRef.current.srcObject = stream
      await videoRef.current.play()
    } catch (error) {
      if (requestId !== 0 && requestId !== mediaRequestIdRef.current) return
      const errorName =
        typeof error === 'object' && error !== null && 'name' in error ? error.name : undefined
      if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
        markUnsupported('camera')
        return
      }
      console.error('Camera test failed:', error)
      setApiError('Camera access failed. Allow camera access in your browser settings, then try again.')
    }
  }

  const startSensors = async () => {
    setApiError('')
    const sensorStep = step
    try {
      if (typeof window === 'undefined' || typeof window.DeviceMotionEvent === 'undefined') {
        markUnsupported('sensors')
        return
      }

      const MotionEventConstructor = window.DeviceMotionEvent as typeof DeviceMotionEvent & {
        requestPermission?: () => Promise<string>
      }
      if (typeof MotionEventConstructor.requestPermission === 'function') {
        const permission = await MotionEventConstructor.requestPermission()
        if (permission !== 'granted') {
          setApiError('Motion sensor permission was not granted. You can try again or skip this test.')
          return
        }
      }
      if (step !== sensorStep) return

      if (sensorHandlerRef.current && typeof window.removeEventListener === 'function') {
        window.removeEventListener('devicemotion', sensorHandlerRef.current)
      }
      const handler = (event: DeviceMotionEvent) => {
        try {
          const acceleration = event.accelerationIncludingGravity
          const rotation = event.rotationRate
          setSensorReading({
            acceleration: `x ${formatValue(acceleration?.x)} · y ${formatValue(acceleration?.y)} · z ${formatValue(acceleration?.z)} m/s²`,
            rotation: `α ${formatValue(rotation?.alpha)} · β ${formatValue(rotation?.beta)} · γ ${formatValue(rotation?.gamma)} °/s`,
          })
        } catch (error) {
          console.error('Unable to read motion sensor values:', error)
          setApiError('Motion sensor values could not be read.')
        }
      }

      sensorHandlerRef.current = handler
      if (typeof window.addEventListener !== 'function') {
        markUnsupported('sensors')
        return
      }
      window.addEventListener('devicemotion', handler)
    } catch (error) {
      console.error('Motion sensor test failed:', error)
      setApiError('Motion sensors could not start. Check browser permissions and try again.')
    }
  }

  const vibrate = () => {
    setApiError('')
    try {
      if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') {
        markUnsupported('vibration')
        return
      }
      const started = navigator.vibrate(250)
      if (!started) {
        markUnsupported('vibration')
      }
    } catch (error) {
      console.error('Vibration test failed:', error)
      setApiError('The browser could not start vibration. You can still mark the result or skip.')
    }
  }

  const shareSummary = () => {
    const summary = TESTS.map(({ id, name }) => `${name}: ${resultLabel(results[id])}`).join('\n')
    const device = deviceInfo
      ? `\nDevice: ${deviceInfo.userAgent}\nScreen: ${deviceInfo.screenSize}\nPixel ratio: ${deviceInfo.pixelRatio}`
      : ''
    const url = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(`Fonestack Phone Diagnostic\n${summary}${device}`)}`
    try {
      if (typeof window === 'undefined' || typeof window.open !== 'function') {
        setApiError('WhatsApp could not be opened on this device.')
        return
      }
      const opened = window.open(url, '_blank', 'noopener,noreferrer')
      if (!opened) setApiError('WhatsApp was blocked by the browser. Allow pop-ups and try again.')
    } catch (error) {
      console.error('Unable to open WhatsApp:', error)
      setApiError('WhatsApp could not be opened on this device.')
    }
  }

  const startAgain = () => {
    setResults({})
    setScreenColorIndex(0)
    setTouchSquares(Array(36).fill(false))
    setSensorReading({
      acceleration: 'Waiting for sensor data…',
      rotation: 'Waiting for sensor data…',
    })
    setStep(-1)
  }

  const currentTest = step >= 0 && step < TESTS.length ? TESTS[step] : null
  const allTouchSquaresDone = touchSquares.every(Boolean)
  const currentColor = SCREEN_COLORS[screenColorIndex]

  return (
    <main className="min-h-screen bg-black px-4 pb-12 pt-8 text-white sm:px-6 sm:pt-12">
      <div className="mx-auto max-w-xl">
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-lime-400">Fonestack · Free phone check</p>

        {step === -1 && (
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Free Phone Diagnostic Test</h1>
            <p className="mt-4 leading-7 text-gray-300">
              Check your screen, touch, speaker, microphone, cameras and more. Follow each step and choose what you
              observe. Some checks need browser permission and may not be available on every device.
            </p>
            <button type="button" className={`${PRIMARY_BUTTON_CLASS} mt-8 w-full`} onClick={() => setStep(0)}>
              Start
            </button>
            <p className="mt-4 text-center text-sm text-gray-400">Your results stay on this device until you choose to share them.</p>
          </section>
        )}

        {currentTest && (
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-8">
            <div className="mb-5 flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-lime-400">Test {step + 1} of {TESTS.length}</p>
              <p className="text-sm text-gray-400">{currentTest.name}</p>
            </div>
            <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-lime-400" style={{ width: `${((step + 1) / TESTS.length) * 100}%` }} />
            </div>

            {currentTest.id === 'screen' && (
              <>
                <h1 className="text-2xl font-bold">Check your screen</h1>
                <p className="mt-2 leading-6 text-gray-300">
                  Look for dead pixels or discoloured spots. Tap the color to move through red, green, blue, white and black.
                </p>
                {currentColor ? (
                  <div
                    className={`fixed inset-0 z-[100] flex min-h-[100svh] w-full flex-col items-center justify-between px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] ${
                      currentColor.name === 'White' ? 'text-black' : 'text-white'
                    }`}
                    style={{ backgroundColor: currentColor.color }}
                  >
                    <button
                      type="button"
                      aria-label={`${currentColor.name} screen test color. Tap to continue.`}
                      className="flex min-h-0 flex-1 items-end justify-center pb-6 text-center text-sm font-semibold"
                      onClick={advanceScreenColors}
                    >
                      {currentColor.name} · Tap anywhere to continue. Look for dead pixels or discoloured spots.
                    </button>
                    <button
                      type="button"
                      className={`${BUTTON_CLASS} border border-current/20 bg-black/10`}
                      onClick={() => recordResult('screen', 'skipped')}
                    >
                      Skip screen test
                    </button>
                  </div>
                ) : (
                  <div className="mt-5 rounded-xl border border-lime-400/30 bg-lime-400/10 p-4 text-center text-lime-200">
                    Color check complete. Did you notice any dead pixels or discoloration?
                  </div>
                )}
                {screenColorIndex === SCREEN_COLORS.length && (
                  <ResultButtons
                    onWorks={() => recordResult('screen', 'pass')}
                    onProblem={() => recordResult('screen', 'problem')}
                    onSkip={() => recordResult('screen', 'skipped')}
                  />
                )}
              </>
            )}

            {currentTest.id === 'touch' && (
              <>
                <h1 className="text-2xl font-bold">Check your touchscreen</h1>
                <p className="mt-2 leading-6 text-gray-300">Tap or swipe across every square until the whole grid turns green.</p>
                {pointerSupported === false ? (
                  <UnsupportedMessage onContinue={() => markUnsupported('touch')} />
                ) : (
                  <>
                    <div
                      className="mt-5 grid grid-cols-6 gap-2 touch-none"
                      onPointerDown={(event) => {
                        activePointersRef.current.add(event.pointerId)
                                        const square = (event.target as HTMLElement).dataset.square
                                        if (square !== undefined) markTouchSquare(Number(square))
                                      }}
                                      onPointerMove={(event) => {
                                        if (activePointersRef.current.has(event.pointerId)) {
                                          try {
                                            if (typeof document !== 'undefined' && typeof document.elementFromPoint === 'function') {
                                              const target = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null
                                              if (target?.dataset.square !== undefined) markTouchSquare(Number(target.dataset.square))
                                            }
                                          } catch (error) {
                                            console.error('Unable to detect touchscreen swipe position:', error)
                                          }
                                        }
                                      }}
                                      onPointerOver={(event) => {
                                        if (activePointersRef.current.has(event.pointerId)) {
                                          const target = event.target as HTMLElement
                          if (target.dataset.square !== undefined) markTouchSquare(Number(target.dataset.square))
                        }
                      }}
                      onPointerUp={(event) => activePointersRef.current.delete(event.pointerId)}
                      onPointerCancel={(event) => activePointersRef.current.delete(event.pointerId)}
                      onLostPointerCapture={(event) => activePointersRef.current.delete(event.pointerId)}
                      aria-label="Touchscreen test grid"
                    >
                      {touchSquares.map((isTouched, index) => (
                        <div
                          key={index}
                          data-square={index}
                          className={`aspect-square rounded-md border transition-colors ${
                            isTouched ? 'border-green-400 bg-green-500' : 'border-white/20 bg-white/10'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="mt-3 text-center text-sm text-gray-400">
                      {touchSquares.filter(Boolean).length} of {touchSquares.length} squares checked
                    </p>
                    <ResultButtons
                      onWorks={() => recordResult('touch', 'pass')}
                      onProblem={() => recordResult('touch', 'problem')}
                      onSkip={() => recordResult('touch', 'skipped')}
                      disabled={!allTouchSquaresDone}
                    />
                  </>
                )}
              </>
            )}

            {currentTest.id === 'speaker' && (
              <>
                <h1 className="text-2xl font-bold">Check your speaker</h1>
                <p className="mt-2 leading-6 text-gray-300">Play each tone and listen for clear sound from the left, right and both sides.</p>
                <div className="mt-5 grid grid-cols-3 gap-2">
                  {(['left', 'right', 'both'] as const).map((channel) => (
                    <button
                      type="button"
                      key={channel}
                      className={SECONDARY_BUTTON_CLASS}
                      onClick={() => playTone(channel)}
                    >
                      {channel[0].toUpperCase() + channel.slice(1)}
                    </button>
                  ))}
                </div>
                <ResultButtons
                  onWorks={() => recordResult('speaker', 'pass')}
                  onProblem={() => recordResult('speaker', 'problem')}
                  onSkip={() => recordResult('speaker', 'skipped')}
                />
              </>
            )}

            {currentTest.id === 'microphone' && (
              <>
                <h1 className="text-2xl font-bold">Check your microphone</h1>
                <p className="mt-2 leading-6 text-gray-300">Allow microphone access, then speak and watch the live level meter.</p>
                <button type="button" className={`${SECONDARY_BUTTON_CLASS} mt-5 w-full`} onClick={startMicrophone}>
                  Start microphone
                </button>
                <div className="mt-5 h-5 overflow-hidden rounded-full bg-white/10" role="meter" aria-label="Microphone input level" aria-valuenow={microphoneLevel} aria-valuemin={0} aria-valuemax={100}>
                  <div className="h-full rounded-full bg-lime-400 transition-[width]" style={{ width: `${microphoneLevel}%` }} />
                </div>
                <p className="mt-2 text-center text-sm text-gray-400">Input level: {microphoneLevel}%</p>
                <ResultButtons
                  onWorks={() => recordResult('microphone', 'pass')}
                  onProblem={() => recordResult('microphone', 'problem')}
                  onSkip={() => recordResult('microphone', 'skipped')}
                />
              </>
            )}

            {currentTest.id === 'camera' && (
              <>
                <h1 className="text-2xl font-bold">Check your cameras</h1>
                <p className="mt-2 leading-6 text-gray-300">Preview the front and back camera. Allow camera access when prompted.</p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button type="button" className={SECONDARY_BUTTON_CLASS} onClick={() => startCamera('user')}>Front camera</button>
                  <button type="button" className={SECONDARY_BUTTON_CLASS} onClick={() => startCamera('environment')}>Back camera</button>
                </div>
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  aria-label={`${cameraFacing === 'user' ? 'Front' : 'Back'} camera preview`}
                  className="mt-4 aspect-video w-full rounded-xl bg-black object-cover"
                />
                <ResultButtons
                  onWorks={() => recordResult('camera', 'pass')}
                  onProblem={() => recordResult('camera', 'problem')}
                  onSkip={() => recordResult('camera', 'skipped')}
                />
              </>
            )}

            {currentTest.id === 'sensors' && (
              <>
                <h1 className="text-2xl font-bold">Check motion sensors</h1>
                <p className="mt-2 leading-6 text-gray-300">Move and tilt your phone to see live accelerometer and gyroscope values.</p>
                <button type="button" className={`${SECONDARY_BUTTON_CLASS} mt-5 w-full`} onClick={startSensors}>
                  Enable motion sensors
                </button>
                <dl className="mt-5 space-y-3 rounded-xl border border-white/10 bg-black/40 p-4 text-sm">
                  <div>
                    <dt className="font-semibold text-gray-300">Accelerometer</dt>
                    <dd className="mt-1 break-words font-mono text-lime-200">{sensorReading.acceleration}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-gray-300">Gyroscope</dt>
                    <dd className="mt-1 break-words font-mono text-lime-200">{sensorReading.rotation}</dd>
                  </div>
                </dl>
                <ResultButtons
                  onWorks={() => recordResult('sensors', 'pass')}
                  onProblem={() => recordResult('sensors', 'problem')}
                  onSkip={() => recordResult('sensors', 'skipped')}
                />
              </>
            )}

            {currentTest.id === 'vibration' && (
              <>
                <h1 className="text-2xl font-bold">Check vibration</h1>
                <p className="mt-2 leading-6 text-gray-300">Tap the button and check whether your phone vibrates.</p>
                <button type="button" className={`${SECONDARY_BUTTON_CLASS} mt-5 w-full`} onClick={vibrate}>
                  Vibrate phone
                </button>
                <ResultButtons
                  onWorks={() => recordResult('vibration', 'pass')}
                  onProblem={() => recordResult('vibration', 'problem')}
                  onSkip={() => recordResult('vibration', 'skipped')}
                />
              </>
            )}

            {apiError && (
              <p role="alert" className="mt-5 rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">
                {apiError}
              </p>
            )}
          </section>
        )}

        {step >= TESTS.length && (
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-8">
            <h1 className="text-3xl font-bold">Your diagnostic results</h1>
            <div className="mt-5 overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-white/5 text-gray-300">
                  <tr>
                    <th scope="col" className="p-3">Test</th>
                    <th scope="col" className="p-3">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {TESTS.map(({ id, name }) => (
                    <tr key={id} className="border-t border-white/10">
                      <th scope="row" className="p-3 font-medium">{name}</th>
                      <td className="p-3">{resultLabel(results[id])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 className="mt-7 text-lg font-bold">Device information</h2>
            <dl className="mt-3 space-y-3 rounded-xl border border-white/10 bg-black/40 p-4 text-sm">
              <div>
                <dt className="font-semibold text-gray-300">Browser / device</dt>
                <dd className="mt-1 break-all text-gray-200">{deviceInfo?.userAgent ?? 'Unavailable'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="font-semibold text-gray-300">Screen size</dt>
                <dd>{deviceInfo?.screenSize ?? 'Unavailable'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="font-semibold text-gray-300">Device pixel ratio</dt>
                <dd>{deviceInfo?.pixelRatio ?? 'Unavailable'}</dd>
              </div>
            </dl>

            <div className="mt-7 grid gap-3">
              <button type="button" className={PRIMARY_BUTTON_CLASS} onClick={shareSummary}>Send result on WhatsApp</button>
              <Link href="/contact" className={`${SECONDARY_BUTTON_CLASS} text-center`}>Book a repair</Link>
              <button type="button" className={SECONDARY_BUTTON_CLASS} onClick={startAgain}>Start again</button>
            </div>
            {apiError && (
              <p role="alert" className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">
                {apiError}
              </p>
            )}
          </section>
        )}
      </div>
    </main>
  )
}

function ResultButtons({
  onWorks,
  onProblem,
  onSkip,
  disabled = false,
}: {
  onWorks: () => void
  onProblem: () => void
  onSkip: () => void
  disabled?: boolean
}) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-3">
      <button type="button" className={PRIMARY_BUTTON_CLASS} onClick={onWorks} disabled={disabled}>Works</button>
      <button type="button" className={`${BUTTON_CLASS} bg-red-500 text-white hover:bg-red-400`} onClick={onProblem} disabled={disabled}>Problem</button>
      <button type="button" className={`${SECONDARY_BUTTON_CLASS} col-span-2`} onClick={onSkip}>Skip</button>
    </div>
  )
}

function UnsupportedMessage({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="mt-5 rounded-xl border border-white/10 bg-black/40 p-4">
      <p className="text-gray-300">Not supported on this device</p>
      <button type="button" className={`${PRIMARY_BUTTON_CLASS} mt-4 w-full`} onClick={onContinue}>Continue</button>
    </div>
  )
}
