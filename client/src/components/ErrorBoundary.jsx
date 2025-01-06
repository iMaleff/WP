import React from 'react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertTitle>Что-то пошло не так</AlertTitle>
            <AlertDescription>
              Произошла ошибка при загрузке страницы. Пожалуйста, обновите страницу или попробуйте позже.
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 