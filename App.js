import { AuthProvider } from './AuthContext';
import StackNavigation from './navigation/StackNavigation';

export default function App() {
  return (
    <AuthProvider>
    <StackNavigation/>
    </AuthProvider>
  );
}

