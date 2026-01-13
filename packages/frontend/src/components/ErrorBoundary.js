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
        <div className="m-5 rounded-xl border-2 border-danger-200 bg-danger-50 p-6">
          <h2 className="text-xl font-bold text-danger-900">Something went wrong!</h2>
          <pre className="mt-4 overflow-auto whitespace-pre-wrap rounded bg-danger-100 p-4 font-mono text-sm text-danger-700">
            {this.state.error && this.state.error.toString()}
          </pre>
          <button onClick={() => window.location.reload()} className="btn-danger mt-4 font-semibold">
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
