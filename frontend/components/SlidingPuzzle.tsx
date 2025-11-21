'use client'

import { useState, useEffect } from 'react'

interface SlidingPuzzleProps {
  showTimer: boolean
  onComplete: (solveTime: number) => void
}

type Board = number[][]

export default function SlidingPuzzle({ showTimer, onComplete }: SlidingPuzzleProps) {
  const [board, setBoard] = useState<Board>([])
  const [emptyPos, setEmptyPos] = useState({ row: 0, col: 0 })
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [moveCount, setMoveCount] = useState(0)

  // 3x3 puzzle constants
  const GRID_SIZE = 3
  const TILE_COUNT = GRID_SIZE * GRID_SIZE

  // Initialize puzzle
  useEffect(() => {
    initializePuzzle()
  }, [])

  // Timer logic
  useEffect(() => {
    if (startTime && !isComplete) {
      const interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime)
      }, 10)
      return () => clearInterval(interval)
    }
  }, [startTime, isComplete])

  const initializePuzzle = () => {
    let newBoard: Board
    let solvable = false
    
    // Keep generating until we get a solvable puzzle
    while (!solvable) {
      newBoard = generateRandomBoard()
      solvable = isSolvable(newBoard)
    }
    
    setBoard(newBoard!)
    
    // Find empty position
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (newBoard![i][j] === 0) {
          setEmptyPos({ row: i, col: j })
        }
      }
    }
    
    setStartTime(Date.now())
    setElapsedTime(0)
    setIsComplete(false)
    setMoveCount(0)
  }

  const generateRandomBoard = (): Board => {
    const numbers = Array.from({ length: TILE_COUNT }, (_, i) => i)
    
    // Fisher-Yates shuffle
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]]
    }

    const board: Board = []
    for (let i = 0; i < GRID_SIZE; i++) {
      board.push(numbers.slice(i * GRID_SIZE, (i + 1) * GRID_SIZE))
    }
    
    return board
  }

  const isSolvable = (board: Board): boolean => {
    const flat = board.flat()
    let inversions = 0
    
    // Count inversions (pairs where larger number comes before smaller)
    for (let i = 0; i < flat.length; i++) {
      if (flat[i] === 0) continue
      for (let j = i + 1; j < flat.length; j++) {
        if (flat[j] === 0) continue
        if (flat[i] > flat[j]) inversions++
      }
    }
    
    // For 3x3 puzzle (odd grid width):
    // Puzzle is solvable if the number of inversions is EVEN
    return inversions % 2 === 0
  }

  const checkWin = (board: Board): boolean => {
    // Goal: 1,2,3,4,5,6,7,8,0 (0 at bottom right)
    const target = [1, 2, 3, 4, 5, 6, 7, 8, 0]
    const flat = board.flat()
    return flat.every((val, idx) => val === target[idx])
  }

  const handleTileClick = (row: number, col: number) => {
    if (isComplete) return

    // Check if tile is adjacent to empty space
    const isAdjacent = 
      (Math.abs(row - emptyPos.row) === 1 && col === emptyPos.col) ||
      (Math.abs(col - emptyPos.col) === 1 && row === emptyPos.row)

    if (!isAdjacent) return

    // Swap tile with empty space
    const newBoard = board.map(row => [...row])
    newBoard[emptyPos.row][emptyPos.col] = newBoard[row][col]
    newBoard[row][col] = 0

    setBoard(newBoard)
    setEmptyPos({ row, col })
    setMoveCount(moveCount + 1)

    // Check if puzzle is complete
    if (checkWin(newBoard)) {
      const solveTime = Date.now() - startTime!
      setIsComplete(true)
      onComplete(solveTime)
    }
  }

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000)
    const milliseconds = Math.floor((ms % 1000) / 10)
    return `${seconds}.${milliseconds.toString().padStart(2, '0')}s`
  }

  return (
    <div style={styles.container}>
      {showTimer && (
        <div style={styles.timerContainer}>
          <div style={styles.timerBox}>
            <div style={styles.timerLabel}>⏱️ TIME</div>
            <div style={styles.timerDisplay}>
              {formatTime(elapsedTime)}
            </div>
          </div>
          <div style={styles.movesBox}>
            <div style={styles.movesLabel}>MOVES</div>
            <div style={styles.movesDisplay}>
              {moveCount}
            </div>
          </div>
        </div>
      )}

      <div style={styles.board}>
        {board.map((row, rowIdx) =>
          row.map((tile, colIdx) => (
            <div
              key={`${rowIdx}-${colIdx}`}
              onClick={() => handleTileClick(rowIdx, colIdx)}
              style={{
                ...styles.tile,
                ...(tile === 0 ? styles.emptyTile : {}),
                cursor: tile === 0 ? 'default' : 'pointer',
              }}
            >
              {tile !== 0 && tile}
            </div>
          ))
        )}
      </div>

      {isComplete && (
        <div style={styles.completeMessage}>
          <h2 style={styles.completeTitle}>🎉 Puzzle Complete!</h2>
          <p style={styles.completeText}>
            Time: {formatTime(elapsedTime)}
          </p>
          <p style={styles.completeText}>
            Moves: {moveCount}
          </p>
          <p style={styles.thankYou}>
            Thank you for participating in our experiment!
          </p>
        </div>
      )}

      {!isComplete && (
        <button onClick={initializePuzzle} style={styles.resetButton}>
          Reset Puzzle
        </button>
      )}
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '32px',
  },
  timerContainer: {
    display: 'flex',
    gap: '24px',
    width: '100%',
    justifyContent: 'center',
  },
  timerBox: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px 32px',
    borderRadius: '16px',
    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
    textAlign: 'center' as const,
    minWidth: '200px',
    border: '3px solid white',
  },
  timerLabel: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: '1px',
    marginBottom: '8px',
  },
  timerDisplay: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'monospace',
    textShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
  movesBox: {
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    padding: '20px 32px',
    borderRadius: '16px',
    boxShadow: '0 8px 24px rgba(245, 87, 108, 0.4)',
    textAlign: 'center' as const,
    minWidth: '180px',
    border: '3px solid white',
  },
  movesLabel: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: '1px',
    marginBottom: '8px',
  },
  movesDisplay: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'monospace',
    textShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
  board: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 110px)',
    gridTemplateRows: 'repeat(3, 110px)',
    gap: '10px',
    padding: '20px',
    background: '#f0f0f0',
    borderRadius: '12px',
    boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.1)',
  },
  tile: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '2.5rem',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    transition: 'transform 0.1s, box-shadow 0.1s',
    userSelect: 'none' as const,
  },
  emptyTile: {
    background: 'transparent',
    boxShadow: 'none',
  },
  completeMessage: {
    background: '#e8f5e9',
    padding: '24px',
    borderRadius: '12px',
    textAlign: 'center' as const,
  },
  completeTitle: {
    fontSize: '2rem',
    color: '#2e7d32',
    marginBottom: '16px',
  },
  completeText: {
    fontSize: '1.2rem',
    color: '#333',
    margin: '8px 0',
  },
  thankYou: {
    fontSize: '1.1rem',
    color: '#666',
    marginTop: '16px',
  },
  resetButton: {
    padding: '12px 24px',
    fontSize: '1rem',
    fontWeight: '600',
    border: 'none',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: 'white',
    cursor: 'pointer',
  },
}

