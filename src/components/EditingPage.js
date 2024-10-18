import React, { useRef } from 'react';

function EditorPage() {
  const editorRef = useRef(null);

  // Apply formatting (e.g., bold, italic, etc.)
  const applyCommand = (command) => {
    document.execCommand(command, false, null);
    editorRef.current.focus(); // Keep focus on the editor after applying a command
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Simple Word Document-like Editor</h1>
      
      {/* Toolbar */}
      <div style={styles.toolbar}>
        <button onClick={() => applyCommand('bold')} style={styles.button}>
          <b>B</b>
        </button>
        <button onClick={() => applyCommand('italic')} style={styles.button}>
          <i>I</i>
        </button>
        <button onClick={() => applyCommand('underline')} style={styles.button}>
          <u>U</u>
        </button>
        <button onClick={() => applyCommand('strikeThrough')} style={styles.button}>
          <s>S</s>
        </button>
        <button onClick={() => applyCommand('insertUnorderedList')} style={styles.button}>
          • List
        </button>
        <button onClick={() => applyCommand('insertOrderedList')} style={styles.button}>
          1. List
        </button>
        <button onClick={() => applyCommand('formatBlock')} value={'<h1>'} style={styles.button}>
          H1
        </button>
        <button onClick={() => applyCommand('formatBlock')} value={'<h2>'} style={styles.button}>
          H2
        </button>
      </div>

      {/* Editable Document Area */}
      <div
        ref={editorRef}
        contentEditable="true"
        style={styles.editor}
        suppressContentEditableWarning={true}
      >
        <p>This is an editable area. Start typing here...</p>
      </div>
    </div>
  );
}

export default EditorPage;

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f4f4f9',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    fontFamily: 'Arial, sans-serif'
  },
  title: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  toolbar: {
    display: 'flex',
    gap: '10px',
    marginBottom: '10px',
    justifyContent: 'center',
  },
  button: {
    padding: '10px',
    fontSize: '16px',
    cursor: 'pointer',
    backgroundColor: '#007BFF',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    minWidth: '40px',
  },
  editor: {
    border: '1px solid #ddd',
    padding: '20px',
    minHeight: '300px',
    backgroundColor: 'white',
    overflowY: 'auto',
    borderRadius: '4px',
  },
};
