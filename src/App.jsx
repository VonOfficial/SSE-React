
import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('Подключение к серверу...')
  const [error, setError] = useState('')
  const [runId, setRunId] = useState(0)

  useEffect(() => {
    let completed = false

    const eventSource = new EventSource(
      'http://127.0.0.1:8000/progress'
    )

    function handleProgress(event) {
      const data = JSON.parse(event.data)

      setProgress(data.progress)
      setStatus('Задача выполняется...')
    }

    function handleComplete(event) {
      const data = JSON.parse(event.data)

      completed = true
      setProgress(100)
      setStatus(data.message)

      eventSource.close()
    }

    eventSource.addEventListener('progress', handleProgress)
    eventSource.addEventListener('complete', handleComplete)

    eventSource.onerror = () => {
      if (!completed) {
        setStatus('Ошибка подключения')
        setError('Соединение потеряно. Проверьте Python-сервер.')
        eventSource.close()
      }
    }

    return () => {
      eventSource.removeEventListener('progress', handleProgress)
      eventSource.removeEventListener('complete', handleComplete)
      eventSource.close()
    }
  }, [runId])

  function restartTask() {
    setProgress(0)
    setStatus('Подключение к серверу...')
    setError('')
    setRunId(id => id + 1)
  }

  return (
    <div className="app">
      <div className="card">
        <h1>SSE Progress</h1>
        <p className="description">
          Отслеживание выполнения задачи через EventSource API
        </p>

        <div className="progress-info">
          <span>Прогресс выполнения</span>
          <strong>{progress}%</strong>
        </div>

        <progress value={progress} max="100" />

        <p className={error ? 'status error' : 'status'}>
          {error || status}
        </p>

        <button onClick={restartTask}>
          Запустить заново
        </button>
      </div>
    </div>
  )
}

export default App
