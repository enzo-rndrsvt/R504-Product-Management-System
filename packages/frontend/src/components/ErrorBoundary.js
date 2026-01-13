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
        <div className="m-5 rounded border-2 border-red-600 bg-red-100 p-5">
          <h2 className="text-red-700">Something went wrong!</h2>
          <pre className="whitespace-pre-wrap text-red-600">{this.state.error && this.state.error.toString()}</pre>
          <button
            onClick={() => window.location.reload()}
            className="rounded bg-red-500 p-2 px-4 text-white transition hover:bg-red-600"
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
