import CodeBlock from '../components/CodeBlock';
import { GetStaticProps } from 'next';

const testCode = {
  python: `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))`,
  
  typescript: `interface User {
  id: number;
  name: string;
  email: string;
}

const user: User = {
  id: 1,
  name: "John Doe",
  email: "john@example.com"
};`,
  
  rust: `use std::collections::HashMap;

fn main() {
    let mut scores = HashMap::new();
    scores.insert(String::from("Blue"), 10);
    scores.insert(String::from("Yellow"), 50);
    
    for (key, value) in &scores {
        println!("{}: {}", key, value);
    }
}`,
  
  sql: `SELECT u.name, u.email, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= '2023-01-01'
GROUP BY u.id, u.name, u.email
HAVING COUNT(o.id) > 5
ORDER BY order_count DESC;`,
  
  go: `package main

import (
    "fmt"
    "net/http"
    "log"
)

func handler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "Hello, %s!", r.URL.Path[1:])
}

func main() {
    http.HandleFunc("/", handler)
    log.Fatal(http.ListenAndServe(":8080", nil))
}`,
  
  cpp: `#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> numbers = {5, 2, 8, 1, 9};
    
    std::sort(numbers.begin(), numbers.end());
    
    for (const auto& num : numbers) {
        std::cout << num << " ";
    }
    
    return 0;
}`
};

export default function TestCodeBlocks() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Code Blocks Test Page</h1>
      <p>This page tests code blocks across different programming languages to ensure consistency.</p>
      
      <section style={{ marginBottom: '3rem' }}>
        <h2>Python</h2>
        <CodeBlock code={testCode.python} language="python" />
      </section>
      
      <section style={{ marginBottom: '3rem' }}>
        <h2>TypeScript</h2>
        <CodeBlock code={testCode.typescript} language="typescript" />
      </section>
      
      <section style={{ marginBottom: '3rem' }}>
        <h2>Rust</h2>
        <CodeBlock code={testCode.rust} language="rust" />
      </section>
      
      <section style={{ marginBottom: '3rem' }}>
        <h2>SQL</h2>
        <CodeBlock code={testCode.sql} language="sql" />
      </section>
      
      <section style={{ marginBottom: '3rem' }}>
        <h2>Go</h2>
        <CodeBlock code={testCode.go} language="go" />
      </section>
      
      <section style={{ marginBottom: '3rem' }}>
        <h2>C++</h2>
        <CodeBlock code={testCode.cpp} language="cpp" />
      </section>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};