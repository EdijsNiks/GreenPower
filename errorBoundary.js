import React from 'react';
import { Text } from 'react-native';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary Caught an Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <Text>Something went wrong. Please try again later.</Text>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
