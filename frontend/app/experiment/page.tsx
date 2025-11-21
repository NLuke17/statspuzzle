'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import SlidingPuzzle from '@/components/SlidingPuzzle'

export default function Experiment() {
  const router = useRouter()
  const [showTimer, setShowTimer] = useState<boolean | null>(null)
  const [completedWithTimer, setCompletedWithTimer] = useState(false)
  const [completedWithoutTimer, setCompletedWithoutTimer] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showTransition, setShowTransition] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    const checkExperimentStatus = async () => {
      const token = localStorage.getItem('token')
      const username = localStorage.getItem('username')

      if (!token || !username) {
        router.push('/login')
        return
      }

      try {
        // Check which conditions user has completed
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/check-completion`,
          { headers: { Authorization: `Bearer ${token}` } }
        )

        console.log('Completion status from server:', response.data)

        setCompletedWithTimer(response.data.completed_with_timer)
        setCompletedWithoutTimer(response.data.completed_without_timer)

        if (response.data.has_completed_both) {
          // Both completed
          console.log('User has completed both conditions')
          setLoading(false)
          return
        }

        // Check if user has started any attempts
        const hasAnyAttempt = response.data.completed_with_timer || response.data.completed_without_timer
        
        if (hasAnyAttempt) {
          // User has completed one, show the other condition immediately
          if (response.data.completed_with_timer) {
            console.log('Already completed with timer, now showing without timer')
            setShowTimer(false)
          } else {
            console.log('Already completed without timer, now showing with timer')
            setShowTimer(true)
          }
          setHasStarted(true)
        } else {
          // First time - show welcome screen, don't assign condition yet
          console.log('First time user - showing welcome screen')
          setHasStarted(false)
        }

        setLoading(false)
      } catch (err: any) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token')
          localStorage.removeItem('username')
          router.push('/login')
        } else {
          setError('Failed to load experiment. Please try again.')
          setLoading(false)
        }
      }
    }

    checkExperimentStatus()
  }, [router])

  const handlePuzzleComplete = async (solveTime: number) => {
    const token = localStorage.getItem('token')
    
    try {
      console.log('Submitting result:', { solve_time: solveTime, show_timer: showTimer })
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/submit-result`,
        {
          solve_time: solveTime,
          show_timer: showTimer,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      console.log('Result submitted successfully:', response.data)

      // Update completion status based on which condition was just completed
      const newCompletedWithTimer = showTimer ? true : completedWithTimer
      const newCompletedWithoutTimer = !showTimer ? true : completedWithoutTimer
      
      console.log('Updating completion states:', {
        completedWithTimer: newCompletedWithTimer,
        completedWithoutTimer: newCompletedWithoutTimer
      })

      setCompletedWithTimer(newCompletedWithTimer)
      setCompletedWithoutTimer(newCompletedWithoutTimer)

      // Check if both are now complete
      if (newCompletedWithTimer && newCompletedWithoutTimer) {
        console.log('Both conditions now complete!')
        setShowTimer(null)
        setShowTransition(false)
      } else {
        console.log('One more condition to go! Switching to the other condition...')
        // Show transition message
        setShowTransition(true)
        // Wait a moment before switching to next condition
        setTimeout(() => {
          setShowTransition(false)
          setShowTimer(!showTimer)
        }, 2000)
      }
    } catch (err: any) {
      console.error('Error submitting result:', err)
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to submit results. Please try again.'
      setError(errorMessage)
      alert(`Error: ${errorMessage}`)
    }
  }

  if (loading) {
    return (
      <main style={styles.container}>
        <div style={styles.card}>
          <h2>Loading...</h2>
        </div>
      </main>
    )
  }

  if (completedWithTimer && completedWithoutTimer) {
    console.log('Rendering completion screen - both conditions done')
    return (
      <main style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>🎉 Thank You!</h1>
          <p style={styles.description}>
            You have completed both conditions of the experiment! Thank you for your participation!
          </p>
          <div style={styles.completionSummary}>
            <p>✅ Completed with timer</p>
            <p>✅ Completed without timer</p>
          </div>
          <button 
            onClick={() => router.push('/')}
            style={styles.button}
          >
            Back to Home
          </button>
        </div>
      </main>
    )
  }


  if (error) {
    return (
      <main style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.errorTitle}>Error</h2>
          <p style={styles.error}>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            style={styles.button}
          >
            Try Again
          </button>
        </div>
      </main>
    )
  }

  const handleStart = () => {
    // Randomly assign condition when user clicks start
    const randomCondition = Math.random() < 0.5
    console.log('User clicked start - randomly assigned:', randomCondition ? 'with timer' : 'without timer')
    setShowTimer(randomCondition)
    setHasStarted(true)
  }

  if (!hasStarted && !completedWithTimer && !completedWithoutTimer) {
    return (
      <main style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Welcome to the Sliding Puzzle Experiment</h1>
          <p style={styles.description}>
            Thank you for participating! In this experiment, you'll solve a 3×3 sliding puzzle twice.
          </p>
          
          <div style={styles.instructionsBox}>
            <h3 style={styles.instructionsTitle}>How it works:</h3>
            <ul style={styles.instructionsList}>
              <li>You will complete the puzzle <strong>two times</strong></li>
              <li>Arrange numbers from 1-8, with the empty space at the bottom right</li>
              <li>Click on tiles adjacent to the empty space to move them</li>
              <li>One puzzle will show a timer, one won't (randomly assigned)</li>
              <li>Try your best on both attempts!</li>
            </ul>
          </div>

          <button 
            onClick={handleStart}
            style={styles.startButton}
          >
            Start Experiment
          </button>

          <p style={styles.hint}>
            Estimated time: 3-5 minutes
          </p>
        </div>
      </main>
    )
  }

  if (showTransition) {
    return (
      <main style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>✅ Great Job!</h1>
          <p style={styles.description}>
            You've completed the first puzzle. Get ready for the second one...
          </p>
          <div style={styles.loader}>
            <div style={styles.spinner}></div>
          </div>
        </div>
      </main>
    )
  }

  if (showTimer !== null) {
    const currentAttempt = completedWithTimer || completedWithoutTimer ? '2' : '1'
    // Create a unique key to force remount when condition changes
    const puzzleKey = `puzzle-${showTimer ? 'with' : 'without'}-timer`
    
    return (
      <main style={styles.container}>
        <div style={styles.experimentCard}>
          <div style={styles.progressIndicator}>
            <p>Attempt {currentAttempt} of 2</p>
          </div>
          <h1 style={styles.title}>Sliding Puzzle</h1>
          {!showTimer && (
            <p style={styles.timerNote}>
              Note: Timer is hidden for this round
            </p>
          )}
          <p style={styles.instructions}>
            Arrange the numbers in order from 1 to 8. Click on a tile adjacent to the empty space to move it.
          </p>
          <SlidingPuzzle 
            key={puzzleKey}
            showTimer={showTimer} 
            onComplete={handlePuzzleComplete}
          />
        </div>
      </main>
    )
  }

  return null
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '20px',
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '48px',
    maxWidth: '600px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    textAlign: 'center' as const,
  },
  experimentCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '48px',
    maxWidth: '700px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    textAlign: 'center' as const,
    position: 'relative' as const,
  },
  progressIndicator: {
    position: 'absolute' as const,
    top: '20px',
    right: '20px',
    padding: '8px 16px',
    background: '#667eea',
    color: 'white',
    borderRadius: '20px',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  timerNote: {
    fontSize: '1rem',
    color: '#f5576c',
    fontWeight: '600',
    marginBottom: '16px',
    padding: '8px 16px',
    background: '#fee',
    borderRadius: '8px',
    display: 'inline-block',
  },
  loader: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '24px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  instructionsBox: {
    background: '#f8f9fa',
    padding: '24px',
    borderRadius: '12px',
    marginBottom: '32px',
    textAlign: 'left' as const,
  },
  instructionsTitle: {
    fontSize: '1.3rem',
    color: '#333',
    marginBottom: '16px',
  },
  instructionsList: {
    fontSize: '1.05rem',
    color: '#555',
    lineHeight: '2',
    paddingLeft: '24px',
  },
  startButton: {
    padding: '18px 48px',
    fontSize: '1.2rem',
    fontWeight: '700',
    border: 'none',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
  },
  hint: {
    marginTop: '16px',
    fontSize: '0.9rem',
    color: '#999',
    fontStyle: 'italic' as const,
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '16px',
    color: '#333',
    fontWeight: 'bold',
  },
  description: {
    fontSize: '1.1rem',
    color: '#666',
    lineHeight: '1.6',
    marginBottom: '24px',
  },
  instructions: {
    fontSize: '1rem',
    color: '#666',
    marginBottom: '32px',
  },
  errorTitle: {
    fontSize: '2rem',
    marginBottom: '16px',
    color: '#c33',
  },
  error: {
    padding: '12px',
    background: '#fee',
    color: '#c33',
    borderRadius: '8px',
    marginBottom: '24px',
  },
  button: {
    padding: '16px 32px',
    fontSize: '1.1rem',
    fontWeight: '600',
    border: 'none',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  secondaryButton: {
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
    marginTop: '24px',
  },
  completionStatus: {
    background: '#f5f5f5',
    padding: '20px',
    borderRadius: '8px',
    margin: '20px 0',
    fontSize: '1.1rem',
  },
  completionSummary: {
    background: '#e8f5e9',
    padding: '20px',
    borderRadius: '8px',
    margin: '20px 0',
    fontSize: '1.1rem',
    color: '#2e7d32',
  },
}

