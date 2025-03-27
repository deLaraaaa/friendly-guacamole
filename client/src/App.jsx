import { useState } from "react";
import "./App.css";
import { Button } from "@mui/material";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Button
        variant="contained"
        onClick={() => setCount((count) => count + 1)}
        color="primary"
      >
        Click me
      </Button>
      <p>{count}</p>
    </>
  );
}

export default App;
