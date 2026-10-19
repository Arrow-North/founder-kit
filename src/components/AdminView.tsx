import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

/**
 * AdminView component - displays all form submissions
 *
 * To use this, add it to your App.tsx or create a separate admin route.
 * For now, you can temporarily add it to see submissions during development.
 *
 * Usage in App.tsx:
 * import { AdminView } from './components/AdminView';
 *
 * // Add somewhere in your render:
 * {process.env.NODE_ENV === 'development' && <AdminView />}
 */
export function AdminView() {
  const submissions = useQuery(api.submissions.getAllSubmissions);

  if (!submissions) {
    return (
      <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg max-w-md">
        <p className="text-sm text-gray-600">Loading submissions...</p>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg max-w-md max-h-96 overflow-auto">
      <h3 className="font-bold text-lg mb-3">Submissions ({submissions.length})</h3>
      {submissions.length === 0 ? (
        <p className="text-sm text-gray-500">No submissions yet</p>
      ) : (
        <div className="space-y-3">
          {submissions.slice(0, 5).map((sub) => (
            <div key={sub._id} className="border-b pb-2">
              <p className="font-medium text-sm">
                {sub.firstName} {sub.lastName}
              </p>
              <p className="text-xs text-gray-600">{sub.email}</p>
              <p className="text-xs text-gray-400">
                {new Date(sub.submittedAt).toLocaleString()}
              </p>
            </div>
          ))}
          {submissions.length > 5 && (
            <p className="text-xs text-gray-500 italic">
              Showing 5 of {submissions.length} submissions
            </p>
          )}
        </div>
      )}
    </div>
  );
}
