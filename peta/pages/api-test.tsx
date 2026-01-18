import { useState, useEffect } from 'react';

export default function ApiTest() {
  const [testResults, setTestResults] = useState<{[key: string]: any}>({});
  const [loading, setLoading] = useState(false);

  const testApi = async () => {
    setLoading(true);
    const results: {[key: string]: any} = {};
    
    try {
      const postsResponse = await fetch('/api/content/post');
      results.posts = {
        status: postsResponse.status,
        ok: postsResponse.ok,
        data: await postsResponse.json()
      };
    } catch (error: any) {
      results.posts = { error: error.message };
    }
    
    try {
      const snippetsResponse = await fetch('/api/content/snippet');
      results.snippets = {
        status: snippetsResponse.status,
        ok: snippetsResponse.ok,
        data: await snippetsResponse.json()
      };
    } catch (error: any) {
      results.snippets = { error: error.message };
    }
    
    try {
      const projectsResponse = await fetch('/api/content/project');
      results.projects = {
        status: projectsResponse.status,
        ok: projectsResponse.ok,
        data: await projectsResponse.json()
      };
    } catch (error: any) {
      results.projects = { error: error.message };
    }
    
    try {
      const tagsResponse = await fetch('/api/tags');
      results.tags = {
        status: tagsResponse.status,
        ok: tagsResponse.ok,
        data: await tagsResponse.json()
      };
    } catch (error: any) {
      results.tags = { error: error.message };
    }
    
    setTestResults(results);
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>API Test</h1>
      <button onClick={testApi} disabled={loading}>
        {loading ? 'Testing...' : 'Test APIs'}
      </button>
      
      {Object.keys(testResults).length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h2>Results:</h2>
          {Object.entries(testResults).map(([key, result]) => (
            <div key={key} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
              <h3>{key}:</h3>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}