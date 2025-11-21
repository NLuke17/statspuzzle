'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const username = localStorage.getItem('username')
    if (token && username) {
      setIsLoggedIn(true)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    setIsLoggedIn(false)
  }

  return (
    <main style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Sliding Puzzle Experiment</h1>
        <p style={styles.description}>
          Welcome to our sliding puzzle experiment! We're studying how the presence 
          of a timer affects solve time. You'll be randomly assigned to either see 
          a stopwatch or not while solving the puzzle.
        </p>
        
        {isLoggedIn ? (
          <div style={styles.buttonGroup}>
            <p style={styles.welcomeText}>
              Welcome back, {localStorage.getItem('username')}!
            </p>
            <button 
              onClick={() => router.push('/experiment')}
              style={styles.button}
            >
              Start Experiment
            </button>
            <button 
              onClick={handleLogout}
              style={{...styles.button, ...styles.secondaryButton}}
            >
              Logout
            </button>
          </div>
        ) : (
          <div style={styles.buttonGroup}>
            <button 
              onClick={() => router.push('/login')}
              style={styles.button}
            >
              Login
            </button>
            <button 
              onClick={() => router.push('/signup')}
              style={{...styles.button, ...styles.secondaryButton}}
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </main>
  )
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
  title: {
    fontSize: '2.5rem',
    marginBottom: '24px',
    color: '#333',
    fontWeight: 'bold',
  },
  description: {
    fontSize: '1.1rem',
    color: '#666',
    lineHeight: '1.6',
    marginBottom: '32px',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
    alignItems: 'stretch',
  },
  welcomeText: {
    fontSize: '1.1rem',
    color: '#667eea',
    fontWeight: '600',
    marginBottom: '8px',
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
}


