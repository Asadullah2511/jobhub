import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from '../lib/axios';
import { setCredentials } from '../store/authSlice';

const roles = [
  {
    value: 'employer',
    title: 'Employer',
    description: 'Post jobs and hire talent',
    icon: '💼',
    color: 'primary',
  },
  {
    value: 'white_collar',
    title: 'White Collar Worker',
    description: 'Find professional opportunities',
    icon: '👔',
    color: 'secondary',
  },
  {
    value: 'blue_collar',
    title: 'Blue Collar Worker',
    description: 'Discover skilled work and gigs',
    icon: '🔧',
    color: 'accent',
  },
];

export default function RoleSelectionPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedRole, setSelectedRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!selectedRole) {
      setError('Please select a role');
      return;
    }

    try {
      setError('');
      setIsLoading(true);

      const signupData = JSON.parse(sessionStorage.getItem('signupData') || '{}');
      if (!signupData.email) {
        navigate('/signup');
        return;
      }

      const response = await axios.post('/auth/register', {
        ...signupData,
        role: selectedRole,
      });

      const { token, user } = response.data.data || response.data;
      dispatch(setCredentials({ user, token }));

      sessionStorage.removeItem('signupData');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 px-4 py-12">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">Choose Your Role</h1>
          <p className="text-neutral-600">Select how you want to use JobHub</p>
        </div>

        {error && (
          <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg mb-6 text-center max-w-md mx-auto">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {roles.map((role) => (
            <button
              key={role.value}
              onClick={() => setSelectedRole(role.value)}
              className={`p-8 rounded-2xl border-2 transition-all text-left ${
                selectedRole === role.value
                  ? `border-${role.color}-500 bg-${role.color}-50/50 shadow-lg scale-105`
                  : 'border-neutral-200 bg-white/70 hover:border-neutral-300'
              }`}
            >
              <div className="text-5xl mb-4">{role.icon}</div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">{role.title}</h3>
              <p className="text-neutral-600">{role.description}</p>
            </button>
          ))}
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={!selectedRole || isLoading}
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
          >
            {isLoading ? 'Creating Account...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
