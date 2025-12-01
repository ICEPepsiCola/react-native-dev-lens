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
      const res = await fetch('https://jsonplaceholder.typicode.com/posts?userId=1&_limit=3&_sort=id&_order=desc&search=test&filter=active&category=technology&tags=javascript,typescript,react&page=1&pageSize=10&includeMetadata=true&fields=id,title,body,userId&expand=author,comments');
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
      
      // Send JSON message
      setTimeout(() => {
        ws.send(JSON.stringify({
          type: 'test',
          data: {
            message: 'Testing JSON over WebSocket',
            timestamp: Date.now(),
          },
        }));
      }, 500);
    };
    ws.onmessage = (e) => {
      addLog(`WS Message: ${e.data}`);
    };
    ws.onclose = () => {
      addLog('WebSocket Closed');
    };
    ws.onerror = (e) => {
      addLog(`WS Error: ${e}`);
    };
    
    // Close after 3 seconds
    setTimeout(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    }, 3000);
  };

  const testPost = async () => {
    addLog('Testing POST with body...');
    try {
      const res = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Custom-Header': 'test-value-with-very-long-string-to-test-overflow-handling-in-the-ui-component',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
          'X-Request-ID': 'req_1234567890abcdefghijklmnopqrstuvwxyz',
          'X-Client-Version': '1.0.0-beta.1+build.20231128.1234567890',
        },
        body: JSON.stringify({
          title: 'Dev Lens Test with Very Long Title to Test UI Overflow Handling and Text Wrapping Behavior',
          body: 'This is a very long body text that contains multiple sentences to test how the UI handles long content. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
          userId: 1,
          metadata: {
            source: 'mobile-app',
            version: '1.0.0',
            tags: ['test', 'demo', 'long-content', 'overflow-test', 'ui-testing'],
            description: 'This is a nested object with very long strings to test overflow handling in nested JSON structures',
            veryLongKey: 'This is a very long value that should test horizontal scrolling or text wrapping in the JSON viewer component',
            urls: [
              'https://example.com/api/v1/users/12345/profile/settings/notifications/preferences',
              'https://example.com/api/v1/users/12345/profile/settings/privacy/data-export',
              'https://example.com/api/v1/users/12345/profile/settings/security/two-factor-authentication',
            ],
            nestedObject: {
              level1: {
                level2: {
                  level3: {
                    level4: {
                      deepValue: 'This is a deeply nested value with a very long string to test deep nesting and overflow',
                      anotherLongKey: 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
                    },
                  },
                },
              },
            },
          },
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

  const testVirtualScroll = async () => {
    addLog('Testing virtual scroll: 10 Fetch + 3 WebSocket...');
    
    // Generate 10 fetch requests
    const fetchPromises = [];
    for (let i = 1; i <= 10; i++) {
      const promise = fetch(`https://jsonplaceholder.typicode.com/posts/${i}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': `req_${i}_${Date.now()}`,
          'X-Test-Header': `Test value for request ${i}`,
        },
      }).catch(() => {});
      fetchPromises.push(promise);
    }
    
    await Promise.all(fetchPromises);
    addLog('10 Fetch requests completed');
    
    // Generate 3 WebSocket connections
    for (let i = 1; i <= 3; i++) {
      const ws = new WebSocket('wss://echo.websocket.org');
      ws.onopen = () => {
        addLog(`WebSocket ${i} Connected`);
        ws.send(`Hello from WebSocket ${i}!`);
        
        // Send multiple messages
        setTimeout(() => {
          ws.send(JSON.stringify({
            type: 'test',
            socketId: i,
            message: `Test message from socket ${i}`,
            timestamp: Date.now(),
          }));
        }, 100 * i);
        
        setTimeout(() => {
          ws.send(`Another message from socket ${i}`);
        }, 200 * i);
      };
      ws.onmessage = (e) => {
        addLog(`WS ${i} Message: ${e.data}`);
      };
      ws.onclose = () => {
        addLog(`WebSocket ${i} Closed`);
      };
      
      // Close after 2 seconds
      setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      }, 2000);
    }
    
    addLog('3 WebSocket connections initiated');
  };

  const testStress = async () => {
    addLog('Starting stress test: 1000 requests + 1000 console logs...');
    
    // Generate 1000 console logs
    for (let i = 0; i < 1000; i++) {
      if (i % 3 === 0) {
        console.log(`Log ${i}:`, {
          index: i,
          timestamp: Date.now(),
          data: { value: Math.random(), nested: { deep: 'value' } }
        });
      } else if (i % 3 === 1) {
        console.warn(`Warning ${i}: This is a warning message`);
      } else {
        console.error(`Error ${i}: This is an error message`);
      }
    }
    
    // Generate 1000 fetch requests
    const promises = [];
    for (let i = 0; i < 1000; i++) {
      const promise = fetch(`https://jsonplaceholder.typicode.com/posts/${(i % 100) + 1}`)
        .catch(() => {});
      promises.push(promise);
      
      // Batch requests to avoid overwhelming the browser
      if (i % 50 === 0) {
        await Promise.all(promises);
        promises.length = 0;
      }
    }
    
    await Promise.all(promises);
    addLog('Stress test completed!');
  };

  const testConsole = () => {
    addLog('Testing Console...');
    
    // Test simple messages
    console.log('Simple log message');
    console.info('Info message');
    console.warn('Warning message');
    console.error('Error message');
    
    // Test very long plain text
    console.log('This is a very long log message that should test text wrapping and overflow handling in the console viewer component. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.');
    
    // Test console.log with label and object (common pattern)
    console.log('User Data:', {
      id: 123,
      name: 'John Doe',
      email: 'john.doe.with.very.long.email.address@example-company-domain.com',
      roles: ['admin', 'user', 'moderator', 'developer', 'tester'],
      bio: 'This is a very long biography text that contains multiple sentences and should test how the JSON viewer handles long string values in nested objects. Lorem ipsum dolor sit amet, consectetur adipiscing elit.This is a very long biography text that contains multiple sentences and should test how the JSON viewer handles long string values in nested objects. Lorem ipsum dolor sit amet, consectetur adipiscing elit.This is a very long biography text that contains multiple sentences and should test how the JSON viewer handles long string values in nested objects. Lorem ipsum dolor sit amet, consectetur adipiscing elit.This is a very long biography text that contains multiple sentences and should test how the JSON viewer handles long string values in nested objects. Lorem ipsum dolor sit amet, consectetur adipiscing elit.This is a very long biography text that contains multiple sentences and should test how the JSON viewer handles long string values in nested objects. Lorem ipsum dolor sit amet, consectetur adipiscing elit.This is a very long biography text that contains multiple sentences and should test how the JSON viewer handles long string values in nested objects. Lorem ipsum dolor sit amet, consectetur adipiscing elit.This is a very long biography text that contains multiple sentences and should test how the JSON viewer handles long string values in nested objects. Lorem ipsum dolor sit amet, consectetur adipiscing elit.This is a very long biography text that contains multiple sentences and should test how the JSON viewer handles long string values in nested objects. Lorem ipsum dolor sit amet, consectetur adipiscing elit.This is a very long biography text that contains multiple sentences and should test how the JSON viewer handles long string values in nested objects. Lorem ipsum dolor sit amet, consectetur adipiscing elit.This is a very long biography text that contains multiple sentences and should test how the JSON viewer handles long string values in nested objects. Lorem ipsum dolor sit amet, consectetur adipiscing elit.This is a very long biography text that contains multiple sentences and should test how the JSON viewer handles long string values in nested objects. Lorem ipsum dolor sit amet, consectetur adipiscing elit.This is a very long biography text that contains multiple sentences and should test how the JSON viewer handles long string values in nested objects. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      timestamp: new Date().toISOString(),
      metadata: {
        version: '1.0.0',
        platform: 'mobile',
        deviceInfo: {
          model: 'iPhone 15 Pro Max',
          os: 'iOS 17.1.2',
          screenResolution: '2796x1290',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
        },
      },
      veryLongArray: [
        'item1', 'item2', 'item3', 'item4', 'item5', 'item6', 'item7', 'item8', 'item9', 'item10',
        'item11', 'item12', 'item13', 'item14', 'item15', 'item16', 'item17', 'item18', 'item19', 'item20',
      ],
    });
    
    // Test console.log with multiple labels
    console.log('API Request:', 'POST', '/api/users', {
      method: 'POST',
      url: 'https://api.example.com/v1/users/12345/profile/settings/notifications/preferences/email/subscriptions',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ',
        'X-Request-ID': 'req_1234567890abcdefghijklmnopqrstuvwxyz',
        'X-Correlation-ID': 'corr_9876543210zyxwvutsrqponmlkjihgfedcba',
      },
      body: {
        username: 'testuser_with_very_long_username_to_test_overflow',
        password: '********',
        preferences: {
          notifications: {
            email: true,
            push: true,
            sms: false,
            channels: ['email', 'push', 'in-app', 'webhook'],
          },
          privacy: {
            shareData: false,
            allowAnalytics: true,
            cookieConsent: true,
          },
        },
      },
    });
    
    // Test console.log with response
    console.log('API Response:', {
      status: 201,
      statusText: 'Created',
      data: {
        id: 456,
        created: true,
        message: 'User profile has been successfully created with all the specified preferences and settings',
        links: {
          self: 'https://api.example.com/v1/users/456',
          profile: 'https://api.example.com/v1/users/456/profile',
          settings: 'https://api.example.com/v1/users/456/settings',
        },
      },
    });
    
    // Test error with label
    console.error('Failed to fetch user data:', new Error('Network timeout after 30 seconds'));
    
    // Test error stack trace
    console.error('Error: Failed to fetch user data\n    at fetchUserData (app.js:123:45)\n    at async loadProfile (app.js:456:78)\n    at async initializeApp (app.js:789:12)\n    at async main (app.js:1011:13)');
    
    // Test warn with object
    console.warn('Deprecated API usage:', {
      api: '/api/v1/users',
      deprecatedSince: '2023-01-01',
      useInstead: '/api/v2/users',
      migrationGuide: 'https://docs.example.com/migration/v1-to-v2-users-api-complete-guide-with-examples',
    });
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
        <TouchableOpacity style={[styles.button, styles.buttonSuccess]} onPress={testVirtualScroll}>
          <Text style={styles.buttonText}>� Virtsual Scroll (10 Fetch + 3 WS)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buttonDanger]} onPress={testStress}>
          <Text style={styles.buttonText}>🔥 Stress Test (1000 each)</Text>
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
  buttonSuccess: {
    backgroundColor: '#34C759',
  },
  buttonDanger: {
    backgroundColor: '#FF3B30',
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
