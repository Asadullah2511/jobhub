import { useState, useEffect } from 'react';
import axios from '../../lib/axios';

const StarRating = ({ rating, onRate, readOnly = false }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readOnly && onRate && onRate(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
          disabled={readOnly}
          className={`text-2xl transition-colors ${
            readOnly ? 'cursor-default' : 'cursor-pointer'
          }`}
        >
          {(hover || rating) >= star ? '⭐' : '☆'}
        </button>
      ))}
    </div>
  );
};

export default function HiringHistoryPage() {
  const [hires, setHires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingWorker, setRatingWorker] = useState(null);
  const [newRating, setNewRating] = useState(0);
  const [review, setReview] = useState('');

  useEffect(() => {
    fetchHiringHistory();
  }, []);

  const fetchHiringHistory = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call to /profile/hiring-history
      const mockHires = [
        {
          id: 1,
          workerName: 'Ahmed Khan',
          jobTitle: 'Plumbing Repair',
          hiredDate: '2026-06-15',
          completedDate: '2026-06-16',
          status: 'completed',
          rating: 4,
          review: 'Great work, very professional',
          paymentAmount: 'Rs 2000',
        },
        {
          id: 2,
          workerName: 'Fatima Ali',
          jobTitle: 'House Painting',
          hiredDate: '2026-06-20',
          completedDate: '2026-06-25',
          status: 'completed',
          rating: 5,
          review: 'Excellent job, highly recommended!',
          paymentAmount: 'Rs 15000',
        },
        {
          id: 3,
          workerName: 'Hassan Ahmed',
          jobTitle: 'Construction Work',
          hiredDate: '2026-07-01',
          completedDate: null,
          status: 'in-progress',
          rating: null,
          review: null,
          paymentAmount: 'Rs 50000',
        },
        {
          id: 4,
          workerName: 'Sara Malik',
          jobTitle: 'Electrical Wiring',
          hiredDate: '2026-06-10',
          completedDate: '2026-06-12',
          status: 'completed',
          rating: null,
          review: null,
          paymentAmount: 'Rs 3500',
        },
      ];
      setHires(mockHires);
    } catch (err) {
      console.error('Failed to fetch hiring history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!ratingWorker || newRating === 0) return;

    try {
      // API call would go here
      await axios.post('/reviews', {
        workerId: ratingWorker.id,
        rating: newRating,
        review: review,
      });

      // Update local state
      setHires(prev =>
        prev.map(hire =>
          hire.id === ratingWorker.id
            ? { ...hire, rating: newRating, review: review }
            : hire
        )
      );

      setRatingWorker(null);
      setNewRating(0);
      setReview('');
      alert('Rating submitted successfully!');
    } catch (err) {
      alert('Failed to submit rating');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading hiring history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-neutral-900 mb-2">Hiring History & Ratings</h1>
        <p className="text-neutral-600 mb-8">Review your past hires and provide feedback</p>

        {hires.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-lg border border-white/50 rounded-2xl p-12 text-center shadow-lg">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">No Hiring History</h2>
            <p className="text-neutral-600">Your hiring history will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {hires.map((hire) => (
              <div
                key={hire.id}
                className="bg-white/70 backdrop-blur-lg border border-white/50 rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-xl font-bold text-neutral-900">{hire.workerName}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          hire.status === 'completed'
                            ? 'bg-success-100 text-success-700'
                            : hire.status === 'in-progress'
                            ? 'bg-warning-100 text-warning-700'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        {hire.status}
                      </span>
                    </div>

                    <p className="text-lg text-neutral-700 mb-3">{hire.jobTitle}</p>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <span className="text-sm text-neutral-600">Hired:</span>
                        <span className="text-sm text-neutral-900 ml-2 font-medium">
                          {new Date(hire.hiredDate).toLocaleDateString()}
                        </span>
                      </div>
                      {hire.completedDate && (
                        <div>
                          <span className="text-sm text-neutral-600">Completed:</span>
                          <span className="text-sm text-neutral-900 ml-2 font-medium">
                            {new Date(hire.completedDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="text-sm text-neutral-600">Payment:</span>
                        <span className="text-sm text-neutral-900 ml-2 font-medium">
                          {hire.paymentAmount}
                        </span>
                      </div>
                    </div>

                    {hire.rating ? (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-neutral-700">Your Rating:</span>
                          <StarRating rating={hire.rating} readOnly />
                        </div>
                        {hire.review && (
                          <div className="bg-neutral-50 rounded-lg p-3">
                            <p className="text-sm text-neutral-700">{hire.review}</p>
                          </div>
                        )}
                      </div>
                    ) : hire.status === 'completed' ? (
                      <button
                        onClick={() => {
                          setRatingWorker(hire);
                          setNewRating(0);
                          setReview('');
                        }}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
                      >
                        Rate This Worker
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rating Modal */}
        {ratingWorker && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">
                Rate {ratingWorker.workerName}
              </h3>

              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Rating *
                </label>
                <StarRating rating={newRating} onRate={setNewRating} />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Review (Optional)
                </label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  rows="4"
                  placeholder="Share your experience working with this person..."
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setRatingWorker(null);
                    setNewRating(0);
                    setReview('');
                  }}
                  className="flex-1 px-4 py-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitRating}
                  disabled={newRating === 0}
                  className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Rating
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
