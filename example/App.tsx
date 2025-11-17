import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';

export default function App() {
  const [logs, setLogs] = useState<string[]>([]);
  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 9)]);
  };

  const testFetch = async () => {
    addLog('Testing Fetch...');
    try {
      const res = await fetch('https://jsonplaceholder.typicode.com/posts/1');
      const data = await res.json();
      addLog(`Fetch Success: ${data.title}`);
    } catch (e: any) {
      addLog(`Fetch Error: ${e.message}`);
    }
  };

  const testFetchWithParams = async () => {
    addLog('Testing Fetch with Query Params...');
    try {
      const res = await fetch('https://jsonplaceholder.typicode.com/posts?userId=1&_limit=3');
      const data = await res.json();
      addLog(`Fetch Success: ${data.length} posts`);
    } catch (e: any) {
      addLog(`Fetch Error: ${e.message}`);
    }
  };

  const testWebSocket = () => {
    addLog('Testing WebSocket...');
    const ws = new WebSocket('wss://echo.websocket.org');
    ws.onopen = () => {
      addLog('WebSocket Connected');
      ws.send('Hello Dev Lens!');
    };
    ws.onmessage = (e) => {
      addLog(`WS Message: ${e.data}`);
      setTimeout(() => ws.close(), 1000);
    };
    ws.onclose = () => addLog('WebSocket Closed');
  };

  const testPost = async () => {
    addLog('Testing POST with body...');
    try {
      const res = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Dev Lens Test',
          body: 'Testing POST request with body',
          userId: 1,
        }),
      });
      const data = await res.json();
      addLog(`POST Success: ID ${data.id}`);
    } catch (e: any) {
      addLog(`POST Error: ${e.message}`);
    }
  };

  const testCookie = async () => {
    addLog('Testing Cookie...');
    try {
      // Set a test cookie (web only)
      if (typeof document !== 'undefined') {
        document.cookie = 'test_cookie=dev_lens_test; path=/';
        document.cookie = 'user_id=12345; path=/';
      }
      
      // Make a request to see cookies captured
      const res = await fetch('https://jsonplaceholder.typicode.com/posts/1');
      const data = await res.json();
      addLog(`Cookie Test: ${data.title}`);
    } catch (e: any) {
      addLog(`Cookie Error: ${e.message}`);
    }
  };

  const testConsole = () => {
    addLog('Testing Console...');
    console.log('Log message');
    console.warn('Warning message');
    console.error('Error message');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔍 Dev Lens Test</Text>
      <Text style={styles.subtitle}>Open Dev Lens Desktop App</Text>
      
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button} onPress={testFetch}>
          <Text style={styles.buttonText}>Test Fetch (GET)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={testFetchWithParams}>
          <Text style={styles.buttonText}>Test Fetch (with params)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={testPost}>
          <Text style={styles.buttonText}>Test POST (with body)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={testWebSocket}>
          <Text style={styles.buttonText}>Test WebSocket</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={testCookie}>
          <Text style={styles.buttonText}>Test Cookie (web only)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={testConsole}>
          <Text style={styles.buttonText}>Test Console</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.logs}>
        <Text style={styles.logsTitle}>Recent Actions:</Text>
        <ScrollView>
          {logs.map((log, i) => (
            <Text key={i} style={styles.logText}>{log}</Text>
          ))}
        </ScrollView>
      </View>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  buttons: {
    gap: 12,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#5856D6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logs: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
  },
  logsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  logText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'Courier',
  },
});
