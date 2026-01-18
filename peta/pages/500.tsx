import Layout from '../components/Layout';

export default function Custom500() {
  return (
    <Layout>
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h1>500 - Server Error</h1>
        <p>Something went wrong on our end. Please try again later.</p>
        <a href="/">Return to Home</a>
      </div>
    </Layout>
  );
}