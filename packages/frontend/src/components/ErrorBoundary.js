import React from 'react';
import PropTypes from 'prop-types';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.log('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-5 m-5 border-2 border-red-600 rounded bg-red-100">
          <h2 className="text-red-700">Something went wrong!</h2>
          <pre className="whitespace-pre-wrap text-red-600">{this.state.error && this.state.error.toString()}</pre>
          <button
            onClick={() => window.location.reload()}
            className="p-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
};

export default ErrorBoundary;
