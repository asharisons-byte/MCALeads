import { useState } from 'react';

export default function App() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/telnyx/status');
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}`);
      }
      
      const data = await response.json();
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testCallEndpoint = async () => {
    setLoading(true);
    setError(null);
    try {
      // Test with invalid phone number to trigger validation error (no real call)
      const response = await fetch('/api/telnyx/voice/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: 'invalid-number' }),
      });
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}`);
      }
      
      const data = await response.json();
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Telnyx API Diagnostic Tool</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Test the Telnyx API endpoints without making real calls
      </p>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={testStatus}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#4F46E5',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          Test /api/telnyx/status
        </button>

        <button
          onClick={testCallEndpoint}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#10B981',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          Test /api/telnyx/voice/call (validation only)
        </button>
      </div>

      {loading && <p style={{ color: '#666' }}>Loading...</p>}

      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#FEE2E2',
          border: '1px solid #EF4444',
          borderRadius: '0.5rem',
          marginBottom: '1rem',
        }}>
          <strong style={{ color: '#DC2626' }}>Error:</strong>
          <pre style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>{error}</pre>
        </div>
      )}

      {status && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#F0FDF4',
          border: '1px solid #10B981',
          borderRadius: '0.5rem',
        }}>
          <strong style={{ color: '#059669' }}>Response:</strong>
          <pre style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(status, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#F3F4F6', borderRadius: '0.5rem' }}>
        <h3>Expected Behavior:</h3>
        <ul style={{ lineHeight: '1.8' }}>
          <li><strong>/api/telnyx/status</strong> should return configuration status (no secrets)</li>
          <li><strong>/api/telnyx/voice/call</strong> with invalid number should return validation error</li>
          <li>All responses should be JSON with consistent structure</li>
          <li>No real calls should be made during testing</li>
        </ul>
      </div>
    </div>
  );
}
