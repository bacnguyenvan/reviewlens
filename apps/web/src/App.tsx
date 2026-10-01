import type { HealthResponse } from "@reviewlens/shared";

function App() {
  const health: HealthResponse = {
    status: "ok",
  };

  return (
    <div>
      <h1>ReviewLens</h1>
      <p>API status: {health.status}</p>
    </div>
  );
}

export default App;
