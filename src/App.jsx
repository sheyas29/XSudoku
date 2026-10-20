import { useState } from 'react';
import './App.css';

const createEmptyBoard = () =>
  Array(9)
    .fill(null)
    .map(() => Array(9).fill(''));

function App() {
  const [board, setBoard] = useState(createEmptyBoard);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [conflictingCells, setConflictingCells] = useState(new Set());

  // Helper functions for validating rows, columns, and 3x3 boxes
  const isValidRow = (currentBoard, rowIdx, conflicts) => {
    const seen = new Map();
    let valid = true;

    for (let colIdx = 0; colIdx < 9; colIdx++) {
      const val = currentBoard[rowIdx][colIdx];
      if (val && val !== '') {
        if (!seen.has(val)) {
          seen.set(val, [colIdx]);
        } else {
          seen.get(val).push(colIdx);
          valid = false;
        }
      }
    }

    seen.forEach((cols) => {
      if (cols.length > 1) {
        cols.forEach((colIdx) => {
          conflicts.add(`${rowIdx}-${colIdx}`);
        });
      }
    });

    return valid;
  };

  const isValidColumn = (currentBoard, colIdx, conflicts) => {
    const seen = new Map();
    let valid = true;

    for (let rowIdx = 0; rowIdx < 9; rowIdx++) {
      const val = currentBoard[rowIdx][colIdx];
      if (val && val !== '') {
        if (!seen.has(val)) {
          seen.set(val, [rowIdx]);
        } else {
          seen.get(val).push(rowIdx);
          valid = false;
        }
      }
    }

    seen.forEach((rows) => {
      if (rows.length > 1) {
        rows.forEach((rowIdx) => {
          conflicts.add(`${rowIdx}-${colIdx}`);
        });
      }
    });

    return valid;
  };

  const isValidBox = (currentBoard, boxRow, boxCol, conflicts) => {
    const seen = new Map();
    let valid = true;
    const startRow = boxRow * 3;
    const startCol = boxCol * 3;

    for (let r = startRow; r < startRow + 3; r++) {
      for (let c = startCol; c < startCol + 3; c++) {
        const val = currentBoard[r][c];
        if (val && val !== '') {
          if (!seen.has(val)) {
            seen.set(val, [{ r, c }]);
          } else {
            seen.get(val).push({ r, c });
            valid = false;
          }
        }
      }
    }

    seen.forEach((cells) => {
      if (cells.length > 1) {
        cells.forEach(({ r, c }) => {
          conflicts.add(`${r}-${c}`);
        });
      }
    });

    return valid;
  };

  const handleValidate = () => {
    const conflicts = new Set();
    let allValid = true;

    // Check all 9 rows
    for (let r = 0; r < 9; r++) {
      if (!isValidRow(board, r, conflicts)) {
        allValid = false;
      }
    }

    // Check all 9 columns
    for (let c = 0; c < 9; c++) {
      if (!isValidColumn(board, c, conflicts)) {
        allValid = false;
      }
    }

    // Check all 9 (3x3) boxes
    for (let br = 0; br < 3; br++) {
      for (let bc = 0; bc < 3; bc++) {
        if (!isValidBox(board, br, bc, conflicts)) {
          allValid = false;
        }
      }
    }

    if (!allValid || conflicts.size > 0) {
      setConflictingCells(conflicts);
      setMessage('Invalid Sudoku! Conflicts found.');
      setMessageType('error');
    } else {
      setConflictingCells(new Set());
      setMessage('Sudoku is valid so far!');
      setMessageType('success');
    }
  };

  const handleCellChange = (rowIndex, colIndex, rawValue) => {
    const val = rawValue.slice(-1);
    if (val === '' || (val >= '1' && val <= '9')) {
      const newBoard = board.map((row, rIdx) =>
        rIdx === rowIndex
          ? row.map((cell, cIdx) => (cIdx === colIndex ? val : cell))
          : [...row]
      );
      setBoard(newBoard);

      // When the board is edited, remove previous conflict highlighting and message
      if (conflictingCells.size > 0) {
        setConflictingCells(new Set());
      }
      if (message) {
        setMessage('');
        setMessageType('');
      }
    }
  };

  const handleClear = () => {
    setBoard(createEmptyBoard());
    setConflictingCells(new Set());
    setMessage('');
    setMessageType('');
  };

  const handleKeyDown = (e, rowIndex, colIndex) => {
    let targetRow = rowIndex;
    let targetCol = colIndex;

    if (e.key === 'ArrowUp') targetRow = Math.max(0, rowIndex - 1);
    else if (e.key === 'ArrowDown') targetRow = Math.min(8, rowIndex + 1);
    else if (e.key === 'ArrowLeft') targetCol = Math.max(0, colIndex - 1);
    else if (e.key === 'ArrowRight') targetCol = Math.min(8, colIndex + 1);
    else return;

    if (targetRow !== rowIndex || targetCol !== colIndex) {
      e.preventDefault();
      const nextCell = document.getElementById(`cell-${targetRow}-${targetCol}`);
      if (nextCell) {
        nextCell.focus();
      }
    }
  };

  return (
    <div className="app-container">
      <div className="card">
        <h1 className="title">Sudoku Validator</h1>
        <p className="description">Enter numbers 1-9 and validate the board.</p>

        <div className="board">
          {board.map((row, rowIndex) =>
            row.map((val, colIndex) => {
              const isConflicted = conflictingCells.has(`${rowIndex}-${colIndex}`);
              return (
                <input
                  key={`${rowIndex}-${colIndex}`}
                  id={`cell-${rowIndex}-${colIndex}`}
                  className={`cell ${isConflicted ? 'invalid conflict' : ''}`.trim()}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={val}
                  onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                  aria-label={`Cell row ${rowIndex + 1} column ${colIndex + 1}`}
                  autoComplete="off"
                />
              );
            })
          )}
        </div>

        <div className="button-group">
          <button type="button" className="btn btn-validate" onClick={handleValidate}>
            Validate
          </button>
          <button type="button" className="btn btn-clear" onClick={handleClear}>
            Clear
          </button>
        </div>

        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
