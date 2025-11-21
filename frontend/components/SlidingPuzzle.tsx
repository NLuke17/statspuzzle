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
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
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
    const numbers = Array.from({ length: 16 }, (_, i) => i)
    
    // Fisher-Yates shuffle
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]]
    }

    const board: Board = []
    for (let i = 0; i < 4; i++) {
      board.push(numbers.slice(i * 4, (i + 1) * 4))
    }
    
    return board
  }

  const isSolvable = (board: Board): boolean => {
    const flat = board.flat()
    let inversions = 0
    
    for (let i = 0; i < flat.length; i++) {
      if (flat[i] === 0) continue
      for (let j = i + 1; j < flat.length; j++) {
        if (flat[j] === 0) continue
        if (flat[i] > flat[j]) inversions++
      }
    }
    
    // Find row of empty tile from bottom
    let emptyRow = 0
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === 0) {
          emptyRow = 4 - i
        }
      }
    }
    
    // For 4x4 puzzle: solvable if inversions + empty row from bottom is odd
    return (inversions + emptyRow) % 2 === 1
  }

  const checkWin = (board: Board): boolean => {
    const target = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0]
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
          <div style={styles.timer}>
            Time: {formatTime(elapsedTime)}
          </div>
          <div style={styles.moves}>
            Moves: {moveCount}
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
    gap: '24px',
  },
  timerContainer: {
    display: 'flex',
    gap: '32px',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#667eea',
  },
  timer: {
    fontFamily: 'monospace',
  },
  moves: {
    fontFamily: 'monospace',
  },
  board: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 100px)',
    gridTemplateRows: 'repeat(4, 100px)',
    gap: '8px',
    padding: '16px',
    background: '#f0f0f0',
    borderRadius: '12px',
    boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.1)',
  },
  tile: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '2rem',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
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

